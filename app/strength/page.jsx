"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card } from "../../lib/ui";
import { BIG3, MILESTONES, nextMilestone, estimate1RM } from "../../lib/oneRepMax";
import MoveIconBadge from "../../components/MoveIconBadge";

export default function StrengthPage() {
  const session = useRequireSession();
  const [sets, setSets] = useState(null);
  const [bodyweight, setBodyweight] = useState(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const [{ data: setsData }, { data: weightData }] = await Promise.all([
        supabase.from("workout_sets").select("exercise_name, weight, reps"),
        supabase.from("body_weights").select("weight").order("date", { ascending: false }).limit(1),
      ]);
      setSets(setsData || []);
      setBodyweight(weightData?.[0]?.weight ?? null);
    })();
  }, [session]);

  const { big3Max, total, ranking } = useMemo(() => {
    if (!sets) return { big3Max: {}, total: 0, ranking: [] };

    const maxWeightByExercise = {};
    const best1RMByExercise = {};
    sets.forEach((s) => {
      if (!maxWeightByExercise[s.exercise_name] || s.weight > maxWeightByExercise[s.exercise_name]) {
        maxWeightByExercise[s.exercise_name] = s.weight;
      }
      const est = estimate1RM(s.weight, s.reps);
      if (!best1RMByExercise[s.exercise_name] || est > best1RMByExercise[s.exercise_name]) {
        best1RMByExercise[s.exercise_name] = est;
      }
    });

    const big3Max = {};
    BIG3.forEach((name) => {
      big3Max[name] = maxWeightByExercise[name] || 0;
    });
    const total = BIG3.reduce((sum, name) => sum + big3Max[name], 0);

    const ranking = Object.entries(best1RMByExercise)
      .map(([name, oneRM]) => ({ name, oneRM }))
      .sort((a, b) => b.oneRM - a.oneRM)
      .slice(0, 10);

    return { big3Max, total, ranking };
  }, [sets]);

  if (!session) return <p>로딩 중...</p>;

  const next = nextMilestone(total);
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= total) ?? 0;
  const progressPct = next ? Math.min(100, ((total - prevMilestone) / (next - prevMilestone)) * 100) : 100;
  const ratio = bodyweight ? total / bodyweight : null;

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>3대 측정</h1>

      {sets === null ? (
        <p style={{ marginTop: 16 }}>불러오는 중...</p>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ ...card, textAlign: "center", padding: 24 }}
          >
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>3대 합계</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>
              {total}
              <span style={{ fontSize: 18, color: "var(--text-muted)", fontWeight: 500 }}>kg</span>
            </div>
            {ratio && (
              <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
                체중 대비 {ratio.toFixed(2)}배
              </div>
            )}

            {next && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: "var(--bg-elevated-2)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ height: "100%", background: "var(--accent)" }}
                  />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  3대 {next}까지 {Math.round((next - total) * 10) / 10}kg 남았어요
                </div>
              </div>
            )}
          </motion.div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {BIG3.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * (i + 1) }}
                style={{ ...card, flex: 1, marginTop: 0, textAlign: "center" }}
              >
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{name}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                  {big3Max[name] || "—"}
                  {big3Max[name] > 0 && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>kg</span>}
                </div>
              </motion.div>
            ))}
          </div>

          <h2
            style={{
              fontSize: 13,
              marginTop: 28,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            예상 1RM 랭킹
          </h2>
          {ranking.length === 0 ? (
            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>아직 기록이 없어요.</p>
          ) : (
            ranking.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ width: 20, fontSize: 13, color: "var(--text-faint)", fontWeight: 700 }}>
                  {i + 1}
                </span>
                <MoveIconBadge name={r.name} size={30} />
                <span style={{ flex: 1 }}>{r.name}</span>
                <strong style={{ color: "var(--accent)" }}>{r.oneRM}kg</strong>
              </motion.div>
            ))
          )}
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10 }}>
            예상 1RM은 Epley 공식(무게 × (1 + 횟수/30))으로 계산돼요. 실제 최대 무게와 다를 수 있어요.
          </p>
        </>
      )}
    </div>
  );
}
