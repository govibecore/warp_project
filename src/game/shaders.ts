/**
 * shaders.ts — the one shared toon shader.
 *
 * Every surface in the glade uses this: NdotL against a single world-space
 * sun, quantised by a narrow smoothstep terminator into exactly two tones
 * (lit / shadow). A manual distance fog dissolves far terrain into the sky
 * colour. Optional wind sway, per-vertex colour modulation, and a hit-flash
 * uniform for combat feedback.
 *
 * Fog and time uniforms are SHARED objects — the tuning panel and the world
 * update them in one place and every material follows.
 */

import * as THREE from 'three';
import { hexToRgb, warmShadow } from './utils';

/** World-space sun. One light, one direction, no shadow maps. */
export const SUN_DIR = new THREE.Vector3(0.45, 0.85, 0.35).normalize();

/** Shared uniforms — mutate `.value` and all toon materials follow. */
export const sharedUniforms = {
  uTime: { value: 0 },
  uSunDir: { value: SUN_DIR.clone() },
  uFogColor: { value: new THREE.Color('#d8e6d4') },
  uFogNear: { value: 55 },
  uFogFar: { value: 125 },
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSway;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  #ifdef USE_COLOR
  varying vec3 vColor;
  #endif

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    // Wind sway: bend with local height so treetops move and roots stay put.
    float swayAmt = uSway * max(position.y, 0.0);
    wp.x += sin(uTime * 1.4 + wp.x * 0.35 + wp.z * 0.27) * swayAmt;
    wp.z += cos(uTime * 1.1 + wp.x * 0.21 + wp.z * 0.33) * swayAmt * 0.7;
    vWorldPos = wp.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    #ifdef USE_COLOR
    vColor = color;
    #endif
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uShadowColor;
  uniform vec3 uSunDir;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uFlash;
  uniform float uOpacity;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  #ifdef USE_COLOR
  varying vec3 vColor;
  #endif

  void main() {
    vec3 base = uBaseColor;
    vec3 shadowC = uShadowColor;
    #ifdef USE_COLOR
    base *= vColor;
    shadowC *= vColor;
    #endif

    // Two-tone toon: narrow terminator, nothing in between.
    float ndl = dot(normalize(vNormal), normalize(uSunDir));
    float tone = smoothstep(-0.14, 0.14, ndl);
    vec3 col = mix(shadowC, base, tone);

    // Combat feedback: hand-painted units flash toward warm white, never neon.
    col = mix(col, vec3(1.0, 0.98, 0.94), clamp(uFlash, 0.0, 1.0) * 0.8);

    // Manual distance fog into the sky colour.
    float dist = distance(vWorldPos, cameraPosition);
    col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, dist));

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export interface ToonOptions {
  /** Lit tone — '#rrggbb' or [r,g,b]. */
  base: string | [number, number, number];
  /** Shadow tone — defaults to a warm-biased darken of `base`. */
  shadow?: [number, number, number];
  /** Wind sway amplitude in world units (0 = rigid). */
  sway?: number;
  opacity?: number;
  /** Multiply both tones by the geometry's `color` attribute (terrain). */
  vertexColors?: boolean;
  transparent?: boolean;
  side?: THREE.Side;
}

export function makeToonMaterial(opts: ToonOptions): THREE.ShaderMaterial {
  const base =
    typeof opts.base === 'string' ? hexToRgb(opts.base) : opts.base;
  const shadow = opts.shadow ?? warmShadow(typeof opts.base === 'string' ? opts.base : '#808080');
  const opacity = opts.opacity ?? 1;

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uBaseColor: { value: new THREE.Vector3(...base) },
      uShadowColor: { value: new THREE.Vector3(...shadow) },
      uSway: { value: opts.sway ?? 0 },
      uFlash: { value: 0 },
      uOpacity: { value: opacity },
      // Shared references — panel/world changes propagate to every material.
      uTime: sharedUniforms.uTime,
      uSunDir: sharedUniforms.uSunDir,
      uFogColor: sharedUniforms.uFogColor,
      uFogNear: sharedUniforms.uFogNear,
      uFogFar: sharedUniforms.uFogFar,
    },
    vertexColors: opts.vertexColors ?? false,
    transparent: opts.transparent ?? opacity < 1,
    depthWrite: opacity >= 1,
    side: opts.side ?? THREE.FrontSide,
  });
  return mat;
}

/** Flat contact-shadow disc: soft dark green-brown, never pure black. */
export function makeContactShadow(radius: number): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 20);
  const mat = new THREE.MeshBasicMaterial({
    color: '#3a4a32',
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  return mesh;
}

/** Set the hit-flash level on every toon material of a unit. */
export function setFlash(materials: THREE.ShaderMaterial[], level: number) {
  for (const m of materials) m.uniforms.uFlash.value = level;
}
