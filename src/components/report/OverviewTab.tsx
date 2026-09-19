import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function ordinal(n: number): string {
  if (!n) return '0th';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

interface OverviewTabProps {
  studentName: string;
  parentName: string;
  snapshot: any;
  benchmark: any;
  studentVariant: any;
  parentVariant: any;
  assessmentData: any;
  parakhVitals: any;
  difficultyData?: any[];
  onViewPlan?: () => void;
}

export function OverviewTab({
  snapshot,
  benchmark,
  studentVariant,
  parentVariant,
  assessmentData,
  difficultyData = [],
  onViewPlan
}: OverviewTabProps) {
  const archetypeTitle = studentVariant?.archetypeTitle || benchmark?.cognitiveArchetype?.title || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || benchmark?.cognitiveArchetype?.tagline || 'Deconstructs multi-variable systems with structural precision';
  const indiaPercentile = benchmark?.indiaNationalPercentile ?? benchmark?.regionalPercentiles?.India ?? 0;
  const globalPercentile = benchmark?.globalPercentile || 50;
  const realityCheck = benchmark?.realityCheck || {};
  const honestSummary = parentVariant?.realityCheckSummary || realityCheck.honestSummary || 'Demonstrates analytical decomposition; growth needed in multi-step deductive chaining.';
  const boardGradeBand = benchmark?.boardGradeBand;

  const responses = assessmentData?.responses || [];
  const correctCount = responses.filter((r: any) => r.correct === true).length;
  const totalCount = responses.length || 30;
  const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-200">
      {/* 4 KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-muted mb-2">Overall Score</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-display font-medium text-ink-primary">
              {snapshot.overallScore} <span className="text-lg text-ink-muted">/ 900</span>
            </div>
            {(() => {
              const compVals = Object.values(snapshot.competencies) as any[];
              const assessed = compVals.filter(c => c.sem && c.sem > 0);
              const overallSem = assessed.length > 0 ? Math.round(assessed.reduce((sum, c) => sum + c.sem, 0) / assessed.length) : undefined;
              return overallSem !== undefined ? (
                <span className="text-xs font-mono text-ink-muted">± {overallSem}</span>
              ) : null;
            })()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-muted mb-2">India Percentile</div>
          <div className="text-3xl font-display font-medium text-ink-primary">{ordinal(indiaPercentile)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-muted mb-2">Global Percentile</div>
          <div className="text-3xl font-display font-medium text-primary">{ordinal(globalPercentile)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-muted mb-2">Accuracy</div>
          <div className="text-3xl font-display font-medium text-ink-primary">{accuracyPercent}%</div>
        </Card>
      </div>

      {/* Narrative & Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Cognitive Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="text-xl font-display text-ink-primary mb-2">{archetypeTitle}</h4>
            <p className="text-[14px] leading-[1.6] text-ink-secondary mb-6 max-w-none">
              {archetypeTagline}. {honestSummary}
            </p>
            {boardGradeBand && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-ink-secondary">Projected Board Grade:</span>
                <span className="px-2 py-0.5 border border-border-hairline bg-surface-page text-[12px] font-mono font-bold text-ink-primary">{boardGradeBand.grade}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="flex flex-col justify-center items-start">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h4 className="text-xl font-display text-ink-primary">Next Steps</h4>
              <p className="text-[14px] leading-[1.6] text-ink-secondary max-w-[40ch]">
                We have generated a targeted 30-day sprint based on these diagnostic results. Review the specific strengths and gaps, then activate the plan.
              </p>
              <Button onClick={onViewPlan}>
                View 30-Day Plan <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Difficulty Distribution */}
      {difficultyData && difficultyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Item Response Curve</CardTitle>
            <p className="text-[13px] text-ink-secondary mt-1 max-w-[65ch]">
              Distribution of responses against the intrinsic difficulty (IRT <span className="font-mono">b</span>-parameter) of each scenario. Correct answers are plotted at the top (1), incorrect at the bottom (0).
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '256px', minWidth: 0 }} className="mt-4">
              <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={0}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                  <XAxis 
                    type="number" 
                    dataKey="difficulty" 
                    name="Difficulty" 
                    domain={[-3, 3]} 
                    tickCount={7}
                    tickFormatter={(val) => val > 0 ? `+${val}` : val}
                    stroke="var(--ink-muted)"
                    fontSize={11}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="correct" 
                    name="Correct" 
                    domain={[-0.2, 1.2]} 
                    ticks={[0, 1]}
                    tickFormatter={(val) => val === 1 ? 'Pass' : 'Fail'}
                    stroke="var(--ink-muted)"
                    fontSize={11}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface border border-border p-3 text-[13px] shadow-sm">
                            <p className="font-semibold text-ink-primary mb-1">{data.label}</p>
                            <p className="text-ink-secondary font-mono text-xs">Difficulty: {data.difficulty > 0 ? `+${data.difficulty}` : data.difficulty}</p>
                            <p className={`font-mono text-xs mt-1 ${data.correct ? 'text-semantic-positive' : 'text-semantic-critical'}`}>
                              {data.status}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={0} stroke="var(--border-strong)" opacity={0.3} />
                  <Scatter 
                    name="Responses" 
                    data={difficultyData} 
                    fill="var(--ink-primary)"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      const fill = payload.correct ? 'var(--semantic-positive)' : 'var(--semantic-critical)';
                      return <circle cx={cx} cy={cy} r={5} fill={fill} opacity={0.8} />;
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
