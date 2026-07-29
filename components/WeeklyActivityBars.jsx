"use client";

import { motion } from "framer-motion";
import { card } from "../lib/ui";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const TRACK_HEIGHT = 56;

export default function WeeklyActivityBars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div style={{ ...card, display: "flex", alignItems: "flex-end", gap: 8 }}>
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
  );
}
