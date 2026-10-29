/** Inserts Cloudinary transformations into a delivery URL. Non-Cloudinary URLs pass through. */
export function optimizeImage(url, { w, h, crop = "fill" } = {}) {
  if (!url || !url.includes("/upload/")) return url;
  const t = [
    w && `w_${w}`,
    h && `h_${h}`,
    h ? `c_${crop}` : w && "c_limit",
    "f_auto",
    "q_auto",
  ]
    .filter(Boolean)
    .join(",");
  return url.replace("/upload/", `/upload/${t}/`);
}

export function imageSrcSet(url, widths = [320, 480, 640, 960], ratio = 0.625) {
  if (!url || !url.includes("/upload/")) return undefined;
  return widths
    .map((w) => `${optimizeImage(url, { w, h: Math.round(w * ratio) })} ${w}w`)
    .join(", ");
}
