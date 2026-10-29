/** Only http(s) links are clickable. Anything else (javascript:, data:, …) renders as plain text. */
export function safeHref(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}
