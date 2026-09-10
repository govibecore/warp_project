import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { ResultSnapshot } from '../domain/types';

/**
 * Regional standings bar chart.
 *
 * Lagom data-viz rules:
 *  - One accent (Fjord / --primary) for the student's own standing; all
 *    other regions are neutral greys so the eye goes where it should.
 *  - No glass, no blur, no heavy shadow. The tooltip is a plain card.
 *  - Hairline grid only; axis lines removed; small tabular tick labels.
 *  - The `--chart-*` tokens keep both light and dark themes legible.
 */
export function CompetencyChart({ snapshot }: { snapshot: ResultSnapshot }) {
  const data = [
    { name: 'India', value: snapshot.regionalPercentiles.India, fill: 'var(--chart-2)' },
    { name: 'Singapore', value: snapshot.regionalPercentiles.Singapore, fill: 'var(--chart-3)' },
    { name: 'China', value: snapshot.regionalPercentiles.China, fill: 'var(--chart-4)' },
    { name: 'USA', value: snapshot.regionalPercentiles.USA, fill: 'var(--chart-5)' },
    { name: 'Europe', value: snapshot.regionalPercentiles.Europe, fill: 'var(--chart-2)' },
    { name: 'Global', value: snapshot.regionalPercentiles.Global, fill: 'var(--chart-1)' },
  ];

  return (
    <div className="w-full h-full min-h-62.5 relative z-10 print:min-h-75">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid
            stroke="var(--border)"
            strokeOpacity={0.5}
            vertical={false}
            strokeDasharray="3 3"
            className="print:stroke-black/15"
          />
          <XAxis
            dataKey="name"
            stroke="var(--foreground-muted)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={6}
            className="print:fill-black/60"
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--foreground-muted)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dx={-6}
            className="print:fill-black/60"
          />
          <Tooltip
            cursor={{ fill: 'var(--primary)', opacity: 0.04 }}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-control)',
              color: 'var(--foreground)',
              padding: '8px 12px',
              boxShadow: 'none',
              fontSize: '12px',
            }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: '600', fontSize: '14px' }}
            labelStyle={{
              color: 'var(--foreground-muted)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '2px',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                className="transition-opacity hover:opacity-80 print:opacity-100"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
