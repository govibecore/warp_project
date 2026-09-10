import * as THREE from 'three';
import {
  REGIONS,
  DISTRICTS,
  ISLAND,
  CITY_COLORS,
  scoreToHeight,
  regionWeight,
  dominantRegion,
  fbm,
  mulberry32,
  clamp,
  lerp,
  smoothstep,
  TAU,
} from './core';
import type { CompetencyId, RegionSpec } from './core';
import {
  groundTexture,
  plazaTexture,
  wallTexture,
  roofTexture,
  windowTexture,
} from './textures';

/**
 * The island itself: terrain, roads, districts, buildings and landmarks.
 *
 * The one rule that makes this a WARP visual rather than a generic village:
 * **height is score**. Each competency district grows a score column whose top
 * is the learner's result, and a cohort ring marks where the global reference
 * sits on that same column. Above the ring is green, below it amber — the gap
 * the whole product exists to close, standing in the middle of the town.
 */

export interface ScoreEntry {
  you: number;
  ref: number;
}
export type ScoreMap = Record<CompetencyId, ScoreEntry>;

/** Anything that needs to move: spinning sails, ticking hands, blinking lamps. */
export interface CityPiece {
  tick?(t: number, night: number, dt: number): void;
}

/* ── Roads ─────────────────────────────────────────────────────────────── */

const RING_ROAD_R = 26;
const ROAD_HALF = 2.1;

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz || 1;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / len2, 0, 1);
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

/** Signed distance to the nearest road — buildings and trees keep off it. */
export function roadDist(x: number, z: number): number {
  let d = Math.abs(Math.hypot(x, z) - RING_ROAD_R);
  for (const r of DISTRICTS) d = Math.min(d, distToSegment(x, z, 0, 0, r.x, r.z));
  return d;
}

/* ── Terrain ───────────────────────────────────────────────────────────── */

/** What elevation a region wants to sit at, before noise and ops. */
function regionTarget(reg: RegionSpec, scores: ScoreMap): number {
  if (reg.role === 'competency' && reg.competency) {
    // The district rides a little with its own score, but the honest reading
    // of the number lives in the score column, not the ground.
    const s = scores[reg.competency]?.you ?? 50;
    return lerp(2.0, 6.4, clamp((s - 36) / 50, 0, 1));
  }
  if (reg.id === 'plaza') return 5.2;
  if (reg.id === 'lake') return -3.6;
  return lerp(1.6, 4.6, fbm(reg.x * 0.08 + 11, reg.z * 0.08 + 7, 3));
}

/** Terrain ops, applied per the dominant region. Terraces are hard-stepped. */
function applyOps(h: number, x: number, z: number, reg: RegionSpec): number {
  for (const op of reg.ops) {
    switch (op) {
      case 'terrace': {
        const step = 1.5;
        h = Math.round(h / step) * step;
        break;
      }
      case 'plateau':
        h = h * 0.82 + 1.4;
        break;
      case 'peak': {
        const d = Math.hypot(x - reg.x, z - reg.z);
        h += smoothstep(reg.r, 0, d) * 7.5;
        break;
      }
      case 'ridge':
        h += (Math.sin(x * 0.09 + z * 0.06) * 0.5 + 0.5) * 2.6;
        break;
      case 'dune':
        h += Math.sin(x * 0.17) * Math.cos(z * 0.15) * 1.7;
        break;
      case 'erosion':
        h *= 0.7;
        break;
    }
  }
  return h;
}

/** Final ground elevation at a point. */
export function terrainHeight(x: number, z: number, scores: ScoreMap): number {
  const r = Math.hypot(x, z);
  if (r > ISLAND.radius) return -6;

  let h = 0;
  let wsum = 0;
  for (const reg of REGIONS) {
    const w = regionWeight(reg, x, z);
    if (w > 0.001) {
      h += w * regionTarget(reg, scores);
      wsum += w;
    }
  }
  h = wsum > 0 ? h / wsum : 2;

  h += (fbm(x * 0.045, z * 0.045, 4) - 0.5) * 3.0;
  h += (fbm(x * 0.15, z * 0.15, 2) - 0.5) * 0.8;

  const dom = dominantRegion(x, z);
  h = applyOps(h, x, z, dom);

  // Roads are cut level, so the town reads as built rather than dumped.
  const road = smoothstep(ROAD_HALF + 3.5, ROAD_HALF, roadDist(x, z));
  h = lerp(h, 3.1, road * 0.75);

  // Rim falls away into the cliff.
  const edge = smoothstep(ISLAND.radius, ISLAND.radius * 0.78, r);
  return lerp(-3.0, h, edge);
}

