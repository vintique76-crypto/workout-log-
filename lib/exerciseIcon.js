const KEYWORD_MAP = [
  { keywords: ["데드리프트", "힌지", "굿모닝", "스티프"], icon: "hinge" },
  { keywords: ["스쿼트", "런지", "레그프레스", "레그 프레스"], icon: "squat" },
  { keywords: ["벤치", "프레스", "숄더", "오버헤드", "푸시업", "딥스", "딥스트"], icon: "press" },
  { keywords: ["로우", "풀업", "랫풀", "당기기", "친업", "로잉머신"], icon: "pull" },
  { keywords: ["컬"], icon: "curl" },
  { keywords: ["레이즈"], icon: "raise" },
  { keywords: ["플랭크", "크런치", "복근", "코어", "싯업"], icon: "core" },
  { keywords: ["러닝", "사이클", "유산소", "달리기", "걷기", "로잉", "일립티컬"], icon: "cardio" },
];

const MUSCLE_GROUP_FALLBACK = {
  가슴: "press",
  등: "pull",
  어깨: "press",
  팔: "curl",
  하체: "squat",
  코어: "core",
  유산소: "cardio",
  기타: "dumbbell",
};

export function iconTypeFor(name, muscleGroup) {
  const n = name || "";
  for (const { keywords, icon } of KEYWORD_MAP) {
    if (keywords.some((k) => n.includes(k))) return icon;
  }
  return MUSCLE_GROUP_FALLBACK[muscleGroup] || "dumbbell";
}
