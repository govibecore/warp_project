import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  DISTRICTS,
  clamp,
  lerp,
  angDiff,
  scoreToHeight,
} from './core';
import {
  buildTerrain,
  buildPlaza,
  buildLake,
  buildDistrict,
  scatterWoods,
} from './world';
import type { ScoreMap } from './world';
import { waterTexture } from './textures';

export interface LabelPos {
  id: string;
  label: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface StemCityOptions {
  onLabels?(labels: LabelPos[]): void;
  onClock?(hours: number): void;
  reducedMotion?: boolean;
}

export interface StemCityHandle {
  dispose(): void;
  setTime(hours: number): void;
  setPlaying(playing: boolean): void;
  setView(id: string): void;
  screenshot(): string;
  setActive(active: boolean): void;
}

export function createStemCity(
  canvas: HTMLCanvasElement,
  scores: ScoreMap,
  opts: StemCityOptions = {},
): StemCityHandle | null {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
  if (!gl) return null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true // Allow background to show through
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // No tone mapping or shadows for blueprint style

  const scene = new THREE.Scene();
  scene.background = null; // Transparent, respects Tailwind bg

  /* ── Camera ── */
  const frustumSize = 150;
  const camera = new THREE.OrthographicCamera(
    frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, 1, 2000
  );

  /* ── World ── */
  const { mesh: terrain, heightAt } = buildTerrain(scores);
  scene.add(terrain);
  scene.add(buildPlaza());

  const water = waterTexture(); // Still need water offset to avoid crash, though it will be blueprintized
  const lake = buildLake(water);
  scene.add(lake);

  const pieces: { tick?(t: number, night: number, dt: number): void }[] = [];
  const anchors: { id: string; label: string; pos: THREE.Vector3 }[] = [];
  const districtGroups: THREE.Group[] = [];

  for (const region of DISTRICTS) {
    const built = buildDistrict(region, scores, heightAt);
    built.group.scale.set(1, 0.001, 1);
    districtGroups.push(built.group);
    scene.add(built.group);
    pieces.push(...built.pieces);
    anchors.push({
      id: region.id,
      label: region.label,
      pos: new THREE.Vector3(region.x, built.column.topY + 3.2, region.z),
    });
  }

  const plaza = buildDistrict(
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
    scores,
    heightAt,
  );
  plaza.group.children = plaza.group.children.filter((c) => c.name.startsWith('landmark'));
  scene.add(plaza.group);
  pieces.push(...plaza.pieces);

  scene.add(scatterWoods(heightAt));

  /* ── BLUEPRINT OVERRIDE ── */
  // Convert all procedural meshes into a Nordic Lagom architectural blueprint
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Add Cyan Wireframe
      const edges = new THREE.EdgesGeometry(child.geometry, 25);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00B4D8, opacity: 0.45, transparent: true });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      child.add(wireframe);
      
      // Dispose old material to prevent memory leaks
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
      // Override material to flat mineral slate
      child.material = new THREE.MeshBasicMaterial({ color: 0x181818 });
    }
  });

  /* ── Camera State ── */
  const cam = { theta: 0.2, phi: 1.04, dist: 122, tx: 0, ty: 0, tz: 0 };
  const goal = { theta: 0.7, phi: 1.04, dist: 122, tx: 0, ty: 6, tz: 0 };

  function applyView(id: string) {
    if (id === 'overview') {
      goal.theta = 0.7;
      goal.phi = 1.04;
      goal.dist = 122;
      goal.tx = 0;
      goal.ty = 6;
      goal.tz = 0;
      return;
    }
    const region = DISTRICTS.find((d) => d.id === id);
    if (!region) return;
    goal.theta = Math.atan2(region.x, region.z);
    goal.phi = 1.02;
    goal.dist = 52;
    goal.tx = region.x * 0.9;
    goal.ty = heightAt(region.x, region.z) + 7;
    goal.tz = region.z * 0.9;
  }

  /* ── Input ── */
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let userTouched = false;

  const onDown = (e: PointerEvent) => {
    dragging = true;
    userTouched = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    goal.theta -= (e.clientX - lastX) * 0.005;
    // Restrict tilt in isometric
    goal.phi = clamp(goal.phi - (e.clientY - lastY) * 0.004, 0.4, 1.38);
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    userTouched = true;
    goal.dist = clamp(goal.dist * (1 + Math.sign(e.deltaY) * 0.09), 34, 260);
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  /* ── Time ── */
  let playing = !opts.reducedMotion;

  /* ── Resize ── */
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let introComplete = false;

  if (!opts.reducedMotion) {
    const tl = gsap.timeline({
      onComplete: () => { introComplete = true; },
    });
    tl.to(cam, {
      theta: goal.theta, phi: goal.phi, dist: goal.dist, tx: goal.tx, ty: goal.ty, tz: goal.tz,
      duration: 2.5, ease: 'power3.out',
    });
    tl.to(
      districtGroups.map(g => g.scale),
      { y: 1, duration: 1.8, stagger: 0.15, ease: 'elastic.out(1, 0.6)' },
      '-=1.5'
    );
  } else {
    cam.theta = goal.theta; cam.phi = goal.phi; cam.dist = goal.dist;
    cam.tx = goal.tx; cam.ty = goal.ty; cam.tz = goal.tz;
    for (const g of districtGroups) g.scale.set(1, 1, 1);
    introComplete = true;
  }

  /* ── Loop ── */
  let raf = 0;
  let prev = performance.now();
  let elapsed = 0;
  let active = true;
  let visible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  const projected = new THREE.Vector3();
  const labelBuf: LabelPos[] = anchors.map((a) => ({ id: a.id, label: a.label, x: 0, y: 0, visible: false }));

  const onVisibility = () => {
    visible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    prev = performance.now();
  };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - prev) / 1000, 0.1);
    prev = now;
    if (!active || !visible) return;
    elapsed += dt;

    const k = opts.reducedMotion ? 1 : 1 - Math.pow(0.0025, dt);
    cam.theta += angDiff(cam.theta, goal.theta) * k;
    cam.phi = lerp(cam.phi, goal.phi, k);
    cam.dist = lerp(cam.dist, goal.dist, k);
    cam.tx = lerp(cam.tx, goal.tx, k);
    cam.ty = lerp(cam.ty, goal.ty, k);
    cam.tz = lerp(cam.tz, goal.tz, k);

    if (!userTouched && playing) goal.theta += dt * 0.05;

    camera.position.set(
      cam.tx + cam.dist * Math.sin(cam.phi) * Math.sin(cam.theta),
      cam.ty + cam.dist * Math.cos(cam.phi),
      cam.tz + cam.dist * Math.sin(cam.phi) * Math.cos(cam.theta),
    );
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    
    // Orthographic Zoom handling based on distance
    camera.zoom = 122 / Math.max(1, cam.dist);
    camera.updateProjectionMatrix();

    if (opts.onLabels) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < anchors.length; i++) {
        projected.copy(anchors[i].pos).project(camera);
        const vis = introComplete && projected.z < 1 && projected.x > -1 && projected.x < 1 && projected.y > -1 && projected.y < 1;
        labelBuf[i].x = (projected.x * 0.5 + 0.5) * w;
        labelBuf[i].y = (-projected.y * 0.5 + 0.5) * h;
        labelBuf[i].visible = vis;
      }
      opts.onLabels(labelBuf);
    }

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  function dispose() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    canvas.removeEventListener('wheel', onWheel);
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    });
    renderer.dispose();
  }

  return {
    dispose,
    setTime: () => {}, // No-op in blueprint
    setPlaying: (p) => { playing = p; if (p) userTouched = true; },
    setView: applyView,
    screenshot: () => renderer.domElement.toDataURL('image/png'),
    setActive: (a) => { active = a; prev = performance.now(); },
  };
}

export { scoreToHeight };
