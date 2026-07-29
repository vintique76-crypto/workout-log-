"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRequireSession } from "../lib/useSession";
import { supabase } from "../lib/supabaseClient";
import { primaryBtn, card } from "../lib/ui";
import { dateStr } from "../lib/date";
import { computeInsights } from "../lib/insights";
import WorkoutCharacter from "../components/WorkoutCharacter";
import GoalProgress from "../components/GoalProgress";

const sectionLabel = {
  fontSize: 13,
  marginTop: 28,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

export default function HomePage() {
  const session = useRequireSession();
  const [recent, setRecent] = useState([]);
  const [dateCounts, setDateCounts] = useState({});
  const [topInsight, setTopInsight] = useState(null);
  const [recommendedRoutine, setRecommendedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(null);
  const [bodyEntries, setBodyEntries] = useState([]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const from = new Date();
      from.setDate(from.getDate() - 90);

      const [{ data: recentData }, { data: setsData }, { data: routinesData }, { data: allWorkouts }, { data: goalData }, { data: bodyData }] =
        await Promise.all([
          supabase
            .from("workouts")
            .select("id, date, routines(name)")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("workout_sets")
            .select("exercise_name, muscle_group, weight, reps, workouts!inner(date)")
            .gte("workouts.date", dateStr(from)),
          supabase.from("routines").select("id, name"),
          supabase.from("workouts").select("routine_id, date"),
          supabase.from("goals").select("target_weight, target_skeletal_muscle, target_body_fat").maybeSingle(),
          supabase
            .from("body_weights")
            .select("date, weight, skeletal_muscle_mass, body_fat_percent")
            .order("date", { ascending: true }),
        ]);

      setRecent(recentData || []);
      setGoal(goalData || null);
      setBodyEntries(bodyData || []);

      if ((routinesData || []).length > 0) {
        const lastUsedByRoutine = {};
        (allWorkouts || []).forEach((w) => {
          if (!w.routine_id) return;
          if (!lastUsedByRoutine[w.routine_id] || w.date > lastUsedByRoutine[w.routine_id]) {
            lastUsedByRoutine[w.routine_id] = w.date;
          }
        });
        const sorted = [...routinesData].sort((a, b) => {
          const da = lastUsedByRoutine[a.id] || "";
          const db = lastUsedByRoutine[b.id] || "";
          return da.localeCompare(db);
        });
        setRecommendedRoutine(sorted[0]);
      }

      const counts = {};
      const sets = [];
      (setsData || []).forEach((r) => {
        const d = r.workouts?.date;
        if (!d) return;
        counts[d] = (counts[d] || 0) + 1;
        sets.push({
          exercise_name: r.exercise_name,
          muscle_group: r.muscle_group || "기타",
          weight: r.weight,
          reps: r.reps,
          date: d,
        });
      });
      setDateCounts(counts);
      const insights = computeInsights({ sets });
      setTopInsight(insights[0] || null);
      setLoading(false);
    })();
  }, [session]);

  const weekStats = useMemo(() => {
    let days = 0;
    let sets = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = dateCounts[dateStr(d)] || 0;
      if (count > 0) days += 1;
      sets += count;
    }
    return { days, sets };
  }, [dateCounts]);

  const activeDays90 = useMemo(() => Object.keys(dateCounts).length, [dateCounts]);

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>오늘도 화이팅</h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ ...card, marginTop: 14 }}
      >
        <WorkoutCharacter days={activeDays90} />
      </motion.div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ ...card, flex: 1, marginTop: 0 }}
        >
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>이번 주 운동</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>
            {weekStats.days}
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>일</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{ ...card, flex: 1, marginTop: 0 }}
        >
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>이번 주 세트</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>
            {weekStats.sets}
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>개</span>
          </div>
        </motion.div>
      </div>

      {recommendedRoutine ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>오늘의 추천 루틴</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{recommendedRoutine.name}</div>
          </div>
          <Link
            href={`/workout/new?routine=${recommendedRoutine.id}`}
            style={{ ...primaryBtn, textDecoration: "none", padding: "10px 16px" }}
          >
            시작
          </Link>
        </motion.div>
      ) : (
        <Link
          href="/workout/new"
          style={{ ...primaryBtn, display: "block", textAlign: "center", textDecoration: "none", marginTop: 16 }}
        >
          오늘 운동 기록하기
        </Link>
      )}

      <GoalProgress goal={goal} entries={bodyEntries} />

      {topInsight && (
        <Link href="/coach" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              ...card,
              borderLeft: `3px solid ${topInsight.tone === "positive" ? "var(--success)" : "var(--accent)"}`,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>코칭</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{topInsight.message}</p>
          </motion.div>
        </Link>
      )}

      <h2 style={sectionLabel}>최근 기록</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : recent.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>아직 기록이 없어요. 첫 운동을 기록해보세요.</p>
      ) : (
        recent.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{ ...card, display: "flex", justifyContent: "space-between" }}
          >
            <span>{w.date}</span>
            <span style={{ color: "var(--text-muted)" }}>{w.routines?.name || "자유 기록"}</span>
          </motion.div>
        ))
      )}
    </div>
  );
}
