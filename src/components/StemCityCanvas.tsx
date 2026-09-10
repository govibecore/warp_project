import { useEffect, useRef, useState } from 'react';
import { createStemCity } from '../city/stemCity';
import type { StemCityHandle } from '../city/stemCity';
import { DISTRICTS, CITY_COLORS } from '../city/core';
import type { ScoreMap } from '../city/world';

/**
 * STEM City — "Where you sit", in three dimensions.
 *
 * Five districts, one per competency. In each, a score column rises to the
 * learner's result and a cohort ring marks the global reference on that same
 * column: green above the ring, amber below it. The gap is the product.
 *
 * Illustrative sample values stand in until an assessment produces real ones.
 * Everything is procedural — no textures, models or fonts are ever fetched.
 */

/** Sample profile: the same numbers the old 2D journey chart used. */
export const SAMPLE_SCORES: ScoreMap = {
  scientificInquiry: { you: 71, ref: 59 },
  computationalThinking: { you: 63, ref: 58 },
  engineeringDesign: { you: 52, ref: 58 },
  mathematicalReasoning: { you: 66, ref: 59 },
  systemsThinking: { you: 57, ref: 61 },
};

export interface StemCityCanvasProps {
  scores?: ScoreMap;
  className?: string;
}

const VIEWS = [
  { id: 'overview', label: 'Overview' },
  ...DISTRICTS.map((d) => ({ id: d.id, label: d.label })),
];

export default function StemCityCanvas({
  scores = SAMPLE_SCORES,
  className = '',
}: StemCityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cityRef = useRef<StemCityHandle | null>(null);
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hours, setHours] = useState(9.5);
  const [playing, setPlaying] = useState(true);
  const [view, setView] = useState('overview');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastPush = 0;

    const city = createStemCity(canvas, scores, {
      reducedMotion: reduced,
      onLabels: (labels) => {
        // Written straight to the DOM: a per-frame setState would thrash React.
        for (const l of labels) {
          const el = labelRefs.current[l.id];
          if (!el) continue;
          el.style.transform = `translate(-50%, -100%) translate(${l.x}px, ${l.y}px)`;
          el.style.opacity = l.visible ? '1' : '0';
        }
      },
      onClock: (h) => {
        const now = performance.now();
        if (now - lastPush < 250) return;
        lastPush = now;
        setHours(h);
      },
    });

    if (!city) {
      setSupported(false);
      return;
    }
    cityRef.current = city;

    const io = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((e) => e.isIntersecting);
        city.setActive(isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      city.dispose();
      cityRef.current = null;
    };
  }, [scores]);

  // The view button and the city's own camera both need to know.
  useEffect(() => {
    cityRef.current?.setView(view);
  }, [view]);

  useEffect(() => {
    cityRef.current?.setPlaying(playing);
  }, [playing]);

  const setTime = (h: number) => {
    setHours(h);
    cityRef.current?.setTime(h);
  };

  const clock = `${String(Math.floor(hours)).padStart(2, '0')}:${String(
    Math.floor((hours % 1) * 60),
  ).padStart(2, '0')}`;

  return (
    <div
      data-testid="stem-city"
      className={`relative w-full overflow-hidden border border-border bg-background ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        style={{ touchAction: 'none' }}
        aria-label="STEM City: five competency districts scored against the global reference cohort"
      />

      {!supported && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-foreground-secondary">
          STEM City needs WebGL, which this browser has turned off.
        </div>
      )}

      {/* ── District labels, projected from 3D each frame ── */}
      <div className="pointer-events-none absolute inset-0">
        {DISTRICTS.map((d) => {
          const entry = d.competency ? scores[d.competency] : undefined;
          const delta = entry ? entry.you - entry.ref : 0;
          const ahead = delta >= 0;
          return (
            <div
              key={d.id}
              ref={(el) => {
                labelRefs.current[d.id] = el;
              }}
              className="absolute top-0 left-0 opacity-0 transition-opacity duration-200"
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className="border border-border bg-background px-2.5 py-1 text-center"
                  style={{ borderTopColor: d.color, borderTopWidth: '2px' }}
                >
                  <div
                    className="text-[9px] font-bold tracking-[0.14em]"
                    style={{ color: d.color }}
                  >
                    {d.label}
                  </div>
                  <div className="font-mono text-[11px] font-bold tabular text-foreground">
                    {entry?.you ?? '—'}
                    <span className="text-foreground-secondary">/{entry?.ref ?? '—'}</span>
                  </div>
                </div>
                <div
                  className="border border-border bg-surface px-2 py-0.5 font-mono text-[10px] font-bold tabular"
                  style={{
                    color: ahead ? CITY_COLORS.ahead : CITY_COLORS.behind,
                  }}
                >
                  {ahead ? '+' : ''}
                  {delta}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legend: how to read the city ── */}
      <div className="pointer-events-none absolute top-3 left-3 border border-border bg-background px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-secondary">
            How to read it
          </p>
          <span className="hidden font-mono text-[10px] tracking-wide text-primary sm:inline-block">
            Drag to orbit · scroll to zoom
          </span>
        </div>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-tight text-foreground-secondary">
          <li className="flex items-center gap-2">
            <span className="inline-block size-2.5" style={{ background: 'var(--chart-1)' }} />
            Column height = your score
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block size-2.5 border" style={{ borderColor: CITY_COLORS.cohort }} />
            Ring = global cohort
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block size-2.5" style={{ background: CITY_COLORS.ahead }} />
            Above the ring — ahead
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block size-2.5" style={{ background: CITY_COLORS.behind }} />
            Below the ring — the gap
          </li>
        </ul>
      </div>

      {/* ── Controls ── */}
      <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={
                'min-h-8 min-w-16 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ' +
                (view === v.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground-secondary hover:border-border-strong hover:text-foreground')
              }
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 border border-border bg-background px-3 py-1.5">
          <button
            onClick={() => setPlaying(!playing)}
            className="flex h-7 w-8 items-center justify-center border border-border px-1.5 text-[10px] font-bold uppercase text-foreground-secondary hover:border-border-strong hover:text-foreground"
            aria-label={playing ? 'Pause the day cycle' : 'Play the day cycle'}
          >
            {playing ? 'II' : '▶'}
          </button>
          <input
            type="range"
            min={0}
            max={24}
            step={0.1}
            value={hours}
            onChange={(e) => setTime(Number(e.target.value))}
            className="accent-primary w-28 cursor-pointer"
            aria-label="Time of day"
          />
          <span className="font-mono text-[11px] tabular text-foreground-secondary">{clock}</span>
        </div>
      </div>
    </div>
  );
}
