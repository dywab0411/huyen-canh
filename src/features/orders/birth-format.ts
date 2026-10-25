export function dateFromDisplay(value: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}
export function dateForDisplay(value: string | null) {
  if (!value) return "Chưa cung cấp";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "Chưa cung cấp";
}
export function maskDate(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
}
export function maskTime(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}
export function timeForDisplay(value: string | null) {
  if (!value) return "Không rõ";
  return /^\d{2}$/.test(value) ? `${value} giờ (chưa có phút)` : value;
}
