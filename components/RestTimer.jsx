"use client";

import { useEffect, useRef, useState } from "react";
import { smallBtn } from "../lib/ui";

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

  return (
    <div
      style={{
        position: "sticky",
        top: 49,
        background: "#111",
        color: "#fff",
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        zIndex: 5,
      }}
    >
      {remaining === null ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, color: "#ccc" }}>휴식 타이머</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => start(p)}
              style={{ ...smallBtn, background: "#333", color: "#fff", border: "none" }}
            >
              {p}초
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 22,
              fontVariantNumeric: "tabular-nums",
              color: done ? "#ff6666" : "#fff",
            }}
          >
            {done ? "휴식 종료" : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => start(total)}
              style={{ ...smallBtn, background: "#333", color: "#fff", border: "none" }}
            >
              재시작
            </button>
            <button
              type="button"
              onClick={stop}
              style={{ ...smallBtn, background: "#333", color: "#fff", border: "none" }}
            >
              끄기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
