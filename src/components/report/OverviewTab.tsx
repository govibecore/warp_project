import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

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
}

export function OverviewTab({
  snapshot,
  benchmark,
  studentVariant,
  parentVariant,
  assessmentData
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
          <div className="text-3xl font-display font-medium text-ink-primary">{snapshot.overallScore} <span className="text-lg text-ink-muted">/ 900</span></div>
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
              <Button>
                View 30-Day Plan <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
