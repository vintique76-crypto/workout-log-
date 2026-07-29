// 성별 평균 체형 기준 골격근량 비율(체중 대비)·체지방률 구간 근사치입니다.
// 공개된 일반 기준을 단순화한 참고용 수치이며, 실제 개인 편차·연령·인바디 기기별 차이가 있을 수 있어요.

const SMM_RATIO_THRESHOLDS = {
  // 골격근량 / 체중, 높을수록 좋은 등급
  male: [0.3, 0.33, 0.36, 0.4],
  female: [0.24, 0.27, 0.3, 0.33],
};

const BODY_FAT_THRESHOLDS = {
  // 체지방률(%), 낮을수록 좋은 등급 (내림차순 정렬)
  male: [25, 20, 15, 10],
  female: [32, 27, 22, 17],
};

export const GRADE_LABELS = ["관리 필요", "보통", "양호", "우수", "최상"];
export const GRADE_PERCENTILES = ["하위권", "평균 이하", "평균", "상위 25%", "상위 10%"];

function gradeAscending(value, thresholds) {
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) idx = i + 1;
  }
  return idx;
}

function gradeDescending(value, thresholds) {
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) return i;
  }
  return thresholds.length;
}

export function getSkeletalMuscleGrade(muscleKg, bodyweightKg, gender = "male") {
  if (!muscleKg || !bodyweightKg) return null;
  const ratio = muscleKg / bodyweightKg;
  const idx = gradeAscending(ratio, SMM_RATIO_THRESHOLDS[gender]);
  return { ratio, label: GRADE_LABELS[idx], percentile: GRADE_PERCENTILES[idx] };
}

export function getBodyFatGrade(fatPercent, gender = "male") {
  if (fatPercent == null) return null;
  const idx = gradeDescending(fatPercent, BODY_FAT_THRESHOLDS[gender]);
  return { label: GRADE_LABELS[idx], percentile: GRADE_PERCENTILES[idx] };
}
