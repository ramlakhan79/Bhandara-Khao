// Chrome fires "beforeinstallprompt" once, early in page load, often before React has rendered
// the footer. So this file is imported in main.jsx to catch the event and keep it until needed.
let state = { event: null, installed: false };
const listeners = new Set();

const set = (next) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we show our own button instead of Chrome's mini bar
    set({ event: e });
  });
  window.addEventListener("appinstalled", () =>
    set({ event: null, installed: true }),
  );
}

export const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getSnapshot = () => state;

/** Opens the browser's install dialog. Returns 'accepted' | 'dismissed' | 'unavailable'. */
export async function promptInstall() {
  const ev = state.event;
  if (!ev) return "unavailable";
  set({ event: null }); // the event can only be used once
  ev.prompt();
  const { outcome } = await ev.userChoice;
  return outcome;
}

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

export function detectPlatform() {
  const ua = navigator.userAgent || "";
  return {
    iOS:
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    android: /Android/i.test(ua),
    inApp:
      /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Snapchat|Twitter|LinkedInApp|; wv\)/i.test(
        ua,
      ),
  };
}
