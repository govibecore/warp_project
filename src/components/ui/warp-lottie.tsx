import { useEffect, useState } from 'react';
import { Lottie, LottieProps } from 'lottie-react';
import { cn } from '../../lib/utils';

export interface WarpLottieProps extends Omit<LottieProps, 'animationData'> {
  animationData: unknown;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  durationMs?: number;
}

export function WarpLottie({ 
  animationData, 
  className, 
  loop = true, 
  autoplay = true,
  durationMs,
  ...props 
}: WarpLottieProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (!isClient) return null;

  let computedSpeed = props.speed as number | undefined;
  if (durationMs && animationData) {
    const data = animationData as any;
    if (typeof data.op === 'number' && typeof data.ip === 'number' && typeof data.fr === 'number') {
      const nativeDurationMs = ((data.op - data.ip) / data.fr) * 1000;
      computedSpeed = nativeDurationMs / durationMs;
    }
  }

  return (
    <div className={cn('pointer-events-none', className)}>
      <Lottie
        {...props}
        animationData={animationData as any}
        loop={prefersReducedMotion ? false : loop}
        autoplay={prefersReducedMotion ? false : autoplay}
        speed={computedSpeed}
      />
    </div>
  );
}
