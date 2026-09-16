/**
 * WARP brand mark - the real logo assets from `public/brand/`.
 *
 * The mark is a gravity well: a spacetime grid warped by a glowing mass. That
 * is the product in one image - the cohort reference is the well, growth is
 * the bend. In-app we use the sharp-tile (`-square`) variants so the mark
 * matches the angular UI geometry; the rounded originals are kept in
 * `public/brand/` for external use.
 *
 * Variants:
 *   - `lockup`  - icon + wordmark side by side (headers, hero)
 *   - `stacked` - icon above wordmark (footer, empty states)
 *   - `icon`    - the tile alone (avatars, favicons, compact headers)
 *
 * `theme` selects the wordmark ink: `dark` (default) for dark surfaces,
 * `light` for light surfaces. The icon tile is identical on both.
 */

interface WarpLogoProps {
  variant?: 'lockup' | 'stacked' | 'icon';
  theme?: 'dark' | 'light';
  className?: string;
}

const SRC: Record<NonNullable<WarpLogoProps['variant']>, Record<NonNullable<WarpLogoProps['theme']>, string>> = {
  lockup: {
    dark: '/brand/warp-logo-dark-square.svg',
    light: '/brand/warp-logo-light-square.svg',
  },
  stacked: {
    dark: '/brand/warp-stacked-dark-square.svg',
    light: '/brand/warp-stacked-light-square.svg',
  },
  icon: {
    dark: '/brand/warp-icon-square.svg',
    light: '/brand/warp-icon-square.svg',
  },
};

function currentTheme(): 'dark' | 'light' {
  return 'dark'; // Site is strictly dark mode now
}

export function WarpLogo({ variant = 'lockup', theme, className = 'h-7 w-auto' }: WarpLogoProps) {
  const resolved = theme ?? currentTheme();
  return (
    <img
      src={SRC[variant][resolved]}
      alt="WARP"
      className={className}
      draggable={false}
      decoding="async"
    />
  );
}
