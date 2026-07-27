const KEYWORD_MAP = [
  { keywords: ["레그프레스", "레그 프레스", "랫풀다운", "랫풀", "시티드 로우", "케이블", "익스텐션", "레그컬", "레그 컬", "머신"], icon: "machine" },
  { keywords: ["데드리프트", "힌지", "굿모닝", "스티프", "힙 쓰러스트", "힙쓰러스트"], icon: "hinge" },
  { keywords: ["스쿼트", "런지"], icon: "squat" },
  { keywords: ["벤치", "프레스", "숄더", "오버헤드", "푸시업", "딥스"], icon: "press" },
  { keywords: ["로우", "풀업", "당기기", "친업", "페이스 풀"], icon: "pull" },
  { keywords: ["컬"], icon: "curl" },
  { keywords: ["레이즈", "플라이", "카프"], icon: "raise" },
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
