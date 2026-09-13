/**
 * game.ts — the orchestrator.
 *
 * Owns the scene, the sun, the camera, and the fixed-step simulation that
 * drives everything: spawning, kiting AI, combat, XP, level-ups, the
 * 12-minute difficulty curve, and bosses.
 *
 * The critical design decision lives here: the ONLY WebGL-dependent object is
 * the renderer, and it arrives as an injected `RendererLike`. Everything else
 * (three.js Object3D graphs, vectors, simulation state) is pure JavaScript, so
 * the exact same loop runs headless in a test with a stub renderer.
 *
 * The camera is deliberately boring: damped follow plus a slow azimuth drift.
 * It never shakes, never punches, never flashes — all feedback is world-space.
 */

import * as THREE from 'three';

import { Effects } from './effects';
import {
  decayFlashes,
  difficultyAt,
  disposeUnit,
  makeEnemy,
  makeGem,
  makeWanderer,
  ringSpawnPoint,
  stepEnemies,
  stepGems,
  stepWanderer,
  type EnemyKind,
  type Gem,
  type Unit,
} from './entities';
import {
  applyUpgrade,
  createWeaponState,
  derivedStats,
  emptyArsenal,
  pickUpgrade,
  stepWeapons,
  type Arsenal,
  type UpgradeId,
} from './weapons';
import { buildWorld, type World } from './world';
import { sharedUniforms } from './shaders';
import { clamp, damp, mulberry32 } from './utils';

// ── Constants ───────────────────────────────────────────────────────────

/** Nordic twilight — also the fog colour, so far terrain dissolves into it. */
export const SKY = '#1a2a3a';

const FIXED_DT = 1 / 60;
const MAX_SUBSTEPS = 5;
const MAX_ENEMIES = 90;
const MAX_GEMS = 160;
const WORLD_BOUNDS = 52;
const BOSS_EVERY = 120; // seconds
const ENEMY_PALETTE: Record<EnemyKind, string> = {
  slime: '#6ab0c8',
  flier: '#8ac0d8',
  brute: '#a07898',
  boss: '#6a5fa8',
};

// ── Tuning (live, driven by the panel) ──────────────────────────────────

export interface Tune {
  /** Spawn interval multiplier — lower spawns faster. */
  spawnRate: number;
  enemySpeed: number;
  playerSpeed: number;
  damage: number;
  cameraHeight: number;
  cameraDistance: number;
  fogFar: number;
}

export const DEFAULT_TUNE: Tune = {
  spawnRate: 1,
  enemySpeed: 1,
  playerSpeed: 1,
  damage: 1,
  cameraHeight: 19,
  cameraDistance: 26,
  fogFar: 125,
};

// ── Renderer seam ───────────────────────────────────────────────────────

/**
 * The minimal surface the game needs from a renderer. three's WebGLRenderer
 * satisfies it structurally; tests pass a stub.
 */
export interface RendererLike {
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  setPixelRatio?(ratio: number): void;
  setClearColor?(color: string): void;
  dispose?(): void;
}

export interface GameOptions {
  canvas?: HTMLCanvasElement | null;
  /** Injected renderer — when present, no WebGLRenderer is ever constructed. */
  renderer?: RendererLike | null;
  seed?: number;
  width?: number;
  height?: number;
}

export interface Game {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly world: World;
  readonly effects: Effects;
  readonly arsenal: Arsenal;
  readonly tune: Tune;
  readonly wanderer: Unit;
  readonly enemies: Unit[];
  readonly gems: Gem[];
  /** Seconds of simulated time since the run started. */
  readonly runTime: number;
  readonly level: number;
  readonly xp: number;
  step(dt: number): void;
  render(): void;
  resize(width: number, height: number): void;
  setTune(patch: Partial<Tune>): void;
  dispose(): void;
}

// ── Factory ─────────────────────────────────────────────────────────────

