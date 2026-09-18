import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, History } from 'lucide-react';
import { Spinner } from '../ui/spinner';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '../ui/chart';

interface ProgressTabProps {
  studentId?: string;
  currentAssessmentId: string;
  currentScore: number;
  classLevel: number;
  benchmark?: any;
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

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--ink-primary)",
  },
} satisfies ChartConfig;

export function ProgressTab({
  studentId,
  currentAssessmentId,
  currentScore,
  classLevel
}: ProgressTabProps) {
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
      <div className="flex justify-center p-12">
        <Spinner size="md" className="text-ink-primary" />
      </div>
    );
  }

  const isInitial = history.length <= 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-accent-default" />
                    Growth Trajectory
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 {isInitial ? (
                    <div className="space-y-4 text-[14px] text-ink-secondary leading-relaxed">
                       <p>This is the first evaluation establishing your baseline structural competency profile.</p>
                       <p>Future assessments will chart trajectory changes across multiple variables and conceptual tiers.</p>
                    </div>
                 ) : (
                    <div className="space-y-4 text-[14px] text-ink-secondary leading-relaxed">
                       <p>Tracking cognitive progression across multiple diagnostic benchmarks.</p>
                       <p>Focus is on long-term skill retention and execution under varying scenario complexity.</p>
                    </div>
                 )}
              </CardContent>
           </Card>

           <Card>
              <CardContent className="pt-6">
                 <h4 className="text-[12px] font-mono font-bold uppercase text-ink-secondary tracking-widest mb-4">Historical Data</h4>
                 <div className="space-y-4">
                    {history.map((pt, i) => (
                       <div key={pt.id} className="flex justify-between items-center text-[14px]">
                          <div className="flex items-center gap-3">
                             <span className="text-[11px] font-mono text-ink-muted">0{i+1}</span>
                             <span className={pt.isCurrent ? 'font-medium text-ink-primary' : 'text-ink-secondary'}>
                                {pt.displayDate}
                             </span>
                          </div>
                          <span className={`font-mono font-bold ${pt.isCurrent ? 'text-accent-default' : 'text-ink-primary'}`}>
                             {pt.score}
                          </span>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="md:col-span-2">
           <Card className="h-full flex flex-col p-6">
              <h4 className="font-display font-medium text-ink-primary mb-6 text-center">Score Trajectory (Scaled / 900)</h4>
              
              <div className="flex-1 min-h-75 w-full mt-4">
                {isInitial ? (
                  <div className="h-full w-full border border-dashed border-border-hairline flex flex-col items-center justify-center p-8 text-center text-ink-secondary">
                    <History className="size-6 mb-3 text-ink-muted" />
                    <p className="text-[14px]">Longitudinal chart will generate after the second benchmark.</p>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                      <XAxis 
                        dataKey="displayDate" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--ink-secondary)' }}
                        dy={10}
                      />
                      <YAxis 
                        domain={[400, 900]} 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--ink-secondary)', fontFamily: 'var(--font-mono, monospace)' }}
                        dx={-10}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="var(--accent-default)" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--accent-default)", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "var(--ink-primary)", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
