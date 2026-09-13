import { ArrowLeft, RefreshCw, Sparkles, GraduationCap, Users, Clock, Globe, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { WarpLogo } from '../WarpLogo';
import { Spinner } from '../ui/spinner';
import { useReportStream } from '../../hooks/useReportStream';
import { computeInternationalBenchmark } from '../../lib/irt/globalBenchmark';
import { createAndSaveReport } from '../../lib/aiService';
import { NemotronSocraticTutor } from './NemotronSocraticTutor';
import { PDFExportButton } from '../report/PDFExportButton';
import { ShareButton } from '../report/ShareButton';
import { StudentVariant } from '../report/StudentVariant';
import { ParentVariant } from '../report/ParentVariant';
import { TrajectoryArc } from '../report/TrajectoryArc';
import { BrainLoading } from '../animations/BrainLoading';
import { GsapCounter } from '../animations/GsapCounter';
import { OutcomeBadge } from '../ui/OutcomeBadge';


function ordinal(n: number): string {
  if (!n) return '0th';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function ReportDetail() {
  const { student } = useAuthStore();
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'trajectory'>('student');
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [studentName, setStudentName] = useState<string>('Candidate');

  const params = new URLSearchParams(window.location.search);
  const shareToken = params.get('share');
  const rawId = params.get('assessment');
  const isValidUuid = Boolean(rawId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId));
  const assessmentId = isValidUuid ? rawId : undefined;

  const stream = useReportStream(assessmentId || null);

  useEffect(() => {
    if (rawId === 'new') {
      window.location.href = '/';
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        // ── Case 1: Accessed via public share token ──
        if (shareToken) {
          const { data: reports, error: reportErr } = await supabase
            .rpc('get_shared_report', { p_token: shareToken });
          const report = reports && reports.length > 0 ? reports[0] : null;

          if (reportErr || !report) {
            console.error('Shared report not found:', reportErr);
            setLoading(false);
            return;
          }

          setReportData(report);

          // Fetch associated assessment
          if (report.assessment_id) {
            const { data: assessment } = await supabase
              .from('assessments')
              .select('*')
              .eq('id', report.assessment_id)
              .maybeSingle();
            
            setAssessmentData(assessment);

            if (assessment?.student_id) {
              const { data: stu } = await supabase
                .from('students')
                .select('full_name')
                .eq('id', assessment.student_id)
                .maybeSingle();
              if (stu?.full_name) setStudentName(stu.full_name);
            }
          }
          setLoading(false);
          return;
        }

        // ── Case 2: Standard assessment report access ──
        if (!assessmentId) {
          setLoading(false);
          return;
        }

        const { data: assessment } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', assessmentId)
          .single();

        if (assessment) {
          // Enrich responses with scenario details if prompts are missing
          const responses = (assessment.responses as any[]) || [];
          if (responses.length > 0 && !responses[0]?.prompt) {
            const scenarioIds = responses.map((r: any) => r.scenario_id).filter(Boolean);
            if (scenarioIds.length > 0) {
              const { data: scenariosList } = await supabase
                .from('scenarios')
                .select('id, prompt, competency, international_benchmark')
                .in('id', scenarioIds);

              if (scenariosList && scenariosList.length > 0) {
                const scenarioMap = new Map(scenariosList.map((s: any) => [s.id, s]));
                assessment.responses = responses.map((r: any) => {
                  const match = scenarioMap.get(r.scenario_id);
                  return {
                    ...r,
                    prompt: match?.prompt || r.option?.text || 'STEM Benchmark Scenario',
                    competency: match?.competency || 'General Competency',
                    benchmarkStandard: match?.international_benchmark || 'International Benchmark',
                    userSelectedOption: r.userSelectedOption || r.option?.text,
                  };
                });
              }
            }
          }
          setAssessmentData(assessment as any);

          // Fetch student name
          const { data: studentRecord } = await supabase
            .from('students')
            .select('full_name, current_class')
            .eq('id', assessment.student_id)
            .maybeSingle();

          const name = studentRecord?.full_name || student?.fullName || 'Candidate';
          setStudentName(name);

          // Check if report already exists in reports table
          const { data: report } = await supabase
            .from('reports')
            .select('*')
            .eq('assessment_id', assessmentId)
            .maybeSingle();

          if (report) {
            setReportData(report);
          } else {
            // Synthesize and store report
            const currentClass = assessment.class_level || studentRecord?.current_class || 8;
            const generated = await createAndSaveReport(
              assessmentId,
              assessment.student_id,
              name,
              currentClass,
              (assessment.ability_theta as any) || {},
              (assessment.responses as any) || []
            );
            setReportData(generated);
          }
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [assessmentId, shareToken, student?.fullName, rawId]);

  useEffect(() => {
    if (stream.status === 'complete' && stream.report) {
      setReportData({
        student_variant: stream.report.student_variant,
        parent_variant: stream.report.parent_variant,
      });
    }
  }, [stream]);

  const aiGenerating = stream.status === 'analyzing';



  if (!assessmentData) {
    if (loading || aiGenerating) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center py-24">
          <BrainLoading
            label={aiGenerating ? stream.text : 'Synthesizing International Psychometric Diagnostic…'}
            sublabel="Evaluating latent parameters against SASMO, AMC 8/10, and European Bebras benchmarks"
          />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-destructive">
        Report not found or link has expired.
      </div>
    );
  }

  // Derive international psychometric benchmark numbers
  const benchmark = reportData?.benchmark || computeInternationalBenchmark(
    assessmentData.ability_theta || {},
    assessmentData.class_level || 8
  );

  const snapshot = {
    classLevel: assessmentData.class_level || 8,
    completedAt: assessmentData.completed_at || assessmentData.created_at,
    overallScore: assessmentData.global_score || benchmark.aggregateScaledScore,
    regionalPercentiles: benchmark.regionalPercentiles,
    scaledScores: assessmentData.scaled_scores || {},
    totalTimeMs: assessmentData.total_time_ms,
  };

  const studentVariant = reportData?.student_variant;
  const parentVariant = reportData?.parent_variant;

  return (
    <div className="w-full flex-1 overflow-y-auto pb-12">
      <div className="mx-auto max-w-5xl" id="report-printable-area">
        {/* ── Header ── */}
        <header className="bg-warp-grid border-b border-border bg-surface p-6 md:p-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.search = '?dashboard'; }}
                className="gap-2 print:hidden"
                data-testid="return-to-dashboard"
              >
                <ArrowLeft className="size-4" /> Return to Dashboard
              </Button>
              <WarpLogo variant="lockup" className="h-7 w-auto print:hidden" />
              <WarpLogo variant="lockup" theme="light" className="print-only h-7 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Globe className="size-3.5" /> Calibrated against Singapore, China, US & Europe
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
                Official Report
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                WARP Global STEM benchmark
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                Diagnostic Executive Summary
              </h1>

              <dl className="flex flex-wrap gap-6 pt-2 text-sm">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Candidate
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {studentName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Grade Level
                  </dt>
                  <dd className="font-semibold text-foreground">
                    Class {snapshot.classLevel}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Questions Calibrated
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {assessmentData.responses?.length || 30} Scenarios
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Time Taken
                  </dt>
                  <dd className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="size-3.5 text-foreground-muted" />
                    {formatDuration(snapshot.totalTimeMs)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                    Assessed Date
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {dateFmt.format(new Date(snapshot.completedAt))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Scorecard Hero */}
            <div className="card corner-marks print-keep relative shrink-0 p-6 text-center md:min-w-64 bg-accent/20 border-border flex flex-col items-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                Global Scaled Score
              </p>
              <div className="flex items-baseline justify-center">
                <GsapCounter
                  value={snapshot.overallScore || benchmark.aggregateScaledScore}
                  className="font-display text-5xl font-bold tabular tracking-tight text-foreground"
                />
                <span className="text-sm font-normal text-foreground-muted ml-1"> / 900</span>
              </div>
              <OutcomeBadge
                percentile={benchmark.globalPercentile}
                size="sm"
                className="mt-2.5"
              />
              <div className="my-3 h-px w-full bg-border" />
              <div className="space-y-1 w-full text-center">
                <p className="text-xs font-semibold text-foreground">
                  {ordinal(benchmark.globalPercentile)} percentile, Global
                </p>
                <p className="text-[11px] font-medium text-foreground-muted">
                  🇸🇬 {ordinal(benchmark.regionalPercentiles.Singapore)} percentile vs Singapore
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Audience Tabs, Share & PDF Actions ── */}
        <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface px-6 md:px-10 pt-4 gap-4">
          <div className="flex space-x-6 overflow-x-auto pb-0">
            <button
              className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'student'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab('student')}
            >
              <GraduationCap className="size-4" />
              Student View
            </button>
            <button
              className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'parent'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab('parent')}
            >
              <Users className="size-4" />
              Parent Blueprint
            </button>
            <button
              className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'trajectory'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab('trajectory')}
            >
              <TrendingUp className="size-4" />
              Longitudinal Arc
            </button>
          </div>

          <div className="pb-3 flex items-center gap-2.5 flex-wrap">
            <ShareButton
              reportId={reportData?.id}
              assessmentId={assessmentData.id}
              initialShareToken={reportData?.share_token}
              studentName={studentName}
            />

            <PDFExportButton
              targetId="report-printable-area"
              studentName={studentName}
              classLevel={snapshot.classLevel}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTutorOpen(true)}
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
            >
              <Sparkles className="size-3.5" />
              <span>Ask Nemotron Tutor</span>
            </Button>
          </div>
        </div>

        <main className="space-y-8 p-4 sm:p-8 md:p-10">
          {aiGenerating && (
            <Card className="flex flex-col items-center justify-center py-10 gap-4">
              <Spinner size="lg" className="text-primary" />
              <p className="text-sm font-medium">{stream.text}</p>
            </Card>
          )}

          {/* ══════════════════ STUDENT VIEW ══════════════════ */}
          {!aiGenerating && activeTab === 'student' && (
            <StudentVariant
              studentVariant={studentVariant}
              benchmark={benchmark}
              classLevel={snapshot.classLevel}
            />
          )}

          {/* ══════════════════ PARENT VIEW ══════════════════ */}
          {!aiGenerating && activeTab === 'parent' && (
            <ParentVariant
              parentVariant={parentVariant}
              benchmark={benchmark}
              classLevel={snapshot.classLevel}
            />
          )}

          {/* ══════════════════ LONGITUDINAL TRAJECTORY ══════════════════ */}
          {!aiGenerating && activeTab === 'trajectory' && (
            <TrajectoryArc
              studentId={assessmentData.student_id}
              currentAssessmentId={assessmentData.id}
              currentScore={snapshot.overallScore}
              classLevel={snapshot.classLevel}
            />
          )}
        </main>

        {/* ── Footer controls ── */}
        <footer className="no-print mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.search = '?dashboard')}
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="size-3" /> Synthesized with NVIDIA Nemotron-70B Psychometric Intelligence
            </span>
          </div>

          <div className="flex gap-3">
            <PDFExportButton
              targetId="report-printable-area"
              studentName={studentName}
              classLevel={snapshot.classLevel}
            />
            <Button onClick={() => (window.location.href = '/')}>
              <RefreshCw className="size-4" />
              New assessment
            </Button>
          </div>
        </footer>

        {/* ── Interactive NVIDIA Nemotron Socratic Tutor ── */}
        <NemotronSocraticTutor
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          classLevel={snapshot.classLevel}
          recentScenarios={assessmentData.responses || []}
        />
      </div>
    </div>
  );
}
