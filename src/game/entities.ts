/**
 * entities.ts — the wanderer, the swarm, and the gems.
 *
 * The wanderer is fully AI-driven: it kites away from threats, drifts toward
 * nearby XP gems, wanders when safe, and steers back inside the world bounds.
 * Enemies chase with cheap separation. Four archetypes (slime, flier, brute,
 * boss) each get a distinct silhouette, palette, speed, health and contact
 * damage. Spawns happen on a ring outside the camera view.
 */

import * as THREE from 'three';
import { damp } from './utils';
import { makeContactShadow, makeToonMaterial, setFlash } from './shaders';

export type EnemyKind = 'slime' | 'flier' | 'brute' | 'boss';
export type UnitKind = 'wanderer' | EnemyKind;

export interface Unit {
  kind: UnitKind;
  obj: THREE.Group;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  contactDamage: number;
  xpValue: number;
  alive: boolean;
  flash: number;
  wobble: number;
  nextHitAt: number;
  hover: number;
  materials: THREE.ShaderMaterial[];
}

export interface Gem {
  obj: THREE.Mesh;
  vel: THREE.Vector3;
  value: number;
  alive: boolean;
}

interface Archetype {
  hp: number;
  speed: number;
  radius: number;
  contactDamage: number;
  xp: number;
  hover: number;
}

export const ARCHETYPES: Record<EnemyKind, Archetype> = {
  slime: { hp: 18, speed: 2.2, radius: 0.6, contactDamage: 6, xp: 1, hover: 0 },
  flier: { hp: 12, speed: 4.6, radius: 0.5, contactDamage: 5, xp: 2, hover: 1.3 },
  brute: { hp: 60, speed: 1.6, radius: 0.95, contactDamage: 12, xp: 4, hover: 0 },
  boss: { hp: 320, speed: 1.5, radius: 1.9, contactDamage: 20, xp: 25, hover: 0 },
};

// ── Factories ────────────────────────────────────────────────────────────

export function makeWanderer(rng: () => number = Math.random): Unit {
  const obj = new THREE.Group();
  const bodyMat = makeToonMaterial({ base: '#f2e3c6' });
  const hatMat = makeToonMaterial({ base: '#d9825f' });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.5, 6, 12), bodyMat);
  body.position.y = 0.65;
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 10), hatMat);
  hat.position.y = 1.32;
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 8, 16), hatMat);
  brim.rotation.x = Math.PI / 2;
  brim.position.y = 1.08;
  obj.add(body, hat, brim, makeContactShadow(0.55));

  return {
    kind: 'wanderer',
    obj,
    hp: 100,
    maxHp: 100,
    speed: 6,
    radius: 0.55,
    contactDamage: 0,
    xpValue: 0,
    alive: true,
    flash: 0,
    wobble: rng() * 10,
    nextHitAt: 0,
    hover: 0,
    materials: [bodyMat, hatMat],
  };
}

export function makeEnemy(kind: EnemyKind, hpScale: number, rng: () => number): Unit {
  const a = ARCHETYPES[kind];
  const obj = new THREE.Group();
  const materials: THREE.ShaderMaterial[] = [];

  if (kind === 'slime') {
    const m = makeToonMaterial({ base: '#9bd35e' });
    materials.push(m);
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), m);
    body.scale.set(1, 0.58, 1);
    body.position.y = 0.32;
    obj.add(body);
  } else if (kind === 'flier') {
    const m = makeToonMaterial({ base: '#7fb6d9' });
    materials.push(m);
    const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), m);
    body.name = 'body';
    const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 4), m);
    wingL.name = 'wingL';
    wingL.rotation.z = Math.PI / 2;
    wingL.position.set(-0.45, 0.1, 0);
    const wingR = wingL.clone();
    wingR.name = 'wingR';
    wingR.rotation.z = -Math.PI / 2;
    wingR.position.x = 0.45;
    obj.add(body, wingL, wingR);
  } else {
    // brute + boss share a silhouette; the boss is bigger and crowned.
    const isBoss = kind === 'boss';
    const m = makeToonMaterial({ base: isBoss ? '#8a5fa8' : '#c96f4a' });
    materials.push(m);
    const scale = isBoss ? 2.05 : 1;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62 * scale, 0.78 * scale, 1.05 * scale, 9), m);
    body.position.y = 0.52 * scale;
    obj.add(body);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.14 * scale, 0.5 * scale, 5), m);
    hornL.position.set(-0.4 * scale, 1.15 * scale, 0);
    hornL.rotation.z = 0.5;
    const hornR = hornL.clone();
    hornR.rotation.z = -0.5;
    hornR.position.x = 0.4 * scale;
    obj.add(hornL, hornR);
    if (isBoss) {
      const crownMat = makeToonMaterial({ base: '#f2c14e' });
      materials.push(crownMat);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.5 * scale, 0.09 * scale, 8, 18), crownMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 1.16 * scale;
      obj.add(band);
      for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1 * scale, 0.32 * scale, 4), crownMat);
        const ang = (i / 4) * Math.PI * 2;
        spike.position.set(Math.cos(ang) * 0.5 * scale, 1.38 * scale, Math.sin(ang) * 0.5 * scale);
        obj.add(spike);
      }
    }
  }

  // Contact shadow stays pinned to the ground even for hovering archetypes.
  const shadow = makeContactShadow(a.radius * 1.15);
  shadow.position.y = 0.03 - a.hover;
  obj.add(shadow);

  return {
    kind,
    obj,
    hp: a.hp * hpScale,
    maxHp: a.hp * hpScale,
    speed: a.speed * (0.9 + rng() * 0.2),
    radius: a.radius,
    contactDamage: a.contactDamage,
    xpValue: a.xp,
    alive: true,
    flash: 0,
    wobble: rng() * 10,
    nextHitAt: 0,
    hover: a.hover,
    materials,
  };
}

