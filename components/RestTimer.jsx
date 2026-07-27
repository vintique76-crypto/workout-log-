"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS = [60, 90, 120];

export default function RestTimer() {
  const [remaining, setRemaining] = useState(null);
  const [total, setTotal] = useState(60);
  const intervalRef = useRef(null);

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

  const mm = remaining !== null ? Math.floor(Math.max(remaining, 0) / 60) : 0;
  const ss = remaining !== null ? Math.max(remaining, 0) % 60 : 0;
  const done = remaining !== null && remaining <= 0;

  const activeBtnStyle = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 8,
        background: remaining === null ? "var(--bg-elevated-2)" : done ? "var(--danger)" : "var(--accent)",
        color: remaining === null ? "var(--text)" : "var(--accent-text)",
        borderRadius: "var(--radius)",
        padding: 12,
        marginTop: 10,
        zIndex: 5,
        transition: "background 0.2s",
      }}
    >
      {remaining === null ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>휴식 타이머</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => start(p)}
              style={{ ...activeBtnStyle, background: "var(--bg-elevated)", color: "var(--text)" }}
            >
              {p}초
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {done ? "휴식 종료" : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => start(total)}
              style={{ ...activeBtnStyle, background: "rgba(0,0,0,0.18)", color: "var(--accent-text)" }}
            >
              재시작
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
      )}
    </div>
  );
}
