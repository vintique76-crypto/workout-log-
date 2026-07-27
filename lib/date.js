export function dateStr(d = new Date()) {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export function todayStr() {
  return dateStr(new Date());
}
