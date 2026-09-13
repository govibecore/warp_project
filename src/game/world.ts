/**
 * world.ts — the sunlit glade.
 *
 * A gentle, non-negative fbm height field coloured per-vertex (grass
 * variants, dirt patches, sandy pond shores), with procedurally scattered
 * trees, rocks, grass tufts and flowers — all from one seed. Foliage sways
 * in the wind, cloud puffs drift overhead, pond discs sit in the dips.
 * A clear circle at the origin keeps the spawn point open.
 */

import * as THREE from 'three';
import { fbm, hexToRgb, lerp, mulberry32 } from './utils';
import { makeToonMaterial } from './shaders';

const WORLD_SIZE = 220;
const HALF = WORLD_SIZE / 2;
const SPAWN_CLEAR = 14;

const GRASS_A = '#5a8fa0';
const GRASS_B = '#6a9caa';
const GRASS_C = '#4d8090';
const DIRT = '#8a9aa8';
const SAND = '#b0c0cc';
const TRUNK = '#6a7a88';
const ROCK_A = '#8090a0';
const ROCK_B = '#708090';
const POND = '#7abcc8';
const FOLIAGE = ['#4a8a9a', '#5c9caa', '#3d7888'];
const FLOWERS = ['#d0dfe8', '#a0c4d8', '#7ab0c8', '#e0eaf0'];

/** Ground height — pure function so entities can walk the same field. */
export function heightAt(x: number, z: number): number {
  const rolling = Math.pow(fbm(x * 0.035 + 7.3, z * 0.035 + 7.3, 4), 1.25) * 2.4;
  const d = Math.hypot(x, z);
  // Flat spawn glade: hills fade in from SPAWN_CLEAR to ~2× that radius.
  const t = Math.min(1, Math.max(0, (d - SPAWN_CLEAR) / SPAWN_CLEAR));
  return rolling * (t * t * (3 - 2 * t));
}

export interface World {
  group: THREE.Group;
  heightAt: (x: number, z: number) => number;
  update(dt: number): void;
  dispose(): void;
}

