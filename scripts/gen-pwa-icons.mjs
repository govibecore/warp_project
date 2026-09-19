// gen-pwa-icons.mjs — generates icon-192x192.png and icon-512x512.png from the WARP square SVG
// Run: node scripts/gen-pwa-icons.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../public/brand/warp-icon-square.svg');
const svgContent = readFileSync(svgPath, 'utf8');

// Dynamically import sharp (it's a dev dep, already installed by vite-plugin-pwa ecosystem)
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  // Fallback: write a minimal PNG using a data URL approach via canvas if available
  console.error('[gen-pwa-icons] sharp not available, trying @resvg/resvg-js...');
  try {
    const { Resvg } = await import('@resvg/resvg-js');
    for (const size of [192, 512]) {
      const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: size } });
      const png = resvg.render().asPng();
      writeFileSync(join(__dirname, `../public/icon-${size}x${size}.png`), png);
      console.log(`[gen-pwa-icons] ✅ Written icon-${size}x${size}.png (${png.length} bytes)`);
    }
    process.exit(0);
  } catch (e2) {
    console.error('[gen-pwa-icons] Neither sharp nor @resvg/resvg-js available:', e2.message);
    process.exit(1);
  }
}

const svgBuffer = Buffer.from(svgContent);
for (const size of [192, 512]) {
  const out = join(__dirname, `../public/icon-${size}x${size}.png`);
  await sharp(svgBuffer).resize(size, size).png().toFile(out);
  console.log(`[gen-pwa-icons] ✅ Written icon-${size}x${size}.png`);
}
