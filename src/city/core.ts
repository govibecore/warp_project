/**
 * STEM City — core toolkit.
 *
 * Deterministic RNG, hand-written value noise, and the semantic region spec
 * that drives the entire island. Terrain, buildings and landmarks all read
 * from these tables, so retuning the city is a matter of editing numbers.
 *
 * No external assets are ever fetched: every surface in the city is painted
 * live on a 2D canvas and every model is stacked from Three.js primitives.
 */

/* ── Deterministic randomness ───────────────────────────────────────────── */

/** mulberry32 — small, fast, seedable. Same seed → same city, every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Math helpers ──────────────────────────────────────────────────────── */

export const TAU = Math.PI * 2;
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Shortest signed angular difference — the camera never takes the long way. */
export function angDiff(a: number, b: number): number {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

/* ── Value noise ───────────────────────────────────────────────────────── */

function hash2(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

/** Smoothed value noise in [0,1]. */
export function noise2(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return lerp(
    lerp(hash2(xi, yi), hash2(xi + 1, yi), u),
    lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u),
    v,
  );
}

/** Multi-octave fractal noise in [0,1]. */
export function fbm(x: number, y: number, octaves = 4): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(fx, fy);
    norm += amp;
    amp *= 0.5;
    fx *= 2;
    fy *= 2;
  }
  return sum / norm;
}

/* ── Spec ──────────────────────────────────────────────────────────────── */

export type CompetencyId =
  | 'scientificInquiry'
  | 'computationalThinking'
  | 'engineeringDesign'
  | 'mathematicalReasoning'
  | 'systemsThinking';

export type TerrainOp = 'terrace' | 'plateau' | 'peak' | 'ridge' | 'dune' | 'erosion';
export type Biome = 'meadow' | 'civic' | 'rock' | 'forest' | 'shore' | 'water' | 'crop' | 'sand';
export type Landmark =
  | 'observatory'
  | 'server'
  | 'windmill'
  | 'clocktower'
  | 'lighthouse'
  | 'obelisk'
  | 'none';

export interface RegionSpec {
  id: string;
  /** Short badge shown in the UI, e.g. "INQUIRY". */
  label: string;
  /** Full district name, e.g. "Inquiry Quarter". */
  name: string;
  competency?: CompetencyId;
  role: 'competency' | 'reference' | 'nature';
  biome: Biome;
  x: number;
  z: number;
  r: number;
  ops: TerrainOp[];
  /** Accent colour — the district's chart hue. */
  color: string;
  landmark: Landmark;
}

export const SEED = 20260909;

export const ISLAND = {
  radius: 72,
  /** How far the cliff drops before the island tapers to a point. */
  cliffBottom: -58,
  /** Extra samples ring for smoother silhouette. */
  rim: 6,
} as const;

/**
 * Scores are reported 0–100, but real cohorts cluster tightly, so we stretch a
 * realistic band across the island's vertical range. Outside it a district
 * simply tops out rather than shooting off the top of the frame.
 */
export const SCORE_BAND = { min: 36, max: 86 } as const;
export const HEIGHT_RANGE = { min: 4, max: 30 } as const;

/** Score (0–100) → the elevation that score earns, in world units. */
export function scoreToHeight(score: number): number {
  const t = clamp((score - SCORE_BAND.min) / (SCORE_BAND.max - SCORE_BAND.min), 0, 1);
  return lerp(HEIGHT_RANGE.min, HEIGHT_RANGE.max, t);
}

/* ── SCENE_SPEC ────────────────────────────────────────────────────────── */

/**
 * The five competency districts sit on a ring around the island, one per
 * competency. Their elevation *is* the learner's score — which is the whole
 * point: you can read a profile off the skyline at a glance.
 */
