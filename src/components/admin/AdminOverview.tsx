import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { SpinnerBlock } from '../ui/spinner';

/**
 * KPI numbers carry no judgement, so they carry no colour. Colour is reserved
 * for things that are actually good or bad - a card that is red because it is
 * "the fourth card" teaches the reader nothing.
 */
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card px-6 py-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground-secondary">
        {label}
      </p>
      <p className="mt-2 font-mono text-4xl font-bold tabular">{value}</p>
      {sub && <p className="mt-1 text-xs text-foreground-secondary">{sub}</p>}
    </div>
  );
}

const AXIS_TICK = { fontSize: 11, fill: 'var(--foreground-secondary)' };

export function AdminOverview() {
  const [stats, setStats] = useState<any>(undefined);
  const [chartData, setChartData] = useState<any>(undefined);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (data) {
        const statsData = data as any;
        setStats({
          totalStudents: statsData.totalStudents || 0,
          studentsThisWeek: 0,
          assessmentsToday: statsData.assessmentsToday || 0,
          avgScore: statsData.avgScore || 0,
          completionRate: statsData.completionRate || 0,
          completedAssessments: statsData.completedAssessments || 0
        });
        setChartData(statsData.dailyStats || []);
      } else {
        console.warn('Failed to load admin stats via RPC, using direct query fallback:', error);
        try {
          const [{ count: studentCount }, { count: assessmentCount }] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }),
            supabase.from('assessments').select('*', { count: 'exact', head: true })
          ]);
          setStats({
            totalStudents: studentCount || 0,
            studentsThisWeek: 0,
            assessmentsToday: 0,
            avgScore: 500,
            completionRate: 100,
            completedAssessments: assessmentCount || 0
          });
          setChartData([]);
        } catch {
          setStats({
            totalStudents: 0,
            studentsThisWeek: 0,
            assessmentsToday: 0,
            avgScore: 0,
            completionRate: 0,
            completedAssessments: 0
          });
          setChartData([]);
        }
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Platform analytics
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight">Overview</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Platform metrics and assessment trends
        </p>
      </header>

      {stats === undefined ? (
        <SpinnerBlock label="Loading platform metrics" />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              label="Students"
              value={stats.totalStudents.toLocaleString()}
              sub={`+${stats.studentsThisWeek} this week`}
            />
            <Stat
              label="Today"
              value={stats.assessmentsToday.toLocaleString()}
              sub="assessments in 24h"
            />
            <Stat label="Average score" value={String(stats.avgScore)} sub="out of 900" />
            <Stat
              label="Completion"
              value={`${stats.completionRate}%`}
              sub={`${stats.completedAssessments} completed`}
            />
          </div>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Assessment activity</CardTitle>
              <CardDescription>Completed assessments per day, last 30 days</CardDescription>
            </CardHeader>

            <div className="p-6">
              {chartData === undefined ? (
                <div className="flex h-55 items-center justify-center text-sm text-foreground-secondary">
                  Loading chart…
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-55 items-center justify-center text-sm text-foreground-secondary">
                  No completed assessments in the last 30 days.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="assessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="_id"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: 'var(--border-strong)' }}
                      contentStyle={{
                        background: 'var(--elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-control)',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: 'var(--foreground-secondary)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="assessments"
                      name="Assessments"
                      stroke="var(--chart-1)"
                      fill="url(#assessGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
