"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EXERCISE_LIBRARY } from "../lib/exerciseLibrary";
import { MUSCLE_GROUPS } from "../lib/muscleGroups";
import { MOVEMENT_ICONS } from "./movementIcons";

export default function ExercisePicker({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = EXERCISE_LIBRARY.filter((ex) => ex.name.includes(query));
  const grouped = MUSCLE_GROUPS.map((g) => ({
    group: g,
    items: filtered.filter((ex) => ex.muscleGroup === g),
  })).filter((g) => g.items.length > 0);

  const handleSelect = (ex) => {
    onSelect(ex);
    setQuery("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 50,
        }}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <strong style={{ fontSize: 16 }}>종목 선택</strong>
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

            <input
              autoFocus
              placeholder="종목 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: 12,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated-2)",
                color: "var(--text)",
                fontSize: 15,
                marginBottom: 8,
              }}
            />

            <div style={{ overflowY: "auto", flex: 1 }}>
              {grouped.length === 0 && (
                <p style={{ color: "var(--text-muted)", padding: "16px 4px" }}>검색 결과가 없어요.</p>
              )}
              {grouped.map(({ group, items }) => (
                <div key={group} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      margin: "10px 4px 6px",
                    }}
                  >
                    {group}
                  </div>
                  {items.map((ex) => {
                    const Icon = MOVEMENT_ICONS[ex.icon];
                    return (
                      <button
                        key={ex.name}
                        onClick={() => handleSelect(ex)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          width: "100%",
                          padding: "10px 8px",
                          border: "none",
                          background: "transparent",
                          color: "var(--text)",
                          fontSize: 15,
                          textAlign: "left",
                          cursor: "pointer",
                          borderRadius: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: "var(--bg-elevated-2)",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon width={18} height={18} />
                        </span>
                        {ex.name}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
      </motion.div>
    </>
  );
}
