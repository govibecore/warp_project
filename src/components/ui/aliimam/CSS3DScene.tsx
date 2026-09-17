/**
 * CSS3DScene — Pure CSS perspective-transform 3D visuals
 * Replaces SVG schematics with architectural-blueprint geometry.
 * Swap-ready: when Blender renders are available, replace with <img> inside
 * the same container. Nordic Lagom: 0px radius, hairline borders, Fjord Cyan.
 */

import { cn } from "@/lib/utils";

/* ── Shared scene wrapper ─────────────────────────────────────────────── */
interface SceneProps {
  className?: string;
  size?: number; // px
}

/* ────────────────────────────────────────────────────────────────────────
   BrainLatticeCube
   A 3D wireframe tesseract (hypercube projection) that slowly rotates,
   representing multidimensional cognitive ability space.
──────────────────────────────────────────────────────────────────────── */
export function BrainLatticeCube({ className, size = 320 }: SceneProps) {
  const s = size;
  const h = s / 2;
  const inner = s * 0.42;
  const hi = inner / 2;

  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: s, height: s }}
      aria-hidden="true"
    >
      {/* Outer wireframe cube */}
      <div
        className="absolute inset-0"
        style={{
          perspective: s * 2.5,
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            animation: "rotateSlow 28s linear infinite",
          }}
        >
          {/* 6 faces — outer cube */}
          {[
            { transform: `translateZ(${h}px)` },
            { transform: `translateZ(-${h}px) rotateY(180deg)` },
            { transform: `rotateY(90deg) translateZ(${h}px)` },
            { transform: `rotateY(-90deg) translateZ(${h}px)` },
            { transform: `rotateX(90deg) translateZ(${h}px)` },
            { transform: `rotateX(-90deg) translateZ(${h}px)` },
          ].map((style, i) => (
            <div
              key={i}
              className="absolute border border-border-strong"
              style={{
                width: s,
                height: s,
                top: 0,
                left: 0,
                ...style,
                opacity: 0.35,
              }}
            />
          ))}

          {/* Inner cube (scaled 42%) */}
          {[
            { transform: `translateZ(${hi}px)` },
            { transform: `translateZ(-${hi}px) rotateY(180deg)` },
            { transform: `rotateY(90deg) translateZ(${hi}px)` },
            { transform: `rotateY(-90deg) translateZ(${hi}px)` },
            { transform: `rotateX(90deg) translateZ(${hi}px)` },
            { transform: `rotateX(-90deg) translateZ(${hi}px)` },
          ].map((style, i) => (
            <div
              key={`i-${i}`}
              className="absolute border border-primary"
              style={{
                width: inner,
                height: inner,
                top: (s - inner) / 2,
                left: (s - inner) / 2,
                ...style,
                opacity: 0.7,
              }}
            />
          ))}

          {/* 8 connector lines (outer corners → inner corners) */}
          {/* Represented as thin diagonal bars using border */}
          {[
            { top: 0, left: 0, w: (s - inner) / 2 + 4, rotate: 45 },
            { top: 0, right: 0, w: (s - inner) / 2 + 4, rotate: -45 },
            { bottom: 0, left: 0, w: (s - inner) / 2 + 4, rotate: -45 },
            { bottom: 0, right: 0, w: (s - inner) / 2 + 4, rotate: 45 },
          ].map((_, i) => (
            <div
              key={`c-${i}`}
              className="absolute"
              style={{
                width: 1,
                height: (s - inner) * 0.86,
                top: i < 2 ? 0 : undefined,
                bottom: i >= 2 ? 0 : undefined,
                left: i % 2 === 0 ? 0 : undefined,
                right: i % 2 === 1 ? 0 : undefined,
                background: "var(--border-strong)",
                transformOrigin: i < 2 ? "top center" : "bottom center",
                transform: `rotate(${i === 0 || i === 3 ? 30 : -30}deg)`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Coordinate axis labels */}
      <span
        className="absolute font-mono text-[10px] text-primary/60 tracking-wider"
        style={{ bottom: 8, left: 12 }}
      >
        θ-ABILITY
      </span>
      <span
        className="absolute font-mono text-[10px] text-foreground-muted tracking-wider"
        style={{ top: 8, right: 12 }}
      >
        5D STEAM SPACE
      </span>
      {/* Corner marks */}
      <span className="absolute top-0 left-0 border-t border-l border-border-strong w-4 h-4" />
      <span className="absolute top-0 right-0 border-t border-r border-border-strong w-4 h-4" />
      <span className="absolute bottom-0 left-0 border-b border-l border-border-strong w-4 h-4" />
      <span className="absolute bottom-0 right-0 border-b border-r border-border-strong w-4 h-4" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   AdaptiveSpiralOrb
   Concentric rings that converge toward center — represents CAT precision
   converging on true θ as items are answered.
──────────────────────────────────────────────────────────────────────── */
export function AdaptiveSpiralOrb({ className, size = 280 }: SceneProps) {
  const rings = 7;
  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {Array.from({ length: rings }).map((_, i) => {
        const pct = 1 - i / rings;
        const dim = size * pct;
        const offset = (size - dim) / 2;
        return (
          <div
            key={i}
            className="absolute border border-border-strong"
            style={{
              width: dim,
              height: dim,
              top: offset,
              left: offset,
              opacity: 0.12 + i * 0.1,
              borderColor: i === rings - 1 ? "var(--primary)" : undefined,
              animation: `rotateSlow ${22 + i * 4}s linear ${i % 2 === 0 ? "" : "reverse"} infinite`,
              borderStyle: i % 2 === 0 ? "solid" : "dashed",
            }}
          />
        );
      })}

      {/* Center probe dot */}
      <div
        className="absolute bg-primary"
        style={{ width: 6, height: 6, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />

      {/* θ label */}
      <span
        className="absolute font-mono text-[11px] text-primary font-bold"
        style={{ bottom: size * 0.08, left: "50%", transform: "translateX(-50%)" }}
      >
        θ̂ ± SEM
      </span>

      {/* Corner marks */}
      <span className="absolute top-0 left-0 border-t border-l border-border w-3 h-3" />
      <span className="absolute top-0 right-0 border-t border-r border-border w-3 h-3" />
      <span className="absolute bottom-0 left-0 border-b border-l border-border w-3 h-3" />
      <span className="absolute bottom-0 right-0 border-b border-r border-border w-3 h-3" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   DomainPentagonPrism
   An extruded regular pentagon in 3D CSS, with each face tinted by the
   5-domain spectrum colors. Represents the 5 STEAM competency axes.
──────────────────────────────────────────────────────────────────────── */
export function DomainPentagonPrism({ className, size = 260 }: SceneProps) {
  const DOMAIN_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];
  const DOMAIN_LABELS = ["SCI", "COMP", "ENG", "MATH", "SYS"];

  // Pentagon vertices (regular, centered)
  const r = (size / 2) * 0.72;
  const cx = size / 2;
  const cy = size / 2;
  const verts = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ animation: "rotateSlow 40s linear infinite" }}
      >
        {/* Pentagon outline */}
        <polygon
          points={verts.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Radial spokes to each vertex */}
        {verts.map((v, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={v.x}
            y2={v.y}
            stroke={DOMAIN_COLORS[i]}
            strokeWidth="1"
            opacity="0.6"
          />
        ))}

        {/* Vertex circles + labels */}
        {verts.map((v, i) => (
          <g key={`v-${i}`}>
            <rect
              x={v.x - 4}
              y={v.y - 4}
              width={8}
              height={8}
              fill={DOMAIN_COLORS[i]}
              opacity={0.8}
            />
            <text
              x={v.x + (v.x > cx ? 10 : v.x < cx - 2 ? -10 : 0)}
              y={v.y + (v.y > cy ? 14 : v.y < cy - 2 ? -6 : 4)}
              textAnchor={v.x > cx + 10 ? "start" : v.x < cx - 10 ? "end" : "middle"}
              fontSize={9}
              fontFamily="var(--font-mono)"
              fill="var(--foreground-secondary)"
              letterSpacing="0.08em"
            >
              {DOMAIN_LABELS[i]}
            </text>
          </g>
        ))}

        {/* Center node */}
        <rect x={cx - 5} y={cy - 5} width={10} height={10} fill="var(--primary)" />
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fontSize={8}
          fontFamily="var(--font-mono)"
          fill="var(--primary)"
          letterSpacing="0.1em"
        >
          WARP θ
        </text>
      </svg>

      {/* Corner marks */}
      <span className="absolute top-0 left-0 border-t border-l border-border w-3 h-3" />
      <span className="absolute top-0 right-0 border-t border-r border-border w-3 h-3" />
      <span className="absolute bottom-0 left-0 border-b border-l border-border w-3 h-3" />
      <span className="absolute bottom-0 right-0 border-b border-r border-border w-3 h-3" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   HeroWireframeField
   A large, dramatic background element for the dark hero section:
   an infinite-looking grid of perspective lines converging to a horizon
   vanishing point — like an IRT coordinate space floor plan.
──────────────────────────────────────────────────────────────────────── */
export function HeroWireframeField({ className }: { className?: string }) {
  const cols = 12;
  const rows = 8;
  const vw = 800;
  const vh = 480;
  const vx = vw / 2;
  const vy = vh * 0.35; // vanishing point Y

  // Generate perspective grid lines
  const colLines = Array.from({ length: cols + 1 }, (_, i) => {
    const x0 = (i / cols) * vw;
    return { x1: x0, y1: vh, x2: vx, y2: vy };
  });

  const rowLines = Array.from({ length: rows }, (_, i) => {
    const t = (i + 1) / rows;
    // lerp from horizon to bottom
    const y = vy + t * (vh - vy);
    const xLeft = vx + ((0 - vx) * (y - vy)) / (vh - vy);
    const xRight = vx + ((vw - vx) * (y - vy)) / (vh - vy);
    return { x1: xLeft, y1: y, x2: xRight, y2: y, opacity: t };
  });

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 right-0 w-full"
        style={{ height: "55%" }}
      >
        {/* Vertical perspective lines (converging) */}
        {colLines.map((l, i) => (
          <line
            key={`cv-${i}`}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            stroke="var(--primary)"
            strokeWidth="0.5"
            opacity={0.12}
          />
        ))}

        {/* Horizontal row lines */}
        {rowLines.map((l, i) => (
          <line
            key={`rh-${i}`}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            stroke="var(--primary)"
            strokeWidth="0.5"
            opacity={l.opacity * 0.2}
          />
        ))}

        {/* Vanishing point marker */}
        <rect x={vx - 3} y={vy - 3} width={6} height={6} fill="var(--primary)" opacity={0.4} />
        <line x1={vx} y1={vy - 16} x2={vx} y2={vy + 16} stroke="var(--primary)" strokeWidth="0.5" opacity={0.4} />
        <line x1={vx - 16} y1={vy} x2={vx + 16} y2={vy} stroke="var(--primary)" strokeWidth="0.5" opacity={0.4} />
      </svg>
    </div>
  );
}