const BIOME_TINT: Record<string, THREE.Color> = {
  meadow: new THREE.Color('#8fc46d'),
  civic: new THREE.Color('#d8cdb8'),
  rock: new THREE.Color('#9d948a'),
  forest: new THREE.Color('#5c8a55'),
  shore: new THREE.Color('#e3d5a6'),
  water: new THREE.Color('#3f83ad'),
  crop: new THREE.Color('#cbb85e'),
  sand: new THREE.Color('#e9dcae'),
};

/** Ground colour: biome tint, darkened where the roads run, rocky at the rim. */
function terrainColor(x: number, z: number, out: THREE.Color): THREE.Color {
  const dom = dominantRegion(x, z);
  out.copy(BIOME_TINT[dom.biome] ?? BIOME_TINT.meadow);

  const road = smoothstep(ROAD_HALF + 1.2, ROAD_HALF, roadDist(x, z));
  out.lerp(new THREE.Color('#5a5a63'), road * 0.85);

  const r = Math.hypot(x, z);
  const rocky = smoothstep(ISLAND.radius * 0.82, ISLAND.radius, r);
  out.lerp(new THREE.Color('#6d6357'), rocky * 0.8);

  return out;
}

export interface TerrainResult {
  mesh: THREE.Mesh;
  heightAt(x: number, z: number): number;
}

export function buildTerrain(scores: ScoreMap): TerrainResult {
  const R = 74; // radial steps
  const S = 128; // angular steps
  const pos: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();

  // Sample the height field once into a grid so the skirt can share the rim.
  const heightAt = (x: number, z: number) => terrainHeight(x, z, scores);

  pos.push(0, heightAt(0, 0), 0);
  uv.push(0.5, 0.5);
  terrainColor(0, 0, c);
  col.push(c.r, c.g, c.b);

  for (let i = 1; i <= R; i++) {
    const rr = (i / R) * ISLAND.radius;
    for (let j = 0; j < S; j++) {
      const a = (j / S) * TAU;
      const x = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      pos.push(x, heightAt(x, z), z);
      uv.push(0.5 + x / (2 * ISLAND.radius), 0.5 + z / (2 * ISLAND.radius));
      terrainColor(x, z, c);
      col.push(c.r, c.g, c.b);
    }
  }

  for (let j = 0; j < S; j++) idx.push(0, 1 + ((j + 1) % S), 1 + j);
  for (let i = 1; i < R; i++) {
    const b0 = 1 + (i - 1) * S;
    const b1 = 1 + i * S;
    for (let j = 0; j < S; j++) {
      const j2 = (j + 1) % S;
      idx.push(b0 + j, b1 + j, b1 + j2);
      idx.push(b0 + j, b1 + j2, b0 + j2);
    }
  }

  // ── Cliff skirt: the island tapers to a point underneath, so it floats. ──
  const K = 12;
  const skirtStart = pos.length / 3;
  for (let j = 0; j < S; j++) {
    const a = (j / S) * TAU;
    const x = Math.cos(a) * ISLAND.radius;
    const z = Math.sin(a) * ISLAND.radius;
    pos.push(x, heightAt(x, z), z);
    uv.push(0.5 + x / (2 * ISLAND.radius), 0.5 + z / (2 * ISLAND.radius));
    col.push(0.42, 0.38, 0.33);
  }
  for (let k = 1; k <= K; k++) {
    const t = k / K;
    const rr = ISLAND.radius * Math.pow(1 - t, 0.62);
    const y = lerp(-3.0, ISLAND.cliffBottom, t);
    for (let j = 0; j < S; j++) {
      const a = (j / S) * TAU;
      const wobble = 1 + (fbm(Math.cos(a) * 3 + k * 0.7, Math.sin(a) * 3, 2) - 0.5) * 0.16;
      const x = Math.cos(a) * rr * wobble;
      const z = Math.sin(a) * rr * wobble;
      pos.push(x, y, z);
      uv.push(0.5 + x / (2 * ISLAND.radius), 0.5 + z / (2 * ISLAND.radius));
      const shade = lerp(0.4, 0.16, t);
      col.push(shade, shade * 0.92, shade * 0.82);
    }
  }
  const apexIndex = pos.length / 3;
  pos.push(0, ISLAND.cliffBottom - 7, 0);
  uv.push(0.5, 0.5);
  col.push(0.12, 0.11, 0.1);

  for (let k = 0; k < K; k++) {
    const b0 = skirtStart + k * S;
    const b1 = skirtStart + (k + 1) * S;
    for (let j = 0; j < S; j++) {
      const j2 = (j + 1) % S;
      idx.push(b0 + j, b1 + j, b1 + j2);
      idx.push(b0 + j, b1 + j2, b0 + j2);
    }
  }
  const lastRing = skirtStart + K * S;
  for (let j = 0; j < S; j++) idx.push(lastRing + j, apexIndex, lastRing + ((j + 1) % S));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    map: groundTexture('meadow'),
    vertexColors: true,
    roughness: 0.94,
    metalness: 0,
    // The skirt is visible from below; DoubleSide keeps it solid from any angle.
    side: THREE.DoubleSide,
  });
  mat.map!.repeat.set(9, 9);

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.name = 'terrain';
  return { mesh, heightAt };
}

