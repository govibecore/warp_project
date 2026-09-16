import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';
import { Spinner } from '../ui/spinner';
import { supabase } from '../../lib/supabase';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TrajectoryArcProps {
  studentId?: string;
  currentAssessmentId: string;
  currentScore: number;
  classLevel: number;
}

interface AssessmentPoint {
  id: string;
  date: string;
  displayDate: string;
  score: number;
  classLevel: number;
  isCurrent: boolean;
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  day: 'numeric',
});

export function TrajectoryArc({
  studentId,
  currentAssessmentId,
  currentScore,
  classLevel,
}: TrajectoryArcProps) {
  const [history, setHistory] = useState<AssessmentPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    async function loadTrajectory() {
      if (!studentId) return;
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('id, global_score, completed_at, class_level')
          .eq('student_id', studentId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const points: AssessmentPoint[] = data.map((item) => ({
            id: item.id,
            date: item.completed_at || new Date().toISOString(),
            displayDate: item.completed_at ? dateFmt.format(new Date(item.completed_at)) : 'Assessment',
            score: item.global_score || currentScore,
            classLevel: item.class_level || classLevel,
            isCurrent: item.id === currentAssessmentId,
          }));
          setHistory(points);
        } else {
          // At minimum, include the current assessment point
          setHistory([
            {
              id: currentAssessmentId,
              date: new Date().toISOString(),
              displayDate: 'Initial Benchmark',
              score: currentScore,
              classLevel,
              isCurrent: true,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load assessment trajectory:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrajectory();
  }, [studentId, currentAssessmentId, currentScore, classLevel]);

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Spinner size="md" className="text-primary" />
      </Card>
    );
  }

  const hasMultiple = history.length > 1;
  const initialScore = history[0]?.score || currentScore;
  const latestScore = history[history.length - 1]?.score || currentScore;
  const totalDelta = latestScore - initialScore;

  return (
    <Card className="p-6 md:p-8 bg-surface border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-none bg-primary/10 text-primary">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-foreground">
              Longitudinal Growth Trajectory
            </h3>
            <p className="text-xs text-foreground-secondary">
              Tracking latent ability growth across calibrated testing windows
            </p>
          </div>
        </div>

        {hasMultiple && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-none bg-accent/40 border border-border text-xs">
            <span className="text-foreground-secondary">Net Progression:</span>
            <span className={`font-mono font-bold flex items-center gap-0.5 ${totalDelta >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {totalDelta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {totalDelta > 0 ? `+${totalDelta}` : totalDelta} pts
            </span>
          </div>
        )}
      </div>

      {hasMultiple ? (
        <div className="space-y-6">
          {/* Recharts longitudinal line */}
          <div className="h-56 w-full pt-2 min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={history} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-foreground-secondary"
                  tickLine={false}
                />
                <YAxis
                  domain={[200, 900]}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-foreground-secondary"
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as AssessmentPoint;
                      return (
                        <div className="rounded-none border border-border bg-background p-3 shadow-lg text-xs">
                          <p className="font-bold text-foreground">{data.displayDate}</p>
                          <p className="text-primary font-mono font-semibold">Score: {data.score} / 900</p>
                          <p className="text-foreground-muted">Class {data.classLevel}</p>
                          {data.isCurrent && (
                            <span className="text-[10px] text-emerald-500 font-medium mt-1 inline-block">
                              ★ Current Report
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--primary, #3b82f6)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: 'var(--primary, #3b82f6)' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {history.map((pt, idx) => (
              <div
                key={pt.id}
                className={`p-3 rounded-none border text-xs ${
                  pt.isCurrent
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-surface text-foreground-secondary'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] uppercase mb-1">
                  <span>Checkpoint #{idx + 1}</span>
                  {pt.isCurrent && <span className="text-primary">Current</span>}
                </div>
                <p className="font-mono font-bold text-sm text-foreground">{pt.score} pts</p>
                <p className="text-[10px] text-foreground-muted">{pt.displayDate}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Baseline Establishment view */
        <div className="rounded-none border border-dashed border-border bg-surface/50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="size-12 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Compass className="size-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">
                First Diagnostic Baseline Established ({currentScore} / 900)
              </h4>
              <span className="px-2 py-0.5 rounded-none text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Calibrated Anchor
              </span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              This score serves as candidate's anchor point on the international latent theta scale. Completing the 30-Day Sprint and re-testing in 60-90 days will plot their comparative growth arc against Singapore, USA, and European peer trajectories.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
