"use client";

import { motion } from "framer-motion";

const RPE_VALUES = [5, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

const TAGS = [
  { value: null, label: "없음" },
  { value: "failure", label: "실패" },
  { value: "dropset", label: "드롭세트" },
  { value: "assisted", label: "보조" },
];

export default function SetTagPicker({ open, onClose, rpe, tag, onChangeRpe, onChangeTag }) {
  if (!open) return null;

  const chipStyle = (active) => ({
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "var(--accent)" : "var(--bg-elevated-2)",
    color: active ? "var(--accent-text)" : "var(--text)",
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50 }}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxWidth: 480,
          margin: "0 auto",
          background: "var(--bg-elevated)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 51,
          padding: 16,
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <strong style={{ fontSize: 16 }}>세트 상세</strong>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "var(--bg-elevated-2)",
              color: "var(--text)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </div>

        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>RPE (체감 난이도)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {RPE_VALUES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChangeRpe(rpe === v ? null : v)}
              style={{
                minWidth: 44,
                height: 40,
                padding: "0 6px",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                background: rpe === v ? "var(--accent)" : "var(--bg-elevated-2)",
                color: rpe === v ? "var(--accent-text)" : "var(--text)",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>태그</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TAGS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => onChangeTag(t.value)}
              style={chipStyle(tag === t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
