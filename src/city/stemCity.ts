import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  DISTRICTS,
  ISLAND,
  clamp,
  lerp,
  smoothstep,
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
import { glowTexture, waterTexture } from './textures';

/**
 * STEM City - scene assembly, sky, lighting, camera and the frame loop.
 *
 * The whole city is one floating island read as a chart: five districts, five
 * competency scores, and a cohort ring on every score column. Everything here
 * is procedural and headless-safe - no asset ever crosses the network.
 */

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

/* ── Day/night palette ─────────────────────────────────────────────────── */

interface PaletteKey {
  t: number;
  zen: string;
  mid: string;
  hor: string;
  sun: string;
  amb: number;
  hemi: number;
}

/** Ten keys across 0–24h. Everything between them is a straight lerp. */
const KEYS: PaletteKey[] = [
  { t: 0, zen: '#040714', mid: '#0a1024', hor: '#121832', sun: '#1a2444', amb: 0.1, hemi: 0.15 },
  { t: 3, zen: '#050818', mid: '#0c142a', hor: '#161e38', sun: '#202a4a', amb: 0.12, hemi: 0.18 },
  { t: 6, zen: '#121c38', mid: '#2a344a', hor: '#8a6452', sun: '#b8764a', amb: 0.28, hemi: 0.35 },
  { t: 8, zen: '#24446a', mid: '#5888a8', hor: '#b89678', sun: '#c8a478', amb: 0.40, hemi: 0.55 },
  { t: 10, zen: '#225088', mid: '#689ac0', hor: '#abc0d0', sun: '#d0c4ac', amb: 0.48, hemi: 0.65 },
  { t: 12, zen: '#1c4a8a', mid: '#629bc4', hor: '#a8bed0', sun: '#e0e4e8', amb: 0.55, hemi: 0.75 },
  { t: 15, zen: '#204d85', mid: '#659dc4', hor: '#b8b4a4', sun: '#d0c4ac', amb: 0.50, hemi: 0.70 },
  { t: 18, zen: '#1e3860', mid: '#8a6854', hor: '#b87854', sun: '#c0784a', amb: 0.32, hemi: 0.42 },
  { t: 20, zen: '#101a35', mid: '#282a44', hor: '#6a485a', sun: '#5a4670', amb: 0.20, hemi: 0.25 },
  { t: 22, zen: '#060a1a', mid: '#0d1428', hor: '#141c32', sun: '#1c2644', amb: 0.12, hemi: 0.18 },
];

function sampleKeys(hours: number) {
  const t = ((hours % 24) + 24) % 24;
  let a = KEYS[KEYS.length - 1];
  let b = KEYS[0];
  for (let i = 0; i < KEYS.length; i++) {
    if (KEYS[i].t <= t) a = KEYS[i];
    if (KEYS[i].t > t) {
      b = KEYS[i];
      break;
    }
  }
  const span = (b.t - a.t + 24) % 24 || 24;
  const k = clamp((t - a.t) / span, 0, 1);
  return {
    zen: new THREE.Color(a.zen).lerp(new THREE.Color(b.zen), k),
    mid: new THREE.Color(a.mid).lerp(new THREE.Color(b.mid), k),
    hor: new THREE.Color(a.hor).lerp(new THREE.Color(b.hor), k),
    sun: new THREE.Color(a.sun).lerp(new THREE.Color(b.sun), k),
    amb: lerp(a.amb, b.amb, k),
    hemi: lerp(a.hemi, b.hemi, k),
  };
}

/* ── Sky ───────────────────────────────────────────────────────────────── */

