/**
 * AuroraCurtain — High-performance WebGL shader background adapted from
 * Pixel Perfect (shaders/aurora-curtain.tsx & flow-field.tsx).
 *
 * Tuned to WARP's Nordic Lagom x Sci-Fi color tokens:
 * - Deep canvas: #0B0E13
 * - Primary cyan: #8FCFE8
 * - Dark teal: #4DA8C9
 * - Deep atmospheric indigo: #1E1B38
 *
 * Automatically pauses when off-screen, when the tab is hidden, or when
 * prefers-reduced-motion is active.
 */

import { useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface AuroraCurtainProps {
  className?: string;
  intensity?: number;
  speed?: number;
  interactive?: boolean;
}

const VERT_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_intensity;

// Simplex-inspired 2D hash
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// 2D Gradient Noise
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Fractional Brownian Motion (4 octaves for optimal mobile performance)
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += amp * gnoise(p);
    p = rot * p;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  // Aspect ratio correction
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * 0.12;

  // Mouse influence: subtle warping towards pointer
  vec2 mDiff = uv - u_mouse;
  float mDist = length(mDiff);
  float mouseWarp = exp(-mDist * 3.5) * 0.15;
  uv += normalize(mDiff + 0.001) * mouseWarp;

  // Multi-frequency aurora curtain folds
  float n1 = fbm(vec2(uv.x * 2.2 + t * 0.4, uv.y * 1.4 - t * 0.6));
  float n2 = fbm(vec2(uv.x * 3.5 - t * 0.3, uv.y * 3.0 + t * 0.5));
  
  // Upper atmosphere vertical drape mask
  float drape = smoothstep(0.05, 0.65, n1 + n2 * 0.5);
  // Falloff towards bottom so it blends seamlessly into dark page content
  float vertFade = smoothstep(0.0, 0.85, 1.0 - uv.y) * smoothstep(0.0, 0.25, uv.y);
  float ribbon = drape * vertFade * u_intensity;

  // WARP Nordic Lagom Palette Tokens:
  // Base canvas #0B0E13 -> (0.043, 0.055, 0.075)
  // Deep Night Teal -> (0.06, 0.18, 0.24)
  // Primary Cyan #8FCFE8 -> (0.56, 0.81, 0.91)
  // Accent Teal #4DA8C9 -> (0.30, 0.66, 0.79)
  // Atmospheric Violet/Indigo -> (0.12, 0.11, 0.24)

  vec3 colDeepTeal = vec3(0.06, 0.20, 0.27);
  vec3 colCyan = vec3(0.56, 0.81, 0.91);
  vec3 colTeal = vec3(0.30, 0.66, 0.79);
  vec3 colViolet = vec3(0.14, 0.12, 0.26);

  // Gradient mixing across the folds
  vec3 auroraColor = mix(colViolet, colDeepTeal, smoothstep(-0.2, 0.5, n1));
  auroraColor = mix(auroraColor, colTeal, smoothstep(0.1, 0.6, n2));
  auroraColor = mix(auroraColor, colCyan, smoothstep(0.35, 0.85, ribbon));

  // Modulate with ribbon density
  vec3 finalColor = auroraColor * ribbon * 1.4;

  // Output with premultiplied alpha for seamless canvas layering
  float alpha = clamp(ribbon * 1.6, 0.0, 1.0);
  fragColor = vec4(finalColor, alpha);
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Aurora shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export const AuroraCurtain = memo(function AuroraCurtain({
  className,
  intensity = 0.85,
  speed = 1.0,
  interactive = true,
}: AuroraCurtainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
      depth: false,
    });

    if (!gl) return;

    const vert = createShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vert || !frag) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Aurora program link error:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    // Full-screen quad
    const quad = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uResolution = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uIntensity = gl.getUniformLocation(prog, 'u_intensity');

    // Handle resizing
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(canvas.clientWidth * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse movement
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
        mouseRef.current.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
      }
    };

    if (interactive) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    // Visibility observer to pause rendering offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(canvas);

    let startTime = performance.now();

    const render = (time: number) => {
      if (!isVisibleRef.current || document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const elapsed = (time - startTime) * 0.001 * speed;

      gl.useProgram(prog);
      gl.bindVertexArray(vao);

      gl.uniform1f(uTime, prefersReducedMotion ? 1.0 : elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uIntensity, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', onMouseMove);
      }
      observer.disconnect();

      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [intensity, speed, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 size-full mix-blend-multiply opacity-30 dark:mix-blend-screen dark:opacity-85', className)}
      aria-hidden="true"
    />
  );
});
