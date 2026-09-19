import { useRef } from 'react';
import { motion } from 'framer-motion';
import { CounterNumber } from './aliimam/CounterNumber';
import { OutcomeBadge } from './OutcomeBadge';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  percentile?: number;
  boardGradeBand?: { grade: string; band: string } | null;
  sem?: number;
  className?: string;
}

const SIZE = 160;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({
  score = 0,
  maxScore = 900,
  percentile,
  boardGradeBand,
  sem,
  className = '',
}: ScoreRingProps) {
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  const fraction = Math.min(1, Math.max(0, score / maxScore));
  // dashoffset = full circumference when empty, 0 when full
  const targetOffset = CIRCUMFERENCE * (1 - fraction);

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
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-accent, #8FCFE8)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="butt"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE, filter: 'drop-shadow(0px 0px 0px var(--color-accent))' }}
            animate={{ 
              strokeDashoffset: reducedMotion.current ? targetOffset : [CIRCUMFERENCE, targetOffset],
              filter: reducedMotion.current ? 'drop-shadow(0px 0px 8px var(--color-accent))' : ['drop-shadow(0px 0px 0px var(--color-accent))', 'drop-shadow(0px 0px 10px var(--color-accent))']
            }}
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1], // Sharp, crisp deceleration (Lagom/geometric feel)
              delay: 0.2 // Wait for layout
            }}
          />
        </svg>

        {/* Center content - rotated back to normal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <CounterNumber
              value={score}
              className="font-display text-3xl font-bold tabular tracking-tight text-foreground"
            />
            <span className="text-[11px] font-mono text-foreground-muted">/{maxScore}</span>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground-secondary mt-0.5">
            Scaled Score
          </span>
          {sem !== undefined && (
            <span className="text-[10px] font-mono text-foreground-muted mt-1" aria-label={`Standard error of measurement: plus or minus ${sem}`}>
              ± {sem}
            </span>
          )}
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
