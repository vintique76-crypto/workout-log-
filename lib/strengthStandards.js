// 체중 대비 무게 배수 기준 (일반적으로 알려진 스트렝스 스탠다드를 단순화한 근사치입니다.
// 참고용이며 성별·나이·경력에 따라 실제 기준은 다를 수 있어요.
const STANDARDS = {
  male: {
    스쿼트: [0.5, 0.75, 1.25, 1.75, 2.25],
    벤치프레스: [0.5, 0.75, 1.0, 1.5, 1.75],
    데드리프트: [0.75, 1.0, 1.5, 2.0, 2.5],
  },
  female: {
    스쿼트: [0.35, 0.5, 0.75, 1.25, 1.75],
    벤치프레스: [0.25, 0.4, 0.6, 0.9, 1.15],
    데드리프트: [0.5, 0.75, 1.0, 1.5, 2.0],
  },
};

export const LEVEL_LABELS = ["초보", "초급", "중급", "상급", "엘리트"];

export function getStrengthLevel(exerciseName, weight, bodyweight, gender = "male") {
  if (!weight || !bodyweight) return null;
  const table = STANDARDS[gender]?.[exerciseName];
  if (!table) return null;

  const ratio = weight / bodyweight;
  let levelIdx = -1;
  for (let i = 0; i < table.length; i++) {
    if (ratio >= table[i]) levelIdx = i;
  }

  const label = levelIdx === -1 ? "입문" : LEVEL_LABELS[levelIdx];
  const nextIdx = levelIdx + 1;
  const nextLabel = nextIdx < table.length ? LEVEL_LABELS[nextIdx] : null;
  const nextWeight = nextIdx < table.length ? Math.round(table[nextIdx] * bodyweight * 10) / 10 : null;

  return { ratio, label, nextLabel, nextWeight };
}
