import { ArrowLeft, Printer, RefreshCw, Sparkles, TriangleAlert, Globe } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAxiomSession } from '../../context/AxiomSessionContext';
import { supabase } from '../../lib/supabase';
import { CompetencyChart } from '../CompetencyChart';
import type { ResultSnapshot } from '../../domain/types';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { WarpLogo } from '../WarpLogo';
import { Spinner } from '../ui/spinner';
import { Progress } from '../ui/progress';

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function ReportDetail() {
  const { student, isGuest } = useAuthStore();
  const { session, startNew } = useAxiomSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const assessmentId = params.get('assessment') || undefined;
  const canFetch = Boolean(assessmentId) && !isGuest;

  useEffect(() => {
    if (!canFetch || !assessmentId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId!)
        .single();
      
      setAssessmentData(assessment);

      if (assessment?.report_id) {
        const { data: report } = await supabase
          .from('reports')
          .select('*')
          .eq('id', assessment.report_id)
          .single();
        setReportData(report);
      } else if (assessment) {
        setIsGenerating(true);
        const { data, error } = await supabase.functions.invoke('generate-report', {
          body: { assessmentId },
        });
        
        if (error || !data?.success) {
          setGenerateError(error?.message || data?.error || 'Could not generate the written analysis.');
        } else if (data.reportId) {
          const { data: report } = await supabase
            .from('reports')
            .select('*')
            .eq('id', data.reportId)
            .single();
          setReportData(report);
        }
        setIsGenerating(false);
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [assessmentId, canFetch]);

  // Server snapshot wins; otherwise fall back to the local session result.
  let snapshot: ResultSnapshot | undefined;
  if (assessmentData?.result) {
    snapshot = {
      ...assessmentData.result,
      responses: assessmentData.responses,
      classLevel: assessmentData.class_level,
      completedAt: assessmentData.completed_at || new Date().toISOString(),
    } as ResultSnapshot;
  } else if (session.result) {
    snapshot = session.result;
  }

  const aiReport = reportData?.ai_insights?.overallAssessment;

  if (!snapshot) {
    if (loading || isGenerating) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
          <Spinner size="lg" className="text-foreground-muted" />
          <p className="text-sm text-foreground-secondary">
            {isGenerating ? 'Writing your analysis…' : 'Loading…'}
          </p>
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-destructive">
        Report not found. It may have been removed.
      </div>
    );
  }

  const standings = [
    { label: 'Global', value: snapshot.regionalPercentiles.Global, primary: true },
    { label: 'Singapore', value: snapshot.regionalPercentiles.Singapore },
    { label: 'USA', value: snapshot.regionalPercentiles.USA },
    { label: 'China', value: snapshot.regionalPercentiles.China },
    { label: 'Europe', value: snapshot.regionalPercentiles.Europe },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full flex-1 overflow-y-auto pb-12">
      <div className="mx-auto max-w-5xl">
        {/* ── Header ── */}
        <header className="bg-warp-grid border-b border-border bg-surface p-8 md:p-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            {/* Screen ink is near-white; paper needs the navy wordmark. */}
            <WarpLogo variant="lockup" className="h-7 w-auto print:hidden" />
            <WarpLogo variant="lockup" theme="light" className="print-only h-7 w-auto" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
              Confidential · Candidate copy
            </p>
          </div>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                WARP benchmark report
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Executive summary
              </h1>

              <dl className="flex flex-wrap gap-8 pt-2 text-sm">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Student
                  </dt>
                  <dd className="font-semibold">
                    {student?.fullName || session.profile?.name || 'Candidate'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Level
                  </dt>
                  <dd className="font-semibold">
                    Class {snapshot.classLevel} ·{' '}
                    {session.profile?.difficulty || 'Standard'} tier
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Date
                  </dt>
                  <dd className="font-semibold">{dateFmt.format(new Date(snapshot.completedAt))}</dd>
                </div>
              </dl>
            </div>

            <div className="card corner-marks print-keep relative shrink-0 p-6 text-center md:min-w-50">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                Aggregate score
              </p>
              <p className="font-display text-6xl font-bold tabular">{snapshot.overallScore}</p>
              <div className="my-4 h-px w-full bg-border" />
              <p className="text-sm font-semibold text-foreground-secondary">
                {ordinal(snapshot.regionalPercentiles.Global)} percentile, global
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-8 p-4 sm:p-8 md:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* ── Left column ── */}
            <div className="flex flex-col gap-8">
              <Card>
                <div className="border-b border-border px-6 py-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground-secondary">
                    Regional breakdown
                  </h2>
                </div>
                <div className="p-6">
                  <div className="h-75">
                    <CompetencyChart snapshot={snapshot} />
                  </div>
                </div>
              </Card>

              {generateError && (
                <div className="card border-destructive/30 bg-destructive-subtle p-6">
                  <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    <TriangleAlert className="size-4" aria-hidden="true" />
                    Written analysis unavailable
                  </p>
                  <p className="mt-1 text-sm text-foreground-secondary">{generateError}</p>
                </div>
              )}

              {aiReport && (
                <Card>
                  <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                    <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground-secondary">
                      Analyst evaluation
                    </h2>
                  </div>
                  <div className="whitespace-pre-wrap px-6 py-6 text-sm leading-relaxed text-foreground-secondary">
                    {aiReport}
                  </div>
                </Card>
              )}

              {!aiReport && isGuest && (
                <Card>
                  <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                    <TriangleAlert className="size-3.5 text-warning" aria-hidden="true" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground-secondary">
                      Local result saved
                    </h2>
                  </div>
                  <div className="px-6 py-6">
                    <p className="text-sm leading-relaxed text-foreground-secondary">
                      A written analysis and parent guidance are generated for registered
                      accounts only. Your score is preserved on this device.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                      }}
                    >
                      Create an account
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="space-y-8">
              <Card>
                <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                  <Globe className="size-3.5 text-foreground-secondary" aria-hidden="true" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground-secondary">
                    International standings
                  </h2>
                </div>
                <div className="space-y-5 px-6 py-6">
                  {standings.map((stat) => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className={stat.primary ? '' : 'text-foreground-secondary'}>
                          {stat.label}
                        </span>
                        <span className="tabular">{ordinal(stat.value)}</span>
                      </div>
                      <Progress
                        value={stat.value}
                        label={`${stat.label} percentile`}
                        fillClassName={stat.primary ? 'bg-primary' : 'bg-border-strong'}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="border-b border-border px-6 py-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground-secondary">
                    Response transcript
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {snapshot.responses.map((response: { itemId: string; missionId: string; optionLabel: string; misconception?: string }) => (
                    <div key={response.itemId} className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <span className="pt-1 w-20 shrink-0 text-[10px] font-bold uppercase leading-tight text-foreground-secondary">
                          {response.missionId.replace(/-/g, ' ')}
                        </span>
                        <div className="flex-1 space-y-1.5">
                          <p className="text-sm text-foreground-secondary">
                            "{response.optionLabel}"
                          </p>
                          {response.misconception && (
                            <p className="flex items-start gap-1.5 text-xs text-warning">
                              <TriangleAlert className="size-3 shrink-0 translate-y-px" aria-hidden="true" />
                              {response.misconception}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* ── Footer controls ── */}
        <footer className="no-print mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border p-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isGuest) window.location.href = '/';
              else window.location.search = '?dashboard';
            }}
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="size-4" />
              Save as PDF
            </Button>
            <Button
              onClick={() => {
                if (isGuest) {
                  localStorage.clear();
                  window.location.href = '/';
                } else {
                  window.history.replaceState({}, '', window.location.pathname);
                  startNew();
                }
              }}
            >
              <RefreshCw className="size-4" />
              New assessment
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
