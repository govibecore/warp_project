import { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export type IonPalette = 'fjord' | 'amber' | 'neon' | 'monochrome';

interface TextIonIgniteProps {
  children?: string;
  text?: string;
  words?: string[];
  palette?: IonPalette;
  className?: string;
  charClassName?: string;
  pauseDuration?: number; // ms to hold fully ignited text before cycling
  repeat?: boolean;
}

interface PaletteConfig {
  initialColor: string;
  stage1Color: string;
  stage1Shadow: string;
  stage2Color: string;
  stage2Shadow: string;
  settleColor: string;
}

const PALETTES: Record<IonPalette, PaletteConfig> = {
  // Luminous Fjord Cyan (WARP Nordic Lagom default)
  fjord: {
    initialColor: '#0284c7',
    stage1Color: '#38bdf8',
    stage1Shadow: '0 0 20px #0284c7, 0 0 35px #38bdf8',
    stage2Color: '#ffffff',
    stage2Shadow: '0 0 10px #ffffff, 0 0 24px #38bdf8, 0 0 40px #0284c7',
    settleColor: 'var(--foreground, #f1f5f9)',
  },
  // Nordic Amber / Thermal
  amber: {
    initialColor: '#d97706',
    stage1Color: '#fbbf24',
    stage1Shadow: '0 0 20px #b45309, 0 0 35px #f59e0b',
    stage2Color: '#ffffff',
    stage2Shadow: '0 0 10px #ffffff, 0 0 22px #fbbf24, 0 0 38px #d97706',
    settleColor: 'var(--foreground, #f1f5f9)',
  },
  // Incandescent High-Voltage Flame (User reference)
  neon: {
    initialColor: '#ef4444',
    stage1Color: '#f97316',
    stage1Shadow: '0 0 20px #ef4444, 0 0 40px #f97316',
    stage2Color: '#ffffff',
    stage2Shadow: '0 0 10px #ffffff, 0 0 22px #fbbf24',
    settleColor: 'var(--foreground, #f1f5f9)',
  },
  // Ultra-quiet scientific monochrome
  monochrome: {
    initialColor: '#94a3b8',
    stage1Color: '#cbd5e1',
    stage1Shadow: '0 0 15px rgba(255, 255, 255, 0.4)',
    stage2Color: '#ffffff',
    stage2Shadow: '0 0 10px #ffffff, 0 0 20px rgba(255, 255, 255, 0.6)',
    settleColor: 'var(--foreground, #f1f5f9)',
  },
};

export function TextIonIgnite({
  children,
  text,
  words,
  palette = 'fjord',
  className = '',
  charClassName = '',
  pauseDuration = 2800,
  repeat = true,
}: TextIonIgniteProps) {
  const wordList = useMemo(() => {
    if (words && words.length > 0) return words;
    if (text) return [text];
    if (children) return [children];
    return ['Close the gap.'];
  }, [words, text, children]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWord = wordList[currentIndex % wordList.length];
  const colors = PALETTES[palette] || PALETTES.fjord;

  // Split string into characters preserving whitespace
  const chars = useMemo(() => {
    return currentWord.split('').map((char, index) => ({
      id: `${currentIndex}-${index}-${char}`,
      char: char === ' ' ? '\u00A0' : char,
      isSpace: char === ' ',
    }));
  }, [currentWord, currentIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const charEls = el.querySelectorAll<HTMLElement>('[data-ion-char]');
    if (!charEls.length) return;

    if (prefersReducedMotion) {
      gsap.set(charEls, {
        opacity: 1,
        color: colors.settleColor,
        textShadow: 'none',
      });
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Initial dark / dormant state
      gsap.set(charEls, {
        opacity: 0,
        color: colors.initialColor,
        textShadow: '0 0 0px transparent',
      });

      const masterTl = gsap.timeline({
        onComplete: () => {
          if (wordList.length > 1 && repeat) {
            // Hold ignited state for pauseDuration, then decay and cycle
            gsap.delayedCall(pauseDuration / 1000, () => {
              // Graceful dissipation decay
              gsap.to(charEls, {
                opacity: 0,
                y: -6,
                filter: 'blur(4px)',
                stagger: 0.015,
                duration: 0.35,
                ease: 'power2.in',
                onComplete: () => {
                  setCurrentIndex((prev) => (prev + 1) % wordList.length);
                },
              });
            });
          }
        },
      });

      // Staggered cathode spark ignition across characters
      charEls.forEach((charEl) => {
        const delay = Math.random() * 0.4;
        const charTl = gsap.timeline({ delay });

        // Phase 1: High frequency micro-flicker (plasma ionization)
        charTl.to(charEl, {
          opacity: 1,
          duration: 0.045,
          repeat: 4,
          yoyo: true,
          ease: 'none',
        });

        // Phase 2: Electric plasma flare
        charTl.to(charEl, {
          opacity: 1,
          color: colors.stage1Color,
          textShadow: colors.stage1Shadow,
          duration: 0.22,
          ease: 'power2.in',
        });

        // Phase 3: White-hot core ignition
        charTl.to(charEl, {
          color: colors.stage2Color,
          textShadow: colors.stage2Shadow,
          duration: 0.3,
          ease: 'power2.out',
        });

        // Phase 4: Settle into crisp, calm typography
        charTl.to(charEl, {
          color: colors.settleColor,
          textShadow: '0 0 0px transparent',
          duration: 0.45,
          ease: 'power2.out',
        });

        masterTl.add(charTl, 0);
      });
    }, el);

    return () => ctx.revert();
  }, [currentIndex, currentWord, colors, wordList.length, repeat, pauseDuration]);

  return (
    <div
      ref={containerRef}
      className={cn('inline-flex items-baseline justify-center select-none', className)}
      role="text"
      aria-label={currentWord}
    >
      <span aria-hidden="true" className="inline-flex whitespace-nowrap">
        {chars.map(({ id, char, isSpace }) => (
          <span
            key={id}
            data-ion-char
            className={cn(
              'inline-block transition-transform',
              isSpace && 'w-[0.28em]',
              charClassName
            )}
            style={{ willChange: 'opacity, color, text-shadow' }}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}
export default TextIonIgnite;
