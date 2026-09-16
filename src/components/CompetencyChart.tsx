import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import { chartTheme, regionColors } from './charts/theme';
import { ChartContainer, ChartTooltip } from './ui/chart';
import type { ChartConfig } from './ui/chart';

export interface RadarDataPoint {
  competency: string;
  student: number;
  singaporeTop10: number;
  globalMedian: number;
}

/** Shorten long competency names to fit the radar polygon axis labels */
function shortLabel(label: string): string {
  const MAP: Record<string, string> = {
    'Scientific Inquiry': 'Sci. Inquiry',
    'Computational Thinking': 'Comp. Thinking',
    'Engineering Design': 'Eng. Design',
    'Mathematical Reasoning': 'Math Reasoning',
    'Systems Thinking': 'Systems',
    'Reading Comprehension': 'Reading',
    'Locating Information': 'Locating Info',
    'Synthesis & Integration': 'Synthesis',
    'Evaluating & Reflecting': 'Evaluating',
  };
  return MAP[label] ?? label;
}

/** Default radarData when benchmark doesn't include it (stored reports) */
function buildFallbackRadarData(competencyBreakdown?: Record<string, any>): RadarDataPoint[] {
  if (!competencyBreakdown) {
    return [
      { competency: 'Sci. Inquiry', student: 55, singaporeTop10: 88, globalMedian: 50 },
      { competency: 'Comp. Thinking', student: 60, singaporeTop10: 88, globalMedian: 50 },
      { competency: 'Eng. Design', student: 50, singaporeTop10: 88, globalMedian: 50 },
      { competency: 'Math Reasoning', student: 65, singaporeTop10: 88, globalMedian: 50 },
      { competency: 'Systems', student: 58, singaporeTop10: 88, globalMedian: 50 },
    ];
  }
  return Object.entries(competencyBreakdown).map(([_key, val]: [string, any]) => ({
    competency: shortLabel(val.label ?? _key),
    student: val.radarScore ?? Math.round(((val.globalPercentile ?? 50) / 100) * 100),
    singaporeTop10: 88,
    globalMedian: 50,
  }));
}

