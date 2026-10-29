import { currentLocale } from "../i18n/index.js";
const TZ = "Asia/Kolkata";
const fmt = (opts) =>
  new Intl.DateTimeFormat(currentLocale(), { timeZone: TZ, ...opts });

const dayKey = (d) =>
  fmt({ year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(d),
  );

export const formatDate = (d) =>
  fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
export const formatLongDate = (d) =>
  fmt({
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
export const formatShortDate = (d) =>
  fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(d));
export const formatTime = (d) =>
  fmt({ hour: "numeric", minute: "2-digit", hour12: true })
    .format(new Date(d))
    .toUpperCase();
export const formatDateTime = (d) => `${formatDate(d)}, ${formatTime(d)}`;

/** "Wed, 5 Nov · 12:00 PM – 4:00 PM" or a two-day range. */
export function formatEventWhen(start, end) {
  if (!start) return "";
  if (!end || dayKey(start) === dayKey(end)) {
    return `${formatShortDate(start)} · ${formatTime(start)}${end ? ` – ${formatTime(end)}` : ""}`;
  }
  return `${formatShortDate(start)}, ${formatTime(start)} → ${formatShortDate(end)}, ${formatTime(end)}`;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function formatRelative(date) {
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return formatDate(date);
}

export const formatNumber = (n) =>
  new Intl.NumberFormat("en-IN").format(n ?? 0);

export const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`;

/** Date → value for <input type="datetime-local"> in IST. */
export function toDateTimeLocal(d) {
  if (!d) return "";
  const p = Object.fromEntries(
    fmt({
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(d))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** <input type="datetime-local"> value (interpreted as IST) → ISO string. */
export const fromDateTimeLocal = (v) =>
  v ? new Date(`${v}:00+05:30`).toISOString() : undefined;
