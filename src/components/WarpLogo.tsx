/**
 * WARP brand mark - Programmable SVG Redesign
 *
 * Adhering to the Nordic Lagom and Sharp Geometry contract.
 * Zero radius corners, strict architectural blueprint grid, 
 * monochromatic with Fjord Cyan accents.
 */

interface WarpLogoProps {
  variant?: 'lockup' | 'stacked' | 'icon';
  theme?: 'dark' | 'light';
  className?: string;
}

export function WarpLogo({ variant = 'lockup', theme = 'dark', className = 'h-7 w-auto' }: WarpLogoProps) {
  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#ffffff' : '#000000';
  const secondaryColor = '#00B4D8'; // Fjord Cyan
  const hairlineColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Geometric blueprint icon
  const icon = (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full block">
      {/* Blueprint Grid */}
      <rect x="0" y="0" width="100" height="100" stroke={hairlineColor} strokeWidth="1" fill="none" />
      <line x1="50" y1="0" x2="50" y2="100" stroke={hairlineColor} strokeWidth="1" />
      <line x1="0" y1="50" x2="100" y2="50" stroke={hairlineColor} strokeWidth="1" />
      <line x1="0" y1="0" x2="100" y2="100" stroke={hairlineColor} strokeWidth="1" />
      <line x1="100" y1="0" x2="0" y2="100" stroke={hairlineColor} strokeWidth="1" />

      {/* Sharp W structure */}
      <path
        d="M 15,25 L 35,80 L 50,55 L 65,80 L 85,25"
        stroke={primaryColor}
        strokeWidth="8"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      
      {/* Cyan data block */}
      <rect x="42" y="47" width="16" height="16" fill={secondaryColor} />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={className}>{icon}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="h-16 w-16">{icon}</div>
        <div className="font-display font-bold text-2xl tracking-[0.25em] leading-none" style={{ color: primaryColor }}>
          WARP
        </div>
      </div>
    );
  }

  // lockup (default)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-full aspect-square">{icon}</div>
      <div className="font-display font-bold text-xl tracking-[0.2em] leading-none uppercase pt-0.5" style={{ color: primaryColor }}>
        WARP
      </div>
    </div>
  );
}
