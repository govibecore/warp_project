/**
 * utils.ts — seeded randomness, value-noise fbm, interpolation, colour.
 *
 * Everything in the glade is deterministic: one seed produces one world, so
 * every visitor (and every test run) sees the same painting.
 */

/** mulberry32 — tiny, fast, seedable PRNG. Returns values in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer-lattice hash → [0, 1). Deterministic, no Math.sin. */
function hash2(x: number, z: number): number {
  let h = (x * 374761393 + z * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Value noise on the 2D lattice, bilinear with smoothstep easing. */
export function valueNoise2D(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  const ux = smooth(fx);
  const uz = smooth(fz);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

/** Fractal Brownian motion: stacked value noise, output roughly [0, 1]. */
export function fbm(x: number, z: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, z * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Frame-rate-independent exponential damping (Freya Holmér's damp).
 * Returns the new value moving `current` toward `target` with rate `lambda`.
 */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(target, current, Math.exp(-lambda * dt));

/** '#rrggbb' → [r, g, b] in 0–1 linear-ish space (used as authored). */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Warm-biased darken: the shadow tone of a hand-painted colour. Drops
 * luminance while nudging toward a warm earth hue rather than pure black.
 */
export function warmShadow(hex: string, amount = 0.62): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const warm: [number, number, number] = [0.28, 0.2, 0.12];
  return [
    clamp(r * amount + warm[0] * (1 - amount) * 0.55, 0, 1),
    clamp(g * amount + warm[1] * (1 - amount) * 0.55, 0, 1),
    clamp(b * amount + warm[2] * (1 - amount) * 0.55, 0, 1),
  ];
}
