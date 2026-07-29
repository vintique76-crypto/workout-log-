"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card } from "../../lib/ui";
import { dateStr } from "../../lib/date";
import { computeInsights } from "../../lib/insights";
import InsightIcon from "../../components/InsightIcon";
import EmptyState from "../../components/EmptyState";

export default function CoachPage() {
  const session = useRequireSession();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const from = new Date();
      from.setDate(from.getDate() - 60);

      const { data } = await supabase
        .from("workout_sets")
        .select("exercise_name, muscle_group, weight, reps, workouts!inner(date)")
        .gte("workouts.date", dateStr(from));

      const sets = (data || [])
        .map((s) => ({
          exercise_name: s.exercise_name,
          muscle_group: s.muscle_group || "기타",
          weight: s.weight,
          reps: s.reps,
          date: s.workouts?.date,
        }))
        .filter((s) => s.date);

      setInsights(computeInsights({ sets }));
    })();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>코칭</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
        최근 기록을 바탕으로 자동으로 계산된 인사이트예요.
      </p>

      {insights === null ? (
        <p style={{ marginTop: 16 }}>분석 중...</p>
      ) : insights.length === 0 ? (
        <EmptyState message="아직 분석할 기록이 부족해요. 꾸준히 기록하면 여기에 인사이트가 나타나요." />
      ) : (
        insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            style={{
              ...card,
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderLeft: `3px solid ${insight.tone === "positive" ? "var(--success)" : "var(--accent)"}`,
            }}
          >
            <InsightIcon type={insight.type} tone={insight.tone} />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{insight.message}</p>
          </motion.div>
        ))
      )}
    </div>
  );
}
