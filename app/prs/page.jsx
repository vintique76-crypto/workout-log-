"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card } from "../../lib/ui";
import MoveIconBadge from "../../components/MoveIconBadge";
import EmptyState from "../../components/EmptyState";

export default function PrsPage() {
  const session = useRequireSession();
  const [events, setEvents] = useState(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from("workout_sets")
        .select("exercise_name, muscle_group, weight, workouts(date)");

      const sets = (data || [])
        .map((s) => ({
          exercise_name: s.exercise_name,
          muscle_group: s.muscle_group,
          weight: s.weight,
          date: s.workouts?.date,
        }))
        .filter((s) => s.date)
        .sort((a, b) => a.date.localeCompare(b.date));

      const runningMax = {};
      const prEvents = [];
      sets.forEach((s) => {
        const prev = runningMax[s.exercise_name];
        if (prev !== undefined && s.weight > prev) {
          prEvents.push({
            date: s.date,
            exercise_name: s.exercise_name,
            muscle_group: s.muscle_group,
            weight: s.weight,
            previousMax: prev,
          });
        }
        if (prev === undefined || s.weight > prev) {
          runningMax[s.exercise_name] = s.weight;
        }
      });

      prEvents.sort((a, b) => b.date.localeCompare(a.date));
      setEvents(prEvents);
    })();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>PR 타임라인</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
        종목별 최고 무게를 갱신한 순간들이에요.
      </p>

      {events === null ? (
        <p style={{ marginTop: 16 }}>불러오는 중...</p>
      ) : events.length === 0 ? (
        <EmptyState message="아직 최고 기록을 갱신한 기록이 없어요. 같은 종목을 2번 이상 기록해보세요." />
      ) : (
        events.map((e, i) => (
          <motion.div
            key={`${e.exercise_name}-${e.date}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.03 }}
            style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}
          >
            <MoveIconBadge name={e.exercise_name} muscleGroup={e.muscle_group} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{e.exercise_name}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {e.previousMax}kg → <span style={{ color: "var(--accent)", fontWeight: 700 }}>{e.weight}kg</span>
                <span style={{ color: "var(--text-faint)" }}> (+{Math.round((e.weight - e.previousMax) * 10) / 10}kg)</span>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{e.date}</span>
          </motion.div>
        ))
      )}
    </div>
  );
}
