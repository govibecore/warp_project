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
  Legend
} from 'recharts';
import { chartTheme, regionColors } from './charts/theme';

export interface RadarDataPoint {
  competency: string;
  student: number;
  singaporeTop10: number;
  globalMedian: number;
}

export function CompetencyRadarChart({ data }: { data: RadarDataPoint[] }) {
  return (
    <div className="w-full h-75 relative z-10">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fill: 'var(--foreground-secondary)', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 9 }}
            stroke="var(--border)"
          />
          <Radar
            name="Student Ability"
            dataKey="student"
            {...chartTheme.radar.student}
          />
          <Radar
            name="Singapore Top 10% (SASMO/MOE)"
            dataKey="singaporeTop10"
            {...chartTheme.radar.benchmark}
          />
          <Radar
            name="Global Median (50th %ile)"
            dataKey="globalMedian"
            {...chartTheme.radar.median}
          />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--foreground-secondary)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface RegionalBarDataPoint {
  name: string;
  value: number;
  benchmarkStandard: string;
  flag: string;
}

export function RegionalBenchmarkBarChart({ regionalPercentiles }: { regionalPercentiles: Record<string, number> }) {
  const data: RegionalBarDataPoint[] = [
    { name: 'Global', value: regionalPercentiles.Global ?? 50, benchmarkStandard: 'PISA/TIMSS Normalized', flag: '🌐' },
    { name: 'Singapore', value: regionalPercentiles.Singapore ?? 50, benchmarkStandard: 'SASMO / MOE Heuristics', flag: '🇸🇬' },
    { name: 'China', value: regionalPercentiles.China ?? 50, benchmarkStandard: 'NOIP / Olympiad Math', flag: '🇨🇳' },
    { name: 'USA', value: regionalPercentiles.USA ?? 50, benchmarkStandard: 'MAA AMC 8/10 & NGSS', flag: '🇺🇸' },
    { name: 'Europe', value: regionalPercentiles.Europe ?? 50, benchmarkStandard: 'Bebras / Kangaroo Math', flag: '🇪🇺' },
    { name: 'India', value: regionalPercentiles.India ?? 50, benchmarkStandard: 'IOQM / NCERT Exemplar', flag: '🇮🇳' },
  ];

  return (
    <div className="w-full h-70 relative z-10">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
          <CartesianGrid
            stroke={chartTheme.grid.stroke}
            strokeOpacity={chartTheme.grid.strokeOpacity}
            vertical={false}
            strokeDasharray={chartTheme.grid.strokeDasharray}
          />
          <XAxis
            dataKey="name"
            stroke={chartTheme.axis.stroke}
            fontSize={chartTheme.axis.fontSize}
            tickLine={chartTheme.axis.tickLine}
            axisLine={chartTheme.axis.axisLine}
            dy={6}
          />
          <YAxis
            domain={[0, 100]}
            stroke={chartTheme.axis.stroke}
            fontSize={10}
            tickLine={chartTheme.axis.tickLine}
            axisLine={chartTheme.axis.axisLine}
            dx={-6}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'var(--primary)', opacity: 0.04 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload as RegionalBarDataPoint;
                return (
                  <div className="border border-border bg-surface p-3 shadow-xs text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-foreground">
                      <span>{p.flag}</span>
                      <span>{p.name} Standing</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {p.value}th Percentile
                    </p>
                    <p className="mt-1 text-[10px] text-foreground-muted">
                      Calibrated Against: {p.benchmarkStandard}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={42}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={regionColors[entry.name] || 'var(--color-primary)'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Retain legacy export for backward compatibility
export function CompetencyChart({ snapshot }: { snapshot: any }) {
  return <RegionalBenchmarkBarChart regionalPercentiles={snapshot.regionalPercentiles || {}} />;
}
