import { useEffect, useRef, useState } from 'react';
import { Delta, DeltaIcon, DeltaValue } from '../efferd/delta';

interface PillarData {
  domain: string;
  label: string;
  value: number; // 0–100
  suffix?: string;
  band: string;
  delta: number;
  observation: string;
}

interface ParakhRadarChartProps {
  pillars: PillarData[];
  baseline?: number; // 0–100, default 50
  className?: string;
}

// Pillar accent colors aligned to Nordic Lagom competency tokens
const PILLAR_COLORS = [
  '#8FCFE8', // c1 - Computational/Conceptual (accent cyan)
  '#D9A86E', // c3 - Mathematical/HOTS (warm amber)
  '#7FCBA0', // c2 - Engineering/Application (ok green)
  '#B89BD9', // c5 - Systems/Metacognition (violet)
];

const SVG_SIZE = 220;
const CENTER = SVG_SIZE / 2;
const MAX_R = 80; // max radius for score = 100

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function buildPolygonPoints(values: number[], maxR: number, cx: number, cy: number, n: number) {
  return values
    .map((v, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const r = (Math.min(100, Math.max(0, v)) / 100) * maxR;
      const p = polarToCartesian(cx, cy, r, angle);
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

export function ParakhRadarChart({ pillars, baseline = 50, className = '' }: ParakhRadarChartProps) {
  const [drawn, setDrawn] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    // Delay radar draw by 400ms to follow card stagger
    const id = setTimeout(() => setDrawn(true), reducedMotion.current ? 0 : 400);
    return () => clearTimeout(id);
  }, []);

  const n = pillars.length; // 4

  // Grid rings at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  // Axis endpoints
  const axes = pillars.map((_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return polarToCartesian(CENTER, CENTER, MAX_R, angle);
  });

  // Score polygon
  const scorePoints = buildPolygonPoints(
    pillars.map((p) => p.value),
    MAX_R,
    CENTER,
    CENTER,
    n,
  );

  // Baseline polygon
  const baselinePoints = buildPolygonPoints(
    Array(n).fill(baseline),
    MAX_R,
    CENTER,
    CENTER,
    n,
  );

  // Label positions (slightly outside MAX_R)
  const labelPositions = pillars.map((p, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = MAX_R + 22;
    return { ...polarToCartesian(CENTER, CENTER, r, angle), label: p.label, domain: p.domain };
  });

  // Polygon perimeter for stroke-dasharray animation
  // Approximate using number of points × average side length
  // We use a large number to cover any polygon size
  const DASH_LEN = 1200;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* SVG Radar */}
      <div className="flex justify-center">
        <svg
          width={SVG_SIZE + 60}
          height={SVG_SIZE + 40}
          viewBox={`-30 -20 ${SVG_SIZE + 60} ${SVG_SIZE + 40}`}
          className="block"
          aria-label="PARAKH 360° competency radar chart"
          role="img"
        >
          {/* Grid rings */}
          {gridLevels.map((level) => {
            const pts = buildPolygonPoints(Array(n).fill(level), MAX_R, CENTER, CENTER, n);
            return (
              <polygon
                key={level}
                points={pts}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            );
          })}

          {/* Axis lines */}
          {axes.map((end, i) => (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          ))}

          {/* Baseline polygon (dashed) */}
          <polygon
            points={baselinePoints}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Score polygon with animation */}
          <polygon
            points={scorePoints}
            fill="rgba(143,207,232,0.12)"
            stroke="rgba(143,207,232,0.8)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeDasharray={DASH_LEN}
            strokeDashoffset={reducedMotion.current || drawn ? 0 : DASH_LEN}
            style={{
              transition: reducedMotion.current
                ? 'none'
                : 'stroke-dashoffset 0.8s cubic-bezier(.2,.7,.2,1)',
              fillOpacity: reducedMotion.current || drawn ? 1 : 0,
              transitionProperty: 'stroke-dashoffset, fill-opacity',
            }}
          />

          {/* Vertex dots */}
          {pillars.map((p, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const r = (Math.min(100, Math.max(0, p.value)) / 100) * MAX_R;
            const pos = polarToCartesian(CENTER, CENTER, r, angle);
            return (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={3.5}
                fill={PILLAR_COLORS[i % PILLAR_COLORS.length]}
                stroke="var(--color-ink-7, #0B0E13)"
                strokeWidth={1.5}
                style={{
                  opacity: reducedMotion.current || drawn ? 1 : 0,
                  transition: reducedMotion.current ? 'none' : 'opacity 0.3s ease 1s',
                }}
              />
            );
          })}

          {/* Axis labels */}
          {labelPositions.map((lp, i) => {
            // Determine text-anchor based on horizontal position
            const ta =
              lp.x < CENTER - 5 ? 'end' : lp.x > CENTER + 5 ? 'start' : 'middle';
            return (
              <g key={i}>
                <text
                  x={lp.x}
                  y={lp.y - 4}
                  textAnchor={ta}
                  fontSize={7}
                  fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
                  fontWeight="700"
                  fill="rgba(255,255,255,0.4)"
                  letterSpacing="0.06em"
                  className="uppercase"
                >
                  {lp.domain}
                </text>
                <text
                  x={lp.x}
                  y={lp.y + 7}
                  textAnchor={ta}
                  fontSize={8.5}
                  fontFamily="var(--font-sans, 'Inter', sans-serif)"
                  fontWeight="600"
                  fill="rgba(255,255,255,0.75)"
                >
                  {lp.label.split(' ').slice(0, 2).join(' ')}
                </text>
              </g>
            );
          })}

          {/* Center dot */}
          <circle cx={CENTER} cy={CENTER} r={2} fill="rgba(255,255,255,0.15)" />

          {/* Baseline label */}
          <text
            x={CENTER + 4}
            y={CENTER - (baseline / 100) * MAX_R - 4}
            fontSize={7}
            fontFamily="var(--font-mono, monospace)"
            fill="rgba(255,255,255,0.3)"
            textAnchor="start"
          >
            {baseline}% baseline
          </text>
        </svg>
      </div>

      {/* 2×2 Legend grid */}
      <div className="grid grid-cols-2 gap-2">
        {pillars.map((p, i) => (
          <div
            key={p.label}
            className="p-2 border border-border bg-surface flex items-start gap-2"
          >
            {/* Accent swatch */}
            <div
              className="mt-0.5 shrink-0 w-1 self-stretch"
              style={{ backgroundColor: PILLAR_COLORS[i % PILLAR_COLORS.length] }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground-muted truncate">
                {p.domain}
              </p>
              <p className="text-[10px] font-semibold text-foreground leading-tight truncate">
                {p.label}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold font-display tabular text-foreground">
                  {p.value}
                  {p.suffix}
                </span>
                <span className="text-[9px] font-mono text-foreground-secondary">
                  ({p.band})
                </span>
                <Delta value={p.delta} variant="default">
                  <DeltaIcon variant="trend" />
                  <DeltaValue suffix=" pts" />
                </Delta>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
