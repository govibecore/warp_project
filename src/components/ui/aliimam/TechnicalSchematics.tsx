import { CornerMarks, CrosshairVector } from './Vectors';

/**
 * ── HERO: Psychometric Multidimensional Coordinate Schematic ─────────────
 * Isometric architectural blueprint depicting the 5-domain latent ability space,
 * adaptive item branching paths, and precision coordinate drafting marks.
 */
export function HeroPsychometricSchematic({ className = '' }: { className?: string }) {
  return (
    <div className={`relative border border-border bg-card p-6 ${className}`}>
      <CornerMarks />

      {/* Header technical bar */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <CrosshairVector size={14} className="text-primary" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            SYS.SCHEMATIC // 3PL-IRT-COORDINATE-GRID
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-foreground-muted">
          <span>DIM: 5-STEAM</span>
          <span className="text-border">/</span>
          <span className="text-primary">CALIBRATED</span>
        </div>
      </div>

      {/* SVG Isometric Schematic */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-surface/50 p-2">
        <svg
          viewBox="0 0 640 400"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Fine hairline grid pattern */}
            <pattern id="isoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.75"
                strokeDasharray="2 2"
              />
            </pattern>
            {/* Linear gradient for trajectory */}
            <linearGradient id="primaryTrace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#isoGrid)" />

          {/* Isometric Coordinate Plane (Base) */}
          <g transform="translate(320, 200)">
            {/* 3D Coordinate Axes */}
            <line x1="0" y1="0" x2="-220" y2="100" stroke="var(--border-strong)" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="220" y2="100" stroke="var(--border-strong)" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="0" y2="-150" stroke="var(--border-strong)" strokeWidth="1.2" />

            {/* Axis labels in mono */}
            <text x="-230" y="115" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="10">
              AXIS-X [TASK DIFFICULTY: b]
            </text>
            <text x="140" y="115" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="10">
              AXIS-Y [DISCRIMINATION: a]
            </text>
            <text x="10" y="-140" fill="var(--primary)" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
              AXIS-Z [LATENT ABILITY: θ]
            </text>

            {/* Iso Rings (Confidence Contours) */}
            <ellipse cx="0" cy="0" rx="160" ry="75" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
            <ellipse cx="0" cy="-40" rx="110" ry="52" stroke="var(--primary)" strokeWidth="1" strokeOpacity="0.4" />
            <ellipse cx="0" cy="-80" rx="65" ry="30" stroke="var(--primary)" strokeWidth="1.2" />

            {/* 5 STEAM Competency Nodes */}
            {/* 01 Ecology */}
            <g transform="translate(-120, -10)">
              <rect x="-18" y="-18" width="36" height="36" fill="var(--card)" stroke="var(--chart-1)" strokeWidth="1.5" />
              <text x="0" y="4" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" fontWeight="bold">
                01
              </text>
              <text x="0" y="30" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="9" textAnchor="middle">
                ECOLOGY
              </text>
            </g>

            {/* 02 Data */}
            <g transform="translate(-70, -100)">
              <rect x="-18" y="-18" width="36" height="36" fill="var(--card)" stroke="var(--chart-2)" strokeWidth="1.5" />
              <text x="0" y="4" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" fontWeight="bold">
                02
              </text>
              <text x="0" y="-24" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="9" textAnchor="middle">
                DATA
              </text>
            </g>

            {/* 03 Infrastructure */}
            <g transform="translate(60, -90)">
              <rect x="-18" y="-18" width="36" height="36" fill="var(--card)" stroke="var(--chart-3)" strokeWidth="1.5" />
              <text x="0" y="4" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" fontWeight="bold">
                03
              </text>
              <text x="0" y="-24" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="9" textAnchor="middle">
                INFRA
              </text>
            </g>

            {/* 04 Energy */}
            <g transform="translate(130, -5)">
              <rect x="-18" y="-18" width="36" height="36" fill="var(--card)" stroke="var(--chart-4)" strokeWidth="1.5" />
              <text x="0" y="4" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" fontWeight="bold">
                04
              </text>
              <text x="0" y="30" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="9" textAnchor="middle">
                ENERGY
              </text>
            </g>

            {/* 05 Space */}
            <g transform="translate(0, 50)">
              <rect x="-18" y="-18" width="36" height="36" fill="var(--card)" stroke="var(--chart-5)" strokeWidth="1.5" />
              <text x="0" y="4" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" fontWeight="bold">
                05
              </text>
              <text x="0" y="30" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="9" textAnchor="middle">
                SPACE
              </text>
            </g>

            {/* Interconnecting Mathematical Vectors */}
            <polyline
              points="-120,-10 -70,-100 60,-90 130,-5 0,50 -120,-10"
              stroke="url(#primaryTrace)"
              strokeWidth="1.5"
            />

            {/* Current θ Ability Center Indicator */}
            <rect x="-6" y="-86" width="12" height="12" fill="var(--primary)" />
            <text x="14" y="-81" fill="var(--primary)" fontFamily="var(--font-mono)" fontSize="9" fontWeight="600">
              θ_ESTIMATED = +1.42σ [SEM: 0.18]
            </text>
          </g>

          {/* Metadata Overlay Bar */}
          <g transform="translate(20, 370)">
            <text fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="10">
              ALGORITHM: 3PL-IRT · CAT MAX-INFORMATION SELECTION · ERROR-BOUND SHRINKAGE: 64%
            </text>
          </g>
        </svg>
      </div>

      {/* Footer proof summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-mono text-xs text-foreground-secondary">
        <div className="flex items-center gap-4">
          <span>
            BANDS: <strong className="text-foreground">5 (GRADES 3–12)</strong>
          </span>
          <span>
            ITEMS: <strong className="text-foreground">30 ADAPTIVE</strong>
          </span>
        </div>
        <div className="text-primary font-medium">
          CONVERGENCE TOLERANCE: Δθ &lt; 0.05
        </div>
      </div>
    </div>
  );
}

/**
 * ── SECTION 3: Item Response Theory (IRT) Technical Diagram ──────────────
 * Clean 2D technical blueprint showing Item Characteristic Curves (ICC),
 * parameter calibrations (a, b, c), and adaptive difficulty convergence.
 */
export function IrtCognitiveSchematic({ className = '' }: { className?: string }) {
  return (
    <div className={`relative border border-border bg-card p-6 ${className}`}>
      <CornerMarks />

      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <CrosshairVector size={14} className="text-primary" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            PSYCHOMETRIC ENGINE // ITEM CHARACTERISTIC CURVE
          </span>
        </div>
        <span className="font-mono text-[11px] text-foreground-muted">P(θ) = c + (1-c)/(1 + e^-a(θ-b))</span>
      </div>

      <div className="relative aspect-video w-full bg-surface/50 p-2">
        <svg viewBox="0 0 560 300" className="h-full w-full" fill="none">
          {/* Coordinate Grid */}
          <line x1="50" y1="20" x2="50" y2="250" stroke="var(--border-strong)" strokeWidth="1.2" />
          <line x1="50" y1="250" x2="520" y2="250" stroke="var(--border-strong)" strokeWidth="1.2" />

          {/* Grid lines */}
          <line x1="50" y1="80" x2="520" y2="80" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="50" y1="165" x2="520" y2="165" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="285" y1="20" x2="285" y2="250" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />

          {/* Axis Labels */}
          <text x="25" y="85" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">1.0</text>
          <text x="25" y="170" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">0.5</text>
          <text x="25" y="255" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">0.0</text>

          <text x="50" y="270" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">-3σ</text>
          <text x="165" y="270" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">-1.5σ</text>
          <text x="280" y="270" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="9" fontWeight="600">θ = 0 (MEAN)</text>
          <text x="395" y="270" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">+1.5σ</text>
          <text x="505" y="270" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">+3σ</text>

          {/* Easy Item Curve (b = -1.0) */}
          <path
            d="M 50 235 C 130 235, 170 210, 200 160 C 230 110, 270 85, 520 85"
            stroke="var(--chart-1)"
            strokeWidth="1.5"
          />

          {/* Medium Item Curve (b = 0.0) */}
          <path
            d="M 50 240 C 210 240, 250 215, 285 165 C 320 115, 360 85, 520 85"
            stroke="var(--primary)"
            strokeWidth="2"
          />

          {/* Hard Item Curve (b = +1.5) */}
          <path
            d="M 50 245 C 290 245, 345 225, 385 165 C 425 105, 465 85, 520 85"
            stroke="var(--chart-4)"
            strokeWidth="1.5"
          />

          {/* Real-time Item Selection Marker */}
          <line x1="340" y1="30" x2="340" y2="250" stroke="var(--destructive)" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="334" y="115" width="12" height="12" fill="var(--destructive)" />
          <text x="355" y="124" fill="var(--destructive)" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
            NEXT ITEM DISPATCHED [b = +0.72]
          </text>
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-chart-1" />
          <span className="text-foreground-secondary">Easy Variant (b = -1.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-primary" />
          <span className="text-foreground font-medium">Active Band (b = 0.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-chart-4" />
          <span className="text-foreground-secondary">Olympiad Peak (b = +1.5)</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ── SECTION 4: Normative Cohort Distribution & Scatterplot Matrix ─────────
 * Replaces the 3D City canvas with an ultra-clean 2D statistical scatterplot
 * showing international benchmark distributions across Classes 3–12.
 */
export function NormativeCohortScatter({ className = '' }: { className?: string }) {
  // Pre-calculated deterministic benchmark dots
  const DOTS = [
    { x: 15, y: 82, band: '3-4' },
    { x: 22, y: 78, band: '3-4' },
    { x: 30, y: 65, band: '5-6' },
    { x: 38, y: 55, band: '5-6' },
    { x: 45, y: 42, band: '7-8' },
    { x: 50, y: 30, band: '7-8' },
    { x: 55, y: 38, band: '9-10' },
    { x: 62, y: 48, band: '9-10' },
    { x: 70, y: 60, band: '11-12' },
    { x: 78, y: 72, band: '11-12' },
    { x: 85, y: 80, band: '11-12' },
    // Median curve dots
    { x: 28, y: 50, band: '5-6' },
    { x: 40, y: 35, band: '7-8' },
    { x: 52, y: 25, band: '7-8' },
    { x: 60, y: 35, band: '9-10' },
    { x: 68, y: 52, band: '11-12' },
    // Outliers / High ability
    { x: 52, y: 15, band: '9-10', highlight: true },
    { x: 75, y: 22, band: '11-12', highlight: true },
  ];

  return (
    <div className={`relative border border-border bg-card p-6 ${className}`}>
      <CornerMarks />

      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <CrosshairVector size={14} className="text-primary" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            NORMATIVE COHORT MATRIX // 25,000+ BENCHMARK SIGNALS
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="h-2 w-2 bg-primary" />
          <span className="text-foreground font-semibold">STUDENT TRAJECTORY</span>
        </div>
      </div>

      <div className="relative aspect-video w-full bg-surface/50 p-2">
        <svg viewBox="0 0 600 320" className="h-full w-full" fill="none">
          {/* Background Grid */}
          <line x1="60" y1="30" x2="60" y2="270" stroke="var(--border-strong)" strokeWidth="1.2" />
          <line x1="60" y1="270" x2="560" y2="270" stroke="var(--border-strong)" strokeWidth="1.2" />

          {/* Reference percentile guidelines */}
          <line x1="60" y1="80" x2="560" y2="80" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="60" y1="150" x2="560" y2="150" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="60" y1="210" x2="560" y2="210" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />

          {/* Labels */}
          <text x="15" y="85" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">95th %</text>
          <text x="15" y="155" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">50th %</text>
          <text x="15" y="215" fill="var(--foreground-muted)" fontFamily="var(--font-mono)" fontSize="9">20th %</text>

          {/* Class bands along X */}
          <text x="100" y="290" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="10">CLASSES 3–4</text>
          <text x="210" y="290" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="10">CLASSES 5–6</text>
          <text x="310" y="290" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="10">CLASSES 7–8</text>
          <text x="410" y="290" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="10">CLASSES 9–10</text>
          <text x="500" y="290" fill="var(--foreground-secondary)" fontFamily="var(--font-mono)" fontSize="10">CLASSES 11–12</text>

          {/* Normative Bell Envelopes (Smooth Mathematical Curves) */}
          <path
            d="M 60 250 Q 300 30, 560 250"
            stroke="var(--foreground-muted)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Benchmark Scatter Dots */}
          {DOTS.map((dot, i) => (
            <rect
              key={i}
              x={60 + (dot.x / 100) * 480 - (dot.highlight ? 4 : 2)}
              y={30 + (dot.y / 100) * 230 - (dot.highlight ? 4 : 2)}
              width={dot.highlight ? 8 : 4}
              height={dot.highlight ? 8 : 4}
              fill={dot.highlight ? 'var(--primary)' : 'var(--foreground-muted)'}
              fillOpacity={dot.highlight ? 1 : 0.4}
              stroke={dot.highlight ? 'var(--card)' : 'none'}
              strokeWidth={dot.highlight ? 1.5 : 0}
            />
          ))}

          {/* Exemplar Student Score Callout */}
          <g transform="translate(360, 65)">
            <rect x="0" y="0" width="160" height="42" fill="var(--card)" stroke="var(--primary)" strokeWidth="1" />
            <text x="10" y="16" fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
              STUDENT PROFILE // BAND 7-8
            </text>
            <text x="10" y="32" fill="var(--primary)" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold">
              88th PERCENTILE [PISA 2025]
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-foreground-secondary">
        <div>
          NORM VERSION: <strong className="text-foreground">2026.08 (PISA / NCF 2023)</strong>
        </div>
        <div>
          STANDARD ERROR (SEM): <strong className="text-primary">&lt; ±0.22σ</strong>
        </div>
      </div>
    </div>
  );
}
