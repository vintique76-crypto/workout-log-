export function estimate1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export const BIG3 = ["스쿼트", "벤치프레스", "데드리프트"];

export const MILESTONES = [200, 300, 400, 500, 600, 700, 800];

export function nextMilestone(total) {
  return MILESTONES.find((m) => m > total) ?? null;
}
