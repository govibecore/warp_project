/**
 * Chart Theme - Single source of truth for all Recharts configuration.
 * Maps to PRODUCT-REDESIGN.md §2.3 Chart Configuration.
 *
 * All charts import from here; no inline colour hex values.
 */

/** Competency key → CSS custom property mapping */
export const competencyColors: Record<string, string> = {
  scientificInquiry: 'var(--color-c1)',
  computationalThinking: 'var(--color-c2)',
  engineeringDesign: 'var(--color-c3)',
  mathematicalReasoning: 'var(--color-c4)',
  systemsThinking: 'var(--color-c5)',
};

/** Ordered array for indexed access (radar charts, bar series, etc.) */
export const competencyColorList = [
  'var(--color-c1)',
  'var(--color-c2)',
  'var(--color-c3)',
  'var(--color-c4)',
  'var(--color-c5)',
];

/** Named region colours for bar charts */
export const regionColors: Record<string, string> = {
  Global: 'var(--color-primary)',
  Singapore: 'var(--color-c1)',    // cyan
  China: 'var(--color-c3)',        // amber
  USA: 'var(--color-c5)',          // purple
  Europe: 'var(--color-c2)',       // green
  India: 'var(--color-c4)',        // coral
};

/** Shared axis, grid, and tooltip styles */
export const chartTheme = {
  grid: {
    stroke: 'var(--border)',
    strokeOpacity: 0.5,
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: 'var(--foreground-muted)',
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--border)',
      borderRadius: '0',
      color: 'var(--foreground)',
      fontSize: '12px',
      padding: '8px 12px',
      boxShadow: 'none',
      border: '1px solid var(--border)',
    },
  },
  radar: {
    student: {
      stroke: 'var(--color-primary)',
      fill: 'var(--color-primary)',
      fillOpacity: 0.4,
    },
    benchmark: {
      stroke: 'var(--color-c2)',
      fill: 'var(--color-c2)',
      fillOpacity: 0.1,
      strokeDasharray: '3 3',
    },
    median: {
      stroke: 'var(--foreground-muted)',
      fill: 'var(--foreground-muted)',
      fillOpacity: 0.05,
      strokeDasharray: '4 4',
    },
  },
  line: {
    student: {
      stroke: 'var(--color-primary)',
      strokeWidth: 2,
      dot: { r: 3, fill: 'var(--color-primary)' },
    },
  },
} as const;
