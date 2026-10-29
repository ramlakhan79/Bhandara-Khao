/** Digits-only number with India's country code, as wa.me expects. */
export function waNumber(phone = "") {
  const d = String(phone).replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`;
  return d;
}

export const whatsappChatUrl = (phone) => `https://wa.me/${waNumber(phone)}`;
export const telUrl = (phone) => `tel:${String(phone).replace(/[^\d+]/g, "")}`;

/** "13:30" → "1:30 PM" */
export function formatHHMM(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