/* ── Plaza & lake ──────────────────────────────────────────────────────── */

export function buildPlaza(): THREE.Mesh {
  const geo = new THREE.CircleGeometry(17, 64);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: plazaTexture(), roughness: 0.9 }),
  );
  mesh.position.y = 5.35;
  mesh.receiveShadow = true;
  mesh.name = 'plaza';
  return mesh;
}

export function buildLake(water: THREE.Texture): THREE.Mesh {
  const geo = new THREE.CircleGeometry(14.5, 56);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    map: water,
    color: new THREE.Color(CITY_COLORS.water),
    transparent: true,
    opacity: 0.9,
    roughness: 0.14,
    metalness: 0.25,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, -1.4, 47);
  mesh.name = 'lake';
  return mesh;
}

/* ── Buildings ─────────────────────────────────────────────────────────── */

interface Tier {
  w: number;
  d: number;
  floors: number;
  weight: number;
  setback: number;
}

const TIERS: readonly Tier[] = [
  { w: 3.2, d: 3.0, floors: 1, weight: 0.3, setback: 3.0 },
  { w: 4.2, d: 3.6, floors: 2, weight: 0.32, setback: 3.4 },
  { w: 5.4, d: 4.4, floors: 3, weight: 0.2, setback: 4.0 },
  { w: 7.0, d: 5.2, floors: 4, weight: 0.12, setback: 4.6 },
  { w: 9.0, d: 6.4, floors: 5, weight: 0.06, setback: 5.4 },
];

const FLOOR_H = 1.7;

function pickTier(r: number): Tier {
  let acc = 0;
  for (const t of TIERS) {
    acc += t.weight;
    if (r <= acc) return t;
  }
  return TIERS[0];
}

/** One building: a box of walls under a four-sided pyramid roof. */
export function makeBuilding(
  rng: () => number,
  tier: Tier,
  lit: boolean,
): THREE.Group {
  const g = new THREE.Group();
  const variant = Math.floor(rng() * 4);
  const h = FLOOR_H * tier.floors;

  const wallTex = wallTexture(variant);
  const winTex = windowTexture().clone();
  winTex.needsUpdate = true;
  winTex.repeat.set(Math.max(2, Math.round(tier.w * 0.9)), tier.floors);

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    emissive: new THREE.Color('#ffd9a0'),
    emissiveMap: winTex,
    emissiveIntensity: 0,
    roughness: 0.85,
  });

  const walls = new THREE.Mesh(new THREE.BoxGeometry(tier.w, h, tier.d), wallMat);
  walls.position.y = h / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  g.add(walls);

  // Angular roof: a four-sided pyramid, echoing the brand's no-curves rule.
  const roofH = 1.2 + tier.floors * 0.42;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(tier.w * 0.82, roofH, 4),
    new THREE.MeshStandardMaterial({ map: roofTexture(variant), roughness: 0.8 }),
  );
  roof.position.y = h + roofH / 2;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  if (lit) {
    // A lit building keeps a small warm halo so night streets aren't black.
    const lamp = new THREE.PointLight('#ffcf8a', 0, 9);
    lamp.position.y = h * 0.6;
    g.add(lamp);
  }
  return g;
}

