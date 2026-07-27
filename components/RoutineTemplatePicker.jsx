"use client";

import { motion } from "framer-motion";
import { ROUTINE_TEMPLATES } from "../lib/routineTemplates";
import { smallBtn } from "../lib/ui";

export default function RoutineTemplatePicker({ open, onClose, onImport, importingId }) {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50 }} />
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
          maxHeight: "78vh",
          background: "var(--bg-elevated)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          padding: 16,
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <strong style={{ fontSize: 16 }}>루틴 템플릿</strong>
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

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {ROUTINE_TEMPLATES.map((t) => (
            <div
              key={t.id}
              style={{
                background: "var(--bg-elevated-2)",
                borderRadius: "var(--radius)",
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
              <p style={{ margin: "4px 0 8px", fontSize: 13, color: "var(--text-muted)" }}>{t.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {t.routines.map((r) => (
                  <span
                    key={r.name}
                    style={{
                      fontSize: 12,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "var(--bg-elevated)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {r.name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onImport(t)}
                disabled={importingId === t.id}
                style={{
                  ...smallBtn,
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                {importingId === t.id ? "가져오는 중..." : "내 루틴에 추가"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
