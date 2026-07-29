"use client";

import { motion, AnimatePresence } from "framer-motion";

export const LEVELS = [
  { min: 0, max: 4, label: "루키", hint: "첫 운동을 기록하면 몸이 만들어지기 시작해요" },
  { min: 5, max: 14, label: "다지는 중", hint: "기초 체력이 붙고 있어요" },
  { min: 15, max: 29, label: "성장 중", hint: "몸에 라인이 잡히기 시작했어요" },
  { min: 30, max: 49, label: "탄탄", hint: "근육이 제법 붙었어요" },
  { min: 50, max: Infinity, label: "챔피언", hint: "최고 단계에 도달했어요" },
];

export function levelForDays(days) {
  const idx = LEVELS.findIndex((l) => days >= l.min && days <= l.max);
  return idx === -1 ? 0 : idx;
}

// 5단계 모두 사람 실루엣을 유지하면서, 뼈만 있는 마른 몸에서 살/근육이 점점 붙는 모습으로 진행됩니다.

function Rookie() {
  return (
    <>
      <circle cx="50" cy="24" r="9" fill="var(--text-faint)" />
      <rect x="44" y="34" width="12" height="26" rx="5" fill="var(--text-faint)" />
      <path d="M45 37 L34 52" stroke="var(--text-faint)" strokeWidth="4" strokeLinecap="round" />
      <path d="M55 37 L66 52" stroke="var(--text-faint)" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 60 L40 90" stroke="var(--text-faint)" strokeWidth="4" strokeLinecap="round" />
      <path d="M54 60 L60 90" stroke="var(--text-faint)" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function BuildingUp() {
  return (
    <>
      <circle cx="50" cy="24" r="9.5" fill="var(--accent)" opacity="0.5" />
      <rect x="42" y="34" width="16" height="28" rx="7" fill="var(--accent)" opacity="0.5" />
      <path d="M43 38 L32 54" stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" opacity="0.5" />
      <path d="M57 38 L68 54" stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" opacity="0.5" />
      <path d="M45 62 L38 90" stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" opacity="0.5" />
      <path d="M55 62 L62 90" stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" opacity="0.5" />
    </>
  );
}

function Growing() {
  return (
    <>
      <circle cx="50" cy="23" r="10" fill="var(--accent)" opacity="0.75" />
      <path d="M37 34 Q50 28 63 34 L60 62 Q50 67 40 62 Z" fill="var(--accent)" opacity="0.75" />
      <path d="M38 36 L26 50" stroke="var(--accent)" strokeWidth="6.5" strokeLinecap="round" opacity="0.75" />
      <path d="M62 36 L74 50" stroke="var(--accent)" strokeWidth="6.5" strokeLinecap="round" opacity="0.75" />
      <circle cx="24" cy="52" r="4.5" fill="var(--bg-elevated-2)" stroke="var(--accent)" strokeWidth="2" />
      <path d="M44 63 L37 91" stroke="var(--accent)" strokeWidth="6.5" strokeLinecap="round" opacity="0.75" />
      <path d="M56 63 L63 91" stroke="var(--accent)" strokeWidth="6.5" strokeLinecap="round" opacity="0.75" />
    </>
  );
}

function Toned() {
  return (
    <>
      <circle cx="50" cy="21" r="10.5" fill="var(--accent)" />
      <path d="M33 33 Q50 26 67 33 L62 63 Q50 69 38 63 Z" fill="var(--accent)" />
      <circle cx="30" cy="35" r="7" fill="var(--accent)" />
      <circle cx="70" cy="35" r="7" fill="var(--accent)" />
      <path d="M30 40 Q22 48 27 58" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M70 40 Q78 48 73 58" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="25" cy="59" r="5" fill="var(--accent-hover)" />
      <circle cx="75" cy="59" r="5" fill="var(--accent-hover)" />
      <path d="M42 64 L35 92" stroke="var(--accent)" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M58 64 L65 92" stroke="var(--accent)" strokeWidth="7.5" strokeLinecap="round" />
    </>
  );
}

function Champion() {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill="var(--accent)" opacity="0.08" />
      <circle cx="50" cy="50" r="37" fill="var(--accent)" opacity="0.1" />
      <path d="M50 2l3 8-3 3-3-3Z" fill="var(--success)" />
      <circle cx="50" cy="20" r="11" fill="var(--accent)" />
      <path d="M29 32 Q50 24 71 32 L64 64 Q50 71 36 64 Z" fill="var(--accent)" />
      <circle cx="26" cy="34" r="8" fill="var(--accent)" />
      <circle cx="74" cy="34" r="8" fill="var(--accent)" />
      <path d="M26 40 Q15 46 18 58" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M74 40 Q85 46 82 58" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="59" r="6" fill="var(--accent-hover)" />
      <circle cx="82" cy="59" r="6" fill="var(--accent-hover)" />
      <rect x="10" y="22" width="80" height="6" rx="3" fill="var(--text)" />
      <circle cx="13" cy="25" r="9" fill="var(--bg-elevated-2)" stroke="var(--text)" strokeWidth="3" />
      <circle cx="87" cy="25" r="9" fill="var(--bg-elevated-2)" stroke="var(--text)" strokeWidth="3" />
      <path d="M40 65 L32 93" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
      <path d="M60 65 L68 93" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
    </>
  );
}

const STAGES = [Rookie, BuildingUp, Growing, Toned, Champion];

export default function WorkoutCharacter({ days }) {
  const level = levelForDays(days);
  const Stage = STAGES[level];
  const info = LEVELS[level];
  const next = LEVELS[level + 1];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 84, height: 84, flexShrink: 0 }}>
        <AnimatePresence mode="wait">
          <motion.svg
            key={level}
            viewBox="0 0 100 100"
            width="84"
            height="84"
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <Stage />
          </motion.svg>
        </AnimatePresence>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {info.label}
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
            최근 90일 {days}일 운동
          </span>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
          {next ? `다음 단계까지 ${next.min - days}일 남았어요` : info.hint}
        </p>
      </div>
    </div>
  );
}