/* ── The score column: height is score, the ring is the cohort ──────────── */

export interface ScoreColumn {
  group: THREE.Group;
  /** Top of the learner's column, in world units. */
  topY: number;
  /** Where the cohort reference sits on the same column. */
  ringY: number;
}

/**
 * The heart of the piece. A slim tower grows to the learner's score; a cohort
 * ring encircles it at the reference score; the span between them is painted
 * green when the learner is ahead and amber when there is ground to make up.
 */
export function buildScoreColumn(
  groundY: number,
  you: number,
  ref: number,
  accent: string,
): ScoreColumn {
  const group = new THREE.Group();
  const youH = scoreToHeight(you);
  const refH = scoreToHeight(ref);
  const ahead = you >= ref;

  const accentColor = new THREE.Color(accent);

  // The column.
  const colMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.32,
    roughness: 0.45,
    metalness: 0.1,
  });
  const column = new THREE.Mesh(new THREE.BoxGeometry(3.4, youH, 3.4), colMat);
  column.position.y = groundY + youH / 2;
  column.castShadow = true;
  group.add(column);

  // Ruler ticks up the column, so the height reads as a measurement.
  const tickMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ffffff') });
  for (let i = 1; i <= 4; i++) {
    const y = groundY + (youH * i) / 5;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.09, 2.9), tickMat);
    tick.position.y = y;
    group.add(tick);
  }

  // The cohort ring.
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.16, 6, 32),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(CITY_COLORS.cohort),
      emissive: new THREE.Color(CITY_COLORS.cohort),
      emissiveIntensity: 0.55,
      roughness: 0.4,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = groundY + refH;
  group.add(ring);

  // The gap: the span between the learner and the reference, sheathed around
  // the column so it reads from across the island — green above the ring
  // (ahead), amber below it (the gap to close).
  const gapH = Math.abs(youH - refH);
  if (gapH > 0.12) {
    const gapColor = new THREE.Color(ahead ? CITY_COLORS.ahead : CITY_COLORS.behind);
    const gap = new THREE.Mesh(
      new THREE.BoxGeometry(3.58, gapH, 3.58),
      new THREE.MeshStandardMaterial({
        color: gapColor,
        emissive: gapColor,
        emissiveIntensity: 0.55,
        roughness: 0.35,
      }),
    );
    gap.position.y = groundY + Math.min(youH, refH) + gapH / 2;
    group.add(gap);

    // A marker plate on the column top so "you are here" is unmistakable.
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.26, 3.8),
      new THREE.MeshStandardMaterial({
        color: gapColor,
        emissive: gapColor,
        emissiveIntensity: 0.9,
      }),
    );
    cap.position.y = groundY + youH + 0.13;
    group.add(cap);
  }

  return { group, topY: groundY + youH, ringY: groundY + refH };
}

/* ── Landmarks ─────────────────────────────────────────────────────────── */

/** An observatory: a drum, a hemispherical dome, and a telescope that sweeps. */
function makeObservatory(accent: string): { group: THREE.Group; piece: CityPiece } {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: '#ddd3bf', roughness: 0.9 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 2.4, 16), stone);
  base.position.y = 1.2;
  base.castShadow = true;
  g.add(base);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 20, 12, 0, TAU, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, metalness: 0.2 }),
  );
  dome.position.y = 2.4;
  dome.castShadow = true;
  g.add(dome);

  const scope = new THREE.Group();
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 3.2, 10),
    new THREE.MeshStandardMaterial({ color: '#3d4652', roughness: 0.5, metalness: 0.4 }),
  );
  tube.rotation.z = Math.PI / 2.6;
  tube.position.set(0.9, 3.4, 0);
  scope.add(tube);
  g.add(scope);

  return {
    group: g,
    piece: { tick: (t) => void (scope.rotation.y = t * 0.16) },
  };
}