export function buildWorld(seed: number): World {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  const clouds: THREE.Group[] = [];

  // ── Terrain ──────────────────────────────────────────────────────────
  const terrainGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 96, 96);
  terrainGeo.rotateX(-Math.PI / 2);
  const pos = terrainGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  const grassA = hexToRgb(GRASS_A);
  const grassB = hexToRgb(GRASS_B);
  const grassC = hexToRgb(GRASS_C);
  const dirt = hexToRgb(DIRT);
  const sand = hexToRgb(SAND);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);

    // Layered noise → grass variant, dirt patch, sandy dip.
    const nPatch = fbm(x * 0.05 + 31.7, z * 0.05 + 31.7, 3);
    const nTint = fbm(x * 0.13 + 91.2, z * 0.13 + 91.2, 2);
    let r = lerp(grassA[0], grassB[0], nTint);
    let g = lerp(grassA[1], grassB[1], nTint);
    let b = lerp(grassA[2], grassB[2], nTint);
    if (nTint > 0.62) {
      r = lerp(r, grassC[0], 0.7);
      g = lerp(g, grassC[1], 0.7);
      b = lerp(b, grassC[2], 0.7);
    }
    if (nPatch > 0.6) {
      const k = Math.min(1, (nPatch - 0.6) * 5);
      r = lerp(r, dirt[0], k);
      g = lerp(g, dirt[1], k);
      b = lerp(b, dirt[2], k);
    }
    if (h < 0.28 && nPatch < 0.45) {
      r = lerp(r, sand[0], 0.55);
      g = lerp(g, sand[1], 0.55);
      b = lerp(b, sand[2], 0.55);
    }
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrain = new THREE.Mesh(
    terrainGeo,
    makeToonMaterial({ base: '#ffffff', shadow: [0.68, 0.66, 0.62], vertexColors: true }),
  );
  group.add(terrain);

  // ── Scatter helper ───────────────────────────────────────────────────
  interface Pond {
    x: number;
    z: number;
    r: number;
  }
  const ponds: Pond[] = [];
  for (let i = 0; i < 3; i++) {
    const x = (rng() - 0.5) * 130;
    const z = (rng() - 0.5) * 130;
    if (Math.hypot(x, z) < 30) continue;
    ponds.push({ x, z, r: 3 + rng() * 2.2 });
  }

  const clearOf = (x: number, z: number) => {
    if (Math.hypot(x, z) < SPAWN_CLEAR) return false;
    for (const p of ponds) if (Math.hypot(x - p.x, z - p.z) < p.r + 3) return false;
    return true;
  };

  const scatter = (count: number, place: (x: number, z: number) => void) => {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      const x = (rng() - 0.5) * (WORLD_SIZE - 24);
      const z = (rng() - 0.5) * (WORLD_SIZE - 24);
      if (!clearOf(x, z)) continue;
      place(x, z);
      placed++;
    }
  };

  // ── Ponds (sand shore + water disc) ──────────────────────────────────
  const shoreMat = makeToonMaterial({ base: SAND });
  const pondMat = makeToonMaterial({
    base: POND,
    shadow: [0.45, 0.62, 0.58],
    opacity: 0.78,
    transparent: true,
    side: THREE.DoubleSide,
  });
  for (const p of ponds) {
    const y = heightAt(p.x, p.z);
    const shore = new THREE.Mesh(new THREE.CircleGeometry(p.r + 1.1, 26), shoreMat);
    shore.rotation.x = -Math.PI / 2;
    shore.position.set(p.x, y + 0.02, p.z);
    const water = new THREE.Mesh(new THREE.CircleGeometry(p.r, 26), pondMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(p.x, y + 0.06, p.z);
    group.add(shore, water);
  }

  // ── Shared vegetation materials ──────────────────────────────────────
  const trunkMat = makeToonMaterial({ base: TRUNK });
  const foliageMats = FOLIAGE.map((c) => makeToonMaterial({ base: c, sway: 0.05 }));
  const rockMats = [ROCK_A, ROCK_B].map((c) => makeToonMaterial({ base: c }));
  const tuftMats = [GRASS_C, GRASS_A, '#699e57'].map((c) =>
    makeToonMaterial({ base: c, sway: 0.03 }),
  );
  const stemMat = makeToonMaterial({ base: '#699e57' });
  const flowerMats = FLOWERS.map((c) => makeToonMaterial({ base: c }));

  // ── Trees: trunk + 2–3 lumpy foliage blobs ───────────────────────────
  scatter(26, (x, z) => {
    const y = heightAt(x, z);
    const tree = new THREE.Group();
    const trunkH = 1.2 + rng() * 0.9;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13 + rng() * 0.06, 0.2 + rng() * 0.08, trunkH, 7),
      trunkMat,
    );
    trunk.position.y = trunkH / 2;
    tree.add(trunk);

    const blobs = 2 + Math.floor(rng() * 2);
    const fMat = foliageMats[Math.floor(rng() * foliageMats.length)];
    for (let i = 0; i < blobs; i++) {
      const r = 0.7 + rng() * 0.6;
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), fMat);
      blob.position.set(
        (rng() - 0.5) * 0.9,
        trunkH + 0.3 + i * 0.55 + rng() * 0.2,
        (rng() - 0.5) * 0.9,
      );
      blob.scale.set(0.85 + rng() * 0.4, 0.75 + rng() * 0.35, 0.85 + rng() * 0.4);
      blob.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      tree.add(blob);
    }
    const s = 0.85 + rng() * 0.6;
    tree.scale.setScalar(s);
    tree.position.set(x, y, z);
    tree.rotation.y = rng() * Math.PI * 2;
    group.add(tree);
  });

  // ── Rocks ────────────────────────────────────────────────────────────
  scatter(18, (x, z) => {
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3 + rng() * 0.5, 0),
      rockMats[Math.floor(rng() * rockMats.length)],
    );
    rock.scale.set(0.7 + rng() * 0.6, 0.5 + rng() * 0.5, 0.7 + rng() * 0.6);
    rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    rock.position.set(x, heightAt(x, z) + 0.08, z);
    group.add(rock);
  });

  // ── Grass tufts ──────────────────────────────────────────────────────
  scatter(90, (x, z) => {
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.07 + rng() * 0.05, 0.3 + rng() * 0.25, 4),
      tuftMats[Math.floor(rng() * tuftMats.length)],
    );
    tuft.position.set(x, heightAt(x, z) + 0.14, z);
    tuft.rotation.y = rng() * Math.PI;
    group.add(tuft);
  });

  // ── Flowers ──────────────────────────────────────────────────────────
  scatter(36, (x, z) => {
    const y = heightAt(x, z);
    const stemH = 0.22 + rng() * 0.16;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, stemH, 5), stemMat);
    stem.position.set(x, y + stemH / 2, z);
    const head = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.07 + rng() * 0.04, 0),
      flowerMats[Math.floor(rng() * flowerMats.length)],
    );
    head.position.set(x, y + stemH + 0.05, z);
    head.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    group.add(stem, head);
  });

  // ── Clouds: squashed-sphere puffs drifting overhead ──────────────────
  const cloudMat = makeToonMaterial({
    base: '#4a8aaa',
    shadow: [0.22, 0.34, 0.42],
    opacity: 0.35,
    transparent: true,
  });
  for (let i = 0; i < 6; i++) {
    const cloud = new THREE.Group();
    const puffs = 2 + Math.floor(rng() * 3);
    for (let j = 0; j < puffs; j++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6 + rng() * 1.4, 1), cloudMat);
      puff.scale.set(1.4 + rng() * 0.8, 0.45 + rng() * 0.2, 1 + rng() * 0.5);
      puff.position.set((j - puffs / 2) * 2.2 + (rng() - 0.5), (rng() - 0.5) * 0.6, (rng() - 0.5) * 1.4);
      cloud.add(puff);
    }
    cloud.position.set((rng() - 0.5) * WORLD_SIZE, 18 + rng() * 8, (rng() - 0.5) * WORLD_SIZE);
    clouds.push(cloud);
    group.add(cloud);
  }

  return {
    group,
    heightAt,
    update(dt: number) {
      for (const cloud of clouds) {
        cloud.position.x += dt * 0.7;
        if (cloud.position.x > HALF + 20) cloud.position.x = -HALF - 20;
      }
    },
    dispose() {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
          else m.dispose();
        }
      });
    },
  };
}
