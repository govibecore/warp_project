import { useEffect, useRef, useState } from 'react';
import { GsapCounter } from '../animations/GsapCounter';
import { OutcomeBadge } from './OutcomeBadge';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  percentile?: number;
  boardGradeBand?: { grade: string; band: string } | null;
  className?: string;
}

const SIZE = 160;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({
  score,
  maxScore = 900,
  percentile,
  boardGradeBand,
  className = '',
}: ScoreRingProps) {
  const [animated, setAnimated] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    // Trigger animation on next frame so CSS transition fires
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const fraction = Math.min(1, Math.max(0, score / maxScore));
  // dashoffset = full circumference when empty, 0 when full
  const targetOffset = CIRCUMFERENCE * (1 - fraction);
  const currentOffset = reducedMotion.current || animated ? targetOffset : CIRCUMFERENCE;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Ring */}
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="block -rotate-90"
          aria-label={`Score: ${score} out of ${maxScore}`}
          role="img"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Fill ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-accent, #8FCFE8)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="butt"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={currentOffset}
            style={{
              transition: reducedMotion.current
                ? 'none'
                : 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)',
            }}
          />
        </svg>

        {/* Center content — rotated back to normal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <GsapCounter
              value={score}
              className="font-display text-3xl font-bold tabular tracking-tight text-foreground"
            />
            <span className="text-[11px] font-mono text-foreground-muted">/{maxScore}</span>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground-secondary mt-0.5">
            Scaled Score
          </span>
        </div>
      </div>

      {/* Below-ring metadata */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        {percentile !== undefined && (
          <OutcomeBadge percentile={percentile} size="sm" />
        )}
        {boardGradeBand && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-border text-foreground-secondary">
            CBSE/ICSE Grade {boardGradeBand.grade}
            <span className="text-foreground-muted">·</span>
            {boardGradeBand.band}
          </span>
        )}
      </div>
    </div>
  );
}