/** A server tower: racked boxes, an antenna, and a lamp that blinks. */
function makeServer(accent: string): { group: THREE.Group; piece: CityPiece } {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 6.4, 3.0),
    new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 0.6, metalness: 0.3 }),
  );
  body.position.y = 3.2;
  body.castShadow = true;
  g.add(body);

  const rackMat = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.6,
  });
  for (let i = 0; i < 6; i++) {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.28, 3.15), rackMat);
    rack.position.y = 1.1 + i * 0.92;
    g.add(rack);
  }

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 3.4, 6),
    new THREE.MeshStandardMaterial({ color: '#8b949e' }),
  );
  mast.position.y = 8.1;
  g.add(mast);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 6),
    new THREE.MeshStandardMaterial({
      color: '#ff5f5f',
      emissive: new THREE.Color('#ff5f5f'),
      emissiveIntensity: 1,
    }),
  );
  lamp.position.y = 9.9;
  g.add(lamp);

  return {
    group: g,
    piece: {
      tick: (t) => {
        lamp.material.emissiveIntensity = 0.35 + 0.65 * (Math.sin(t * 3.2) > 0 ? 1 : 0.15);
      },
    },
  };
}

/** A windmill: the sails are the whole point, so they actually turn. */
function makeWindmill(): { group: THREE.Group; piece: CityPiece } {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 2.4, 7.0, 12),
    new THREE.MeshStandardMaterial({ color: '#e6dcc6', roughness: 0.9 }),
  );
  tower.position.y = 3.5;
  tower.castShadow = true;
  g.add(tower);

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 1.6, 12),
    new THREE.MeshStandardMaterial({ color: '#8c5a3c', roughness: 0.8 }),
  );
  cap.position.y = 7.7;
  g.add(cap);

  const hub = new THREE.Group();
  hub.position.set(0, 7.0, 1.9);
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#f4ece0', roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.34, 4.6, 0.14), bladeMat);
    blade.position.y = 2.3;
    const arm = new THREE.Group();
    arm.rotation.z = (i / 4) * TAU;
    arm.add(blade);
    hub.add(arm);
  }
  g.add(hub);

  return { group: g, piece: { tick: (t) => void (hub.rotation.z = t * 0.55) } };
}

/** A clock tower whose hands tell the real time. */
function makeClockTower(): { group: THREE.Group; piece: CityPiece } {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 9.5, 3.0),
    new THREE.MeshStandardMaterial({ color: '#efe4cf', roughness: 0.9 }),
  );
  body.position.y = 4.75;
  body.castShadow = true;
  g.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 2.8, 4),
    new THREE.MeshStandardMaterial({ color: '#4f5d68', roughness: 0.8 }),
  );
  roof.position.y = 10.9;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(1.25, 24),
    new THREE.MeshStandardMaterial({ color: '#f7f2e6', roughness: 0.5 }),
  );
  face.position.set(0, 7.6, 1.52);
  g.add(face);

  const handMat = new THREE.MeshStandardMaterial({ color: '#2b2f36' });
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.06), handMat);
  hourHand.geometry.translate(0, 0.36, 0);
  hourHand.position.set(0, 7.6, 1.58);
  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 0.06), handMat);
  minHand.geometry.translate(0, 0.52, 0);
  minHand.position.set(0, 7.6, 1.6);
  g.add(hourHand, minHand);

  return {
    group: g,
    piece: {
      tick: () => {
        const now = new Date();
        const mins = now.getHours() * 60 + now.getMinutes();
        hourHand.rotation.z = -((mins / 720) * TAU);
        minHand.rotation.z = -((now.getMinutes() / 60) * TAU);
      },
    },
  };
}

