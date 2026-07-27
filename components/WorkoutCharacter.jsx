"use client";

import { motion, AnimatePresence } from "framer-motion";

export const LEVELS = [
  { min: 0, max: 4, label: "알", hint: "첫 운동을 기록하면 부화해요" },
  { min: 5, max: 14, label: "새싹", hint: "꾸준히 기록해서 성장시켜보세요" },
  { min: 15, max: 29, label: "성장", hint: "제법 단단해지고 있어요" },
  { min: 30, max: 49, label: "숙련", hint: "근육이 붙기 시작했어요" },
  { min: 50, max: Infinity, label: "챔피언", hint: "최고 단계에 도달했어요" },
];

export function levelForDays(days) {
  const idx = LEVELS.findIndex((l) => days >= l.min && days <= l.max);
  return idx === -1 ? 0 : idx;
}

function Egg() {
  return <circle cx="50" cy="56" r="15" fill="var(--text-faint)" />;
}

function Sprout() {
  return (
    <>
      <circle cx="50" cy="40" r="10" fill="var(--accent)" opacity="0.55" />
      <ellipse cx="50" cy="64" rx="13" ry="17" fill="var(--accent)" opacity="0.55" />
      <path d="M46 32c-4-4-10-4-12 0c4 4 10 4 12 0Z" fill="var(--success)" />
    </>
  );
}

function Growing() {
  return (
    <>
      <circle cx="50" cy="34" r="11" fill="var(--accent)" />
      <rect x="36" y="45" width="28" height="32" rx="12" fill="var(--accent)" />
      <path d="M36 52 L26 60" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 52 L74 60" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="24" cy="62" r="4" fill="var(--bg-elevated-2)" stroke="var(--accent)" strokeWidth="2" />
      <circle cx="76" cy="62" r="4" fill="var(--bg-elevated-2)" stroke="var(--accent)" strokeWidth="2" />
      <path d="M44 77 L40 90" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
      <path d="M56 77 L60 90" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function Skilled() {
  return (
    <>
      <circle cx="50" cy="28" r="12" fill="var(--accent)" />
      <rect x="33" y="40" width="34" height="36" rx="14" fill="var(--accent)" />
      <path d="M33 46 L18 34" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      <path d="M67 46 L82 34" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="20" cy="46" r="5" fill="var(--accent-hover)" />
      <circle cx="80" cy="46" r="5" fill="var(--accent-hover)" />
      <path d="M14 30h72" stroke="var(--text)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="16" cy="30" r="8" fill="var(--bg-elevated-2)" stroke="var(--text)" strokeWidth="3" />
      <circle cx="84" cy="30" r="8" fill="var(--bg-elevated-2)" stroke="var(--text)" strokeWidth="3" />
      <path d="M41 76 L36 92" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
      <path d="M59 76 L64 92" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function Champion() {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill="var(--accent)" opacity="0.08" />
      <circle cx="50" cy="50" r="36" fill="var(--accent)" opacity="0.1" />
      <path d="M50 4l3 8-3 3-3-3Z" fill="var(--success)" />
      <circle cx="50" cy="26" r="13" fill="var(--accent)" />
      <rect x="31" y="39" width="38" height="38" rx="15" fill="var(--accent)" />
      <path d="M31 45 L14 30" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
      <path d="M69 45 L86 30" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="16" cy="42" r="6" fill="var(--accent-hover)" />
      <circle cx="84" cy="42" r="6" fill="var(--accent-hover)" />
      <path d="M8 26h84" stroke="var(--text)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="10" cy="26" r="10" fill="var(--bg-elevated-2)" stroke="var(--text)" strokeWidth="3" />
      <circle cx="90" cy="26" r="10" fill="var(--bg-elevated-2)" stroke="var(--text)" strokeWidth="3" />
      <path d="M39 77 L33 95" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      <path d="M61 77 L67 95" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
    </>
  );
}

const STAGES = [Egg, Sprout, Growing, Skilled, Champion];

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
