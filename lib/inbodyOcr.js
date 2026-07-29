// 인바디 결과지 사진에서 체중/골격근량/체지방률 숫자를 뽑아내는 유틸.
// 브라우저에서 무료로 동작하는 OCR(Tesseract.js)로 사진 텍스트를 읽고,
// 라벨(한글/영문) 근처의 숫자를 정규식으로 찾아냅니다. 인식 결과는 참고용이며
// 사용자가 저장 전에 직접 확인/수정하는 것을 전제로 합니다.

function firstNumberNear(text, labelPattern) {
  const match = text.match(labelPattern);
  return match ? Number(match[1]) : null;
}

export function parseInbodyText(text) {
  const normalized = text.replace(/\s+/g, " ");

  const weight =
    firstNumberNear(normalized, /체\s*중[^\d]{0,15}(\d{2,3}(?:\.\d)?)/) ??
    firstNumberNear(normalized, /\bWeight\b[^\d]{0,10}(\d{2,3}(?:\.\d)?)/i);

  const muscle =
    firstNumberNear(normalized, /골격근량[^\d]{0,15}(\d{1,2}(?:\.\d)?)/) ??
    firstNumberNear(normalized, /\bSMM\b[^\d]{0,10}(\d{1,2}(?:\.\d)?)/i);

  const fat =
    firstNumberNear(normalized, /체지방(?:률|율)[^\d]{0,15}(\d{1,2}(?:\.\d)?)/) ??
    firstNumberNear(normalized, /\bPBF\b[^\d]{0,10}(\d{1,2}(?:\.\d)?)/i);

  return { weight, muscle, fat };
}

export async function recognizeInbodyPhoto(file) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("kor+eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return { text, ...parseInbodyText(text) };
  } finally {
    await worker.terminate();
  }
}
