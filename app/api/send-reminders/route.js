import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { dateStr } from "../../../lib/date";

const INACTIVE_DAYS_THRESHOLD = 2;

function getAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "") || request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const supabase = getAdminClient();

  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth");
  if (subsErr) {
    return Response.json({ error: subsErr.message }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return Response.json({ sent: 0, message: "no subscriptions" });
  }

  const userIds = Array.from(new Set(subs.map((s) => s.user_id)));
  const { data: workouts } = await supabase
    .from("workouts")
    .select("user_id, date")
    .in("user_id", userIds)
    .order("date", { ascending: false });

  const lastWorkoutByUser = {};
  (workouts || []).forEach((w) => {
    if (!lastWorkoutByUser[w.user_id] || w.date > lastWorkoutByUser[w.user_id]) {
      lastWorkoutByUser[w.user_id] = w.date;
    }
  });

  const today = dateStr(new Date());
  let sent = 0;
  const staleEndpoints = [];

  for (const sub of subs) {
    const lastDate = lastWorkoutByUser[sub.user_id];
    const daysSince = lastDate
      ? Math.floor((new Date(today) - new Date(lastDate)) / 86400000)
      : INACTIVE_DAYS_THRESHOLD + 1;
    if (daysSince < INACTIVE_DAYS_THRESHOLD) continue;

    const payload = JSON.stringify({
      title: "운동 기록",
      body: `${daysSince}일째 운동 기록이 없어요. 오늘 가볍게라도 몸 풀어볼까요?`,
      url: "/workout/new",
    });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent += 1;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) staleEndpoints.push(sub.endpoint);
    }
  }

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  return Response.json({ sent, checked: subs.length, removedStale: staleEndpoints.length });
}
