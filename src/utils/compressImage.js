export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // server limit per image
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // refuse absurd originals before decoding

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Downscales large photos (max 1600px) and re-encodes them as WebP/JPEG.
 * Returns the original file when compression would not help or is unsupported.
 */
export async function compressImage(
  file,
  { maxDim = 1600, quality = 0.82, skipBelowBytes = 800 * 1024 } = {},
) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // the server re-validates and resizes anyway
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= skipBelowBytes) {
    bitmap.close?.();
    return file;
  }

  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  let blob = await toBlob(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp")
    blob = await toBlob(canvas, "image/jpeg", quality);
  if (!blob || (scale === 1 && blob.size >= file.size)) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