export function CompetencyRadarChart({
  data,
  competencyBreakdown,
}: {
  data?: RadarDataPoint[];
  competencyBreakdown?: Record<string, any>;
}) {
  // Guard: if data is missing or empty, derive from competencyBreakdown or use defaults
  const chartData: RadarDataPoint[] =
    data && data.length > 0
      ? data.map(d => ({ ...d, competency: shortLabel(d.competency) }))
      : buildFallbackRadarData(competencyBreakdown);

  return (
    <div className="w-full h-72 relative z-10 min-w-0 min-h-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <RadarChart cx="50%" cy="45%" outerRadius="62%" data={chartData}>
          <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fill: 'var(--foreground-secondary)', fontSize: 9.5, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 8 }}
            stroke="var(--border)"
            tickCount={4}
          />
          <Radar
            name="Student"
            dataKey="student"
            {...chartTheme.radar.student}
            isAnimationActive
            animationDuration={600}
          />
          <Radar
            name="Singapore Top 10%"
            dataKey="singaporeTop10"
            {...chartTheme.radar.benchmark}
          />
          <Radar
            name="Global Median"
            dataKey="globalMedian"
            {...chartTheme.radar.median}
          />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{
              fontSize: '10px',
              paddingTop: '8px',
              color: 'var(--foreground-secondary)',
              lineHeight: '1.6',
            }}
            formatter={(value) => (
              <span style={{ color: 'var(--foreground-secondary)', fontSize: '10px' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface RegionalBarDataPoint {
  name: string;
  student: number;
  olympiadThreshold: number;
  flag: string;
  benchmarkStandard: string;
  color: string;
}

// shadcn ChartConfig for the regional benchmark chart
const regionalChartConfig: ChartConfig = {
  student: {
    label: 'Student Percentile',
    color: 'var(--color-primary)',
  },
  olympiadThreshold: {
    label: 'Olympiad Baseline (~75th)',
    color: 'var(--foreground-muted)',
  },
} satisfies ChartConfig;

const REGION_META: Record<string, { flag: string; standard: string; threshold: number }> = {
  Global:    { flag: '🌐', standard: 'PISA / TIMSS Normalized',   threshold: 75 },
  India:     { flag: '🇮🇳', standard: 'IOQM / NCERT Exemplar',    threshold: 80 },
  Singapore: { flag: '🇸🇬', standard: 'SASMO / MOE Heuristics',   threshold: 70 },
  USA:       { flag: '🇺🇸', standard: 'MAA AMC 8 / NGSS',         threshold: 72 },
  Europe:    { flag: '🇪🇺', standard: 'Bebras / Kangaroo Math',   threshold: 70 },
  China:     { flag: '🇨🇳', standard: 'NOIP / Olympiad Math',     threshold: 78 },
};

/** Enhanced custom tooltip for the benchmark bar chart */
function BenchmarkTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload as RegionalBarDataPoint;
  const score = p.student;
  const gap = score - p.olympiadThreshold;
  return (
    <div className="border border-border bg-surface p-3 shadow-md text-xs min-w-45">
      <p className="font-bold flex items-center gap-1.5 text-foreground mb-2 pb-2 border-b border-border">
        <span className="text-base">{p.flag}</span>
        <span>{p.name} Standing</span>
      </p>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-foreground-muted">Percentile</span>
          <span className="font-mono font-bold text-primary">{score}th</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-foreground-muted">Olympiad Bar</span>
          <span className="font-mono font-bold text-foreground">{p.olympiadThreshold}th</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <span className="text-foreground-muted">Gap to Olympiad</span>
          <span className={`font-mono font-bold ${gap >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {gap >= 0 ? '+' : ''}{gap} pts
          </span>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-foreground-muted leading-relaxed">
        Calibrated: {p.benchmarkStandard}
      </p>
    </div>
  );
}

export function RegionalBenchmarkBarChart({ regionalPercentiles }: { regionalPercentiles: Record<string, number> }) {
  const regionOrder = ['India', 'Global', 'Singapore', 'USA', 'Europe', 'China'];

  const data: RegionalBarDataPoint[] = regionOrder
    .filter((region) => typeof regionalPercentiles[region] === 'number')
    .map((region) => {
      const meta = REGION_META[region];
      return {
        name: region,
        student: regionalPercentiles[region],
        olympiadThreshold: meta.threshold,
        flag: meta.flag,
        benchmarkStandard: meta.standard,
        color: regionColors[region] || 'var(--color-primary)',
      };
    });

  return (
    <ChartContainer config={regionalChartConfig} className="w-full h-72">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }} barCategoryGap="28%">
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeOpacity={0.4}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="name"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={6}
          tick={({ x, y, payload }: any) => {
            const meta = REGION_META[payload.value];
            return (
              <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill="var(--foreground-secondary)">
                <tspan x={x} dy="0">{meta?.flag ?? ''}</tspan>
                <tspan x={x} dy="13" fontSize={9} fill="var(--foreground-muted)">{payload.value}</tspan>
              </text>
            );
          }}
          height={36}
        />
        <YAxis
          domain={[0, 100]}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dx={-6}
          unit="%"
          tick={{ fill: 'var(--foreground-muted)' }}
        />

        {/* Olympiad threshold reference line at 75th */}
        <ReferenceLine
          y={75}
          stroke="var(--foreground-muted)"
          strokeDasharray="5 3"
          strokeOpacity={0.5}
          label={{
            value: 'Olympiad Baseline (~75th)',
            position: 'insideTopRight',
            fontSize: 9,
            fill: 'var(--foreground-muted)',
            offset: 4,
          }}
        />
        {/* World median at 50th */}
        <ReferenceLine
          y={50}
          stroke="var(--foreground-muted)"
          strokeDasharray="2 4"
          strokeOpacity={0.3}
          label={{
            value: 'World Median',
            position: 'insideTopRight',
            fontSize: 9,
            fill: 'var(--foreground-muted)',
            offset: 4,
          }}
        />

        <ChartTooltip content={<BenchmarkTooltip />} cursor={{ fill: 'var(--primary)', opacity: 0.04 }} />

        <Bar dataKey="student" radius={[2, 2, 0, 0]} maxBarSize={40} isAnimationActive animationDuration={600} animationEasing="ease-out">
          {data.map((entry, index) => {
            const aboveThreshold = entry.student >= entry.olympiadThreshold;
            return (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={aboveThreshold ? 0.9 : 0.65}
                stroke={aboveThreshold ? entry.color : 'var(--border)'}
                strokeWidth={aboveThreshold ? 0 : 1}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

// ── Legend chip component ──────────────────────────────────────────────────────
export function BenchmarkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-foreground-muted mt-2">
      <span className="flex items-center gap-1">
        <span className="inline-block w-6 h-0.5 opacity-50" style={{ borderTop: '1px dashed var(--foreground-muted)' }} />
        Olympiad Baseline (~75th %ile)
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-6 h-0.5 opacity-30" style={{ borderTop: '1px dotted var(--foreground-muted)' }} />
        World Median (50th %ile)
      </span>
      <span className="flex items-center gap-1 ml-auto">
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-surface border border-border" />
        Below regional bar
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary opacity-90" />
        At or above regional bar
      </span>
    </div>
  );
}

// Retain legacy export for backward compatibility
export function CompetencyChart({ snapshot }: { snapshot: any }) {
  return <RegionalBenchmarkBarChart regionalPercentiles={snapshot.regionalPercentiles || {}} />;
}
