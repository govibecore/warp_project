import * as THREE from 'three';
import { mulberry32, fbm } from './core';
import type { Biome } from './core';

/**
 * Every surface in STEM City is painted here, at load time, on a 2D canvas.
 * There is not a single .png in the project: ground, roads, plaza brick,
 * walls, roofs, window lights and the water noise are all drawn with the
 * canvas API and handed to Three.js as CanvasTextures.
 *
 * Each distinct surface is painted once and cached; buildings that need a
 * different window count clone the texture (cheap — the image is shared) so
 * they can carry their own repeat.
 */

const cache = new Map<string, THREE.CanvasTexture>();

type Painter = (ctx: CanvasRenderingContext2D, s: number) => void;

function paint(key: string, size: number, repeat: number, draw: Painter): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) draw(ctx, size);

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

/** Speckled grit — the thing that stops flat colour from looking like plastic. */
function speckle(
  ctx: CanvasRenderingContext2D,
  s: number,
  rng: () => number,
  count: number,
  alpha: number,
  size = 1.6,
) {
  for (let i = 0; i < count; i++) {
    const dark = rng() > 0.45;
    ctx.fillStyle = dark ? `rgba(0,0,0,${rng() * alpha})` : `rgba(255,255,255,${rng() * alpha})`;
    ctx.fillRect(rng() * s, rng() * s, size, size);
  }
}

/* ── Ground ────────────────────────────────────────────────────────────── */

const BIOME_BASE: Record<Biome, [string, string]> = {
  meadow: ['#7fb069', '#5d8f4e'],
  civic: ['#cdc4b2', '#a89f8c'],
  rock: ['#9a9186', '#6f675d'],
  forest: ['#4f7a4a', '#375739'],
  shore: ['#e0d3a8', '#c2ad7c'],
  water: ['#3d7ea6', '#2b6084'],
  crop: ['#c9b458', '#9c8537'],
  sand: ['#e8d9a8', '#cfba82'],
};

export function groundTexture(biome: Biome): THREE.CanvasTexture {
  return paint(`ground:${biome}`, 256, 5, (ctx, s) => {
    const [base, shade] = BIOME_BASE[biome];
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(1000 + biome.length * 37 + biome.charCodeAt(0));

    // Soft blotches break up the flat fill into believable ground cover.
    for (let i = 0; i < 64; i++) {
      const x = rng() * s;
      const y = rng() * s;
      const r = 8 + rng() * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, shade + '99');
      g.addColorStop(1, shade + '00');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    speckle(ctx, s, rng, 2200, 0.055);
    speckle(ctx, s, rng, 900, 0.07, 2.2);
  });
}

/* ── Roads & plaza ─────────────────────────────────────────────────────── */

export function roadTexture(): THREE.CanvasTexture {
  return paint('road', 128, 1, (ctx, s) => {
    ctx.fillStyle = '#4c4c55';
    ctx.fillRect(0, 0, s, s);
    const rng = mulberry32(77);
    speckle(ctx, s, rng, 1600, 0.06);
    speckle(ctx, s, rng, 1100, 0.1, 1);

    // A handful of hairline cracks, so the tarmac isn't pristine.
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      let x = rng() * s;
      let y = rng() * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 9; j++) {
        x += (rng() - 0.5) * 20;
        y += (rng() - 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });
}

/** Radial brick for the reference plaza — the one "designed" surface. */
export function plazaTexture(): THREE.CanvasTexture {
  return paint('plaza', 512, 1, (ctx, s) => {
    const c = s / 2;
    ctx.fillStyle = '#cfc6b4';
    ctx.fillRect(0, 0, s, s);
    const rng = mulberry32(99);

    const rings = 10;
    for (let i = rings; i > 0; i--) {
      const r0 = (i / rings) * c * 0.97;
      const r1 = ((i + 1) / rings) * c * 0.97;
      const count = Math.max(14, Math.round(r0 * 0.85));
      for (let k = 0; k < count; k++) {
        const a0 = (k / count) * Math.PI * 2;
        const a1 = ((k + 1) / count) * Math.PI * 2 - 0.018;
        ctx.beginPath();
        ctx.arc(c, c, r1, a0, a1);
        ctx.arc(c, c, r0, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = `hsl(${32 + rng() * 12}, ${16 + rng() * 10}%, ${62 + rng() * 14}%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.09)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });
}

/* ── Buildings ─────────────────────────────────────────────────────────── */

const WALLS = ['#f0e6d2', '#e6dac2', '#f2d9d0', '#dbd1bd'];
const ROOFS = ['#b4453a', '#8c5a3c', '#4f5d68', '#7a4b52'];

export function wallTexture(variant: number): THREE.CanvasTexture {
  const v = ((variant % WALLS.length) + WALLS.length) % WALLS.length;
  return paint(`wall:${v}`, 128, 1, (ctx, s) => {
    ctx.fillStyle = WALLS[v];
    ctx.fillRect(0, 0, s, s);
    const rng = mulberry32(200 + v);
    speckle(ctx, s, rng, 1500, 0.045);
  });
}

export function roofTexture(variant: number): THREE.CanvasTexture {
  const v = ((variant % ROOFS.length) + ROOFS.length) % ROOFS.length;
  return paint(`roof:${v}`, 128, 1, (ctx, s) => {
    ctx.fillStyle = ROOFS[v];
    ctx.fillRect(0, 0, s, s);
    const rng = mulberry32(300 + v);
    // Tile courses.
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.lineWidth = 1.5;
    for (let y = 8; y < s; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(s, y);
      ctx.stroke();
    }
    for (let y = 8; y < s; y += 12) {
      const off = ((y / 12) % 2) * 10;
      for (let x = off; x < s; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 12);
        ctx.stroke();
      }
    }
    speckle(ctx, s, rng, 900, 0.06);
  });
}

/**
 * One lit window on black. Buildings clone this and set their own repeat, so a
 * three-storey townhouse gets a 3×4 grid and a hut gets 1×2 — from one texture.
 */
export function windowTexture(): THREE.CanvasTexture {
  return paint('window', 64, 1, (ctx, s) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, s, s);
    const w = s * 0.4;
    const h = s * 0.46;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((s - w) / 2, (s - h) / 2, w, h);
  });
}

/* ── Effects ───────────────────────────────────────────────────────────── */

/** Soft radial sprite used for fireflies, glows and the lighthouse halo. */
export function glowTexture(): THREE.CanvasTexture {
  const t = paint('glow', 64, 1, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.32, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Grayscale fractal noise, scrolled by the water shader to fake a surface. */
export function waterTexture(): THREE.CanvasTexture {
  return paint('water', 128, 3, (ctx, s) => {
    const img = ctx.createImageData(s, s);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = fbm(x * 0.055, y * 0.055, 4);
        const v = (n * 255) | 0;
        const i = (y * s + x) * 4;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}