export const DISTRICTS: readonly RegionSpec[] = [
  {
    id: 'inquiry',
    label: 'INQUIRY',
    name: 'Inquiry Quarter',
    competency: 'scientificInquiry',
    role: 'competency',
    biome: 'meadow',
    x: 0,
    z: -38,
    r: 21,
    ops: ['terrace'],
    color: '#5ba6d6', // Fjord
    landmark: 'observatory',
  },
  {
    id: 'compute',
    label: 'COMPUTE',
    name: 'Compute Core',
    competency: 'computationalThinking',
    role: 'competency',
    biome: 'civic',
    x: 36,
    z: -12,
    r: 20,
    ops: ['plateau'],
    color: '#4ea658', // Moss
    landmark: 'server',
  },
  {
    id: 'engineer',
    label: 'ENGINEER',
    name: 'Engineer Works',
    competency: 'engineeringDesign',
    role: 'competency',
    biome: 'rock',
    x: 22,
    z: 31,
    r: 21,
    ops: ['ridge', 'terrace'],
    color: '#d9a043', // Amber/Gold
    landmark: 'windmill',
  },
  {
    id: 'reason',
    label: 'REASON',
    name: 'Reason Grove',
    competency: 'mathematicalReasoning',
    role: 'competency',
    biome: 'forest',
    x: -22,
    z: 31,
    r: 20,
    ops: ['peak'],
    color: '#b35836', // Terracotta
    landmark: 'clocktower',
  },
  {
    id: 'systems',
    label: 'SYSTEMS',
    name: 'Systems Harbor',
    competency: 'systemsThinking',
    role: 'competency',
    biome: 'shore',
    x: -36,
    z: -12,
    r: 21,
    ops: ['dune'],
    color: '#9657b8', // Purple
    landmark: 'lighthouse',
  },
] as const;

/**
 * Supporting regions: the cohort reference at the centre of town, plus the
 * landscape that makes the island feel lived in rather than diagrammed.
 */
export const SUPPORT: readonly RegionSpec[] = [
  {
    id: 'plaza',
    label: 'COHORT',
    name: 'Reference Plaza',
    role: 'reference',
    biome: 'civic',
    x: 0,
    z: 0,
    r: 18,
    ops: ['plateau'],
    color: '#e2e8f0',
    landmark: 'obelisk',
  },
  {
    id: 'lake',
    label: 'LAKE',
    name: 'Lake Basin',
    role: 'nature',
    biome: 'water',
    x: 0,
    z: 47,
    r: 15,
    ops: ['erosion'],
    color: '#38bdf8',
    landmark: 'none',
  },
  {
    id: 'farm',
    label: 'FARM',
    name: 'Outback Farm',
    role: 'nature',
    biome: 'crop',
    x: 50,
    z: 30,
    r: 16,
    ops: ['terrace'],
    color: '#a3e635',
    landmark: 'none',
  },
  {
    id: 'woods',
    label: 'WOODS',
    name: 'Dense Woods',
    role: 'nature',
    biome: 'forest',
    x: -50,
    z: 30,
    r: 17,
    ops: ['ridge'],
    color: '#34d399',
    landmark: 'none',
  },
  {
    id: 'dunes',
    label: 'DUNES',
    name: 'Coastal Dunes',
    role: 'nature',
    biome: 'sand',
    x: 58,
    z: -34,
    r: 16,
    ops: ['dune', 'erosion'],
    color: '#fcd34d',
    landmark: 'none',
  },
] as const;

/** Every region on the island, competency districts first. */
export const REGIONS: readonly RegionSpec[] = [...DISTRICTS, ...SUPPORT];

/** Semantic colours shared by the 3D scene and the HTML overlay. */
export const CITY_COLORS = {
  ahead: '#4ea658',
  behind: '#b35836',
  cohort: '#d0dfe8',
  water: '#1a3a5a',
} as const;

/**
 * Blended region weight at a point. Regions overlap by design — the falloff is
 * smooth so the island reads as one landmass rather than ten stitched discs.
 */
export function regionWeight(r: RegionSpec, x: number, z: number): number {
  const d = Math.hypot(x - r.x, z - r.z);
  return 1 - smoothstep(r.r * 0.35, r.r, d);
}

/** The single most dominant region at a point (used for biome tinting). */
export function dominantRegion(x: number, z: number): RegionSpec {
  let best = REGIONS[0];
  let bestW = -1;
  for (const r of REGIONS) {
    const w = regionWeight(r, x, z);
    if (w > bestW) {
      bestW = w;
      best = r;
    }
  }
  return best;
}