const gemGeo = new THREE.OctahedronGeometry(0.18, 0);
const gemMat = makeToonMaterial({ base: '#6fd3e7', shadow: [0.3, 0.55, 0.6] });

export function makeGem(
  pos: THREE.Vector3,
  value: number,
  groundY: number,
  rng: () => number = Math.random,
): Gem {
  const obj = new THREE.Mesh(gemGeo, gemMat);
  obj.position.set(pos.x, groundY + 0.35, pos.z);
  return {
    obj,
    vel: new THREE.Vector3((rng() - 0.5) * 3, 2.5, (rng() - 0.5) * 3),
    value,
    alive: true,
  };
}

// ── Spawner ──────────────────────────────────────────────────────────────

export interface SpawnPlan {
  interval: number;
  batch: number;
  hpScale: number;
  pool: EnemyKind[];
}

/** The 12-minute difficulty curve, evaluated at run time t (seconds). */
export function difficultyAt(t: number): SpawnPlan {
  const pool: EnemyKind[] = ['slime'];
  if (t > 90) pool.push('flier');
  if (t > 240) pool.push('brute');
  return {
    interval: Math.max(0.45, 2.1 - (t * 1.65) / 660),
    batch: Math.min(6, 1 + Math.floor(t / 75)),
    hpScale: 1 + t / 480,
    pool,
  };
}

/** Random spawn point on a ring outside the camera view, around the wanderer. */
export function ringSpawnPoint(center: THREE.Vector3, rng: () => number): THREE.Vector3 {
  const ang = rng() * Math.PI * 2;
  const r = 24 + rng() * 6;
  return new THREE.Vector3(center.x + Math.cos(ang) * r, 0, center.z + Math.sin(ang) * r);
}

// ── AI steps ─────────────────────────────────────────────────────────────

const _dir = new THREE.Vector3();

/**
 * Wanderer steering: threat avoidance dominates, gems attract, curiosity
 * fills the silence, and the world edge gently pushes back.
 */
export function stepWanderer(
  w: Unit,
  enemies: Unit[],
  gems: Gem[],
  dt: number,
  time: number,
  speedMult: number,
  pickupRadius: number,
  bounds: number,
  heightAt: (x: number, z: number) => number,
): void {
  let dx = 0;
  let dz = 0;

  // Threat: flee the weighted centre of nearby enemies.
  let threat = 0;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.obj.position.x - w.obj.position.x, e.obj.position.z - w.obj.position.z);
    if (d < 11) {
      const k = 1 / Math.max(0.6, d);
      dx -= ((e.obj.position.x - w.obj.position.x) / Math.max(0.001, d)) * k;
      dz -= ((e.obj.position.z - w.obj.position.z) / Math.max(0.001, d)) * k;
      threat += k;
    }
  }
  const threatW = threat > 0 ? 3 : 0;

  // Gems: drift toward the nearest one in pickup range ×2.
  let gemW = 0;
  let nearest: Gem | null = null;
  let nearestD = Infinity;
  for (const g of gems) {
    if (!g.alive) continue;
    const d = Math.hypot(g.obj.position.x - w.obj.position.x, g.obj.position.z - w.obj.position.z);
    if (d < nearestD) {
      nearestD = d;
      nearest = g;
    }
  }
  if (nearest && nearestD < pickupRadius * 2.2) {
    gemW = 1.2;
    dx += ((nearest.obj.position.x - w.obj.position.x) / Math.max(0.001, nearestD)) * gemW;
    dz += ((nearest.obj.position.z - w.obj.position.z) / Math.max(0.001, nearestD)) * gemW;
  }

  // Wander: a slow figure-eight drift when nothing presses.
  const wanderW = threatW === 0 ? 0.55 : 0.1;
  dx += Math.sin(time * 0.31 + w.wobble) * wanderW;
  dz += Math.cos(time * 0.23 + w.wobble * 1.7) * wanderW;

  // Bounds: steer home.
  const distC = Math.hypot(w.obj.position.x, w.obj.position.z);
  if (distC > bounds) {
    dx -= (w.obj.position.x / distC) * 2.5;
    dz -= (w.obj.position.z / distC) * 2.5;
  }

  const len = Math.hypot(dx, dz);
  if (len > 0.001) {
    const v = w.speed * speedMult;
    w.obj.position.x += (dx / len) * v * dt;
    w.obj.position.z += (dz / len) * v * dt;
    // Face travel direction.
    const targetRot = Math.atan2(dx, dz);
    w.obj.rotation.y += (targetRot - w.obj.rotation.y) * Math.min(1, dt * 8);
  }
  w.obj.position.y = heightAt(w.obj.position.x, w.obj.position.z);
}

