import { SITE } from "./site.js";

export const eventUrl = (slug) => `${SITE.url}/bhandaras/${slug}`;

export const whatsappShareUrl = ({ title, url }) =>
  `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

const gcalDate = (d) => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, "");

export function googleCalendarUrl(ev) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${gcalDate(ev.startDateTime)}/${gcalDate(ev.endDateTime)}`,
    details: `${(ev.description || "").slice(0, 400)}\n\n${eventUrl(ev.slug)}`,
    location: [
      ev.venueName,
      ev.address,
      ev.locality,
      ev.city,
      ev.state,
      ev.pincode,
    ]
      .filter(Boolean)
      .join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function directionsUrl(ev) {
  const c = ev.location?.coordinates;
  const destination =
    c?.length === 2
      ? `${c[1]},${c[0]}`
      : [ev.venueName, ev.address, ev.locality, ev.city, ev.state, ev.pincode]
          .filter(Boolean)
          .join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta);
    return ok;
  }
}

/** Returns true if the native share sheet was used (or dismissed), false if unsupported. */
export async function nativeShare(data) {
  if (!navigator.share) return false;
  try {
    await navigator.share(data);
  } catch (err) {
    if (err?.name !== "AbortError") return false;
  }
  return true;
}
