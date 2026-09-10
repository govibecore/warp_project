/**
 * weapons.ts — auto-firing arsenal and passives.
 *
 * Four weapons (seeking bolt, damage aura, orbiting orbs, expanding nova)
 * fire on cooldown with zero input. Six passives (damage, move speed,
 * cooldown, pickup radius, max health, regeneration) stack quietly.
 * On level-up the AI auto-picks one upgrade — new weapons are slightly
 * favoured so the build grows visible variety early.
 */

import * as THREE from 'three';
import { makeToonMaterial } from './shaders';
import type { Unit } from './entities';
import { hurt } from './entities';
import type { Effects } from './effects';

// ── Arsenal & upgrades ───────────────────────────────────────────────────

export interface Arsenal {
  bolt: number;
  aura: number;
  orbits: number;
  nova: number;
  damage: number;
  speed: number;
  cooldown: number;
  pickup: number;
  maxHealth: number;
  regen: number;
}

export const UPGRADE_IDS = [
  'bolt',
  'aura',
  'orbits',
  'nova',
  'damage',
  'speed',
  'cooldown',
  'pickup',
  'maxHealth',
  'regen',
] as const;

export type UpgradeId = (typeof UPGRADE_IDS)[number];

export const MAX_LEVEL = 5;

export function emptyArsenal(): Arsenal {
  return { bolt: 0, aura: 0, orbits: 0, nova: 0, damage: 0, speed: 0, cooldown: 0, pickup: 0, maxHealth: 0, regen: 0 };
}

export function applyUpgrade(a: Arsenal, id: UpgradeId): void {
  if (a[id] < MAX_LEVEL) a[id]++;
}

/** Weighted pick: unowned weapons at 1.4×, owned upgrades at 1×, maxed excluded. */
export function pickUpgrade(a: Arsenal, rng: () => number): UpgradeId | null {
  const pool: { id: UpgradeId; w: number }[] = [];
  for (const id of UPGRADE_IDS) {
    if (a[id] >= MAX_LEVEL) continue;
    const isWeapon = id === 'bolt' || id === 'aura' || id === 'orbits' || id === 'nova';
    pool.push({ id, w: isWeapon && a[id] === 0 ? 1.4 : 1 });
  }
  if (pool.length === 0) return null;
  let total = 0;
  for (const p of pool) total += p.w;
  let roll = rng() * total;
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) return p.id;
  }
  return pool[pool.length - 1].id;
}

/** Effective stats derived from passive levels (× tuning multipliers). */
export function derivedStats(a: Arsenal) {
  return {
    damageMult: 1 + 0.12 * a.damage,
    moveSpeedMult: 1 + 0.06 * a.speed,
    cooldownMult: Math.max(0.55, 1 - 0.07 * a.cooldown),
    pickupRadius: 3.5 * (1 + 0.25 * a.pickup),
    maxHealth: 100 + 20 * a.maxHealth,
    regenPerSec: 0.8 * a.regen,
  };
}

// ── Runtime weapon state ─────────────────────────────────────────────────

interface Bolt {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  alive: boolean;
  damage: number;
}

export interface WeaponState {
  group: THREE.Group;
  bolts: Bolt[];
  boltCd: number;
  auraMesh: THREE.Mesh;
  auraTick: number;
  orbitMeshes: THREE.Mesh[];
  orbitAngle: number;
  orbitHitAt: Map<Unit, number>;
  novaCd: number;
}

const boltGeo = new THREE.OctahedronGeometry(0.16, 0);
const boltMat = makeToonMaterial({ base: '#f2c14e', shadow: [0.72, 0.5, 0.15] });
const orbGeo = new THREE.IcosahedronGeometry(0.22, 0);
const orbMat = makeToonMaterial({ base: '#d9825f' });
const auraMat = new THREE.MeshBasicMaterial({
  color: '#f2e3c6',
  transparent: true,
  opacity: 0.16,
  side: THREE.DoubleSide,
  depthWrite: false,
});

export function createWeaponState(): WeaponState {
  const group = new THREE.Group();
  const auraMesh = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), auraMat);
  auraMesh.rotation.x = -Math.PI / 2;
  auraMesh.visible = false;
  group.add(auraMesh);
  return {
    group,
    bolts: [],
    boltCd: 0.5,
    auraMesh,
    auraTick: 0,
    orbitMeshes: [],
    orbitAngle: 0,
    orbitHitAt: new Map(),
    novaCd: 2,
  };
}

const _v = new THREE.Vector3();

