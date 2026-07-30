const COLORS = {
  bg: "#16181a",
  accent: "#2c6dff",
  text: "#f0f1f2",
  textMuted: "#8a9096",
  textFaint: "#565c62",
  border: "#383d43",
};

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export function generateShareImage(shareData) {
  const width = 720;
  const padding = 44;
  const contentWidth = width - padding * 2;
  const lineH = 30;
  const summaryLineH = 26;
  const blockGap = 18;
  const headerHeight = 172;
  const footerHeight = 116;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font = "700 26px sans-serif";
  const blocks = shareData.exercises.map((ex) => {
    const nameLines = wrapLines(ctx, ex.name, contentWidth);
    ctx.font = "400 22px sans-serif";
    const summaryLines = wrapLines(ctx, ex.summary, contentWidth);
    return { nameLines, summaryLines };
  });

  let y = headerHeight;
  blocks.forEach((b) => {
    y += b.nameLines.length * lineH;
    y += b.summaryLines.length * summaryLineH;
    y += blockGap;
  });
  const height = Math.max(560, y + footerHeight);

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 42px sans-serif";
  ctx.fillText("오운완", padding, 76);

  ctx.fillStyle = COLORS.textMuted;
  ctx.font = "500 22px sans-serif";
  const subtitle = shareData.dateLabel + (shareData.routineLabel ? ` · ${shareData.routineLabel}` : "");
  ctx.fillText(subtitle, padding, 112);

  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(padding, 140);
  ctx.lineTo(width - padding, 140);
  ctx.stroke();

  let cy = headerHeight;
  blocks.forEach((b) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = "700 26px sans-serif";
    b.nameLines.forEach((line) => {
      cy += lineH;
      ctx.fillText(line, padding, cy);
    });
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "400 22px sans-serif";
    b.summaryLines.forEach((line) => {
      cy += summaryLineH;
      ctx.fillText(line, padding, cy);
    });
    cy += blockGap;
  });

  const footerTop = height - footerHeight;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(padding, footerTop + 10);
  ctx.lineTo(width - padding, footerTop + 10);
  ctx.stroke();

  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 25px sans-serif";
  ctx.fillText(
    `총 ${shareData.totalSets}세트 · ${shareData.totalVolume.toLocaleString()}kg 볼륨`,
    padding,
    footerTop + 52
  );

  ctx.fillStyle = COLORS.textFaint;
  ctx.font = "400 18px sans-serif";
  ctx.fillText("내 운동 기록", padding, footerTop + 86);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function generateWeeklyReportImage({ days, sets, avgDurationLabel, insightMessage, bars }) {
  const width = 720;
  const padding = 44;
  const contentWidth = width - padding * 2;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font = "400 20px sans-serif";
  const insightLines = insightMessage ? wrapLines(ctx, insightMessage, contentWidth) : [];
  const height = 520 + insightLines.length * 28;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 40px sans-serif";
  ctx.fillText("이번 주 리포트", padding, 76);

  ctx.fillStyle = COLORS.textMuted;
  ctx.font = "500 22px sans-serif";
  ctx.fillText(
    `운동 ${days}일 · 세트 ${sets}개${avgDurationLabel ? ` · 평균 ${avgDurationLabel}` : ""}`,
    padding,
    114
  );

  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(padding, 142);
  ctx.lineTo(width - padding, 142);
  ctx.stroke();

  const barAreaTop = 190;
  const trackHeight = 140;
  const gap = 18;
  const barWidth = (contentWidth - gap * (bars.length - 1)) / bars.length;
  const max = Math.max(1, ...bars.map((b) => b.count));

  bars.forEach((b, i) => {
    const x = padding + i * (barWidth + gap);
    const h = b.count === 0 ? 6 : Math.max(10, (b.count / max) * trackHeight);
    const y = barAreaTop + trackHeight - h;

    ctx.fillStyle = b.isToday ? COLORS.accent : b.count > 0 ? "rgba(44,109,255,0.5)" : "#363b42";
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, h, 6);
    ctx.fill();

    ctx.fillStyle = b.isToday ? COLORS.accent : COLORS.textFaint;
    ctx.font = b.isToday ? "700 18px sans-serif" : "400 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(b.label, x + barWidth / 2, barAreaTop + trackHeight + 28);
  });
  ctx.textAlign = "left";

  let y = barAreaTop + trackHeight + 70;
  if (insightLines.length > 0) {
    ctx.strokeStyle = COLORS.border;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    y += 36;

    ctx.fillStyle = COLORS.text;
    ctx.font = "400 20px sans-serif";
    insightLines.forEach((line) => {
      ctx.fillText(line, padding, y);
      y += 28;
    });
  }

  ctx.fillStyle = COLORS.textFaint;
  ctx.font = "400 18px sans-serif";
  ctx.fillText("내 운동 기록", padding, height - 30);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
