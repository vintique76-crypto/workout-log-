"use client";

import { card, smallBtn } from "../lib/ui";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const TRACK_HEIGHT = 50;

export default function WeeklyActivityBars({ days, totalSets, changePct, onShare }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const step = 320 / (days.length - 1);

  const points = days.map((d, i) => {
    const x = i * step;
    const y = TRACK_HEIGHT - (d.count / max) * TRACK_HEIGHT;
    return { x, y, ...d };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ ...card, padding: "14px 16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="eyebrow">Activity Trace</span>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            style={{ ...smallBtn, background: "none", border: "none", padding: 0, color: "var(--accent)", fontWeight: 700, fontSize: 11 }}
          >
            공유 ↗
          </button>
        )}
      </div>

      <svg viewBox={`0 0 320 ${TRACK_HEIGHT}`} width="100%" height={TRACK_HEIGHT} style={{ marginTop: 10, display: "block", overflow: "visible" }}>
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={p.isToday ? 4 : 3}
            fill={p.count > 0 || p.isToday ? "var(--accent)" : "var(--text-faint)"}
          />
        ))}
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 2px" }}>
        {points.map((p) => (
          <span
            key={p.date}
            style={{
              fontSize: 9.5,
              flex: 1,
              textAlign: "center",
              color: p.isToday ? "var(--accent)" : "var(--text-faint)",
              fontWeight: p.isToday ? 700 : 400,
            }}
          >
            {DAY_LABELS[p.dayOfWeek]}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
          {changePct != null ? `지난주 대비 ${changePct > 0 ? "+" : ""}${changePct}%` : "지난주 기록 없음"}
        </span>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{totalSets} SETS</span>
      </div>
    </div>
  );
}
