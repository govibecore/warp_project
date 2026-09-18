import { ArrowLeft, RefreshCw, Sparkles, Clock, Printer, MoreHorizontal, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

import { WarpLogo } from '../WarpLogo';
import { Spinner } from '../ui/spinner';
import { useReportStream } from '../../hooks/useReportStream';
import { computeInternationalBenchmark } from '../../lib/irt/globalBenchmark';
import { createAndSaveReport } from '../../lib/aiService';
import { NemotronSocraticTutor } from './NemotronSocraticTutor';
import { PDFExportButton } from '../report/PDFExportButton';
import { ShareButton } from '../report/ShareButton';
import { OverviewTab } from '../report/OverviewTab';
import { StrengthsGapsTab } from '../report/StrengthsGapsTab';
import { PlanTab } from '../report/PlanTab';
import { ProgressTab } from '../report/ProgressTab';
import { OnePagePrintSummary } from '../report/OnePagePrintSummary';
import { ComprehensivePrintDossier } from '../report/ComprehensivePrintDossier';
import { ScoreRing } from '../ui/ScoreRing';
import { BrainLoading } from '../animations/BrainLoading';

type TabType = 'overview' | 'strengths' | 'plan' | 'progress';



function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return '-';
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
  const params = new URLSearchParams(window.location.search);
  const shareToken = params.get('share');
  const rawId = params.get('assessment');
  const isValidUuid = Boolean(rawId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId));
  const assessmentId = isValidUuid ? rawId : undefined;
  const shouldOpenTutor = params.get('tutor') === 'true';

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isTutorOpen, setIsTutorOpen] = useState(Boolean(shouldOpenTutor && assessmentId));
  const [selectedTutorScenarioIndex, setSelectedTutorScenarioIndex] = useState<number>(0);
  const [studentName, setStudentName] = useState<string>('Candidate');
  const [parentName, setParentName] = useState<string>('Parent/Guardian');
  const [printMode, setPrintMode] = useState<'one-page' | 'comprehensive'>('one-page');
  const [showOverflow, setShowOverflow] = useState(false);

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
                .select('full_name, parent_name')
                .eq('id', assessment.student_id)
                .maybeSingle();
              if (stu?.full_name) setStudentName(stu.full_name);
              if (stu?.parent_name) setParentName(stu.parent_name);
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
                    prompt: match?.prompt || r.option?.text || ((assessment as any).subject?.toLowerCase().includes('english') ? 'English Literacy Benchmark Scenario' : 'STEM Benchmark Scenario'),
                    competency: match?.competency || 'General Competency',
                    benchmarkStandard: match?.international_benchmark || 'International Benchmark',
                    userSelectedOption: r.userSelectedOption || r.option?.text,
                  };
                });
              }
            }
          }
          setAssessmentData(assessment as any);

          // Fetch student name and parent name
          const { data: studentRecord } = await supabase
            .from('students')
            .select('full_name, parent_name, current_class')
            .eq('id', assessment.student_id)
            .maybeSingle();

          const name = studentRecord?.full_name || student?.fullName || 'Candidate';
          const pName = studentRecord?.parent_name || 'Parent/Guardian';
          setStudentName(name);
          setParentName(pName);

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
              (assessment.responses as any) || [],
              (assessment as any).subject || 'STEM'
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
      setReportData((prev: any) => ({
        ...prev,
        student_variant: stream.report.student_variant,
        parent_variant: stream.report.parent_variant,
      }));
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

  const recordedResponses = (assessmentData.responses as any[]) || [];
  const isIncomplete = recordedResponses.length < 5 || assessmentData.status === 'in_progress';

  if (isIncomplete) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-foreground">
          Assessment Incomplete
        </h1>
        <p className="mb-6 text-sm text-foreground-secondary leading-relaxed max-w-md mx-auto">
          This session recorded {recordedResponses.length} response{recordedResponses.length === 1 ? '' : 's'}. A minimum of 5 completed items are required to calibrate your psychometric latent ability parameters and generate an authoritative diagnostic report.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => {
              window.location.search = '?choose';
            }}
            size="md"
          >
            Start New Assessment <ArrowRight className="size-4 ml-1.5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              window.location.search = '?dashboard';
            }}
            size="md"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Derive international psychometric benchmark numbers
  const benchmark = reportData?.benchmark || reportData?.parent_variant?.benchmark || computeInternationalBenchmark(
    assessmentData.ability_theta || {},
    assessmentData.class_level || 8,
    assessmentData.subject || 'STEM'
  );

  const snapshot = {
    classLevel: assessmentData.class_level || 8,
    completedAt: assessmentData.completed_at || assessmentData.created_at,
    overallScore: assessmentData.global_score ?? (benchmark.hasSufficientData ? benchmark.aggregateScaledScore : 0),
    regionalPercentiles: benchmark.regionalPercentiles,
    scaledScores: assessmentData.scaled_scores || {},
    totalTimeMs: assessmentData.total_time_ms,
  };

  const studentVariant = reportData?.student_variant;
  const parentVariant = reportData?.parent_variant;

  const parakh = benchmark.parakhHolisticPillars;

  const isEnglish = (assessmentData.subject || benchmark.subject || '').toLowerCase().includes('english');
  const subjectDisplay = isEnglish ? 'English Literacy' : (assessmentData.subject || benchmark.subject || 'STEM');
  const responses = assessmentData.responses || [];
  const correctCount = responses.filter((r: any) => r.correct === true).length;
  const totalCount = responses.length || 6;
  const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const metacognitiveScore = benchmark.hasSufficientData
    ? Math.max(5, Math.min(99, Math.round(accuracyPercent * 0.65 + (50 + (benchmark.abilityTheta || 0) * 18) * 0.35)))
    : 0;
  const metacognitiveBand = !benchmark.hasSufficientData
    ? 'Not Assessed'
    : metacognitiveScore >= 75
    ? 'Advanced'
    : metacognitiveScore >= 55
    ? 'Proficient'
    : metacognitiveScore >= 35
    ? 'Developing'
    : 'Foundational Need';

  const parakhVitals = [
    {
      domain: 'Core Domain',
      label: 'Conceptual Knowledge',
      value: parakh?.conceptualKnowledge?.score ?? 0,
      suffix: '%',
      band: parakh?.conceptualKnowledge?.level || (benchmark.hasSufficientData ? 'Developing' : 'Not Assessed'),
      delta: (parakh?.conceptualKnowledge?.score ?? 50) - 50,
      observation: parakh?.conceptualKnowledge?.description || 'Evaluated via adaptive CAT item discrimination on first-principles reasoning.',
    },
    {
      domain: 'Cognitive Domain',
      label: 'Higher Order Thinking (HOTS)',
      value: parakh?.higherOrderThinkingSkills?.score ?? 0,
      suffix: '%',
      band: parakh?.higherOrderThinkingSkills?.level || (benchmark.hasSufficientData ? 'Developing' : 'Not Assessed'),
      delta: (parakh?.higherOrderThinkingSkills?.score ?? 50) - 50,
      observation: parakh?.higherOrderThinkingSkills?.description || 'Non-linear parameter shifts and multi-step deduction analysis.',
    },
    {
      domain: 'Methodological',
      label: 'Application & Problem Solving',
      value: parakh?.applicationAndProblemSolving?.score ?? 0,
      suffix: '%',
      band: parakh?.applicationAndProblemSolving?.level || (benchmark.hasSufficientData ? 'Developing' : 'Not Assessed'),
      delta: (parakh?.applicationAndProblemSolving?.score ?? 50) - 50,
      observation: parakh?.applicationAndProblemSolving?.description || (isEnglish ? 'Applies linguistic analysis to novel textual contexts.' : 'Applies foundational theorems to novel STEM challenge contexts.'),
    },
    {
      domain: 'Metacognitive',
      label: 'Metacognition & Traps',
      value: metacognitiveScore,
      suffix: '%',
      band: metacognitiveBand,
      delta: metacognitiveScore - 50,
      observation: 'Pacing control and recognition of distractor choices engineered around formula traps.',
    },
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto pb-32">
      <div className="mx-auto max-w-[1200px] border-x border-border bg-background min-h-screen" id="report-printable-area">
        {/* ── Header ── */}
        <header
          className="relative border-b border-border px-4 py-16 md:px-8 md:py-24 screen-only overflow-hidden group"
          style={{ animation: 'fadeIn 300ms cubic-bezier(.2,.7,.2,1) both' }}
        >
          <div
            className="absolute inset-0 z-0 pointer-events-none bg-surface"
          />
          <div className="relative z-10">
            {/* Top bar: nav only */}
            <div className="mb-4 flex items-center justify-between gap-4">
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
                <WarpLogo variant="lockup" theme="light" className="hidden print:block h-7 w-auto" />
              </div>
            </div>

            {/* Hero: title + metadata strip on left, score ring on right */}
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div
                className="space-y-4"
                style={{ animation: 'slideUp 350ms 100ms cubic-bezier(.2,.7,.2,1) both' }}
              >
                <div className="inline-flex items-center gap-2 border border-border bg-surface/50 px-4 py-1.5 text-xs font-mono uppercase tracking-widest rounded-none mb-2">
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-foreground-secondary">WARP Global {subjectDisplay} Benchmark</span>
                </div>
                <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tighter leading-tight max-w-3xl text-foreground">
                  Diagnostic Executive Summary
                </h1>
                {/* Compact metadata strip */}
                <p className="text-xs font-mono text-foreground-secondary leading-relaxed">
                  <span className="text-foreground font-semibold">{studentName}</span>
                  {' · '}
                  <span className="text-foreground font-semibold">{parentName || 'Parent'}</span>
                  {' · '}
                  <span>Class {snapshot.classLevel}</span>
                  {' · '}
                  <span>{assessmentData.responses?.length || 30} Scenarios</span>
                  {assessmentData.responses && assessmentData.responses.length > 0 && (
                    <>
                      {' · '}
                      <span className="text-[--color-ok,#7FCBA0]">
                        {Math.round((assessmentData.responses.filter((r: any) => r.correct === true).length / assessmentData.responses.length) * 100)}% accuracy
                      </span>
                    </>
                  )}
                  {snapshot.totalTimeMs && snapshot.totalTimeMs > 0 && (
                    <>
                      {' · '}
                      <span><Clock className="inline size-3 -mt-0.5" /> {formatDuration(snapshot.totalTimeMs)}</span>
                    </>
                  )}
                  {' · '}
                  <span>{dateFmt.format(new Date(snapshot.completedAt))}</span>
                </p>
              </div>

              {/* Score Ring Hero */}
              <div
                className="shrink-0 print-keep"
                style={{ animation: 'fadeIn 500ms 50ms cubic-bezier(.2,.7,.2,1) both' }}
              >
                <ScoreRing
                  score={snapshot.overallScore}
                  maxScore={900}
                  percentile={benchmark.globalPercentile}
                  boardGradeBand={benchmark.boardGradeBand}
                />
              </div>
            </div>
          </div>
        </header>

        {/* ── Sticky Tab Navigation ── */}
        <div className="sticky top-0 z-20 no-print print:hidden border-b border-border bg-surface/95 backdrop-blur-md">
          <div className="mx-auto max-w-[1200px] flex items-center justify-between px-4 md:px-8 py-2">
            {/* Segmented Control Tab Row */}
            <div className="flex items-center overflow-x-auto hide-scrollbar w-full py-1 pr-4">
              <div className="flex items-center border-b border-border w-full shrink-0">
                {(['overview', 'strengths', 'plan', 'progress'] as TabType[]).map((id) => {
                  const labels: Record<TabType, string> = {
                    overview: 'Overview',
                    strengths: 'Strengths & Gaps',
                    plan: 'Plan',
                    progress: 'Progress',
                  };
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`px-6 py-3 text-[13px] font-medium transition-colors border-b-2 ${
                        activeTab === id
                          ? 'text-foreground border-primary'
                          : 'text-foreground-secondary border-transparent hover:text-foreground hover:border-border-strong'
                      }`}
                    >
                      {labels[id]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Share Report — always mounted so modal portal survives dropdown close */}
            <ShareButton
              reportId={reportData?.id}
              assessmentId={assessmentData.id}
              studentId={assessmentData.student_id}
              initialShareToken={reportData?.share_token}
              studentName={studentName}
              className="shrink-0"
            />

            {/* Overflow actions menu */}
            <div className="relative shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverflow(!showOverflow)}
                className="h-8 w-8 p-0"
                aria-label="Report actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
              {showOverflow && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowOverflow(false)} />
                  <div className="absolute right-0 top-full mt-1 z-40 min-w-50 border border-border bg-surface shadow-lg py-1">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase text-foreground-muted border-b border-border">
                      Print &amp; Export Options
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground-secondary">Format:</span>
                      <div className="flex items-center bg-elevated border border-border p-0.5 text-xs">
                        <button
                          onClick={() => setPrintMode('one-page')}
                          className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            printMode === 'one-page'
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'text-foreground-secondary hover:text-foreground'
                          }`}
                        >
                          1-Page
                        </button>
                        <button
                          onClick={() => setPrintMode('comprehensive')}
                          className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            printMode === 'comprehensive'
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'text-foreground-secondary hover:text-foreground'
                          }`}
                        >
                          4-Page
                        </button>
                      </div>
                    </div>
                    <div className="px-3 py-1.5">
                      <PDFExportButton
                        studentName={studentName}
                        classLevel={snapshot.classLevel}
                        completedAt={snapshot.completedAt}
                        totalTimeMs={snapshot.totalTimeMs}
                        overallScore={snapshot.overallScore}
                        abilityTheta={benchmark.abilityTheta}
                        benchmark={benchmark}
                        studentVariant={studentVariant}
                        parentVariant={parentVariant}
                        responses={responses}
                        printMode={printMode}
                        className="w-full justify-start"
                        onClose={() => setShowOverflow(false)}
                      />
                    </div>
                    <button
                      onClick={() => { setShowOverflow(false); window.print(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-elevated transition-colors"
                    >
                      <Printer className="size-4" />
                      Print {printMode === 'one-page' ? '(1-Page Summary)' : '(4-Page Dossier)'}
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { setShowOverflow(false); window.location.href = '/'; }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-elevated transition-colors"
                    >
                      <RefreshCw className="size-4" />
                      New assessment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Screen-Only Interactive Main ── */}
        <main className="mx-auto max-w-5xl space-y-24 px-4 py-16 md:px-8 md:py-24 screen-only">
          {aiGenerating && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 border border-border bg-card">
              <Spinner size="lg" className="text-primary" />
              <p className="text-sm font-medium">{stream.text}</p>
            </div>
          )}

          {/* ══════════════════ NEW DESIGN TABS ══════════════════ */}
          {!aiGenerating && activeTab === 'overview' && (
            <OverviewTab
              studentName={studentName}
              parentName={parentName}
              snapshot={snapshot}
              benchmark={benchmark}
              studentVariant={studentVariant}
              parentVariant={parentVariant}
              assessmentData={assessmentData}
              parakhVitals={parakhVitals}
            />
          )}

          {!aiGenerating && activeTab === 'strengths' && (
            <StrengthsGapsTab
              parakhVitals={parakhVitals}
              benchmark={benchmark}
              studentVariant={studentVariant}
              responses={assessmentData.responses || []}
              onAskTutor={(idx) => {
                setSelectedTutorScenarioIndex(idx);
                setIsTutorOpen(true);
              }}
            />
          )}

          {!aiGenerating && activeTab === 'plan' && (
            <PlanTab
              benchmark={benchmark}
              studentVariant={studentVariant}
              parentVariant={parentVariant}
            />
          )}

          {!aiGenerating && activeTab === 'progress' && (
            <ProgressTab
              studentId={assessmentData.student_id}
              currentAssessmentId={assessmentData.id}
              currentScore={snapshot.overallScore}
              classLevel={snapshot.classLevel}
              benchmark={benchmark}
            />
          )}
        </main>

        {/* ══════════════════ PDF CAPTURE TARGET (always in DOM, off-screen) ══════════════════
             Positioned fixed far off-screen so html2canvas can compute its layout
             (display:none would make it invisible to canvas; off-screen keeps layout intact).
             For real window.print() usage, print:block overrides the fixed position. */}
        <div
          id="report-print-target"
          className="print-dossier p-0 print:block"
          style={{ position: 'fixed', top: 0, left: '-9999px', width: '794px', zIndex: -10, background: '#fff' }}
        >
          {printMode === 'one-page' ? (
            <OnePagePrintSummary
              studentName={studentName}
              parentName={parentName}
              classLevel={snapshot.classLevel}
              completedAt={snapshot.completedAt}
              totalTimeMs={snapshot.totalTimeMs}
              overallScore={snapshot.overallScore}
              abilityTheta={benchmark.abilityTheta}
              benchmark={benchmark}
              studentVariant={studentVariant}
              parentVariant={parentVariant}
              responses={assessmentData.responses || []}
            />
          ) : (
            <ComprehensivePrintDossier
              studentName={studentName}
              parentName={parentName}
              classLevel={snapshot.classLevel}
              completedAt={snapshot.completedAt}
              totalTimeMs={snapshot.totalTimeMs}
              overallScore={snapshot.overallScore}
              abilityTheta={benchmark.abilityTheta}
              benchmark={benchmark}
              studentVariant={studentVariant}
              parentVariant={parentVariant}
              responses={assessmentData.responses || []}
            />
          )}
        </div>

        {/* Attribution — quiet, non-interactive */}
        <div className="no-print print:hidden py-4 text-center">
          <p className="text-xs text-foreground-muted font-mono">
            Synthesized with WARP AI Psychometric Intelligence
          </p>
        </div>

        {/* ── Floating AI Tutor Button ── */}
        {!isTutorOpen && (
          <button
            onClick={() => setIsTutorOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 no-print print:hidden"
            aria-label="Open AI Tutor"
          >
            <Sparkles className="size-4" />
            Ask AI
          </button>
        )}

        {/* ── Interactive WARP AI Socratic Tutor ── */}
        <NemotronSocraticTutor
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          classLevel={snapshot.classLevel}
          initialScenarioIndex={selectedTutorScenarioIndex}
          initialMode={activeTab === 'plan' ? 'parent' : 'student'}
          recentScenarios={assessmentData?.responses || []}
          subject={subjectDisplay}
        />
      </div>
    </div>
  );
}
