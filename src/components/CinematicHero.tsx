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
import { AuroraCurtain } from './ui/pixel-perfect/AuroraCurtain';

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
        const duration = 14 + i * 4;
        const xRange = 50 + i * 25;
        const yRange = 35 + i * 20;

        gsap.to(orb, {
          x: `+=${xRange}`,
          y: `+=${yRange}`,
          duration,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(orb, {
          scale: 1 + (i % 2 === 0 ? 0.25 : -0.15),
          opacity: 0.35 + Math.random() * 0.25,
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
    const count = 28;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = 1 + Math.random() * 2.5;
      p.className = 'absolute rounded-full pointer-events-none';
      Object.assign(p.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: `oklch(0.78 0.09 ${210 + Math.random() * 40})`,
        opacity: '0',
      });
      container.appendChild(p);
      particles.push(p);
    }

    const ctx = gsap.context(() => {
      particles.forEach((p, i) => {
        gsap.to(p, {
          y: -(90 + Math.random() * 140),
          x: (Math.random() - 0.5) * 50,
          opacity: 0.3 + Math.random() * 0.5,
          duration: 5 + Math.random() * 5,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.25,
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
      {/* Dynamic WebGL Aurora Curtain shader ribbons */}
      <AuroraCurtain intensity={0.7} speed={0.85} />

      {/* Aurora ambient radial washes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_20%_80%,oklch(0.35_0.08_230/0.45),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_80%_30%,oklch(0.32_0.06_260/0.35),transparent_50%)]" />

      {/* Animated orbs — soft blurred gradient spheres complementing the shader */}
      <div
        ref={(el) => { if (el) orbsRef.current[0] = el; }}
        className="absolute -left-20 top-1/4 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.10_230/0.35),transparent_70%)] blur-3xl"
      />
      <div
        ref={(el) => { if (el) orbsRef.current[1] = el; }}
        className="absolute right-0 top-1/3 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.40_0.08_200/0.3),transparent_70%)] blur-3xl"
      />
      <div
        ref={(el) => { if (el) orbsRef.current[2] = el; }}
        className="absolute bottom-1/4 left-1/3 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.38_0.09_280/0.25),transparent_70%)] blur-3xl"
      />

      {/* Floating particles layer */}
      <div ref={particlesRef} className="absolute inset-0" />

      {/* Telemetry hairline grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Edge blending — gently blends into the mineral slate background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_40%,var(--color-background)_100%)]" />
    </div>
  );
}
