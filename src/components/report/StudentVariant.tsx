import { Card } from '../ui/card';
import { Sparkles, Compass, AlertCircle, Target, Flame, Cpu, Bot, Layers, Leaf } from 'lucide-react';
import { CompetencyRadarChart } from '../CompetencyChart';

interface StudentVariantProps {
  studentName?: string;
  parentName?: string;
  studentVariant?: any;
  benchmark?: any;
  overallScore?: number;
  classLevel: number;
}

export function StudentVariant({ studentName, parentName, studentVariant, benchmark, overallScore, classLevel = 8 }: StudentVariantProps) {
  const archetypeTitle = studentVariant?.archetypeTitle || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || 'Deconstructs multi-variable systems with structural precision';
  const summary = studentVariant?.summary || 'Consistently demonstrates strong structural awareness when approaching complex, multi-step problems.';
  const primaryStrength = 'Parameter isolation & causal inference';
  const criticalBlindspot = 'Premature optimization under time pressure';

  const strengths: string[] = studentVariant?.keyStrengths || [
    primaryStrength,
    'Consistent execution on first-principles reasoning.',
    'High resilience through non-linear parameter shifts.'
  ];

  const blindspots: string[] = studentVariant?.blindspots || [
    criticalBlindspot,
    'Tendency to rely on visual intuition in non-linear scale changes.',
    'Vulnerability to distractor options engineered around formula shortcuts.'
  ];

  const sprintEntries = Object.entries(studentVariant?.challengeSprint || {});

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Student Header ── */}
      {studentName && (
        <Card className="p-4 bg-surface border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">Candidate</p>
            <p className="font-display font-medium text-lg">{studentName}</p>
          </div>
          {parentName && (
            <div>
              <p className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">Parent / Guardian</p>
              <p className="font-display font-medium text-lg">{parentName}</p>
            </div>
          )}
          {overallScore !== undefined && (
            <div className="text-right">
              <p className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">Global Score</p>
              <p className="font-display font-medium text-lg">{overallScore}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Cognitive Profile Hero ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 md:p-8 border border-border bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-primary">Cognitive Profile</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              {archetypeTitle}
            </h2>
            <p className="text-sm text-foreground-secondary italic mt-1 font-medium">
              "{archetypeTagline}"
            </p>
            <div className="mt-4 text-sm leading-relaxed text-foreground-secondary whitespace-pre-wrap">
              {summary}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-foreground-secondary" />
              <span className="font-semibold text-foreground">
                Primary Superpower: <span className="font-normal text-foreground-secondary">{primaryStrength}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-surface border border-border text-foreground font-semibold font-mono text-[11px]">
              <span>🇮🇳 All-India Standing: Top {Math.max(1, 100 - (benchmark.indiaNationalPercentile || benchmark.regionalPercentiles?.India || 68))}% ({benchmark.indiaNationalPercentile || 68}th Percentile)</span>
              {benchmark.boardGradeBand && (
                <span className="ml-1 text-primary">· Grade {benchmark.boardGradeBand.grade}</span>
              )}
            </div>
          </div>
        </Card>

        {/* ── Competency Radar Chart ── */}
        <Card className="p-5 flex flex-col justify-between bg-card border border-border">
          <div className="border-b border-border pb-2 px-1">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground-secondary">
              Competency Radar (Class {classLevel})
            </h3>
            <p className="text-[10px] text-foreground-muted">Comparative Ability vs International &amp; National Cohorts</p>
          </div>
          <div className="py-2 flex items-center justify-center">
            <CompetencyRadarChart
              data={benchmark.radarData}
              competencyBreakdown={benchmark.competencyBreakdown}
            />
          </div>
        </Card>
      </div>

      {/* ── Strengths & Blindspots ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center gap-2 mb-4 text-foreground">
            <Compass className="size-4 text-primary" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">
              Verified Cognitive Strengths
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-foreground-secondary">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-surface border border-border text-foreground font-mono font-bold text-xs mt-0.5">
                  ✓
                </span>
                <span className="leading-snug">{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center gap-2 mb-4 text-foreground">
            <AlertCircle className="size-4 text-foreground-secondary" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">
              Cognitive Blindspots & Distractor Traps
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-foreground-secondary">
            {blindspots.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-surface border border-border text-foreground font-mono font-bold text-xs mt-0.5">
                  !
                </span>
                <span className="leading-snug">{str}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── 30-Day Guided Sprint ── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Target className="size-5" />
            <div>
              <h2 className="text-base font-bold font-display uppercase tracking-wider text-foreground">
                Your Personalized 30-Day Level-Up Sprint (Class {classLevel})
              </h2>
              <p className="text-xs text-foreground-secondary">
                Weekly deliberate practice missions mapped to CBSE/ICSE curriculum and competitive problem-solving
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sprintEntries.map(([weekKey, sprint]: [string, any], idx) => (
            <div
              key={weekKey}
              className="rounded-none border border-border bg-surface p-4 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
                  <span>Week {idx + 1}</span>
                  <span className="text-foreground-muted font-normal text-[10px]">7 Days</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1 leading-snug">
                  {sprint.title}
                </h4>
                <p className="text-[11px] font-medium text-foreground-secondary mb-3">
                  Focus: <span className="text-foreground font-semibold">{sprint.focus}</span>
                </p>
                <p className="text-xs text-foreground-secondary leading-relaxed border-t border-border/50 pt-2">
                  {sprint.mission}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4 Frontier Pillars of 21st Century STEM ── */}
      {/* ── 4 Frontier Pillars of 21st Century STEM ── */}
      <Card className="p-6 md:p-8 bg-card border border-border">
        <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
          <Cpu className="size-4 text-primary" />
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">
              Frontier STEM Capability Index (Class {classLevel})
            </h3>
            <p className="text-[11px] text-foreground-secondary">
              Evaluated across 4 foundational pillars: Algorithmic Logic, Physical Mechanics, Spatial Modeling, and Sustainable Systems
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-none bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-mono">
                  <Cpu className="size-3.5 text-primary" /> AI & Data
                </span>
                <span className="text-xs font-mono tabular font-bold text-foreground">
                  {benchmark.frontierPillars?.aiDataLiteracy?.index ?? 75}/100
                </span>
              </div>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono border border-border text-foreground-secondary mb-2">
                {benchmark.frontierPillars?.aiDataLiteracy?.tier ?? 'Frontier Ready'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.aiDataLiteracy?.details ?? 'Algorithmic decomposition, invariant tracking, and probabilistic deduction.'}
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-none bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-mono">
                  <Bot className="size-3.5 text-foreground-secondary" /> Robotics
                </span>
                <span className="text-xs font-mono tabular font-bold text-foreground">
                  {benchmark.frontierPillars?.roboticsAutomation?.index ?? 68}/100
                </span>
              </div>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono border border-border text-foreground-secondary mb-2">
                {benchmark.frontierPillars?.roboticsAutomation?.tier ?? 'Developing Competency'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.roboticsAutomation?.details ?? 'Kinematic constraints, sensor feedback loops, and actuator power trade-offs.'}
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-none bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-mono">
                  <Layers className="size-3.5 text-foreground-secondary" /> XR Modeling
                </span>
                <span className="text-xs font-mono tabular font-bold text-foreground">
                  {benchmark.frontierPillars?.xrSimulation?.index ?? 72}/100
                </span>
              </div>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono border border-border text-foreground-secondary mb-2">
                {benchmark.frontierPillars?.xrSimulation?.tier ?? 'Frontier Ready'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.xrSimulation?.details ?? 'Multi-dimensional geometry, virtual dynamic modeling, and physical wave interactions.'}
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-none bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-mono">
                  <Leaf className="size-3.5 text-foreground-secondary" /> Sustainable
                </span>
                <span className="text-xs font-mono tabular font-bold text-foreground">
                  {benchmark.frontierPillars?.smartSustainableSystems?.index ?? 65}/100
                </span>
              </div>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono border border-border text-foreground-secondary mb-2">
                {benchmark.frontierPillars?.smartSustainableSystems?.tier ?? 'Developing Competency'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.smartSustainableSystems?.details ?? 'Closed-loop energy grids, ecological feedback dynamics, and climate resilience.'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
