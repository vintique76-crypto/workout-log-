"use client";

import { useEffect, useRef, useState } from "react";
import { card } from "../lib/ui";

const PRESETS = [60, 90, 120];
const AUTO_START_SECONDS = 90;

export default function RestTimer({ autoStartSignal }) {
  const [remaining, setRemaining] = useState(null);
  const [total, setTotal] = useState(60);
  const intervalRef = useRef(null);
  const lastSignal = useRef(autoStartSignal);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      clearInterval(intervalRef.current);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [remaining]);

  const start = (sec) => {
    setTotal(sec);
    setRemaining(sec);
  };
  const stop = () => {
    clearInterval(intervalRef.current);
    setRemaining(null);
  };
  const extend = (sec) => {
    setRemaining((r) => (r === null ? sec : Math.max(r, 0) + sec));
  };

  useEffect(() => {
    if (autoStartSignal === undefined || autoStartSignal === null) return;
    if (autoStartSignal === lastSignal.current) return;
    lastSignal.current = autoStartSignal;
    start(AUTO_START_SECONDS);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal]);

  const mm = remaining !== null ? Math.floor(Math.max(remaining, 0) / 60) : 0;
  const ss = remaining !== null ? Math.max(remaining, 0) % 60 : 0;
  const done = remaining !== null && remaining <= 0;

  const activeBtnStyle = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };

  if (remaining !== null) {
    return (
      <div
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: "calc(72px + env(safe-area-inset-bottom))",
          maxWidth: 448,
          margin: "0 auto",
          background: done ? "var(--danger)" : "var(--accent)",
          color: "var(--accent-text)",
          borderRadius: "var(--radius)",
          padding: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          {done ? "휴식 종료" : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => extend(30)}
            style={{ ...activeBtnStyle, background: "rgba(0,0,0,0.18)", color: "var(--accent-text)" }}
          >
            +30초
          </button>
          <button
            type="button"
            onClick={() => extend(60)}
            style={{ ...activeBtnStyle, background: "rgba(0,0,0,0.18)", color: "var(--accent-text)" }}
          >
            +1분
          </button>
          <button
            type="button"
            onClick={stop}
            style={{ ...activeBtnStyle, background: "rgba(0,0,0,0.18)", color: "var(--accent-text)" }}
          >
            끄기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...card,
        position: "sticky",
        top: 8,
        marginTop: 10,
        zIndex: 5,
        padding: 12,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 8 }}>Rest Timer</div>
      <div style={{ display: "flex", gap: 8 }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => start(p)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "9px 0",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-strong)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {p}s
          </button>
        ))}
      </div>
    </div>
  );
}
