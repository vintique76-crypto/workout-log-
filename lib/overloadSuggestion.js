// 지난 세션 기록을 바탕으로 다음 목표를 제안하는 간단한 점진적 과부하 규칙.
// 무게는 가장 작은 증량 단위(2.5kg)만큼, 무게를 더 못 늘릴 상황이면 횟수를 1회 늘리는 것을 제안합니다.

export function suggestNextTarget(ghostSets) {
  const first = ghostSets?.find(Boolean);
  if (!first || !first.weight || !first.reps) return null;

  if (first.reps < 12) {
    return { weight: Math.round((first.weight + 2.5) * 10) / 10, reps: first.reps };
  }
  return { weight: first.weight, reps: first.reps + 1 };
}
