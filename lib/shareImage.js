const COLORS = {
  bg: "#1c1917",
  accent: "#e8825a",
  text: "#f2ede6",
  textMuted: "#a89f92",
  textFaint: "#6f675d",
  border: "#3a352f",
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
