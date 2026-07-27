"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { buildShareText } from "../lib/shareWorkout";
import { generateShareImage } from "../lib/shareImage";
import { primaryBtn } from "../lib/ui";

export default function ShareWorkoutModal({ open, onClose, shareData }) {
  const [copied, setCopied] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  if (!open || !shareData) return null;

  const text = buildShareText(shareData);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  const handleImage = async () => {
    setImageBusy(true);
    try {
      const blob = await generateShareImage(shareData);
      const file = new File([blob], `오운완_${shareData.dateLabel}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "오운완" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `오운완_${shareData.dateLabel}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        // real failure (not just user cancelling the share sheet); ignore silently for now
      }
    } finally {
      setImageBusy(false);
    }
  };

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
          background: "var(--bg-elevated)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 51,
          padding: 16,
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <strong style={{ fontSize: 16 }}>운동 완료! 오운완 공유하기</strong>
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

        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "var(--bg-elevated-2)",
            borderRadius: 10,
            padding: 12,
            fontSize: 13,
            color: "var(--text)",
            fontFamily: "inherit",
            maxHeight: 220,
            overflowY: "auto",
            margin: 0,
          }}
        >
          {text}
        </pre>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button type="button" onClick={handleCopy} style={{ ...primaryBtn, flex: 1 }}>
            {copied ? "복사됨!" : "텍스트 복사"}
          </button>
          <button
            type="button"
            onClick={handleImage}
            disabled={imageBusy}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated-2)",
              color: "var(--text)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {imageBusy ? "생성 중..." : "이미지로 공유"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
