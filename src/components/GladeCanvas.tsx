/**
 * GladeCanvas - mounts the self-playing glade as a hero background.
 *
 * Default-exported so it can be `React.lazy`-loaded: three.js ships in its own
 * chunk and never blocks first paint. The component is purely decorative -
 * pointer events pass through, there is no HUD, and it pauses itself when the
 * hero scrolls away or the tab is hidden so a background never burns battery.
 */

import { useEffect, useRef, useState } from 'react';
import { createGame, DEFAULT_TUNE, type Game, type Tune } from '@/game/game';

interface SliderSpec {
  key: keyof Tune | 'spawnHz';
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderSpec[] = [
  { key: 'spawnHz', label: 'Spawn rate', min: 0.33, max: 5, step: 0.01 },
  { key: 'enemySpeed', label: 'Enemy speed', min: 0.2, max: 3, step: 0.05 },
  { key: 'playerSpeed', label: 'Wanderer speed', min: 0.2, max: 3, step: 0.05 },
  { key: 'damage', label: 'Damage', min: 0.1, max: 10, step: 0.1 },
  { key: 'cameraHeight', label: 'Camera height', min: 8, max: 46, step: 0.5 },
  { key: 'cameraDistance', label: 'Camera distance', min: 10, max: 60, step: 0.5 },
  { key: 'fogFar', label: 'Fog range', min: 40, max: 300, step: 1 },
];

/**
 * Probe on a throwaway canvas, never the real one: requesting a context
 * locks its attributes, which would silently defeat three's `antialias`.
 */
function hasWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function GladeCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({
    spawnHz: 1,
    enemySpeed: DEFAULT_TUNE.enemySpeed,
    playerSpeed: DEFAULT_TUNE.playerSpeed,
    damage: DEFAULT_TUNE.damage,
    cameraHeight: DEFAULT_TUNE.cameraHeight,
    cameraDistance: DEFAULT_TUNE.cameraDistance,
    fogFar: DEFAULT_TUNE.fogFar,
  });

  // ── Mount the simulation ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let game: Game;
    try {
      game = createGame({ canvas, width: canvas.clientWidth || window.innerWidth, height: canvas.clientHeight || window.innerHeight });
    } catch {
      return; // No GL context available - leave the hero on its CSS backdrop.
    }
    gameRef.current = game;
    setReady(true);

    // Fit the canvas to its container and the device pixel ratio.
    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      game.resize(w, h);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    let visible = true;
    let onScreen = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (now - last) / 1000;
      last = now;
      if (!visible || !onScreen) return;
      game.step(dt);
      game.render();
    };

    if (reduced) {
      // One painted frame, then stillness - the glade, held.
      game.step(1 / 60);
      game.step(1 / 60);
      game.render();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        last = performance.now();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      game.dispose();
      gameRef.current = null;
      setReady(false);
    };
  }, []);

  // ── Hidden tuning panel (backtick) ────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setPanelOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setSlider = (spec: SliderSpec, raw: number) => {
    setValues((v) => ({ ...v, [spec.key]: raw }));
    const game = gameRef.current;
    if (!game) return;
    if (spec.key === 'spawnHz') game.setTune({ spawnRate: 1 / raw });
    else game.setTune({ [spec.key]: raw });
  };

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

      {panelOpen && (
        <div
          className="pointer-events-auto absolute top-4 right-4 z-20 w-64 rounded-none border border-border bg-background/90 p-4 shadow-lg backdrop-blur"
          data-testid="glade-tuning-panel"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-secondary">
              Glade tuning
            </span>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="text-xs text-foreground-muted hover:text-foreground"
              aria-label="Close tuning panel"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {SLIDERS.map((s) => (
              <label key={s.key} className="flex flex-col gap-1">
                <span className="flex items-center justify-between text-[11px] text-foreground-secondary">
                  <span>{s.label}</span>
                  <span className="font-mono tabular text-foreground-muted">
                    {values[s.key]?.toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={values[s.key]}
                  onChange={(e) => setSlider(s, Number(e.target.value))}
                  className="w-full accent-(--color-primary)"
                />
              </label>
            ))}
          </div>

          <p className="mt-3 border-t border-border pt-2 font-mono text-[10px] text-foreground-muted">
            {ready ? 'running · press ` to hide' : 'starting…'}
          </p>
        </div>
      )}
    </div>
  );
}
