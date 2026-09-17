import { useEffect, useState, useRef } from 'react';
import { Lottie, LottieProps } from 'lottie-react';
import { cn } from '../../lib/utils';

export interface WarpLottieProps extends Omit<LottieProps, 'src'> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lottieRef = useRef<any>(null);

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

  // We do NOT use the built-in `autoplay` prop because lottie-react hardcodes a console 
  // warning for any autoplay > 5s in development mode, even for purely decorative animations.
  // Instead, we manually call play() if autoplay was requested.
  useEffect(() => {
    if (isClient && lottieRef.current) {
      if (!prefersReducedMotion && autoplay) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isClient, prefersReducedMotion, autoplay]);

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
        lottieRef={lottieRef}
        src={animationData as any}
        loop={prefersReducedMotion ? false : loop}
        autoplay={false}
        speed={computedSpeed}
        rendererSettings={{
          // @ts-expect-error: ariaHidden is supported in lottie-web 5.12+ but missing from lottie-react types
          ariaHidden: true,
          ...props.rendererSettings,
        }}
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
}
