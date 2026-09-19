import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { WarpLottie } from './warp-lottie';
import radarData from '../../assets/lottie/Radar.json';

/**
 * A card is a surface with one hairline border. It does not glow, float, or
 * cast a shadow. Padding is the caller's call - pass `className="p-0"` for
 * full-bleed tables and let the inner element own its own inset.
 *
 * Supports Ali Imam's dashed hairline border style via `dashed` prop.
 */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  dashed?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, dashed, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card border border-border-hairline bg-surface-card text-ink-primary overflow-hidden transition-colors hover:border-border-hover',
        dashed && 'border-dashed',
        className
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 px-7 pt-6 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-[18px] leading-[1.3] font-medium text-ink-primary', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-1 text-[14px] leading-[1.55] text-ink-muted max-w-[70ch]', className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('ml-auto flex items-center gap-2', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-7 pb-6 text-[14px] leading-[1.55]', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-border-hairline bg-surface-card px-7 py-4',
        className,
      )}
      {...props}
    />
  );
}

/** An empty state. One of these, used everywhere rows would have been. */
export function EmptyState({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <WarpLottie animationData={radarData} className="w-24 h-24 mb-4 opacity-50" />
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-foreground-secondary">{hint}</p>}
    </div>
  );
}
