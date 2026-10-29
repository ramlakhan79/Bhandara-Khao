export const SITE = {
  name: "Bhandara Khao",
  tagline: "Find Bhandaras. Share Seva. Spread Happiness.",
  url: (import.meta.env.VITE_SITE_URL || window.location.origin).replace(
    /\/$/,
    "",
  ),
  social: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || "",
    facebook: import.meta.env.VITE_FACEBOOK_URL || "",
    x: import.meta.env.VITE_X_URL || "",
    youtube: import.meta.env.VITE_YOUTUBE_URL || "",
  },
};
