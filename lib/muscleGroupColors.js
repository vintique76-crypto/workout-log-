export const MUSCLE_GROUP_COLORS = {
  가슴: "#2c6dff",
  등: "#3ddc9a",
  어깨: "#f5a623",
  팔: "#9b7fd4",
  하체: "#4fc3f7",
  코어: "#ff5c5c",
  유산소: "#5fbf82",
  기타: "#8a9096",
};

export function colorForMuscleGroup(group) {
  return MUSCLE_GROUP_COLORS[group] || MUSCLE_GROUP_COLORS["기타"];
}
