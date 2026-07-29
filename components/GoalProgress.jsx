"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { card } from "../lib/ui";

function computeProgress(baselineVal, latestVal, targetVal, direction) {
  if (baselineVal == null || latestVal == null || targetVal == null) return null;

  let reached;
  if (direction === "higher") reached = latestVal >= targetVal;
  else if (direction === "lower") reached = latestVal <= targetVal;
  else reached = Math.abs(latestVal - targetVal) < 0.05;

  const span = targetVal - baselineVal;
  const pct = span === 0 ? 100 : Math.max(0, Math.min(100, ((latestVal - baselineVal) / span) * 100));

  return { pct: reached ? 100 : pct, reached, remaining: Math.round(Math.abs(targetVal - latestVal) * 10) / 10 };
}

function Bar({ label, unit, progress }) {
  if (!progress) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
        <span>{label}</span>
        <span style={{ color: progress.reached ? "var(--success)" : "var(--text)", fontWeight: 600 }}>
          {progress.reached ? "목표 달성!" : `${Math.round(progress.pct)}% · ${progress.remaining}${unit} 남음`}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--bg-elevated-2)", overflow: "hidden", marginTop: 4 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: progress.reached ? "var(--success)" : "var(--accent)" }}
        />
      </div>
    </div>
  );
}

export default function GoalProgress({ goal, entries }) {
  const hasGoal = goal && (goal.target_weight || goal.target_skeletal_muscle || goal.target_body_fat);

  if (!hasGoal) {
    if (!entries || entries.length === 0) return null;
    return (
      <Link href="/weight" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={card}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>목표를 설정하면 여기서 달성률을 볼 수 있어요</div>
          <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginTop: 4 }}>목표 설정하러 가기 →</div>
        </motion.div>
      </Link>
    );
  }

  if (!entries || entries.length === 0) return null;

  const baseline = entries[0];
  const latest = entries[entries.length - 1];

  const weightProgress = goal.target_weight
    ? computeProgress(baseline.weight, latest.weight, goal.target_weight, "neutral")
    : null;
  const muscleProgress = goal.target_skeletal_muscle
    ? computeProgress(baseline.skeletal_muscle_mass, latest.skeletal_muscle_mass, goal.target_skeletal_muscle, "higher")
    : null;
  const fatProgress = goal.target_body_fat
    ? computeProgress(baseline.body_fat_percent, latest.body_fat_percent, goal.target_body_fat, "lower")
    : null;

  const bars = [weightProgress, muscleProgress, fatProgress].filter(Boolean);
  if (bars.length === 0) return null;

  const allReached = bars.every((b) => b.reached);

  return (
    <Link href="/weight" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={card}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
          목표 진행률
        </div>
        {allReached && (
          <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 700, marginTop: 4 }}>
            설정한 목표를 모두 달성했어요!
          </div>
        )}
        <Bar label="체중" unit="kg" progress={weightProgress} />
        <Bar label="골격근량" unit="kg" progress={muscleProgress} />
        <Bar label="체지방률" unit="%" progress={fatProgress} />
      </motion.div>
    </Link>
  );
}
