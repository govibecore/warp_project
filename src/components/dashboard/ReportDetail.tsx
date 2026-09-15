import { ArrowLeft, RefreshCw, Sparkles, GraduationCap, Users, Clock, Globe, TrendingUp, FileCheck, Printer, LayoutDashboard, ArrowRight, FileText } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import type React from 'react';
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
import { ScenarioAudit } from '../report/ScenarioAudit';
import { TrajectoryArc } from '../report/TrajectoryArc';
import { OnePagePrintSummary } from '../report/OnePagePrintSummary';
import { ParakhRadarChart } from '../report/ParakhRadarChart';
import { ScoreRing } from '../ui/ScoreRing';
import { BrainLoading } from '../animations/BrainLoading';

import {
  ShareBarList,
  ShareBarListItem,
  ShareBarListContent,
  ShareBarListLabel,
  ShareBarListValue,
  ShareBarListFill,
} from '../efferd/share-bar-list';

type TabType = 'hub' | 'onepage' | 'student' | 'parent' | 'audit' | 'trajectory';

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
  const params = new URLSearchParams(window.location.search);
  const shareToken = params.get('share');
  const rawId = params.get('assessment');
  const isValidUuid = Boolean(rawId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId));
  const assessmentId = isValidUuid ? rawId : undefined;
  const shouldOpenTutor = params.get('tutor') === 'true';

  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [isTutorOpen, setIsTutorOpen] = useState(Boolean(shouldOpenTutor && assessmentId));
  const [selectedTutorScenarioIndex, setSelectedTutorScenarioIndex] = useState<number>(0);
  const [studentName, setStudentName] = useState<string>('Candidate');
  const [printMode, setPrintMode] = useState<'one-page' | 'comprehensive'>('one-page');

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
  const benchmark = reportData?.benchmark || reportData?.parent_variant?.benchmark || computeInternationalBenchmark(
    assessmentData.ability_theta || {},
    assessmentData.class_level || 8,
    assessmentData.subject || 'STEM'
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

  // Derived high-signal metrics for Executive Summary Hub
  const archetypeTitle = studentVariant?.archetypeTitle || benchmark.cognitiveArchetype?.title || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || benchmark.cognitiveArchetype?.tagline || 'Deconstructs multi-variable systems with structural precision';
  const keyStrengths: string[] = studentVariant?.keyStrengths || [
    benchmark.cognitiveArchetype?.primaryStrength || 'Parameter isolation & causal inference',
  ];
  const blindspots: string[] = studentVariant?.blindspots || [
    benchmark.cognitiveArchetype?.criticalBlindspot || 'Premature optimization under time pressure',
  ];
  const realityCheck = benchmark.realityCheck || {};
  const verdict = realityCheck.verdict || 'Developing Foundation';
  const honestSummary = parentVariant?.realityCheckSummary || realityCheck.honestSummary || 'Demonstrates analytical decomposition; growth needed in multi-step deductive chaining.';
  const boardGradeBand = benchmark.boardGradeBand;
  const parakh = benchmark.parakhHolisticPillars;
  const homeRoutines = parentVariant?.indianHomeRoutines || parentVariant?.immediateHomeRoutines || benchmark.parentActionBlueprint?.indianHomeRoutines || [];
  const indiaPercentile = benchmark.indiaNationalPercentile || benchmark.regionalPercentiles?.India || 68;
  const isEnglish = (assessmentData.subject || benchmark.subject || '').toLowerCase().includes('english');
  const subjectDisplay = isEnglish ? 'English Literacy' : (assessmentData.subject || benchmark.subject || 'STEM');
  const responses = assessmentData.responses || [];
  const correctCount = responses.filter((r: any) => r.correct === true).length;
  const totalCount = responses.length || 6;

  const parakhVitals = [
    {
      domain: 'Core Domain',
      label: 'Conceptual Knowledge',
      value: parakh?.conceptualKnowledge?.score ?? 62,
      suffix: '%',
      band: parakh?.conceptualKnowledge?.level || 'Proficient',
      delta: (parakh?.conceptualKnowledge?.score ?? 62) - 50,
      observation: parakh?.conceptualKnowledge?.description || 'Evaluated via adaptive CAT item discrimination on first-principles reasoning.',
    },
    {
      domain: 'Cognitive Domain',
      label: 'Higher Order Thinking (HOTS)',
      value: parakh?.higherOrderThinkingSkills?.score ?? 49,
      suffix: '%',
      band: parakh?.higherOrderThinkingSkills?.level || 'Developing',
      delta: (parakh?.higherOrderThinkingSkills?.score ?? 49) - 50,
      observation: parakh?.higherOrderThinkingSkills?.description || 'Non-linear parameter shifts and multi-step deduction analysis.',
    },
    {
      domain: 'Methodological',
      label: 'Application & Problem Solving',
      value: parakh?.applicationAndProblemSolving?.score ?? 56,
      suffix: '%',
      band: parakh?.applicationAndProblemSolving?.level || 'Proficient',
      delta: (parakh?.applicationAndProblemSolving?.score ?? 56) - 50,
      observation: parakh?.applicationAndProblemSolving?.description || (isEnglish ? 'Applies linguistic analysis to novel textual contexts.' : 'Applies foundational theorems to novel STEM challenge contexts.'),
    },
    {
      domain: 'Metacognitive',
      label: 'Metacognition & Traps',
      value: 78,
      suffix: '%',
      band: 'Advanced',
      delta: 28,
      observation: 'Pacing control and recognition of distractor choices engineered around formula traps.',
    },
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto pb-12">
      <div className="mx-auto max-w-5xl" id="report-printable-area">
        {/* ── Header ── */}
        <header
          className="bg-warp-grid border-b border-border bg-surface px-6 pt-6 pb-8 md:px-10 md:pt-8 md:pb-10 screen-only"
          style={{ animation: 'fadeIn 300ms cubic-bezier(.2,.7,.2,1) both' }}
        >
          {/* Top bar: nav + calibration badge */}
          <div className="mb-5 flex items-center justify-between gap-4">
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
                <Globe className="size-3.5" /> Calibrated against India (CBSE/PARAKH), Singapore, China & US
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
                Official Report
              </p>
            </div>
          </div>

          {/* Hero: title + metadata strip on left, score ring on right */}
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div
              className="space-y-3"
              style={{ animation: 'slideUp 350ms 100ms cubic-bezier(.2,.7,.2,1) both' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                WARP Global {subjectDisplay} Benchmark
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Diagnostic Executive Summary
              </h1>
              {/* Compact metadata strip */}
              <p className="text-xs font-mono text-foreground-secondary leading-relaxed">
                <span className="text-foreground font-semibold">{studentName}</span>
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
              {/* India percentile quick read */}
              <p className="text-xs font-semibold text-foreground-secondary">
                🇮🇳 {ordinal(benchmark.indiaNationalPercentile || benchmark.regionalPercentiles?.India || 68)} percentile in India
                {' · '}
                🌐 {ordinal(benchmark.globalPercentile)} global
                {' · '}
                🇸🇬 {ordinal(benchmark.regionalPercentiles?.Singapore)} vs Singapore
              </p>
            </div>

            {/* Score Ring Hero */}
            <div
              className="shrink-0 print-keep"
              style={{ animation: 'fadeIn 500ms 50ms cubic-bezier(.2,.7,.2,1) both' }}
            >
              <ScoreRing
                score={snapshot.overallScore || benchmark.aggregateScaledScore}
                maxScore={900}
                percentile={benchmark.globalPercentile}
                boardGradeBand={benchmark.boardGradeBand}
              />
            </div>
          </div>
        </header>

        {/* ── Sticky Pill Tab Navigation ── */}
        <div className="sticky top-0 z-20 no-print print:hidden border-b border-border bg-surface/95 backdrop-blur-sm">
          {/* Pill tab row */}
          {(() => {
            const tabs: Array<{ id: TabType; icon: React.ElementType; label: string; badge?: string }> = [
              { id: 'hub', icon: LayoutDashboard, label: 'Executive Hub' },
              { id: 'onepage', icon: FileText, label: '1-Page Brief', badge: 'Print Ready' },
              { id: 'student', icon: GraduationCap, label: 'Student Sprint' },
              { id: 'parent', icon: Users, label: 'Parent Blueprint' },
              { id: 'audit', icon: FileCheck, label: 'Scenario Audit', badge: String(totalCount) },
              { id: 'trajectory', icon: TrendingUp, label: 'Longitudinal Arc' },
            ];
            return (
              <div className="flex items-center gap-1 overflow-x-auto px-4 md:px-6 pt-2 pb-0">
                {tabs.map(({ id, icon: Icon, label, badge }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 mb-0 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-foreground-secondary hover:text-foreground hover:bg-surface/60'
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {label}
                    {badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-mono font-bold">
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Secondary action row */}
          <div className="flex items-center justify-end gap-2 px-4 md:px-6 py-2 border-t border-border/50">
            {/* Print Mode Selector */}
            <div className="flex items-center border border-border bg-surface p-0.5 text-xs mr-auto">
              <button
                type="button"
                onClick={() => setPrintMode('one-page')}
                className={`px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                  printMode === 'one-page'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
                title="Strict 1-Page condensed printout"
              >
                1-Page Print
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('comprehensive')}
                className={`px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                  printMode === 'comprehensive'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
                title="Full multi-page comprehensive report"
              >
                Full Dossier
              </button>
            </div>
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
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
              aria-label="Print official dossier"
            >
              <Printer className="size-3.5" />
              <span>Print {printMode === 'one-page' ? '(1-Page)' : '(Full)'}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTutorOpen(true)}
              className="gap-1.5 border-border bg-accent/40 text-foreground hover:bg-accent"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Ask Nemotron Tutor</span>
            </Button>
          </div>
        </div>

        {/* ── Screen-Only Interactive Main (Compact, Calm, Zero Bloat) ── */}
        <main className="space-y-6 p-4 sm:p-8 md:p-10 screen-only">
          {aiGenerating && (
            <Card className="flex flex-col items-center justify-center py-10 gap-4">
              <Spinner size="lg" className="text-primary" />
              <p className="text-sm font-medium">{stream.text}</p>
            </Card>
          )}

          {/* ══════════════════ EXECUTIVE SUMMARY HUB ══════════════════ */}
          {!aiGenerating && activeTab === 'hub' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* High Signal Focus Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:grid-rows-[1fr]">
                {/* ── CARD 1: Student Cognitive Profile — Cyan accent ── */}
                <Card
                  className="p-5 md:p-6 border border-border border-l-2 bg-card flex flex-col justify-between hover:-translate-y-0.5 hover:border-border-strong transition-all duration-200 hub-card-1"
                  style={{ borderLeftColor: 'var(--color-accent, #8FCFE8)' }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                        Student Profile
                      </span>
                      <GraduationCap className="size-4 text-primary" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-display text-foreground leading-snug">
                        {archetypeTitle}
                      </h3>
                      <p className="text-xs text-foreground-secondary italic mt-0.5 line-clamp-2">
                        "{archetypeTagline}"
                      </p>
                    </div>

                    <div className="space-y-2 text-xs pt-1 border-t border-border">
                      <div>
                        <span className="font-semibold text-foreground">Core Strength: </span>
                        <span className="text-foreground-secondary">{keyStrengths[0]}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Priority Growth: </span>
                        <span className="text-foreground-secondary">{blindspots[0]}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('student')}
                    className="w-full text-left pt-3.5 mt-4 border-t border-border -mx-5 -mb-5 px-5 py-3 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-surface/80 group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-none bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <GraduationCap className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">Explore 30-Day Sprint</div>
                        <div className="text-[10px] text-foreground-muted font-normal">Targeted milestones & superpower expansion</div>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                </Card>

                {/* ── CARD 2: Parent Educational Blueprint — Warm amber accent ── */}
                <Card
                  className="p-5 md:p-6 border border-border border-l-2 bg-card flex flex-col justify-between hover:-translate-y-0.5 hover:border-border-strong transition-all duration-200 hub-card-2"
                  style={{ borderLeftColor: 'var(--color-warm, #D9A86E)' }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                        Parent Blueprint
                      </span>
                      <Users className="size-4 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-display text-foreground leading-snug">
                          {boardGradeBand ? `Grade ${boardGradeBand.grade}` : verdict}
                        </h3>
                        {boardGradeBand && (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-accent text-foreground-secondary font-medium">
                            {boardGradeBand.band}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        NEP 2020 & Board Diagnostic Verdict
                      </p>
                    </div>

                    <div className="space-y-2 text-xs pt-1 border-t border-border">
                      <div>
                        <span className="font-semibold text-foreground">Ratta Reality: </span>
                        <span className="text-foreground-secondary line-clamp-2">{honestSummary}</span>
                      </div>
                      {homeRoutines[0] && (
                        <div>
                          <span className="font-semibold text-foreground">Immediate Action: </span>
                          <span className="text-foreground-secondary line-clamp-1">
                            {typeof homeRoutines[0] === 'string' ? homeRoutines[0] : homeRoutines[0].routine || homeRoutines[0].title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('parent')}
                    className="w-full text-left pt-3.5 mt-4 border-t border-border -mx-5 -mb-5 px-5 py-3 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-surface/80 group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-none bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Users className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">View Board & PTM Guide</div>
                        <div className="text-[10px] text-foreground-muted font-normal">Home routines & teacher discussion questions</div>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                </Card>

                {/* ── CARD 3: Diagnostic Precision & Audit — Emerald accent ── */}
                <Card
                  className="p-5 md:p-6 border border-border border-l-2 bg-card flex flex-col justify-between hover:-translate-y-0.5 hover:border-border-strong transition-all duration-200 hub-card-3"
                  style={{ borderLeftColor: 'var(--color-ok, #7FCBA0)' }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                        Psychometric Audit
                      </span>
                      <FileCheck className="size-4 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-display text-foreground">
                          {snapshot.overallScore || benchmark.aggregateScaledScore}
                        </span>
                        <span className="text-xs font-mono text-foreground-muted">/ 900</span>
                        <span className="text-xs font-semibold text-primary ml-auto font-mono">
                          🇮🇳 {ordinal(indiaPercentile)} %ile
                        </span>
                      </div>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        {correctCount} of {totalCount} scenarios answered correctly ({Math.round((correctCount / totalCount) * 100)}%)
                      </p>
                    </div>

                    {/* Efferd ShareBarList: Cohort Score Distribution */}
                    <div className="space-y-1.5 pt-1 border-t border-border">
                      <div className="flex items-center justify-between text-[10px] font-mono text-foreground-muted">
                        <span>Cohort Benchmarks</span>
                        <span>Score / 900</span>
                      </div>
                      <ShareBarList className="gap-1">
                        <ShareBarListItem value={Math.round(((snapshot.overallScore || benchmark.aggregateScaledScore) / 900) * 100)}>
                          <ShareBarListFill isHighlight />
                          <ShareBarListContent>
                            <ShareBarListLabel className="font-semibold text-primary">
                              Candidate Scaled Score
                            </ShareBarListLabel>
                            <ShareBarListValue className="text-primary">
                              {snapshot.overallScore || benchmark.aggregateScaledScore}
                            </ShareBarListValue>
                          </ShareBarListContent>
                        </ShareBarListItem>
                        <ShareBarListItem value={Math.round((510 / 900) * 100)}>
                          <ShareBarListFill />
                          <ShareBarListContent>
                            <ShareBarListLabel>
                              🇮🇳 India 50th %ile
                            </ShareBarListLabel>
                            <ShareBarListValue>510</ShareBarListValue>
                          </ShareBarListContent>
                        </ShareBarListItem>
                        <ShareBarListItem value={Math.round((485 / 900) * 100)}>
                          <ShareBarListFill />
                          <ShareBarListContent>
                            <ShareBarListLabel>
                              Class {snapshot.classLevel} Cohort Mean
                            </ShareBarListLabel>
                            <ShareBarListValue>485</ShareBarListValue>
                          </ShareBarListContent>
                        </ShareBarListItem>
                        <ShareBarListItem value={Math.round((690 / 900) * 100)}>
                          <ShareBarListFill />
                          <ShareBarListContent>
                            <ShareBarListLabel>
                              🇸🇬 Singapore SASMO 75th %ile
                            </ShareBarListLabel>
                            <ShareBarListValue>690</ShareBarListValue>
                          </ShareBarListContent>
                        </ShareBarListItem>
                      </ShareBarList>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('audit')}
                    className="w-full text-left pt-3.5 mt-4 border-t border-border -mx-5 -mb-5 px-5 py-3 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-surface/80 group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-none bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileCheck className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">Review Question Audit ({totalCount})</div>
                        <div className="text-[10px] text-foreground-muted font-normal">3PL IRT latent theta & distractor traps</div>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                </Card>
              </div>

              {/* Secondary Row: PARAKH 360° WebVitals Grid & Quick Socratic Assist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* PARAKH 360° Radar Chart */}
                <Card className="md:col-span-2 p-5 border border-border bg-card hub-parakh">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-secondary">
                        PARAKH 360° Holistic Assessment Framework
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-mono font-semibold">NEP 2020</span>
                    </div>
                    <span className="text-[11px] text-foreground-muted font-mono">Calibrated vs Class {snapshot.classLevel} Baseline</span>
                  </div>
                  <ParakhRadarChart pillars={parakhVitals} baseline={50} />
                </Card>

                {/* Socratic Tutor & Fast Actions */}
                <Card className="p-5 border border-border bg-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Sparkles className="size-4" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        Nemotron Socratic Tutor
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      Need Live Socratic Explanations?
                    </h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Nemotron walks candidate and parents through distractor traps step-by-step using first principles.
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border space-y-2">
                    <Button
                      size="sm"
                      onClick={() => setIsTutorOpen(true)}
                      className="w-full gap-2 text-xs font-semibold"
                    >
                      <Sparkles className="size-3.5" />
                      <span>Launch Socratic Tutor</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('trajectory')}
                      className="w-full gap-2 text-xs font-semibold"
                    >
                      <TrendingUp className="size-3.5" />
                      <span>View Longitudinal Arc</span>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══════════════════ 1-PAGE SUMMARY SCREEN PREVIEW ══════════════════ */}
          {!aiGenerating && activeTab === 'onepage' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-3.5 bg-surface border border-border text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    1-Page Executive Summary (Print-Ready Preview)
                  </span>
                  <span className="hidden md:inline text-[10px] font-mono text-foreground-muted">
                    Exact single-page brief for students, parents & PTM discussions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs font-semibold">
                    <Printer className="size-3.5" /> Print Single Page
                  </Button>
                </div>
              </div>

              <div className="shadow-sm">
                <OnePagePrintSummary
                  studentName={studentName}
                  classLevel={snapshot.classLevel}
                  completedAt={snapshot.completedAt}
                  totalTimeMs={snapshot.totalTimeMs}
                  overallScore={snapshot.overallScore || benchmark.aggregateScaledScore}
                  abilityTheta={benchmark.abilityTheta}
                  benchmark={benchmark}
                  studentVariant={studentVariant}
                  parentVariant={parentVariant}
                  responses={assessmentData.responses || []}
                />
              </div>
            </div>
          )}

          {/* ══════════════════ INDIVIDUAL FOCUSED TABS ══════════════════ */}
          {!aiGenerating && activeTab === 'student' && (
            <StudentVariant
              studentVariant={studentVariant}
              benchmark={benchmark}
              classLevel={snapshot.classLevel}
            />
          )}

          {!aiGenerating && activeTab === 'parent' && (
            <ParentVariant
              parentVariant={parentVariant}
              benchmark={benchmark}
              classLevel={snapshot.classLevel}
            />
          )}

          {!aiGenerating && activeTab === 'audit' && (
            <ScenarioAudit
              responses={assessmentData.responses || []}
              overallScore={snapshot.overallScore || benchmark.aggregateScaledScore}
              classLevel={snapshot.classLevel}
              nationalPercentile={benchmark.indiaNationalPercentile || benchmark.regionalPercentiles?.India || 68}
              boardGrade={benchmark.boardGradeBand?.grade || 'A2'}
              onAskTutor={(scenarioIdx) => {
                setSelectedTutorScenarioIndex(scenarioIdx);
                setIsTutorOpen(true);
              }}
            />
          )}

          {!aiGenerating && activeTab === 'trajectory' && (
            <TrajectoryArc
              studentId={assessmentData.student_id}
              currentAssessmentId={assessmentData.id}
              currentScore={snapshot.overallScore}
              classLevel={snapshot.classLevel}
            />
          )}
        </main>

        {/* ══════════════════ DYNAMIC PRINT DOSSIER ══════════════════ */}
        <div className="hidden print:block print-dossier p-0 space-y-8">
          {printMode === 'one-page' ? (
            <div className="print-avoid-break">
              <OnePagePrintSummary
                studentName={studentName}
                classLevel={snapshot.classLevel}
                completedAt={snapshot.completedAt}
                totalTimeMs={snapshot.totalTimeMs}
                overallScore={snapshot.overallScore || benchmark.aggregateScaledScore}
                abilityTheta={benchmark.abilityTheta}
                benchmark={benchmark}
                studentVariant={studentVariant}
                parentVariant={parentVariant}
                responses={assessmentData.responses || []}
              />
            </div>
          ) : (
            <>
              {/* PAGE 1: EXECUTIVE 1-PAGE SUMMARY */}
              <section className="print-avoid-break">
                <OnePagePrintSummary
                  studentName={studentName}
                  classLevel={snapshot.classLevel}
                  completedAt={snapshot.completedAt}
                  totalTimeMs={snapshot.totalTimeMs}
                  overallScore={snapshot.overallScore || benchmark.aggregateScaledScore}
                  abilityTheta={benchmark.abilityTheta}
                  benchmark={benchmark}
                  studentVariant={studentVariant}
                  parentVariant={parentVariant}
                  responses={assessmentData.responses || []}
                />
              </section>

              {/* PAGE 2: STUDENT COGNITIVE PROFILE & 30-DAY SPRINT */}
              <section className="space-y-4 print-break-before pt-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                      PAGE 2 · CANDIDATE PROFILE
                    </span>
                    <h2 className="text-base font-bold font-display text-foreground">
                      Student Cognitive Profile & 30-Day Action Sprint
                    </h2>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    Class {snapshot.classLevel} · {studentName}
                  </span>
                </div>
                <StudentVariant
                  studentVariant={studentVariant}
                  benchmark={benchmark}
                  classLevel={snapshot.classLevel}
                />
              </section>

              {/* PAGE 3: PARENT EDUCATIONAL BLUEPRINT & BOARD ALIGNMENT */}
              <section className="space-y-4 print-break-before pt-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                      PAGE 3 · PARENT BLUEPRINT
                    </span>
                    <h2 className="text-base font-bold font-display text-foreground">
                      Parent Educational Blueprint & Board Alignment (NEP 2020 / PARAKH)
                    </h2>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    CBSE / ICSE / Global Benchmarking
                  </span>
                </div>
                <ParentVariant
                  parentVariant={parentVariant}
                  benchmark={benchmark}
                  classLevel={snapshot.classLevel}
                />
              </section>

              {/* PAGE 4: SCENARIO DIAGNOSTIC AUDIT */}
              <section className="space-y-4 print-break-before pt-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                      PAGE 4 · DIAGNOSTIC AUDIT
                    </span>
                    <h2 className="text-base font-bold font-display text-foreground">
                      Scenario Diagnostic Audit & Distractor Traps
                    </h2>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    Item Response Theory (3PL IRT) Psychometric Transparency
                  </span>
                </div>
                <ScenarioAudit
                  responses={assessmentData.responses || []}
                  overallScore={snapshot.overallScore || benchmark.aggregateScaledScore}
                  classLevel={snapshot.classLevel}
                  nationalPercentile={benchmark.indiaNationalPercentile || benchmark.regionalPercentiles?.India || 68}
                  boardGrade={benchmark.boardGradeBand?.grade || 'A2'}
                  onAskTutor={(scenarioIdx) => {
                    setSelectedTutorScenarioIndex(scenarioIdx);
                    setIsTutorOpen(true);
                  }}
                />
              </section>
            </>
          )}
        </div>

        {/* ── Footer controls ── */}
        <footer className="no-print print:hidden mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.search = '?dashboard')}
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-medium bg-muted text-foreground-secondary border border-border">
              <Sparkles className="size-3 text-primary" /> Synthesized with NVIDIA Nemotron-70B Psychometric Intelligence
            </span>
          </div>

          <div className="flex gap-3">
            <PDFExportButton
              targetId="report-printable-area"
              studentName={studentName}
              classLevel={snapshot.classLevel}
            />
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="size-4" />
              Print Dossier
            </Button>
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
          initialScenarioIndex={selectedTutorScenarioIndex}
          initialMode={activeTab === 'parent' ? 'parent' : 'student'}
          recentScenarios={assessmentData?.responses || []}
        />
      </div>
    </div>
  );
}
