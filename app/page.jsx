"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireSession } from "../lib/useSession";
import { supabase } from "../lib/supabaseClient";
import { primaryBtn, card } from "../lib/ui";
import { dateStr } from "../lib/date";
import CalendarHeatmap from "../components/CalendarHeatmap";

export default function HomePage() {
  const session = useRequireSession();
  const [recent, setRecent] = useState([]);
  const [dateCounts, setDateCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const from = new Date();
      from.setDate(from.getDate() - 90);

      const [{ data: recentData }, { data: setsData }] = await Promise.all([
        supabase
          .from("workouts")
          .select("id, date, routines(name)")
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("workout_sets")
          .select("workouts!inner(date)")
          .gte("workouts.date", dateStr(from)),
      ]);

      setRecent(recentData || []);

      const counts = {};
      (setsData || []).forEach((r) => {
        const d = r.workouts?.date;
        if (!d) return;
        counts[d] = (counts[d] || 0) + 1;
      });
      setDateCounts(counts);
      setLoading(false);
    })();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22 }}>오늘도 화이팅</h1>
      <Link
        href="/workout/new"
        style={{ ...primaryBtn, display: "block", textAlign: "center", textDecoration: "none", marginTop: 16 }}
      >
        오늘 운동 기록하기
      </Link>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>최근 90일</h2>
      <CalendarHeatmap dateCounts={dateCounts} />

      <h2 style={{ fontSize: 16, marginTop: 24 }}>최근 기록</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : recent.length === 0 ? (
        <p style={{ color: "#888" }}>아직 기록이 없어요. 첫 운동을 기록해보세요.</p>
      ) : (
        recent.map((w) => (
          <div key={w.id} style={{ ...card, display: "flex", justifyContent: "space-between" }}>
            <span>{w.date}</span>
            <span style={{ color: "#888" }}>{w.routines?.name || "자유 기록"}</span>
          </div>
        ))
      )}
    </div>
  );
}
