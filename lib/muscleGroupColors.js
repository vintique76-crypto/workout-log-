export const MUSCLE_GROUP_COLORS = {
  가슴: "#e8825a",
  등: "#5aa9a3",
  어깨: "#d9a441",
  팔: "#b98cd1",
  하체: "#6b8fd4",
  코어: "#e2574c",
  유산소: "#7fb069",
  기타: "#9a9186",
};

export function colorForMuscleGroup(group) {
  return MUSCLE_GROUP_COLORS[group] || MUSCLE_GROUP_COLORS["기타"];
}
