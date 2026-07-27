export function buildShareData({ date, routineName, exerciseGroups }) {
  const dateLabel = (date || "").replace(/-/g, ".");
  let totalSets = 0;
  let totalVolume = 0;

  const exercises = exerciseGroups.map((ex) => {
    const summary = ex.sets.map((s) => `${s.weight}kg×${s.reps}`).join(", ");
    totalSets += ex.sets.length;
    ex.sets.forEach((s) => {
      totalVolume += s.reps * s.weight;
    });
    return { name: ex.name, summary };
  });

  return {
    dateLabel,
    routineLabel: routineName || null,
    exercises,
    totalSets,
    totalVolume: Math.round(totalVolume),
  };
}

export function buildShareText(shareData) {
  const lines = [];
  lines.push(`오운완 - ${shareData.dateLabel}${shareData.routineLabel ? ` (${shareData.routineLabel})` : ""}`);
  lines.push("");
  shareData.exercises.forEach((ex) => {
    lines.push(`${ex.name} ${ex.summary}`);
  });
  lines.push("");
  lines.push(`총 ${shareData.totalSets}세트 · ${shareData.totalVolume.toLocaleString()}kg 볼륨`);
  return lines.join("\n");
}