export function createGame(opts: GameOptions = {}): Game {
  // Authored hex values must appear exactly as written.
  THREE.ColorManagement.enabled = false;

  const seed = opts.seed ?? 20240917;
  const rng = mulberry32(seed);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);

  const camera = new THREE.PerspectiveCamera(
    42,
    (opts.width ?? 1280) / Math.max(1, opts.height ?? 720),
    0.5,
    400,
  );

  const tune: Tune = { ...DEFAULT_TUNE };
  sharedUniforms.uFogColor.value.set(SKY);
  sharedUniforms.uFogFar.value = tune.fogFar;

  const world = buildWorld(seed);
  scene.add(world.group);

  const effects = new Effects();
  scene.add(effects.group);

  const wanderer = makeWanderer(rng);
  wanderer.obj.position.set(0, world.heightAt(0, 0), 0);
  scene.add(wanderer.obj);

  const enemies: Unit[] = [];
  const gems: Gem[] = [];

  // Start with one weapon so the glade is alive from frame one.
  const arsenal = emptyArsenal();
  arsenal.bolt = 1;

  const ws = createWeaponState();
  scene.add(ws.group);

  let time = 0;
  let spawnTimer = 1.2;
  let nextBossAt = BOSS_EVERY;
  let xp = 0;
  let level = 1;
  let running = true;

  // Damped camera state.
  const camFocus = new THREE.Vector3(wanderer.obj.position.x, 0, wanderer.obj.position.z);
  let azimuth = Math.PI * 0.25;

  // ── Renderer ──────────────────────────────────────────────────────────
  let renderer: RendererLike | null = null;
  if (opts.renderer) {
    renderer = opts.renderer;
  } else if (opts.canvas) {
    try {
      const r = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: true });
      r.outputColorSpace = THREE.LinearSRGBColorSpace;
      r.setPixelRatio(
        Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
      );
      r.setClearColor(SKY, 1);
      renderer = r;
    } catch {
      // No WebGL (jsdom, blocked context) — the simulation still runs.
      renderer = null;
    }
  }

  // ── Simulation ────────────────────────────────────────────────────────

  /** XP required to reach the next level — gently steepening. */
  function xpForLevel(l: number): number {
    return Math.round(6 + l * 4.5);
  }

  function onEnemyKilled(e: Unit): void {
    effects.deathBurst(
      e.obj.position,
      ENEMY_PALETTE[e.kind as EnemyKind] ?? '#c96f4a',
      e.kind === 'boss' ? 22 : 9,
      world.heightAt(e.obj.position.x, e.obj.position.z),
    );
    if (gems.length < MAX_GEMS) {
      const gem = makeGem(
        e.obj.position,
        e.xpValue,
        world.heightAt(e.obj.position.x, e.obj.position.z),
        rng,
      );
      gems.push(gem);
      scene.add(gem.obj);
    }
  }

  function grantXp(amount: number): void {
    xp += amount;
    let guard = 0;
    while (xp >= xpForLevel(level) && guard++ < 40) {
      xp -= xpForLevel(level);
      level++;
      const pick = pickUpgrade(arsenal, rng);
      if (pick) applyUpgrade(arsenal, pick as UpgradeId);
      effects.ring(wanderer.obj.position, '#f2c14e', 4.5, 0.7);
    }
  }

  function spawnWave(): void {
    const plan = difficultyAt(time);
    for (let i = 0; i < plan.batch; i++) {
      if (enemies.length >= MAX_ENEMIES) return;
      const kind = plan.pool[Math.floor(rng() * plan.pool.length)];
      const e = makeEnemy(kind, plan.hpScale, rng);
      const p = ringSpawnPoint(wanderer.obj.position, rng);
      e.obj.position.set(p.x, world.heightAt(p.x, p.z) + e.hover, p.z);
      enemies.push(e);
      scene.add(e.obj);
    }
  }

  function spawnBoss(): void {
    if (enemies.length >= MAX_ENEMIES) return;
    const boss = makeEnemy('boss', difficultyAt(time).hpScale, rng);
    const p = ringSpawnPoint(wanderer.obj.position, rng);
    boss.obj.position.set(p.x, world.heightAt(p.x, p.z), p.z);
    enemies.push(boss);
    scene.add(boss.obj);
  }

  function respawn(): void {
    effects.respawn(wanderer.obj.position);
    wanderer.obj.position.set(0, world.heightAt(0, 0), 0);
    wanderer.hp = derivedStats(arsenal).maxHealth;
    wanderer.flash = 1;
  }

  function updateCamera(dt: number): void {
    // Damped follow — frame-rate independent, never snaps.
    camFocus.x = damp(camFocus.x, wanderer.obj.position.x, 3.2, dt);
    camFocus.y = damp(camFocus.y, wanderer.obj.position.y, 3.2, dt);
    camFocus.z = damp(camFocus.z, wanderer.obj.position.z, 3.2, dt);

    // Very slow azimuth drift for a cinematic, never-jarring feel.
    azimuth = Math.PI * 0.25 + Math.sin(time * 0.045) * 0.38;

    const d = tune.cameraDistance;
    const h = tune.cameraHeight;
    camera.position.set(
      camFocus.x + Math.cos(azimuth) * d,
      camFocus.y + h,
      camFocus.z + Math.sin(azimuth) * d,
    );
    camera.lookAt(camFocus.x, camFocus.y + 1.2, camFocus.z);
  }

  function simulate(dt: number): void {
    time += dt;
    sharedUniforms.uTime.value = time;

    const stats = derivedStats(arsenal);

    // ── Spawning ──
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      const plan = difficultyAt(time);
      spawnTimer = Math.max(0.12, plan.interval * tune.spawnRate);
      spawnWave();
    }
    if (time >= nextBossAt) {
      nextBossAt += BOSS_EVERY;
      spawnBoss();
    }

    // ── Movement & AI ──
    stepWanderer(
      wanderer,
      enemies,
      gems,
      dt,
      time,
      tune.playerSpeed,
      stats.pickupRadius,
      WORLD_BOUNDS,
      world.heightAt,
    );
    stepEnemies(enemies, wanderer, dt, time, tune.enemySpeed, world.heightAt);
    stepGems(gems, wanderer, dt, stats.pickupRadius, world.heightAt);

    // ── Weapons ──
    stepWeapons(
      ws,
      arsenal,
      wanderer,
      enemies,
      effects,
      dt,
      time,
      tune.damage,
      1,
      world.heightAt,
      onEnemyKilled,
    );

    // ── Contact damage: enemies hurt the wanderer on a per-unit cooldown ──
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.obj.position.x - wanderer.obj.position.x;
      const dz = e.obj.position.z - wanderer.obj.position.z;
      const reach = e.radius + wanderer.radius;
      if (dx * dx + dz * dz < reach * reach && time >= e.nextHitAt) {
        e.nextHitAt = time + 0.7;
        wanderer.hp -= e.contactDamage;
        wanderer.flash = 1;
      }
    }

    // ── Regeneration & the soft respawn ──
    const maxHp = stats.maxHealth;
    wanderer.maxHp = maxHp;
    if (wanderer.hp < maxHp) wanderer.hp = Math.min(maxHp, wanderer.hp + stats.regenPerSec * dt);
    if (wanderer.hp <= 0) respawn();

    // ── Reap the dead, collect gems ──
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e.alive) {
        scene.remove(e.obj);
        disposeUnit(e);
        ws.orbitHitAt.delete(e); // would otherwise pin dead units forever
        enemies.splice(i, 1);
      }
    }
    for (let i = gems.length - 1; i >= 0; i--) {
      const g = gems[i];
      if (!g.alive) continue;
      const dx = g.obj.position.x - wanderer.obj.position.x;
      const dz = g.obj.position.z - wanderer.obj.position.z;
      const dy = g.obj.position.y - (wanderer.obj.position.y + 0.5);
      if (dx * dx + dz * dz + dy * dy < 0.85 * 0.85) {
        grantXp(g.value);
        g.alive = false;
        scene.remove(g.obj);
        gems.splice(i, 1);
      }
    }

    decayFlashes(enemies, dt);
    decayFlashes([wanderer], dt);

    effects.update(dt);
    world.update(dt);
    updateCamera(dt);
  }

  let accumulator = 0;

  return {
    scene,
    camera,
    world,
    effects,
    arsenal,
    tune,
    wanderer,
    enemies,
    gems,
    get runTime() {
      return time;
    },
    get level() {
      return level;
    },
    get xp() {
      return xp;
    },

    step(dt: number) {
      if (!running) return;
      // Clamp so a backgrounded tab doesn't fast-forward the whole run.
      accumulator += clamp(dt, 0, 0.25);
      let n = 0;
      while (accumulator >= FIXED_DT && n < MAX_SUBSTEPS) {
        simulate(FIXED_DT);
        accumulator -= FIXED_DT;
        n++;
      }
      if (n === MAX_SUBSTEPS) accumulator = 0;
    },

    render() {
      if (renderer) renderer.render(scene, camera);
    },

    resize(width: number, height: number) {
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer?.setSize(w, h, false);
    },

    setTune(patch: Partial<Tune>) {
      Object.assign(tune, patch);
      sharedUniforms.uFogFar.value = tune.fogFar;
    },

    dispose() {
      running = false;
      // Release only what this instance owns. Gem, bolt and orb geometries
      // are module-level singletons shared with any future game instance, so
      // a blanket scene.traverse would corrupt a remount.
      disposeUnit(wanderer);
      for (const e of enemies) disposeUnit(e);
      enemies.length = 0;
      for (const g of gems) scene.remove(g.obj);
      gems.length = 0;
      ws.auraMesh.geometry.dispose();
      world.dispose();
      effects.dispose();
      renderer?.dispose?.();
      renderer = null;
    },
  };
}
