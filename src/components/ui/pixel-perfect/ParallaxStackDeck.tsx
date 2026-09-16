/**
 * ParallaxStackDeck - Scroll-driven stacking card parallax adapted from
 * Pixel Perfect (scroll/stacking-cards-parallax.tsx).
 *
 * Cards stick and stack as the user scrolls, creating a tactile physical deck
 * effect for the 5 STEAM Competencies or Multi-Step Assessment Roadmap.
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CardDeckItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  accentColor?: string;
  metric?: string;
}

interface ParallaxStackDeckProps {
  items: CardDeckItem[];
  className?: string;
}

function DeckCard({
  item,
  index,
  targetScale,
}: {
  item: CardDeckItem;
  index: number;
  targetScale: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={containerRef}
      className="sticky top-28 flex items-center justify-center py-4"
    >
      <motion.div
        style={{
          scale,
          top: `calc(${index * 24}px)`,
        }}
        className={cn(
          'relative w-full max-w-4xl border border-border bg-surface/90 p-8 sm:p-10 backdrop-blur-xl shadow-lg transition-colors',
          'hover:border-primary/50'
        )}
      >
        {/* Subtle accent bar on card left */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 h-full w-1"
          style={{ backgroundColor: item.accentColor || 'var(--color-accent)' }}
        />

        {/* Technical corner markers */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1.5 -left-1.5 font-mono text-[10px] text-border"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1.5 -right-1.5 font-mono text-[10px] text-border"
        >
          +
        </span>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="font-mono text-xs uppercase tracking-wider font-semibold px-2 py-0.5 border"
                style={{
                  color: item.accentColor || 'var(--color-accent)',
                  borderColor: item.accentColor ? `${item.accentColor}40` : 'var(--color-border)',
                }}
              >
                {item.tag}
              </span>
              {item.metric && (
                <span className="font-mono text-xs text-foreground-secondary">
                  {item.metric}
                </span>
              )}
            </div>

            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-3">
              {item.title}
            </h3>

            <p className="max-w-2xl text-base text-foreground-secondary leading-relaxed">
              {item.description}
            </p>
          </div>

          {item.icon && (
            <div className="shrink-0 flex items-center justify-center size-14 border border-border bg-background p-3 text-primary">
              {item.icon}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function ParallaxStackDeck({ items, className }: ParallaxStackDeckProps) {
  return (
    <div className={cn('relative w-full space-y-8 pb-16', className)}>
      {items.map((item, index) => {
        const targetScale = 1 - (items.length - index) * 0.03;
        return (
          <DeckCard
            key={item.id}
            item={item}
            index={index}
            targetScale={targetScale}
          />
        );
      })}
    </div>
  );
}
