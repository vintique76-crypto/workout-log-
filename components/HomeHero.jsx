"use client";

import { card } from "../lib/ui";
import { LEVELS, levelForDays } from "./WorkoutCharacter";

function Reticle() {
  return (
    <span style={{ width: 15, height: 15, position: "relative", flexShrink: 0 }}>
      <span style={{ position: "absolute", background: "var(--text-faint)", top: 0, left: 6, width: 3, height: 15 }} />
      <span style={{ position: "absolute", background: "var(--text-faint)", top: 6, left: 0, width: 15, height: 3 }} />
    </span>
  );
}

export default function HomeHero({ days, weekSets }) {
  const level = levelForDays(days);
  const info = LEVELS[level];
  const next = LEVELS[level + 1];
  const progressPct = Math.min(100, (days / (next ? next.min : 50)) * 100);

  return (
    <div style={{ ...card, padding: 18, marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Reticle />
          <span className="eyebrow">
            Stage {String(level + 1).padStart(2, "0")} / {String(LEVELS.length).padStart(2, "0")}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)" }}>{weekSets}</div>
          <div style={{ fontSize: 9.5, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Sets / WK
          </div>
        </div>
      </div>

      <div
        className="mono"
        style={{
          fontSize: 64,
          fontWeight: 800,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          marginTop: 10,
          textShadow: "0 0 24px var(--accent-glow)",
        }}
      >
        {String(days).padStart(2, "0")}
        <span style={{ fontSize: 20, color: "var(--accent)", fontWeight: 700, marginLeft: 6 }}>/ 90D</span>
      </div>
      <div style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>
        현재 단계 <b style={{ color: "var(--text)", fontWeight: 700 }}>{info.label}</b>
      </div>

      <div style={{ marginTop: 16, height: 3, background: "var(--border)", position: "relative" }}>
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "var(--accent)",
            boxShadow: "0 0 10px var(--accent-glow)",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              right: -3,
              top: "50%",
              transform: "translateY(-50%)",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px 2px var(--accent-glow)",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9.5, color: "var(--text-faint)" }}>
        <span>0</span>
        <span>5</span>
        <span>15</span>
        <span>30</span>
        <span>50+</span>
      </div>
    </div>
  );
}
