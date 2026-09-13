import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GsapCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function GsapCounter({
  value,
  duration = 1.6,
  className = '',
  prefix = '',
  suffix = '',
}: GsapCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const counter = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        val: value,
        duration,
        ease: 'power3.out',
        onUpdate: () => {
          if (node) {
            node.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
          }
        },
      });
    }, nodeRef);

    return () => ctx.revert();
  }, [value, duration, prefix, suffix]);

  return (
    <span ref={nodeRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
