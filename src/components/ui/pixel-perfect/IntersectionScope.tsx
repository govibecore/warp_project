/**
 * IntersectionScope — Technical blueprint border and crosshair intersection system
 * adapted from Pixel Perfect (borders/intersection2.tsx & borders/star-border.tsx).
 *
 * Adds authentic scientific instrument markers (+ crosshairs, corner brackets,
 * and laser hairlines) to cards, stats blocks, and telemetry grids.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface IntersectionScopeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'crosshair' | 'corner-brackets' | 'star-node';
  accentOnHover?: boolean;
  glowBeam?: boolean;
}

export function IntersectionScope({
  children,
  className,
  variant = 'crosshair',
  accentOnHover = true,
  glowBeam = false,
}: IntersectionScopeProps) {
  return (
    <div
      className={cn(
        'group relative border border-border/80 bg-surface/30 p-6 transition-all duration-300',
        accentOnHover && 'hover:border-primary/50 hover:bg-surface/50',
        className
      )}
    >
      {/* ── Corner Markers ── */}
      {variant === 'crosshair' && (
        <>
          {/* Top-Left */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2 -left-2 select-none font-mono text-xs font-semibold text-border transition-colors duration-200 group-hover:text-primary"
          >
            +
          </span>
          {/* Top-Right */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2 -right-2 select-none font-mono text-xs font-semibold text-border transition-colors duration-200 group-hover:text-primary"
          >
            +
          </span>
          {/* Bottom-Left */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 -left-2 select-none font-mono text-xs font-semibold text-border transition-colors duration-200 group-hover:text-primary"
          >
            +
          </span>
          {/* Bottom-Right */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 -right-2 select-none font-mono text-xs font-semibold text-border transition-colors duration-200 group-hover:text-primary"
          >
            +
          </span>
        </>
      )}

      {variant === 'corner-brackets' && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute -top-px -left-px size-2.5 border-t-2 border-l-2 border-primary/60 transition-colors group-hover:border-primary" />
          <div aria-hidden="true" className="pointer-events-none absolute -top-px -right-px size-2.5 border-t-2 border-r-2 border-primary/60 transition-colors group-hover:border-primary" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px size-2.5 border-b-2 border-l-2 border-primary/60 transition-colors group-hover:border-primary" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px size-2.5 border-b-2 border-r-2 border-primary/60 transition-colors group-hover:border-primary" />
        </>
      )}

      {variant === 'star-node' && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute -top-1.5 -left-1.5 size-2 bg-primary/40 transition-colors duration-200 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(143,207,232,0.8)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -top-1.5 -right-1.5 size-2 bg-primary/40 transition-colors duration-200 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(143,207,232,0.8)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -left-1.5 size-2 bg-primary/40 transition-colors duration-200 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(143,207,232,0.8)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -right-1.5 size-2 bg-primary/40 transition-colors duration-200 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(143,207,232,0.8)]" />
        </>
      )}

      {/* ── Optional Traveling Glow Beam ── */}
      {glowBeam && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div className="absolute -top-full left-0 h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(143,207,232,0.15),transparent_70%)]" />
        </div>
      )}

      {children}
    </div>
  );
}
