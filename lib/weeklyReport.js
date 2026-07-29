export function buildWeeklyReportText({ days, sets, avgDurationLabel, insightMessage, bars }) {
  const lines = [];
  lines.push(`이번 주 운동 리포트`);
  lines.push("");
  lines.push(`운동 ${days}일 · 세트 ${sets}개${avgDurationLabel ? ` · 평균 ${avgDurationLabel}` : ""}`);
  lines.push(bars.map((b) => `${b.label}${b.count > 0 ? "●" : "·"}`).join(" "));
  if (insightMessage) {
    lines.push("");
    lines.push(insightMessage);
  }
  return lines.join("\n");
}
