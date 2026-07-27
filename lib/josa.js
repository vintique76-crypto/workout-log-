export function pickJosa(word, withFinal, withoutFinal) {
  if (!word) return withoutFinal;
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return withoutFinal;
  const hasFinal = code % 28 !== 0;
  return hasFinal ? withFinal : withoutFinal;
}
