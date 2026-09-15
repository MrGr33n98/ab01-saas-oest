import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("../frontend/node_modules/sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "frontend/public/images/oest-logo.png");
const output = path.join(root, "frontend/public/icons");

await mkdir(output, { recursive: true });
const logo = await sharp(source)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
  .png()
  .toBuffer();

async function createIcon(name, size, artworkScale) {
  const artwork = await sharp(logo)
    .resize({
      width: Math.round(size * artworkScale),
      height: Math.round(size * artworkScale),
      fit: "contain",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#CAD7F6",
    },
  })
    .composite([{ input: artwork, gravity: "centre" }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(output, name));
}

await Promise.all([
  createIcon("oest-192.png", 192, 0.74),
  createIcon("oest-512.png", 512, 0.74),
  createIcon("oest-maskable-512.png", 512, 0.62),
  createIcon("apple-touch-icon.png", 180, 0.74),
]);

console.log(`Generated OEST PWA icons in ${output}`);
