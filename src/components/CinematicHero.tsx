/**
 * CinematicHero — GSAP + motion-powered hero background overlay.
 *
 * Renders animated gradient orbs, floating particles, and a subtle
 * aurora effect behind the hero text. All colours are derived from
 * the Nordic Lagom design tokens so the overlay blends seamlessly
 * with both light and dark modes.
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface CinematicHeroProps {
  className?: string;
}

export function CinematicHero({ className }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement[]>([]);
  const particlesRef = useRef<HTMLDivElement>(null);

  // ── GSAP orb animations ──────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const orbs = orbsRef.current.filter(Boolean);
    const ctx = gsap.context(() => {
      // Each orb drifts in a unique figure-8 / lissajous path
      orbs.forEach((orb, i) => {
        const duration = 12 + i * 4;
        const xRange = 60 + i * 30;
        const yRange = 40 + i * 20;

        gsap.to(orb, {
          x: `+=${xRange}`,
          y: `+=${yRange}`,
          duration,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(orb, {
          scale: 1 + (i % 2 === 0 ? 0.3 : -0.2),
          opacity: 0.4 + Math.random() * 0.3,
          duration: duration * 0.7,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 1.2,
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // ── Floating particles ───────────────────────────────────────────────
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    const count = 24;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = 1 + Math.random() * 3;
      p.className = 'absolute rounded-full';
      Object.assign(p.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: `oklch(0.7 0.08 ${200 + Math.random() * 60})`,
        opacity: '0',
      });
      container.appendChild(p);
      particles.push(p);
    }

    const ctx = gsap.context(() => {
      particles.forEach((p, i) => {
        gsap.to(p, {
          y: -(80 + Math.random() * 120),
          x: (Math.random() - 0.5) * 60,
          opacity: 0.3 + Math.random() * 0.5,
          duration: 4 + Math.random() * 6,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.3,
        });
      });
    }, container);

    return () => {
      ctx.revert();
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Aurora gradient wash — sits behind everything */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_20%_80%,oklch(0.35_0.08_230/0.6),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_80%_30%,oklch(0.30_0.06_260/0.4),transparent_50%)]" />

      {/* Animated orbs — large blurred gradient spheres */}
      <div
        ref={(el) => { if (el) orbsRef.current[0] = el; }}
        className="absolute -left-20 top-1/4 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.1_230/0.5),transparent_70%)] blur-3xl"
      />
      <div
        ref={(el) => { if (el) orbsRef.current[1] = el; }}
        className="absolute right-0 top-1/3 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.38_0.08_200/0.35),transparent_70%)] blur-3xl"
      />
      <div
        ref={(el) => { if (el) orbsRef.current[2] = el; }}
        className="absolute bottom-1/4 left-1/3 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.42_0.12_280/0.3),transparent_70%)] blur-3xl"
      />

      {/* Floating particles layer */}
      <div ref={particlesRef} className="absolute inset-0" />

      {/* Scan lines — very subtle CRT / cinematic texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Vignette — darkens corners for cinematic depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_30%,oklch(0.12_0.01_260/0.7)_100%)]" />
    </div>
  );
}
