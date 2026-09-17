import React, { useEffect, useRef, useState, useId } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// 1. COORDINATE RETICLE & SPOTLIGHT (Nordic Lagom Psychometric Lens)
// ============================================================================

interface CoordinateReticleProps {
  children: React.ReactNode;
  className?: string;
  gridLabel?: string;
}

export function CoordinateReticle({
  children,
  className = "",
  gridLabel = "SYS.GRID-402",
}: CoordinateReticleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    x: number;
    y: number;
    theta: number;
    se: number;
    active: boolean;
  }>({
    x: -100,
    y: -100,
    theta: 0.0,
    se: 0.18,
    active: false,
  });

  const mouseRef = useRef({ x: -100, y: -100, active: false });
  const smoothRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseEnter = () => {
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      setCoords((prev) => ({ ...prev, active: false }));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    const loop = () => {
      if (mouseRef.current.active) {
        // Smooth lerp: 12% interpolation per frame for organic glide
        smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.14;
        smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.14;

        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 1;
          // Map relative X to Theta (-3.0 to +3.0) and calculate local Standard Error
          const normX = Math.max(0, Math.min(1, smoothRef.current.x / width));
          const theta = Number((-3.0 + normX * 6.0).toFixed(2));
          // SE is lowest in the center where information is highest
          const distFromCenter = Math.abs(normX - 0.5) * 2;
          const se = Number((0.18 + distFromCenter * 0.22).toFixed(2));

          setCoords({
            x: Math.round(smoothRef.current.x),
            y: Math.round(smoothRef.current.y),
            theta,
            se,
            active: true,
          });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden group select-none", className)}
    >
      {/* Subtle radial spotlight illumination on underlying 1px grid */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          opacity: coords.active ? 1 : 0,
          background: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, var(--border-strong) 0%, transparent 70%)`,
          mixBlendMode: "multiply",
        }}
      />

      {/* Hairline Drafting Crosshairs following cursor */}
      {coords.active && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {/* Vertical Hairline */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary opacity-40"
            style={{ left: `${coords.x}px` }}
          />
          {/* Horizontal Hairline */}
          <div
            className="absolute left-0 right-0 h-px bg-primary opacity-40"
            style={{ top: `${coords.y}px` }}
          />
          {/* Intersection Reticle Dot */}
          <div
            className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 border border-primary bg-background"
            style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
          />
        </div>
      )}

      {/* Floating Precision Coordinate Tag */}
      {coords.active && (
        <div
          className="pointer-events-none absolute z-30 hidden sm:flex items-center gap-2 px-2 py-0.5 bg-background border border-border-strong text-[10px] font-mono tracking-tight text-foreground shadow-none"
          style={{
            left: `${Math.min(Math.max(coords.x + 16, 12), (containerRef.current?.offsetWidth || 300) - 170)}px`,
            top: `${Math.min(Math.max(coords.y + 16, 12), (containerRef.current?.offsetHeight || 200) - 35)}px`,
          }}
        >
          <span className="text-primary font-semibold">{gridLabel}</span>
          <span className="text-border-strong">|</span>
          <span className="tabular font-medium">θ: {coords.theta >= 0 ? `+${coords.theta}` : coords.theta}</span>
          <span className="text-border-strong">|</span>
          <span className="tabular text-foreground-secondary">SE: ±{coords.se}</span>
        </div>
      )}

      {children}
    </div>
  );
}

// ============================================================================
// 2. SHARP 0PX PERIMETER BEAM (Nordic Lagom Hairline Trace)
// ============================================================================

interface SharpPerimeterBeamProps {
  color?: string;
  duration?: number;
  borderWidth?: number;
  className?: string;
}

export function SharpPerimeterBeam({
  color = "var(--primary)",
  duration = 6,
  borderWidth = 1.5,
  className = "",
}: SharpPerimeterBeamProps) {
  const filterId = useId();

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 w-full h-full z-20 overflow-visible",
        className
      )}
    >
      <defs>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={`calc(100% - ${borderWidth}px)`}
        height={`calc(100% - ${borderWidth}px)`}
        fill="none"
        stroke={color}
        strokeWidth={borderWidth}
        strokeDasharray="140 660"
        filter={`url(#${filterId})`}
        style={{
          animation: `sharpBeamOrbit ${duration}s linear infinite`,
        }}
      />
    </svg>
  );
}

// ============================================================================
// 3. KINETIC TEXT ROLL (MotionSites Dual-Layer Text Kinematics)
// ============================================================================

interface KineticTextRollProps {
  children: string;
  className?: string;
}

export function KineticTextRoll({ children, className = "" }: KineticTextRollProps) {
  return (
    <span
      className={cn(
        "relative block overflow-hidden h-[1.25em] leading-[1.25em]",
        className
      )}
    >
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="block transition-transform duration-300 ease-out group-hover:-translate-y-full absolute top-full left-0 right-0"
      >
        {children}
      </span>
    </span>
  );
}

// ============================================================================
// 4. TABULAR SPRING COUNTER (MotionSites Ticker Kinematics)
// ============================================================================

interface TabularSpringCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function TabularSpringCounter({
  value,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: TabularSpringCounterProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Cubic-bezier(0.16, 1, 0.3, 1) out easing approximation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrent(easeOut * value);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return (
    <span className={cn("tabular font-mono tracking-tight", className)}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
