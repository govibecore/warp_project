import { Crown, Sparkles, Award, Shield, Target } from 'lucide-react';

export type OutcomeTier = 'olympiad' | 'high_distinction' | 'advanced' | 'proficient' | 'developing';

export interface OutcomeBadgeProps {
  theta?: number;
  percentile?: number;
  tier?: OutcomeTier;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export function getOutcomeTier(theta?: number, percentile?: number): OutcomeTier {
  if (theta !== undefined) {
    if (theta >= 1.5) return 'olympiad';
    if (theta >= 0.9) return 'high_distinction';
    if (theta >= 0.3) return 'advanced';
    if (theta >= -0.3) return 'proficient';
    return 'developing';
  }

  if (percentile !== undefined) {
    if (percentile >= 95) return 'olympiad';
    if (percentile >= 80) return 'high_distinction';
    if (percentile >= 65) return 'advanced';
    if (percentile >= 40) return 'proficient';
    return 'developing';
  }

  return 'proficient';
}

const TIER_CONFIG: Record<
  OutcomeTier,
  {
    label: string;
    description: string;
    icon: typeof Crown;
    badgeClass: string;
    iconClass: string;
  }
> = {
  olympiad: {
    label: 'International Olympiad Tier',
    description: 'Calibrated to SASMO & AMC 8/10 Medal Standards (Top 5% Global)',
    icon: Crown,
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    iconClass: 'text-amber-500',
  },
  high_distinction: {
    label: 'High Distinction',
    description: 'Equivalent to Singapore Gifted Education Program (GEP) Track (Top 15%)',
    icon: Sparkles,
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    iconClass: 'text-emerald-500',
  },
  advanced: {
    label: 'Advanced Analytical Track',
    description: 'Competitive against top US/EU Magnet and Grammar School Cohorts',
    icon: Award,
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    iconClass: 'text-blue-500',
  },
  proficient: {
    label: 'Core Foundation Verified',
    description: 'Solid execution on textbook and curriculum-aligned STEM reasoning',
    icon: Shield,
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    iconClass: 'text-indigo-500',
  },
  developing: {
    label: 'Foundational Practice Needed',
    description: 'Vulnerable to non-routine problem traps; targeted sprint recommended',
    icon: Target,
    badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    iconClass: 'text-rose-500',
  },
};

export function OutcomeBadge({
  theta,
  percentile,
  tier: propTier,
  size = 'md',
  showDescription = false,
  className = '',
}: OutcomeBadgeProps) {
  const tier = propTier || getOutcomeTier(theta, percentile);
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'size-3',
    md: 'size-3.5',
    lg: 'size-4',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center font-bold tracking-tight rounded-none border shadow-2xs font-display ${sizeClasses[size]} ${config.badgeClass}`}
      >
        <Icon className={`${iconSizes[size]} ${config.iconClass} shrink-0`} />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-foreground-secondary mt-1 max-w-xs leading-tight">
          {config.description}
        </span>
      )}
    </div>
  );
}
