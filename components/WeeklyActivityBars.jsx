"use client";

import { motion } from "framer-motion";
import { card, smallBtn } from "../lib/ui";
import { formatDuration } from "../lib/date";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const TRACK_HEIGHT = 56;

export default function WeeklyActivityBars({ days, avgDuration, onShare }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const avgLabel = formatDuration(avgDuration);

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>이번 주 활동</span>
          {avgLabel && (
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>평균 {avgLabel}</span>
          )}
        </div>
        {onShare && (
          <button type="button" onClick={onShare} style={{ ...smallBtn, padding: "4px 10px", fontSize: 12 }}>
            공유
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        {days.map((d, i) => {
          const barHeight = d.count === 0 ? 3 : Math.max(6, Math.round((d.count / max) * TRACK_HEIGHT));
          return (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ height: TRACK_HEIGHT, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ duration: 0.4, delay: i * 0.03, ease: "easeOut" }}
                  style={{
                    width: "100%",
                    borderRadius: 4,
                    background: d.isToday ? "var(--accent)" : d.count > 0 ? "var(--accent)" : "var(--bg-elevated-2)",
                    opacity: d.isToday ? 1 : d.count > 0 ? 0.55 : 1,
                  }}
                />
              </div>
              <span style={{ fontSize: 10, color: d.isToday ? "var(--accent)" : "var(--text-faint)", fontWeight: d.isToday ? 700 : 400 }}>
                {DAY_LABELS[d.dayOfWeek]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
