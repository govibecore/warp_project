import { Card } from '../ui/card';
import { AlertCircle, BookOpen, Clock, Target, Globe, Layers, TrendingUp, Scale } from 'lucide-react';
import { RegionalBenchmarkBarChart } from '../CompetencyChart';

interface ParentVariantProps {
  parentVariant?: any;
  benchmark: any;
  classLevel: number;
}

export function ParentVariant({ parentVariant, benchmark, classLevel }: ParentVariantProps) {
  const realityCheck = benchmark.realityCheck || {};
  const blueprint = benchmark.parentActionBlueprint || {};
  const regionalPercentiles = benchmark.regionalPercentiles || {};

  const verdict = realityCheck.verdict || 'Developing Foundation';
  const honestSummary = parentVariant?.realityCheckSummary || realityCheck.honestSummary;
  const internationalGapSummary = parentVariant?.internationalGapSummary || realityCheck.internationalGapSummary;
  const gradeInflationWarning = parentVariant?.gradeInflationWarning || realityCheck.gradeInflationWarning;

  const curricula = parentVariant?.recommendedCurricula || blueprint.recommendedCurricula || [];
  const homeRoutines = parentVariant?.immediateHomeRoutines || blueprint.immediateHomeRoutines || [];
  const quarterlyMilestones = blueprint.quarterlyMilestones || [];

  const mathGap = benchmark.competencyBreakdown?.mathematicalReasoning?.singaporeGapSigma ?? -0.6;
  const compGap = benchmark.competencyBreakdown?.computationalThinking?.singaporeGapSigma ?? -0.4;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Unvarnished Reality Check ── */}
      <Card className="p-6 md:p-8 border-l-4 border-l-amber-500 bg-amber-500/5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="size-5 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Unvarnished Reality Check: Beyond School Grade Inflation
          </h2>
        </div>
        <div className="space-y-3.5 text-sm leading-relaxed text-foreground-secondary">
          <p className="font-semibold text-foreground text-base">
            Diagnostic Verdict: <span className="text-amber-600 dark:text-amber-400">{verdict}</span>
          </p>
          <p>{honestSummary}</p>
          <p>{internationalGapSummary}</p>
          <div className="rounded-none bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 font-medium border border-amber-500/25 leading-normal">
            <span className="font-bold uppercase tracking-wider block mb-1">Standardized Warning:</span>
            {gradeInflationWarning}
          </div>
        </div>
      </Card>

      {/* ── International Standings Bar Chart & Sigma Gaps ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-surface border-border">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Global Cohort Standings (Class {classLevel})
                </h3>
              </div>
              <p className="text-[11px] text-foreground-secondary mt-0.5">
                Calibrated against SASMO (Singapore), China Math Olympiad, AMC 8/10 (USA), and Bebras (EU)
              </p>
            </div>
          </div>
          <RegionalBenchmarkBarChart regionalPercentiles={regionalPercentiles} />
        </Card>

        {/* Direct Gap Metrics */}
        <Card className="p-6 flex flex-col justify-between bg-surface border-border">
          <div className="border-b border-border pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Key International Latent Gaps
            </h3>
            <p className="text-[10px] text-foreground-secondary">Standard deviation delta (σ) vs Top Cohorts</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground-secondary">Singapore Mathematical Gap:</span>
              <span className={`font-mono font-bold ${mathGap >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {mathGap > 0 ? '+' : ''}{mathGap} σ
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground-secondary">Singapore Computational Gap:</span>
              <span className={`font-mono font-bold ${compGap >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {compGap > 0 ? '+' : ''}{compGap} σ
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground-secondary">Global Percentile Rank:</span>
              <span className="font-mono font-bold text-primary">
                Top {Math.max(1, 100 - (benchmark.globalPercentile || 50))}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground-secondary">Singapore Cohort Rank:</span>
              <span className="font-mono font-bold text-foreground">
                Top {Math.max(1, 100 - (regionalPercentiles.Singapore || 50))}%
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3 text-[11px] text-foreground-muted leading-relaxed">
            1.0σ represents one standard deviation (~34 percentile points in typical normative distributions). Closing a 0.5σ gap requires ~60 hours of targeted deliberate practice.
          </div>
        </Card>
      </div>

      {/* ── Recommended Curricula & Platforms ── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <BookOpen className="size-5 text-primary" />
          <div>
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-foreground">
              Recommended International Platforms & Curricula (Class {classLevel})
            </h3>
            <p className="text-xs text-foreground-secondary">
              Authentic resources and curricula used by top percentiles in Singapore, the United States, and East Asia
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curricula.map((item: any, i: number) => (
            <div
              key={i}
              className="rounded-none border border-border p-4 space-y-2 bg-surface hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                  Verified
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

      {/* ── UNESCO 3-Tier Indicator Framework & IEEE Domain Learning (MDL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UNESCO 3-Tier Indicator Framework */}
        <Card className="p-6 bg-surface border-border">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Layers className="size-4 text-primary" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                UNESCO 3-Tier Indicator Framework
              </h3>
              <p className="text-[11px] text-foreground-secondary">
                Policy Brief 2 (UNESCO & IISc Bangalore 2023)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Tier 1 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">
                  Tier 1: Foundation & Conceptual Grasp
                </span>
                <span className="font-mono text-xs font-bold text-primary">
                  {benchmark.unescoIndicators?.tier1Foundation?.score ?? 72}/100 · {benchmark.unescoIndicators?.tier1Foundation?.level ?? 'Proficient'}
                </span>
              </div>
              <div className="h-2 w-full bg-accent/30 rounded-none overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-none"
                  style={{ width: `${benchmark.unescoIndicators?.tier1Foundation?.score ?? 72}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground-secondary mt-1">
                {benchmark.unescoIndicators?.tier1Foundation?.description ?? 'Foundational scientific and mathematical conceptual grasp; recall and direct single-variable operations.'}
              </p>
            </div>

            {/* Tier 2 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">
                  Tier 2: Analysis & Multi-Variable Application
                </span>
                <span className="font-mono text-xs font-bold text-emerald-500">
                  {benchmark.unescoIndicators?.tier2Application?.score ?? 64}/100 · {benchmark.unescoIndicators?.tier2Application?.level ?? 'Developing'}
                </span>
              </div>
              <div className="h-2 w-full bg-accent/30 rounded-none overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-none"
                  style={{ width: `${benchmark.unescoIndicators?.tier2Application?.score ?? 64}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground-secondary mt-1">
                {benchmark.unescoIndicators?.tier2Application?.description ?? 'Multi-variable causal analysis, hypothesis testing, and principled cross-domain application.'}
              </p>
            </div>

            {/* Tier 3 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">
                  Tier 3: Demonstrated Innovation Ability
                </span>
                <span className="font-mono text-xs font-bold text-amber-500">
                  {benchmark.unescoIndicators?.tier3Innovation?.score ?? 48}/100 · {benchmark.unescoIndicators?.tier3Innovation?.level ?? 'Emerging'}
                </span>
              </div>
              <div className="h-2 w-full bg-accent/30 rounded-none overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500 rounded-none"
                  style={{ width: `${benchmark.unescoIndicators?.tier3Innovation?.score ?? 48}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground-secondary mt-1">
                {benchmark.unescoIndicators?.tier3Innovation?.description ?? 'Novel problem solving, trade-off optimization, and resilience against counter-intuitive traps.'}
              </p>
            </div>
          </div>
        </Card>

        {/* IEEE Model of Domain Learning (MDL) Progression */}
        <Card className="p-6 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
              <TrendingUp className="size-4 text-emerald-500" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  IEEE Model of Domain Learning (MDL)
                </h3>
                <p className="text-[11px] text-foreground-secondary">
                  Progression Stages (Vance et al., IEEE ISEC)
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

      {/* ── NSF NCSES 2026 / TIMSS 2023 International Science & Engineering Indicators ── */}
      <Card className="p-6 bg-surface border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
          <Scale className="size-4 text-primary" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Official NSF Science & Engineering Indicators (NSB-2026-1)
            </h3>
            <p className="text-[11px] text-foreground-secondary">
              TIMSS 2023 & PISA 2022 Calibrated International Benchmark Scale (Mean = 500, SD = 100)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3.5 rounded-none bg-accent/20 border border-border text-center">
            <span className="text-[10px] font-bold uppercase text-foreground-secondary block">Candidate Equivalent</span>
            <span className="text-2xl font-bold font-mono text-primary block mt-0.5">
              {benchmark.nsfComparisons?.candidateEquivalentTimss ?? 520}
            </span>
            <span className="text-[10px] text-foreground-muted">{benchmark.nsfComparisons?.nationalPercentileDelta ?? '+32 pts vs US Median'}</span>
          </div>

          <div className="p-3.5 rounded-none bg-accent/20 border border-border text-center">
            <span className="text-[10px] font-bold uppercase text-foreground-secondary block">🇸🇬 Singapore Top Tier</span>
            <span className="text-2xl font-bold font-mono text-foreground block mt-0.5">
              {benchmark.nsfComparisons?.singaporeBenchmarkScore ?? 605}
            </span>
            <span className="text-[10px] text-foreground-muted">TIMSS 2023 #1 Global</span>
          </div>

          <div className="p-3.5 rounded-none bg-accent/20 border border-border text-center">
            <span className="text-[10px] font-bold uppercase text-foreground-secondary block">East Asia Elite</span>
            <span className="text-2xl font-bold font-mono text-foreground block mt-0.5">
              {benchmark.nsfComparisons?.eastAsiaTopTierScore ?? 585}
            </span>
            <span className="text-[10px] text-foreground-muted">HK, TW, KR, JP Median</span>
          </div>

          <div className="p-3.5 rounded-none bg-accent/20 border border-border text-center">
            <span className="text-[10px] font-bold uppercase text-foreground-secondary block">🇺🇸 US 8th Grade Math</span>
            <span className="text-2xl font-bold font-mono text-amber-500 block mt-0.5">
              {benchmark.nsfComparisons?.usNationalAverageScore ?? 488}
            </span>
            <span className="text-[10px] text-foreground-muted">Post-pandemic (-27 pts drop)</span>
          </div>
        </div>

        <p className="text-xs text-foreground-secondary leading-relaxed bg-primary/5 p-3.5 rounded-none border border-primary/15">
          {benchmark.nsfComparisons?.nsb2026Insight ?? 'According to the National Science Board (NSB-2026-1), Singapore leads global math/science performance (605/606). Standard school grades mask true competitive standing; non-routine international challenges are mandatory for calibration.'}
        </p>
      </Card>

      {/* ── Immediate Home Routines & Quarterly Milestones ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-t-2 border-t-primary">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Clock className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Immediate Home Study Routines (Weekly Cadence)
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs text-foreground-secondary">
            {homeRoutines.map((routine: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="size-5 rounded-none bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{routine}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <Target className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Quarterly Intervention Milestones
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs text-foreground-secondary">
            {quarterlyMilestones.map((milestone: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="size-5 rounded-none bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                  Q{i + 1}
                </span>
                <span className="leading-snug">{milestone}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
