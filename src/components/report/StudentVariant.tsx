import { Card } from '../ui/card';
import { Sparkles, Compass, AlertCircle, Target, Trophy, Flame, Cpu, Bot, Layers, Leaf } from 'lucide-react';
import { CompetencyRadarChart } from '../CompetencyChart';

interface StudentVariantProps {
  studentVariant?: any;
  benchmark: any;
  classLevel: number;
}

export function StudentVariant({ studentVariant, benchmark }: StudentVariantProps) {
  const archetypeTitle = studentVariant?.archetypeTitle || benchmark.cognitiveArchetype?.title || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || benchmark.cognitiveArchetype?.tagline || 'Deconstructs multi-variable systems with structural precision';
  const summary = studentVariant?.summary || benchmark.realityCheck?.honestSummary;
  const primaryStrength = benchmark.cognitiveArchetype?.primaryStrength || 'Parameter isolation & causal inference';
  const criticalBlindspot = benchmark.cognitiveArchetype?.criticalBlindspot || 'Premature optimization under time pressure';

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

  const sprintEntries = Object.entries(benchmark.studentChallengeSprint || {});

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Cognitive Profile Hero ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 md:p-8 border-l-4 border-l-primary flex flex-col justify-between relative overflow-hidden bg-linear-to-br from-surface to-accent/20">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy className="size-36" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Cognitive Profile</span>
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

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-6 text-xs">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-amber-500" />
              <span className="font-semibold text-foreground">
                Primary Superpower: <span className="font-normal text-foreground-secondary">{primaryStrength}</span>
              </span>
            </div>
          </div>
        </Card>

        {/* ── Competency Radar Chart ── */}
        <Card className="p-5 flex flex-col justify-between bg-surface border-border">
          <div className="border-b border-border pb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
              Competency Radar vs Singapore Elite
            </h3>
            <p className="text-[10px] text-foreground-muted">5-Dimension Latent Ability Vector (IRT θ)</p>
          </div>
          <div className="py-2 flex items-center justify-center">
            <CompetencyRadarChart data={benchmark.radarData} />
          </div>
          <div className="text-[10px] text-center text-foreground-muted border-t border-border pt-2">
            Dashed green outline: Singapore Top 10% benchmark standard
          </div>
        </Card>
      </div>

      {/* ── Strengths & Blindspots ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <Compass className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Your Verified Cognitive Strengths
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-foreground-secondary">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-emerald-500/10 text-emerald-500 font-bold text-xs mt-0.5">
                  ✓
                </span>
                <span className="leading-snug">{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border-t-2 border-t-amber-500">
          <div className="flex items-center gap-2 mb-4 text-amber-500">
            <AlertCircle className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Cognitive Blindspots & Distractor Traps
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-foreground-secondary">
            {blindspots.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-amber-500/10 text-amber-500 font-bold text-xs mt-0.5">
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
                Your Personalized 30-Day Level-Up Sprint
              </h2>
              <p className="text-xs text-foreground-secondary">
                Weekly deliberate practice missions to close latent skill gaps against Singapore & international cohorts
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

      {/* ── Nature (2026) 4 Frontier Pillars of 21st Century STEM ── */}
      <Card className="p-6 md:p-8 bg-surface border-border">
        <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
          <Cpu className="size-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Frontier STEM Capability Index (Nature 2026 / UN SDG 4.4)
            </h3>
            <p className="text-xs text-foreground-secondary">
              Evaluated across the 4 foundational pillars of next-generation technological readiness
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-none bg-accent/20 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                  <Cpu className="size-3.5" /> AI & Data Literacy
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {benchmark.frontierPillars?.aiDataLiteracy?.index ?? 75}/100
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary mb-2">
                {benchmark.frontierPillars?.aiDataLiteracy?.tier ?? 'Frontier Ready'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.aiDataLiteracy?.details ?? 'Algorithmic decomposition, invariant tracking, and probabilistic deduction.'}
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-none bg-accent/20 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5">
                  <Bot className="size-3.5" /> Robotics & Control
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {benchmark.frontierPillars?.roboticsAutomation?.index ?? 68}/100
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 mb-2">
                {benchmark.frontierPillars?.roboticsAutomation?.tier ?? 'Developing Competency'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.roboticsAutomation?.details ?? 'Kinematic constraints, sensor feedback loops, and actuator power trade-offs.'}
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-none bg-accent/20 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-sky-500 flex items-center gap-1.5">
                  <Layers className="size-3.5" /> XR & Simulation
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {benchmark.frontierPillars?.xrSimulation?.index ?? 72}/100
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-500 mb-2">
                {benchmark.frontierPillars?.xrSimulation?.tier ?? 'Frontier Ready'}
              </span>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {benchmark.frontierPillars?.xrSimulation?.details ?? 'Multi-dimensional geometry, virtual dynamic modeling, and physical wave interactions.'}
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-none bg-accent/20 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1.5">
                  <Leaf className="size-3.5" /> Smart & Sustainable
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {benchmark.frontierPillars?.smartSustainableSystems?.index ?? 65}/100
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-500 mb-2">
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