/** Enemies chase the wanderer; cheap pairwise separation keeps them readable. */
export function stepEnemies(
  enemies: Unit[],
  target: Unit,
  dt: number,
  time: number,
  speedMult: number,
  heightAt: (x: number, z: number) => number,
): void {
  for (const e of enemies) {
    if (!e.alive) continue;
    _dir.subVectors(target.obj.position, e.obj.position);
    _dir.y = 0;
    const d = _dir.length();
    if (d > 0.01) {
      _dir.divideScalar(d);
      const v = e.speed * speedMult;
      e.obj.position.addScaledVector(_dir, v * dt);
      e.obj.rotation.y = Math.atan2(_dir.x, _dir.z);
    }
    // Wobble / flap animation by archetype.
    if (e.kind === 'slime') {
      const s = 0.58 + Math.sin(time * 6 + e.wobble) * 0.08;
      const body = e.obj.children[0];
      body.scale.set(1 + (0.58 - s) * 0.8, s, 1 + (0.58 - s) * 0.8);
    } else if (e.kind === 'flier') {
      const flap = Math.sin(time * 14 + e.wobble) * 0.7;
      const wingL = e.obj.getObjectByName('wingL');
      const wingR = e.obj.getObjectByName('wingR');
      if (wingL) wingL.rotation.y = flap;
      if (wingR) wingR.rotation.y = -flap;
      e.obj.position.y = heightAt(e.obj.position.x, e.obj.position.z) + e.hover + Math.sin(time * 3 + e.wobble) * 0.15;
      continue;
    }
    e.obj.position.y = heightAt(e.obj.position.x, e.obj.position.z) + e.hover;
  }

  // Separation (O(n²), capped population — fine at this scale).
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (!a.alive) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (!b.alive) continue;
      const dx = b.obj.position.x - a.obj.position.x;
      const dz = b.obj.position.z - a.obj.position.z;
      const min = (a.radius + b.radius) * 0.9;
      const d2 = dx * dx + dz * dz;
      if (d2 > 0.0001 && d2 < min * min) {
        const d = Math.sqrt(d2);
        const push = ((min - d) / d) * 0.5;
        a.obj.position.x -= dx * push;
        a.obj.position.z -= dz * push;
        b.obj.position.x += dx * push;
        b.obj.position.z += dz * push;
      }
    }
  }
}

/** Gems scatter, settle, then magnetise toward the wanderer in pickup range. */
export function stepGems(
  gems: Gem[],
  w: Unit,
  dt: number,
  pickupRadius: number,
  heightAt: (x: number, z: number) => number,
): void {
  for (const g of gems) {
    if (!g.alive) continue;
    const groundY = heightAt(g.obj.position.x, g.obj.position.z) + 0.35;
    if (g.vel.lengthSq() > 0.01) {
      g.vel.y -= 9 * dt;
      g.obj.position.addScaledVector(g.vel, dt);
      if (g.obj.position.y < groundY) {
        g.obj.position.y = groundY;
        g.vel.set(0, 0, 0);
      }
    }
    const d = Math.hypot(g.obj.position.x - w.obj.position.x, g.obj.position.z - w.obj.position.z);
    if (d < pickupRadius) {
      const pull = 14 * dt * (1.2 - d / pickupRadius);
      g.obj.position.x += ((w.obj.position.x - g.obj.position.x) / Math.max(0.001, d)) * pull;
      g.obj.position.z += ((w.obj.position.z - g.obj.position.z) / Math.max(0.001, d)) * pull;
      g.obj.position.y = damp(g.obj.position.y, w.obj.position.y + 0.5, 6, dt);
    }
    g.obj.rotation.y += dt * 3;
  }
}

/** Damage a unit and drive its hit flash; returns true if it died. */
export function hurt(e: Unit, amount: number): boolean {
  if (!e.alive) return false;
  e.hp -= amount;
  e.flash = 1;
  if (e.hp <= 0) {
    e.alive = false;
    return true;
  }
  return false;
}

/**
 * Release a unit's per-instance GPU resources.
 *
 * Units own their materials (so a hit flash lights one slime, not every slime)
 * and their geometry, which means the scene cannot reap them implicitly — a
 * 12-minute run spawns hundreds. Safe to call more than once.
 */
export function disposeUnit(u: Unit): void {
  u.obj.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const m = obj.material;
      if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
      else m?.dispose();
    }
  });
}

/** Per-frame flash decay for a whole population. */
export function decayFlashes(units: Unit[], dt: number): void {
  for (const u of units) {
    if (u.flash > 0.001) {
      u.flash = Math.max(0, u.flash - dt * 4);
      setFlash(u.materials, u.flash);
    }
  }
}