const SKY_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uBot;
  uniform vec3 uSunCol;
  uniform vec3 uSunDir;
  uniform float uSunPow;
  uniform float uNight;
  uniform float uTime;
  varying vec3 vWorld;

  float hash13(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vWorld);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 col = mix(uBot, uMid, smoothstep(0.34, 0.56, h));
    col = mix(col, uTop, smoothstep(0.52, 0.96, h));

    // Sun disk plus a wide halo.
    float s = max(dot(dir, normalize(uSunDir)), 0.0);
    col += uSunCol * pow(s, uSunPow) * 1.25;
    col += uSunCol * pow(s, 6.0) * 0.16;

    // Stars: a hashed cell grid, twinkling, only after dark.
    if (uNight > 0.01) {
      vec3 cell = floor(dir * 190.0);
      float rnd = hash13(cell);
      float star = step(0.9965, rnd);
      float tw = 0.55 + 0.45 * sin(uTime * 1.7 + rnd * 60.0);
      col += vec3(star * tw) * uNight;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ── Entry point ───────────────────────────────────────────────────────── */

export function createStemCity(
  canvas: HTMLCanvasElement,
  scores: ScoreMap,
  opts: StemCityOptions = {},
): StemCityHandle | null {
  // Probe on a throwaway canvas: asking the real one locks its attributes.
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
  if (!gl) return null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2000);

  /* ── Sky ── */
  const skyUniforms = {
    uTop: { value: new THREE.Color('#2f7fd0') },
    uMid: { value: new THREE.Color('#9ccdf2') },
    uBot: { value: new THREE.Color('#e8f3fc') },
    uSunCol: { value: new THREE.Color('#ffffff') },
    uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3) },
    uSunPow: { value: 220 },
    uNight: { value: 0 },
    uTime: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(700, 32, 18),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  sky.name = 'sky';
  scene.add(sky);

  /* ── Lights ── */
  const hemi = new THREE.HemisphereLight('#9fd0f5', '#5f7a4a', 0.9);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight('#ffffff', 0.5);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight('#fff2d8', 1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 420;
  sun.shadow.camera.left = -95;
  sun.shadow.camera.right = 95;
  sun.shadow.camera.top = 95;
  sun.shadow.camera.bottom = -95;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  // A warm fill that only earns its keep once the sun is down.
  const nightFill = new THREE.DirectionalLight('#8fa8d8', 0);
  nightFill.position.set(-40, 30, -30);
  scene.add(nightFill);

  /* ── World ── */
  const { mesh: terrain, heightAt } = buildTerrain(scores);
  scene.add(terrain);
  scene.add(buildPlaza());

  const water = waterTexture();
  const lake = buildLake(water);
  scene.add(lake);

  const pieces: { tick?(t: number, night: number, dt: number): void }[] = [];
  const anchors: { id: string; label: string; pos: THREE.Vector3 }[] = [];

  const districtGroups: THREE.Group[] = [];

  for (const region of DISTRICTS) {
    const built = buildDistrict(region, scores, heightAt);
    
    // Hide for intro animation
    built.group.scale.set(1, 0.001, 1);
    districtGroups.push(built.group);

    // If you exposed column parts inside built.column, you could grab rings.
    // For now, scaling the whole group Y gives a satisfying "rising city" effect.
    scene.add(built.group);
    pieces.push(...built.pieces);
    anchors.push({
      id: region.id,
      label: region.label,
      pos: new THREE.Vector3(region.x, built.column.topY + 3.2, region.z),
    });
  }

  // The reference plaza district also gets a column-free anchor.
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
  // The plaza already has buildings from buildDistrict; keep only its landmark.
  plaza.group.children = plaza.group.children.filter((c) => c.name.startsWith('landmark'));
  scene.add(plaza.group);
  pieces.push(...plaza.pieces);

  scene.add(scatterWoods(heightAt));

  /* ── Fireflies ── */
  const flyCount = 240;
  const flyPos = new Float32Array(flyCount * 3);
  for (let i = 0; i < flyCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * (ISLAND.radius - 8);
    flyPos[i * 3] = Math.cos(a) * r;
    flyPos[i * 3 + 1] = 3 + Math.random() * 11;
    flyPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.Float32BufferAttribute(flyPos, 3));
  const flyMat = new THREE.PointsMaterial({
    map: glowTexture(),
    color: new THREE.Color('#ffe9a8'),
    size: 1.1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const fireflies = new THREE.Points(flyGeo, flyMat);
  scene.add(fireflies);

  /* ── Window lights ── */
  const windowMats: THREE.MeshStandardMaterial[] = [];
  scene.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (m && m.emissiveMap && m.emissive) windowMats.push(m);
  });

  /* ── Camera ── */
  const cam = { theta: 0.2, phi: 1.4, dist: 220, tx: 0, ty: 0, tz: 0 };
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
    goal.phi = clamp(goal.phi - (e.clientY - lastY) * 0.004, 0.22, 1.38);
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
  let hours = 9.5;
  let playing = !opts.reducedMotion;
  let night = 0;

  /* ── Resize ── */
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Suppress labels during intro
  let introComplete = false;

  /* ── Intro GSAP Animation ── */
  if (!opts.reducedMotion) {
    const tl = gsap.timeline({
      onComplete: () => {
        introComplete = true;
      },
    });

    // 1. Camera sweeps in
    tl.to(cam, {
      theta: goal.theta,
      phi: goal.phi,
      dist: goal.dist,
      tx: goal.tx,
      ty: goal.ty,
      tz: goal.tz,
      duration: 2.5,
      ease: 'power3.out',
    });

    // 2. Districts rise out of the ground (staggered)
    tl.to(
      districtGroups.map(g => g.scale),
      {
        y: 1,
        duration: 1.8,
        stagger: 0.15,
        ease: 'elastic.out(1, 0.6)',
      },
      '-=1.5'
    );
  } else {
    // Skip animation
    cam.theta = goal.theta;
    cam.phi = goal.phi;
    cam.dist = goal.dist;
    cam.tx = goal.tx;
    cam.ty = goal.ty;
    cam.tz = goal.tz;
    for (const g of districtGroups) g.scale.set(1, 1, 1);
    introComplete = true;
  }

  /* ── Loop ── */
  let raf = 0;
  let prev = performance.now();
  let elapsed = 0;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let active = true;
  let visible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  const projected = new THREE.Vector3();
  const labelBuf: LabelPos[] = anchors.map((a) => ({ id: a.id, label: a.label, x: 0, y: 0, visible: false }));

  const onVisibility = () => {
    visible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    prev = performance.now();
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - prev) / 1000, 0.1);
    prev = now;
    if (!active || !visible) return;
    elapsed += dt;

    if (playing) {
      hours = (hours + dt * 0.55) % 24;
      opts.onClock?.(hours);
    }

    // ── Day/night ──
    const pal = sampleKeys(hours);
    const sunAngle = ((hours - 6) / 12) * Math.PI;
    const sunDir = new THREE.Vector3(Math.cos(sunAngle), Math.sin(sunAngle), 0.32).normalize();
    // Night follows the clock, not just the sun: dusk colours linger until
    // 20h, so stars, fireflies and window glow must wait for them.
    night = Math.max(
      smoothstep(18.2, 20.2, hours),
      1 - smoothstep(4.6, 6.4, hours),
    );

    skyUniforms.uTop.value.copy(pal.zen);
    skyUniforms.uMid.value.copy(pal.mid);
    skyUniforms.uBot.value.copy(pal.hor);
    skyUniforms.uSunCol.value.copy(pal.sun);
    skyUniforms.uSunDir.value.copy(sunDir);
    skyUniforms.uNight.value = night;
    skyUniforms.uTime.value = elapsed;

    hemi.intensity = pal.hemi;
    hemi.color.copy(pal.zen).lerp(new THREE.Color('#ffffff'), 0.25);
    ambient.intensity = pal.amb;
    sun.intensity = 1.55 * (1 - night * 0.82);
    sun.color.copy(pal.sun);
    sun.position.copy(sunDir).multiplyScalar(180);
    nightFill.intensity = night * 0.35;

    // Windows come up as the sun goes down.
    const winGlow = night * 1.5;
    for (let i = 0; i < windowMats.length; i++) windowMats[i].emissiveIntensity = winGlow;

    fireflies.material.opacity = night * 0.85;
    fireflies.rotation.y = elapsed * 0.012;

    renderer.toneMappingExposure = 1.05 + night * 0.16;
    scene.fog = new THREE.Fog(pal.hor.getHex(), cam.dist * 0.75, cam.dist * 2.35);

    // Water drifts.
    water.offset.x = elapsed * 0.014;
    water.offset.y = elapsed * 0.009;

    // ── Landmarks ──
    for (let i = 0; i < pieces.length; i++) pieces[i].tick?.(elapsed, night, dt);

    // ── Camera ──
    const k = opts.reducedMotion ? 1 : 1 - Math.pow(0.0025, dt);
    cam.theta += angDiff(cam.theta, goal.theta) * k;
    cam.phi = lerp(cam.phi, goal.phi, k);
    cam.dist = lerp(cam.dist, goal.dist, k);
    cam.tx = lerp(cam.tx, goal.tx, k);
    cam.ty = lerp(cam.ty, goal.ty, k);
    cam.tz = lerp(cam.tz, goal.tz, k);

    // A slow drift keeps the city alive until the visitor takes over.
    if (!userTouched && playing) goal.theta += dt * 0.02;

    camera.position.set(
      cam.tx + cam.dist * Math.sin(cam.phi) * Math.sin(cam.theta),
      cam.ty + cam.dist * Math.cos(cam.phi),
      cam.tz + cam.dist * Math.sin(cam.phi) * Math.cos(cam.theta),
    );
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    sun.target.position.set(cam.tx, cam.ty, cam.tz);

    // ── Labels ──
    if (opts.onLabels) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < anchors.length; i++) {
        projected.copy(anchors[i].pos).project(camera);
        const vis = introComplete && projected.z < 1;
        labelBuf[i].x = (projected.x * 0.5 + 0.5) * w;
        labelBuf[i].y = (-projected.y * 0.5 + 0.5) * h;
        labelBuf[i].visible = vis;
      }
      opts.onLabels(labelBuf);
    }

    renderer.render(scene, camera);

    fpsAcc += dt;
    fpsFrames++;
    if (fpsAcc > 1) {
      fpsAcc = 0;
      fpsFrames = 0;
    }
  }
  raf = requestAnimationFrame(frame);

  /* ── Teardown ── */
  function dispose() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    canvas.removeEventListener('wheel', onWheel);

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibility);
    }
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    });
    renderer.dispose();
  }

  // Dev-only introspection hook, used by the headless render tests.
  (window as unknown as { __stemCity?: unknown }).__stemCity = { scene, anchors, heightAt };

  return {
    dispose,
    setTime: (h) => {
      hours = ((h % 24) + 24) % 24;
    },
    setPlaying: (p) => {
      playing = p;
      if (p) userTouched = true;
    },
    setView: applyView,
    screenshot: () => renderer.domElement.toDataURL('image/png'),
    setActive: (a) => {
      active = a;
      prev = performance.now();
    },
  };
}

/** Re-exported so the React layer can turn a score into a column height. */
export { scoreToHeight };
