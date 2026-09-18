import { Delta, DeltaIcon, DeltaValue } from '../efferd/delta';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

interface PillarData {
  domain: string;
  label: string;
  value: number; // 0–100
  suffix?: string;
  band: string;
  delta: number;
  observation: string;
}

interface ParakhRadarChartProps {
  pillars: PillarData[];
  baseline?: number; // 0–100, default 50
  className?: string;
}

// Pillar accent colors aligned to Nordic Lagom competency tokens
const PILLAR_COLORS = [
  '#8FCFE8', // c1 - Computational/Conceptual (accent cyan)
  '#D9A86E', // c3 - Mathematical/HOTS (warm amber)
  '#7FCBA0', // c2 - Engineering/Application (ok green)
  '#B89BD9', // c5 - Systems/Metacognition (violet)
];

const chartConfig = {
  value: {
    label: "Score",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ParakhRadarChart({ pillars, baseline = 50, className = '' }: ParakhRadarChartProps) {
  const chartData = pillars.map((p) => ({
    domain: p.domain,
    shortLabel: p.label.split(' ').slice(0, 2).join(' '),
    value: p.value,
    baseline: baseline,
  }));

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Recharts Radar */}
      <div className="flex justify-center px-4 pt-4" role="img" aria-label="Competency breakdown radar chart">
        <div className="hidden md:block w-full">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-70">
            <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    indicator="dot" 
                    hideLabel={true}
                    formatter={(val, name, item) => (
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">{item.payload.domain}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{val}%</span>
                          {name === 'value' && <span className="text-muted-foreground ml-1">Achieved</span>}
                          {name === 'baseline' && <span className="text-muted-foreground ml-1">Baseline</span>}
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <PolarGrid 
                className="stroke-border/40" 
                gridType="polygon"
              />
              <PolarAngleAxis 
                dataKey="domain" 
                tick={{ fill: "var(--foreground)", fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, opacity: 0.6 }} 
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="baseline"
                dataKey="baseline"
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
              <Radar
                name="value"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill="var(--color-value)"
                fillOpacity={0.15}
                dot={{
                  r: 4,
                  fill: "var(--color-value)",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--color-value)",
                }}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        <div className="md:hidden flex flex-col gap-4 w-full">
          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col gap-1.5 text-xs w-full">
              <div className="flex justify-between items-center text-foreground-secondary">
                <span className="font-semibold">{d.domain}</span>
                <span className="font-mono text-primary font-bold">{d.value}</span>
              </div>
              <div className="relative h-1.5 w-full bg-border overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-700"
                  style={{ width: `${d.value}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 border-l border-muted-foreground/50 border-dashed"
                  style={{ left: `${d.baseline}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-foreground-muted font-mono">
                <span className="text-muted-foreground">Baseline: {d.baseline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2x2 Legend grid */}
      <div className="grid grid-cols-2 gap-2">
        {pillars.map((p, i) => (
          <div
            key={p.label}
            className="p-2 border border-border bg-surface flex items-start gap-2"
          >
            {/* Accent swatch */}
            <div
              className="mt-0.5 shrink-0 w-1 self-stretch"
              style={{ backgroundColor: PILLAR_COLORS[i % PILLAR_COLORS.length] }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground-muted truncate">
                {p.domain}
              </p>
              <p className="text-[10px] font-semibold text-foreground leading-tight truncate">
                {p.label}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold font-display tabular text-foreground">
                  {p.value}
                  {p.suffix}
                </span>
                <span className="text-[9px] font-mono text-foreground-secondary">
                  ({p.band})
                </span>
                <Delta value={p.delta} variant="default">
                  <DeltaIcon variant="trend" />
                  <DeltaValue suffix=" pts" />
                </Delta>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
