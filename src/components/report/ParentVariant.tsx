import { Card } from '../ui/card';
import {
  AlertCircle,
  BookOpen,
  Clock,
  Target,
  Globe,
  Layers,
  TrendingUp,
  GraduationCap,
  MessageSquareQuote,
  ShieldAlert,
} from 'lucide-react';
import { RegionalBenchmarkBarChart, BenchmarkLegend } from '../CompetencyChart';

interface ParentVariantProps {
  studentName?: string;
  parentName?: string;
  parentVariant?: any;
  benchmark?: any;
  overallScore?: number;
  classLevel: number;
}

export function ParentVariant({ studentName, parentName, parentVariant, benchmark = {}, overallScore, classLevel }: ParentVariantProps) {
  const realityCheck = parentVariant?.realityCheck || {};
  const blueprint = parentVariant?.parentActionBlueprint || {};
  const regionalPercentiles = parentVariant?.regionalPercentiles || {};

  const verdict = realityCheck.verdict || 'Developing Foundation';
  const honestSummary = parentVariant?.realityCheckSummary || realityCheck.honestSummary;
  const internationalGapSummary = parentVariant?.internationalGapSummary || realityCheck.internationalGapSummary;
  const gradeInflationWarning = parentVariant?.gradeInflationWarning || realityCheck.gradeInflationWarning;

  const curricula = parentVariant?.recommendedCurricula || blueprint.recommendedCurricula || [];
  const indianCurricula = parentVariant?.indianRecommendedCurricula || blueprint.indianRecommendedCurricula || [];
  const homeRoutines = parentVariant?.immediateHomeRoutines || blueprint.immediateHomeRoutines || [];
  const indianHomeRoutines = parentVariant?.indianHomeRoutines || blueprint.indianHomeRoutines || [];
  const ptmGuide = parentVariant?.ptmDiscussionGuide || blueprint.ptmDiscussionGuide || [];
  const streamInfo = parentVariant?.streamOrientation || blueprint.streamOrientation;
  const quarterlyMilestones = blueprint.quarterlyMilestones || [];

  const boardGradeBand = benchmark?.boardGradeBand || parentVariant?.benchmark?.boardGradeBand || parentVariant?.boardGradeBand;
  const parakh = benchmark?.parakhHolisticPillars || parentVariant?.benchmark?.parakhHolisticPillars || parentVariant?.parakhHolisticPillars;
  const competitive = benchmark?.indianCompetitiveFoundation || parentVariant?.benchmark?.indianCompetitiveFoundation || parentVariant?.indianCompetitiveFoundation;
  const indiaPercentile = benchmark?.indiaNationalPercentile || parentVariant?.benchmark?.indiaNationalPercentile || parentVariant?.indiaNationalPercentile || regionalPercentiles.India || 68;

  const isEnglish = (parentVariant?.subject || '').toLowerCase().includes('english');
  const mathGap = isEnglish
    ? (parentVariant?.competencyBreakdown?.understanding?.singaporeGapSigma ?? -0.5)
    : (parentVariant?.competencyBreakdown?.mathematicalReasoning?.singaporeGapSigma ?? -0.6);
  const compGap = isEnglish
    ? (parentVariant?.competencyBreakdown?.synthesis?.singaporeGapSigma ?? -0.4)
    : (parentVariant?.competencyBreakdown?.computationalThinking?.singaporeGapSigma ?? -0.4);

  const gapLabel1 = isEnglish ? 'Reading Comprehension Gap:' : 'Singapore Mathematical Gap:';
  const gapLabel2 = isEnglish ? 'Synthesis & Integration Gap:' : 'Singapore Computational Gap:';
  const calibrationSubtitle = isEnglish
    ? 'Calibrated against CBSE/ICSE National Standards, Cambridge English, and Singapore MOE'
    : 'Calibrated against Indian National Standards (CBSE/ICSE/PARAKH), Singapore SASMO, and US AMC 8';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Parent Header ── */}
      {studentName && parentName && (
        <Card className="p-4 bg-surface border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">Candidate</p>
            <p className="font-display font-medium text-lg">{studentName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">Parent / Guardian</p>
            <p className="font-display font-medium text-lg">{parentName}</p>
          </div>
          {overallScore !== undefined && (
            <div className="text-right">
              <p className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">Global Score</p>
              <p className="font-display font-medium text-lg">{overallScore}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Direct Truth & Reality Check ── */}
      <Card className="p-6 md:p-8 bg-card border-border">
        <div className="flex items-center gap-2 mb-4 text-foreground">
          <AlertCircle className="size-4 text-primary" />
          <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">
            Executive Diagnostic for Parents: Beyond 95% School Marks
          </h2>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-foreground-secondary">
          {/* Diagnostic Verdict & Grade Band */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-foreground-secondary block">
                Diagnostic Verdict
              </span>
              <span className="font-bold font-display text-foreground text-lg">
                {verdict}
              </span>
            </div>

            {boardGradeBand && (
              <div className="text-right">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary block">
                  CBSE / ICSE Grade Band
                </span>
                <span className="font-mono font-bold text-lg text-primary">
                  Grade {boardGradeBand.grade} ({boardGradeBand.band})
                </span>
              </div>
            )}
          </div>

          <p className="leading-relaxed">{honestSummary}</p>
          <p className="leading-relaxed">{internationalGapSummary}</p>

          {/* Indian Competitive Standing */}
          {competitive && (
            <div className="pt-4 border-t border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-foreground flex items-center gap-1.5">
                  <Target className="size-3.5 text-primary" /> All-India Competitive Standing (Class {classLevel})
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-surface border border-border text-foreground">
                  {competitive.badge}
                </span>
              </div>
              <p className="text-xs text-foreground font-semibold">
                {competitive.tier}
              </p>
              <p className="text-xs text-foreground-secondary">
                {competitive.description}
              </p>
              <p className="text-[11px] text-primary pt-0.5 font-medium">
                <strong>Next Step:</strong> {competitive.recommendation}
              </p>
            </div>
          )}

          {/* The Ratta Reality Check */}
          <div className="pt-4 border-t border-border text-xs text-foreground-secondary leading-relaxed">
            <div className="flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-foreground mb-1">
              <ShieldAlert className="size-4 text-foreground-secondary" />
              The "Ratta" (Rote Learning) Reality Check
            </div>
            <p>{gradeInflationWarning}</p>
          </div>
        </div>
      </Card>

      {/* ── PARAKH 360° Holistic Progress Card (NEP 2020) ── */}
      {parakh && (
        <Card className="p-6 md:p-8 bg-surface border-border">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
            <Layers className="size-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                PARAKH 360° Holistic Progress Assessment (NEP 2020)
              </h3>
              <p className="text-xs text-foreground-secondary">
                Evaluates your child across Foundational Recall, Application, and Higher-Order Thinking Skills (HOTS)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="p-4 bg-accent/20 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">
                    1. Conceptual Recall
                  </span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {parakh.conceptualKnowledge?.score}/100
                  </span>
                </div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary mb-2">
                  {parakh.conceptualKnowledge?.level}
                </span>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {parakh.conceptualKnowledge?.description}
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 bg-accent/20 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">
                    2. Numerical Application
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-500">
                    {parakh.applicationAndProblemSolving?.score}/100
                  </span>
                </div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  {parakh.applicationAndProblemSolving?.level}
                </span>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {parakh.applicationAndProblemSolving?.description}
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 bg-accent/20 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">
                    3. HOTS & Trap Immunity
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-500">
                    {parakh.higherOrderThinkingSkills?.score}/100
                  </span>
                </div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
                  {parakh.higherOrderThinkingSkills?.level}
                </span>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {parakh.higherOrderThinkingSkills?.description}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── International & National Standings Bar Chart & Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-surface border-border">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  National & International Standings (Class {classLevel})
                </h3>
              </div>
              <p className="text-[11px] text-foreground-secondary mt-0.5">
                {calibrationSubtitle}
              </p>
            </div>
          </div>
          <RegionalBenchmarkBarChart regionalPercentiles={regionalPercentiles} />
          <BenchmarkLegend />
        </Card>

        {/* Direct Comparative Standing Metrics */}
        <Card className="p-6 flex flex-col justify-between bg-surface border-border">
          <div className="border-b border-border pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Where Your Child Stands
            </h3>
            <p className="text-[10px] text-foreground-secondary">
              National & International Percentile Standing
            </p>
          </div>

          <div className="space-y-3 py-4">
            {/* India */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-secondary font-semibold">🇮🇳 All-India Standing</span>
                <span className="font-mono font-bold text-primary">{indiaPercentile}th pct</span>
              </div>
              <div className="h-1.5 w-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${indiaPercentile}%` }}
                />
              </div>
              {boardGradeBand && (
                <p className="text-[10px] text-foreground-muted">Board Equiv: Grade {boardGradeBand.grade} - {boardGradeBand.band}</p>
              )}
            </div>

            {/* Singapore */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-secondary font-semibold">🇸🇬 Singapore SASMO</span>
                <span className="font-mono font-bold text-foreground">{regionalPercentiles.Singapore || 50}th pct</span>
              </div>
              <div className="h-1.5 w-full bg-border overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${regionalPercentiles.Singapore || 50}%`, backgroundColor: 'var(--color-c1)' }}
                />
              </div>
            </div>

            {/* Global */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-secondary font-semibold">🌐 Global (PISA/TIMSS)</span>
                <span className="font-mono font-bold text-primary">{benchmark.globalPercentile || 50}th pct</span>
              </div>
              <div className="h-1.5 w-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary opacity-60 transition-all duration-700"
                  style={{ width: `${benchmark.globalPercentile || 50}%` }}
                />
              </div>
            </div>

            {/* USA */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-secondary font-semibold">🇺🇸 USA AMC 8</span>
                <span className="font-mono font-bold text-foreground">{regionalPercentiles.USA || 50}th pct</span>
              </div>
              <div className="h-1.5 w-full bg-border overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${regionalPercentiles.USA || 50}%`, backgroundColor: 'var(--color-c5)' }}
                />
              </div>
            </div>

            {/* Sigma gap section */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-secondary">{gapLabel1}</span>
                <span className={`font-mono font-bold text-[11px] ${mathGap >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {mathGap > 0 ? '+' : ''}{mathGap}σ
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-secondary">{gapLabel2}</span>
                <span className={`font-mono font-bold text-[11px] ${compGap >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {compGap > 0 ? '+' : ''}{compGap}σ
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 text-[10px] text-foreground-muted leading-relaxed">
            A 0.5σ gap ≈ 17 percentile points vs. top Asian cohorts. Targeted non-routine practice closes this in 8–12 weeks.
          </div>
        </Card>
      </div>

      {/* ── Recommended Curricula & Reference Books for Indian Students ── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <BookOpen className="size-5 text-primary" />
          <div>
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-foreground">
              Recommended Reference Books & Learning Resources (Class {classLevel})
            </h3>
            <p className="text-xs text-foreground-secondary">
              Curated Indian board materials and competitive Olympiad platforms to build conceptual transfer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(indianCurricula.length > 0 ? indianCurricula : curricula).map((item: any, i: number) => (
            <div
              key={i}
              className="rounded-none border border-border p-4 space-y-2 bg-surface hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none bg-primary/10 text-primary">
                  {item.category || 'Verified'}
                </span>
              </div>
              <p className="text-xs text-primary font-medium">{item.urlDescription || item.url}</p>
              <p className="text-xs text-foreground-secondary leading-relaxed pt-1 border-t border-border/50">
                {item.purpose}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Home Study Blueprint & PTM Discussion Guide ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Study Routine */}
        <Card className="p-6 border-t-2 border-t-primary">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Clock className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Indian Home Study Routine (45 Mins Daily)
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs text-foreground-secondary">
            {(indianHomeRoutines.length > 0 ? indianHomeRoutines : homeRoutines).map((routine: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="size-5 rounded-none bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{routine}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* PTM Action Checklist */}
        <Card className="p-6 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <MessageSquareQuote className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Parent-Teacher Meeting (PTM) Guide
            </h3>
          </div>
          <p className="text-xs text-foreground-secondary mb-3">
            Ask these 4 high-impact questions to your child's school teacher at the next PTM:
          </p>
          {(() => {
            const rawQuestions = ptmGuide.length > 0 ? ptmGuide : quarterlyMilestones;
            const validQuestions = (Array.isArray(rawQuestions) ? rawQuestions : [])
              .map(q => (typeof q === 'string' ? q : (q && typeof q === 'object' && ('title' in q || 'description' in q)) ? `${q.title ? q.title + ': ' : ''}${q.description || ''}` : ''))
              .filter(Boolean);
            if (validQuestions.length === 0) {
              return <p className="text-xs text-foreground-muted">No discussion questions available.</p>;
            }
            return (
              <ul className="space-y-3.5 text-xs text-foreground-secondary">
                {validQuestions.map((ptmQ: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-5 rounded-none bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                      Q{i + 1}
                    </span>
                    <span className="leading-snug">{ptmQ}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </Card>
      </div>

      {/* ── Higher Education & Career Stream Orientation ── */}
      {streamInfo && (
        <Card className="p-6 bg-surface border-border">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <GraduationCap className="size-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Future Academic & Career Stream Orientation
              </h3>
              <p className="text-xs text-foreground-secondary">
                Early aptitude indicators based on cognitive reasoning vectors
              </p>
            </div>
          </div>

          <div className="p-4 bg-accent/20 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                Primary Direction: {streamInfo.topStream}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary">
                Class 8–10 Foundation
              </span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              {streamInfo.description}
            </p>
            <p className="text-xs text-primary font-medium pt-1 border-t border-border/50">
              <strong>Curriculum Focus:</strong> {streamInfo.subjectFocus}
            </p>
          </div>
        </Card>
      )}

      {/* ── IEEE Model of Domain Learning (MDL) Progression ── */}
      <Card className="p-6 bg-surface border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <TrendingUp className="size-4 text-emerald-500" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Domain Learning Progression (IEEE MDL Framework)
              </h3>
              <p className="text-[11px] text-foreground-secondary">
                Transitioning from routine problem solving to autonomous mastery
              </p>
            </div>
          </div>

          {/* Stage Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 mb-4 text-center">
            {(['Acclimation', 'Competency', 'Proficiency', 'Mastery'] as const).map((stage, idx) => {
              const currentStage = benchmark.ieeeMdlStage?.stage ?? 'Competency';
              const stages = ['Acclimation', 'Competency', 'Proficiency', 'Mastery'];
              const isCurrent = currentStage === stage;
              const isPassed = stages.indexOf(currentStage) >= idx;

              return (
                <div key={stage} className="space-y-1">
                  <div
                    className={`h-2 rounded-none transition-colors ${
                      isCurrent
                        ? 'bg-primary ring-2 ring-primary/30'
                        : isPassed
                        ? 'bg-emerald-500'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold block ${
                      isCurrent ? 'text-primary' : isPassed ? 'text-foreground' : 'text-foreground-muted'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-xs text-foreground-secondary">
            <div className="p-2.5 rounded-none bg-accent/20 border border-border">
              <span className="font-bold text-foreground block mb-0.5">Current Domain Knowledge Depth:</span>
              <p className="text-[11px]">{benchmark.ieeeMdlStage?.domainKnowledgeDepth ?? 'Structured foundational knowledge with emerging multi-variable synthesis.'}</p>
            </div>
            <div className="p-2.5 rounded-none bg-accent/20 border border-border">
              <span className="font-bold text-foreground block mb-0.5">Strategic Processing & Metacognition:</span>
              <p className="text-[11px]">{benchmark.ieeeMdlStage?.strategicProcessing ?? 'Principled problem solving on familiar templates; needs non-routine challenge to reach Proficiency.'}</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] italic text-foreground-muted border-t border-border pt-3 mt-4">
          {benchmark.ieeeMdlStage?.progressionSummary ?? 'Transitioning toward next progression stage requires deliberate practice on non-routine multi-variable transfer.'}
        </p>
      </Card>
    </div>
  );
}