/** A lighthouse with a beam that only earns its keep after dark. */
function makeLighthouse(): { group: THREE.Group; piece: CityPiece } {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 2.0, 9.0, 12),
    new THREE.MeshStandardMaterial({ color: '#f2ece0', roughness: 0.85 }),
  );
  tower.position.y = 4.5;
  tower.castShadow = true;
  g.add(tower);

  const stripeMat = new THREE.MeshStandardMaterial({ color: '#c0453a', roughness: 0.85 });
  for (let i = 0; i < 3; i++) {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.5 - i * 0.14, 1.62 - i * 0.14, 1.1, 12), stripeMat);
    stripe.position.y = 1.6 + i * 2.8;
    g.add(stripe);
  }

  const lampRoom = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 1.5, 12),
    new THREE.MeshStandardMaterial({
      color: '#ffe9b8',
      emissive: new THREE.Color('#ffcf7a'),
      emissiveIntensity: 0.8,
    }),
  );
  lampRoom.position.y = 9.7;
  g.add(lampRoom);

  const beamMat = new THREE.MeshBasicMaterial({
    color: '#ffe6ac',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.6, 26, 4, 1, true), beamMat);
  beam.rotation.z = Math.PI / 2;
  beam.position.set(13, 9.7, 0);
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 0;
  beamPivot.add(beam);
  g.add(beamPivot);

  return {
    group: g,
    piece: {
      tick: (t, night) => {
        beamPivot.rotation.y = t * 0.5;
        beamMat.opacity = night * 0.34;
      },
    },
  };
}

/** The reference obelisk at the centre of the plaza: the cohort, made solid. */
function makeObelisk(): { group: THREE.Group; piece: CityPiece } {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 1.3, 12, 4),
    new THREE.MeshStandardMaterial({
      color: '#eef2f7',
      emissive: new THREE.Color('#cfe4f5'),
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.2,
    }),
  );
  shaft.position.y = 6;
  shaft.castShadow = true;
  g.add(shaft);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(3.0, 0.12, 6, 40),
    new THREE.MeshStandardMaterial({
      color: CITY_COLORS.cohort,
      emissive: new THREE.Color(CITY_COLORS.cohort),
      emissiveIntensity: 0.7,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 8.2;
  g.add(halo);

  return { group: g, piece: { tick: (t) => void (halo.rotation.z = t * 0.3) } };
}

export function makeLandmark(
  kind: RegionSpec['landmark'],
  accent: string,
): { group: THREE.Group; piece: CityPiece } | null {
  switch (kind) {
    case 'observatory':
      return makeObservatory(accent);
    case 'server':
      return makeServer(accent);
    case 'windmill':
      return makeWindmill();
    case 'clocktower':
      return makeClockTower();
    case 'lighthouse':
      return makeLighthouse();
    case 'obelisk':
      return makeObelisk();
    default:
      return null;
  }
}

/* ── Trees & props ─────────────────────────────────────────────────────── */

/** Angular conifers — six-sided cones, no spheres. */
export function makeTree(rng: () => number): THREE.Group {
  const g = new THREE.Group();
  const h = 2.6 + rng() * 2.6;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, h * 0.35, 6),
    new THREE.MeshStandardMaterial({ color: '#6b4f3a', roughness: 0.95 }),
  );
  trunk.position.y = h * 0.175;
  g.add(trunk);

  const green = new THREE.Color(rng() > 0.5 ? '#4e7f4a' : '#3f6b42');
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.1 - t * 0.28, h * 0.45, 6),
      new THREE.MeshStandardMaterial({ color: green, roughness: 0.9 }),
    );
    cone.position.y = h * (0.32 + t * 0.28);
    cone.castShadow = true;
    g.add(cone);
  }
  return g;
}

/* ── District assembly ─────────────────────────────────────────────────── */

export interface DistrictBuild {
  region: RegionSpec;
  group: THREE.Group;
  column: ScoreColumn;
  pieces: CityPiece[];
}

/**
 * Fill one district: houses ringed around the score column, trees wherever the
 * ground is free, and the district's landmark standing just off centre.
 */
