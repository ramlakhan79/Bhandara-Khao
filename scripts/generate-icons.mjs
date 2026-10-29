// Generates PWA PNG icons from public/favicon.svg. Run: npm run icons
import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";

const svg = await readFile("public/favicon.svg");
await mkdir("public/icons", { recursive: true });

for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`public/icons/${name}`);
}

// Maskable icon: full-bleed background with the mark inside the safe zone
const fullBleed = svg.toString().replace(' rx="16"', "");
const mark = await sharp(Buffer.from(fullBleed), { density: 384 })
  .resize(380, 380)
  .png()
  .toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#c74c07" },
})
  .composite([{ input: mark, gravity: "center" }])
  .png()
  .toFile("public/icons/maskable-512.png");

console.log("✅ Icons written to public/icons");