export function stepWeapons(
  ws: WeaponState,
  a: Arsenal,
  wanderer: Unit,
  enemies: Unit[],
  effects: Effects,
  dt: number,
  time: number,
  tuneDamageMult: number,
  tuneCdMult: number,
  heightAt: (x: number, z: number) => number,
  onKill: (e: Unit) => void,
): void {
  const stats = derivedStats(a);
  const dmgMult = stats.damageMult * tuneDamageMult;
  const cdMult = stats.cooldownMult * tuneCdMult;
  const wp = wanderer.obj.position;

  // ── Seeking bolt ──
  if (a.bolt > 0) {
    ws.boltCd -= dt;
    const cd = 1.1 * Math.pow(0.92, a.bolt - 1) * cdMult;
    if (ws.boltCd <= 0) {
      const target = nearestEnemy(wp, enemies);
      if (target) {
        ws.boltCd = cd;
        const count = a.bolt >= 3 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const mesh = new THREE.Mesh(boltGeo, boltMat);
          mesh.position.copy(wp).setY(wp.y + 0.8);
          _v.subVectors(target.obj.position, wp).setY(0).normalize();
          if (i === 1) _v.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.35);
          ws.bolts.push({
            mesh,
            vel: _v.clone().multiplyScalar(22),
            life: 1.6,
            alive: true,
            damage: 12 * Math.pow(1.25, a.bolt - 1) * dmgMult,
          });
          ws.group.add(mesh);
        }
      }
    }
  }

  for (let i = ws.bolts.length - 1; i >= 0; i--) {
    const b = ws.bolts[i];
    if (!b.alive) continue;
    b.life -= dt;
    // Gentle homing.
    const target = nearestEnemy(b.mesh.position, enemies);
    if (target) {
      _v.subVectors(target.obj.position, b.mesh.position).setY(0).normalize();
      b.vel.lerp(_v.multiplyScalar(22), Math.min(1, dt * 6));
    }
    b.mesh.position.addScaledVector(b.vel, dt);
    b.mesh.position.y = heightAt(b.mesh.position.x, b.mesh.position.z) + 0.7;
    b.mesh.rotation.y += dt * 12;
    if (b.life <= 0) b.alive = false;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.obj.position.x - b.mesh.position.x, e.obj.position.z - b.mesh.position.z);
      if (d < e.radius + 0.25) {
        if (hurt(e, b.damage)) onKill(e);
        effects.spark(b.mesh.position, '#f2c14e', 5);
        b.alive = false;
        break;
      }
    }
    if (!b.alive) {
      ws.group.remove(b.mesh);
      ws.bolts.splice(i, 1);
    }
  }

  // ── Damage aura ──
  if (a.aura > 0) {
    const radius = 3.2 * (1 + 0.12 * (a.aura - 1));
    ws.auraMesh.visible = true;
    ws.auraMesh.position.set(wp.x, wp.y + 0.12, wp.z);
    const pulse = 1 + Math.sin(time * 2.2) * 0.04;
    ws.auraMesh.scale.setScalar(radius * pulse);
    ws.auraTick -= dt;
    if (ws.auraTick <= 0) {
      ws.auraTick = 0.5;
      const dps = 8 * Math.pow(1.25, a.aura - 1) * dmgMult * 0.5;
      for (const e of enemies) {
        if (!e.alive) continue;
        const d = Math.hypot(e.obj.position.x - wp.x, e.obj.position.z - wp.z);
        if (d < radius + e.radius) {
          if (hurt(e, dps)) onKill(e);
        }
      }
    }
  } else {
    ws.auraMesh.visible = false;
  }

  // ── Orbiting orbs ──
  const wantOrbs = a.orbits;
  while (ws.orbitMeshes.length < wantOrbs) {
    const mesh = new THREE.Mesh(orbGeo, orbMat);
    ws.orbitMeshes.push(mesh);
    ws.group.add(mesh);
  }
  while (ws.orbitMeshes.length > wantOrbs) {
    const mesh = ws.orbitMeshes.pop();
    if (mesh) ws.group.remove(mesh);
  }
  if (wantOrbs > 0) {
    const orbRadius = 2.6;
    const orbDmg = 10 * Math.pow(1.25, a.orbits - 1) * dmgMult;
    ws.orbitAngle += dt * 2.4 * (1 + 0.1 * (a.orbits - 1));
    for (let i = 0; i < ws.orbitMeshes.length; i++) {
      const ang = ws.orbitAngle + (i / ws.orbitMeshes.length) * Math.PI * 2;
      const mesh = ws.orbitMeshes[i];
      mesh.position.set(
        wp.x + Math.cos(ang) * orbRadius,
        wp.y + 0.7 + Math.sin(time * 3 + i) * 0.1,
        wp.z + Math.sin(ang) * orbRadius,
      );
      for (const e of enemies) {
        if (!e.alive) continue;
        const last = ws.orbitHitAt.get(e) ?? -1;
        if (time - last < 0.6) continue;
        const d = Math.hypot(e.obj.position.x - mesh.position.x, e.obj.position.z - mesh.position.z);
        if (d < e.radius + 0.3) {
          ws.orbitHitAt.set(e, time);
          if (hurt(e, orbDmg)) onKill(e);
          effects.spark(mesh.position, '#d9825f', 4);
        }
      }
    }
  }

  // ── Expanding nova ──
  if (a.nova > 0) {
    ws.novaCd -= dt;
    if (ws.novaCd <= 0) {
      ws.novaCd = 4.5 * Math.pow(0.92, a.nova - 1) * cdMult;
      const radius = 5.5 * (1 + 0.1 * (a.nova - 1));
      const dmg = 18 * Math.pow(1.25, a.nova - 1) * dmgMult;
      effects.ring(wp, '#f2e3c6', radius, 0.55);
      for (const e of enemies) {
        if (!e.alive) continue;
        const d = Math.hypot(e.obj.position.x - wp.x, e.obj.position.z - wp.z);
        if (d < radius + e.radius) {
          if (hurt(e, dmg)) onKill(e);
        }
      }
    }
  }
}

function nearestEnemy(pos: THREE.Vector3, enemies: Unit[]): Unit | null {
  let best: Unit | null = null;
  let bestD = Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.obj.position.x - pos.x, e.obj.position.z - pos.z);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}