export function buildDistrict(
  region: RegionSpec,
  scores: ScoreMap,
  heightAt: (x: number, z: number) => number,
): DistrictBuild {
  const group = new THREE.Group();
  const pieces: CityPiece[] = [];
  const rng = mulberry32(
    SEED_OFFSET + region.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) * 131,
  );

  const entry = region.competency ? scores[region.competency] : undefined;
  const you = entry?.you ?? 60;
  const ref = entry?.ref ?? 55;

  const cx = region.x;
  const cz = region.z;
  const groundY = heightAt(cx, cz);

  // The score column sits at the district centre. Its meshes carry absolute
  // Y already, so only X/Z get placed here.
  const column = buildScoreColumn(groundY, you, ref, region.color);
  column.group.name = 'score-column';
  column.group.position.set(cx, 0, cz);
  group.add(column.group);

  // Building count scales with the score: a strong competency is a busy one.
  const count = Math.round(lerp(7, 15, clamp((you - 40) / 45, 0, 1)));
  const placed: { x: number; z: number; r: number }[] = [
    { x: cx, z: cz, r: 6.5 },
  ];

  for (let attempt = 0, built = 0; attempt < count * 30 && built < count; attempt++) {
    const a = rng() * TAU;
    const rad = 7 + rng() * (region.r - 9);
    const x = cx + Math.cos(a) * rad;
    const z = cz + Math.sin(a) * rad;
    if (Math.hypot(x, z) > ISLAND.radius - 8) continue;
    if (roadDist(x, z) < 3.2) continue;

    const tier = pickTier(rng());
    const clear = placed.every((p) => Math.hypot(p.x - x, p.z - z) > p.r + Math.max(tier.w, tier.d) * 0.6);
    if (!clear) continue;

    const b = makeBuilding(rng, tier, true);
    b.position.set(x, heightAt(x, z), z);
    b.rotation.y = Math.round(rng() * 4) * (Math.PI / 2);
    group.add(b);
    placed.push({ x, z, r: Math.max(tier.w, tier.d) * 0.6 });
    built++;
  }

  // Trees fill the gaps, mostly toward the district edge.
  for (let attempt = 0, planted = 0; attempt < 90 && planted < 22; attempt++) {
    const a = rng() * TAU;
    const rad = 8 + rng() * (region.r - 6);
    const x = cx + Math.cos(a) * rad;
    const z = cz + Math.sin(a) * rad;
    if (Math.hypot(x, z) > ISLAND.radius - 5) continue;
    if (roadDist(x, z) < 2.6) continue;
    if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + 1.6)) continue;

    const tree = makeTree(rng);
    tree.position.set(x, heightAt(x, z), z);
    group.add(tree);
    placed.push({ x, z, r: 1.6 });
    planted++;
  }

  // The landmark stands beside the column, clear of the cohort ring (r≈4.4).
  const lm = makeLandmark(region.landmark, region.color);
  if (lm) {
    const a = rng() * TAU;
    const lx = cx + Math.cos(a) * 7.8;
    const lz = cz + Math.sin(a) * 7.8;
    lm.group.position.set(lx, heightAt(lx, lz), lz);
    lm.group.name = `landmark:${region.id}`;
    group.add(lm.group);
    pieces.push(lm.piece);
  }

  return { region, group, column, pieces };
}

const SEED_OFFSET = 9001;

/** Scatter trees across the nature regions so the island isn't bald. */
export function scatterWoods(heightAt: (x: number, z: number) => number): THREE.Group {
  const g = new THREE.Group();
  const rng = mulberry32(4242);
  for (const reg of REGIONS) {
    if (reg.role !== 'nature' || reg.biome === 'water' || reg.biome === 'sand') continue;
    const n = reg.biome === 'forest' ? 34 : 16;
    for (let i = 0; i < n; i++) {
      const a = rng() * TAU;
      const rad = Math.sqrt(rng()) * reg.r;
      const x = reg.x + Math.cos(a) * rad;
      const z = reg.z + Math.sin(a) * rad;
      if (Math.hypot(x, z) > ISLAND.radius - 4) continue;
      if (roadDist(x, z) < 2.4) continue;
      const tree = makeTree(rng);
      tree.position.set(x, heightAt(x, z), z);
      g.add(tree);
    }
  }
  return g;
}
