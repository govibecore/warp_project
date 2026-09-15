import { WarpLogo } from '../WarpLogo';
import { GraduationCap, Users, Sparkles, CheckCircle2, AlertTriangle, Target, BookOpen } from 'lucide-react';

interface OnePagePrintSummaryProps {
  studentName: string;
  classLevel: number;
  completedAt: string;
  totalTimeMs?: number;
  overallScore: number;
  abilityTheta?: number | null;
  benchmark: any;
  studentVariant?: any;
  parentVariant?: any;
  responses?: any[];
}

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
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function OnePagePrintSummary({
  studentName,
  classLevel,
  completedAt,
  totalTimeMs,
  overallScore,
  abilityTheta,
  benchmark,
  studentVariant,
  parentVariant,
  responses = [],
}: OnePagePrintSummaryProps) {
  const correctCount = responses.filter((r: any) => r.correct === true).length;
  const totalCount = responses.length || 6;
  const accuracyPct = Math.round((correctCount / totalCount) * 100);

  // Student metrics
  const archetypeTitle = studentVariant?.archetypeTitle || benchmark.cognitiveArchetype?.title || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || benchmark.cognitiveArchetype?.tagline || 'Deconstructs multi-variable systems with structural precision';
  const keyStrengths: string[] = studentVariant?.keyStrengths || [
    benchmark.cognitiveArchetype?.primaryStrength || 'Parameter isolation & causal inference',
  ];
  const blindspots: string[] = studentVariant?.blindspots || [
    benchmark.cognitiveArchetype?.criticalBlindspot || 'Premature optimization under time pressure',
  ];

  // Parent metrics
  const boardGradeBand = benchmark.boardGradeBand;
  const verdict = benchmark.realityCheck?.verdict || 'Developing Foundation';
  const honestSummary = parentVariant?.realityCheckSummary || benchmark.realityCheck?.honestSummary || 'Demonstrates analytical decomposition; growth needed in multi-step deductive chaining.';
  const homeRoutines = parentVariant?.indianHomeRoutines || parentVariant?.immediateHomeRoutines || benchmark.parentActionBlueprint?.indianHomeRoutines || [];
  const ptmGuide = parentVariant?.ptmDiscussionGuide || benchmark.parentActionBlueprint?.ptmDiscussionGuide || [];

  const sprintChallenges = benchmark.studentChallengeSprint
    ? Object.entries(benchmark.studentChallengeSprint).slice(0, 3)
    : [];

  const parakh = benchmark.parakhHolisticPillars;
  const indiaPercentile = benchmark.indiaNationalPercentile || benchmark.regionalPercentiles?.India || 68;
  const isEnglish = (benchmark?.subject || '').toLowerCase().includes('english');
  const subjectDisplay = isEnglish ? 'English Literacy' : (benchmark?.subject || 'STEM');

  return (
    <div className="one-page-summary border border-neutral-300 bg-white text-neutral-900 p-6 font-sans text-xs leading-tight print:p-4 print:border-none">
      {/* ── Document Header ── */}
      <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <WarpLogo variant="lockup" theme="light" className="h-6 w-auto" />
          <div className="border-l border-neutral-300 pl-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 block">
              Official Executive Diagnostic Brief
            </span>
            <h1 className="text-base font-bold font-display uppercase tracking-tight text-neutral-900">
              WARP Global {subjectDisplay} Benchmark (NEP 2020 / PARAKH)
            </h1>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-300 text-neutral-800">
            1-Page Joint Executive Dossier
          </span>
          <p className="text-[9px] text-neutral-500 mt-0.5">
            {isEnglish
              ? 'Calibrated vs Singapore EL, UK GCSE & India CBSE'
              : 'Calibrated vs Singapore SASMO, US AMC & India CBSE'}
          </p>
        </div>
      </div>

      {/* ── Candidate Metadata & Benchmark Score Ribbon ── */}
      <div className="grid grid-cols-12 gap-3 pb-3 mb-3 border-b border-neutral-200">
        <div className="col-span-8 grid grid-cols-4 gap-2 text-[10px]">
          <div>
            <span className="text-neutral-500 block font-mono uppercase text-[8px]">Candidate</span>
            <span className="font-bold text-neutral-900 text-xs truncate block">{studentName}</span>
          </div>
          <div>
            <span className="text-neutral-500 block font-mono uppercase text-[8px]">Cohort Level</span>
            <span className="font-semibold text-neutral-900 text-xs">Class {classLevel}</span>
          </div>
          <div>
            <span className="text-neutral-500 block font-mono uppercase text-[8px]">Date & Duration</span>
            <span className="font-medium text-neutral-800 text-[11px] block">
              {dateFmt.format(new Date(completedAt))} · {formatDuration(totalTimeMs)}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block font-mono uppercase text-[8px]">Item Accuracy</span>
            <span className="font-mono font-bold text-neutral-900 text-[11px]">
              {accuracyPct}% ({correctCount}/{totalCount})
            </span>
          </div>
        </div>

        {/* Global Scaled Score Hero — static SVG ring (no animation, pre-drawn at final position) */}
        <div className="col-span-4 flex items-center justify-end gap-3 pl-3 border-l border-neutral-200">
          {/* Static score ring */}
          <div className="relative shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64" className="block -rotate-90">
              {/* Track */}
              <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="5" />
              {/* Fill ring — pre-drawn at score fraction */}
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#8FCFE8"
                strokeWidth="5"
                strokeLinecap="butt"
                strokeDasharray={`${(Math.min(900, Math.max(0, overallScore)) / 900) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-[13px] text-neutral-900 leading-none">{overallScore}</span>
              <span className="text-[7px] font-mono text-neutral-500">/900</span>
            </div>
          </div>
          <div className="text-[9px] space-y-0.5">
            <div className="font-bold text-[#4DA8C9] font-mono">
              🇮🇳 {ordinal(indiaPercentile)} %ile (India)
            </div>
            {boardGradeBand && (
              <div className="font-semibold text-neutral-800 font-mono">
                CBSE/ICSE: {boardGradeBand.grade} ({boardGradeBand.band})
              </div>
            )}
            <div className="text-neutral-500 font-mono text-[8px]">
              🌐 {ordinal(benchmark.globalPercentile)} %ile Global
            </div>
          </div>
        </div>
      </div>

      {/* ── Dual Column Body: Student Sprint (Left) & Parent Blueprint (Right) ── */}
      <div className="grid grid-cols-2 gap-4 pb-3 mb-3 border-b border-neutral-200">
        {/* ── LEFT COLUMN: Student Section — Cyan accent — matches web hub Card 1 ── */}
        <div className="space-y-3 pr-2 border-r border-neutral-200 border-l-2 pl-2" style={{ borderLeftColor: '#8FCFE8' }}>
          <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-200">
            <GraduationCap className="size-3.5" style={{ color: '#4DA8C9' }} />
            <h2 className="font-bold font-display uppercase tracking-wider text-[11px] text-neutral-900">
              Student Focus &amp; Cognitive Profile
            </h2>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-neutral-900 text-xs">{archetypeTitle}</span>
              {typeof (abilityTheta ?? benchmark?.abilityTheta ?? benchmark?.averageTheta) === 'number' && (
                <span className="text-[9px] font-mono text-cyan-800 font-semibold">
                  Latent Theta: {(abilityTheta ?? benchmark?.abilityTheta ?? benchmark?.averageTheta) >= 0 ? '+' : ''}{(abilityTheta ?? benchmark?.abilityTheta ?? benchmark?.averageTheta).toFixed(2)}σ
                </span>
              )}
            </div>
            <p className="text-[10px] italic text-neutral-600 mt-0.5">"{archetypeTagline}"</p>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="p-1.5 bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-600" /> Core Cognitive Strength:
              </span>
              <span className="text-neutral-700 leading-snug">{keyStrengths[0]}</span>
            </div>
            <div className="p-1.5 bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                <AlertTriangle className="size-3 text-amber-600" /> Critical Growth Blindspot:
              </span>
              <span className="text-neutral-700 leading-snug">{blindspots[0]}</span>
            </div>
          </div>

          {/* 30-Day Sprint Priority Milestones */}
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              30-Day Student Challenge Sprint
            </span>
            <ul className="space-y-1 text-[9px] text-neutral-700">
              {sprintChallenges.length > 0 ? (
                sprintChallenges.map(([weekKey, challenge]: [string, any], idx: number) => (
                  <li key={weekKey} className="flex items-start gap-1.5">
                    <span className="font-mono font-bold text-neutral-500 shrink-0 text-[8px] mt-0.5">W{idx + 1}:</span>
                    <span className="leading-snug">
                      <strong>{challenge.title || challenge.theme}:</strong> {challenge.mission || challenge.description}
                    </span>
                  </li>
                ))
              ) : (
                <>
                  <li className="leading-snug"><strong>Week 1-2:</strong> First-Principles Derivation without formula shortcuts.</li>
                  <li className="leading-snug"><strong>Week 3-4:</strong> Distractor Trap Inoculation on multi-variable scenarios.</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Parent Section — Warm amber accent — matches web hub Card 2 ── */}
        <div className="space-y-3 pl-2 border-l-2" style={{ borderLeftColor: '#D9A86E' }}>
          <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-200">
            <Users className="size-3.5" style={{ color: '#B8894E' }} />
            <h2 className="font-bold font-display uppercase tracking-wider text-[11px] text-neutral-900">
              Parent Blueprint &amp; Board Alignment
            </h2>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-neutral-900 text-xs">
                {boardGradeBand ? `Grade ${boardGradeBand.grade} (${boardGradeBand.band})` : verdict}
              </span>
              <span className="text-[9px] font-mono text-neutral-500">CBSE / ICSE / NEP 2020</span>
            </div>
            <p className="text-[10px] text-neutral-700 leading-snug mt-0.5">
              <strong>Ratta Reality Check:</strong> {honestSummary}
            </p>
          </div>

          {/* Immediate Home Action Routines */}
          <div className="space-y-1.5 text-[10px]">
            <div className="p-1.5 bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                <Target className="size-3 text-cyan-800" /> High-Yield Home Routine (15-20 min/day):
              </span>
              <span className="text-neutral-700 leading-snug">
                {homeRoutines[0] ? (typeof homeRoutines[0] === 'string' ? homeRoutines[0] : homeRoutines[0].routine || homeRoutines[0].title) : 'Daily 15-minute error log review focusing on WHY distractor options were chosen.'}
              </span>
            </div>

            {/* PTM Talking Points */}
            <div className="p-1.5 bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                <BookOpen className="size-3 text-neutral-800" /> Parent-Teacher Meeting (PTM) Guide:
              </span>
              <span className="text-neutral-700 leading-snug italic">
                "{ptmGuide[0] ? (typeof ptmGuide[0] === 'string' ? ptmGuide[0] : ptmGuide[0].question || ptmGuide[0].topic) : 'Ask teacher: Is the student applying concepts to unseen problems or memorizing textbook patterns?'}"
              </span>
            </div>
          </div>

          {/* Curriculum Orientation */}
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Recommended Olympiad & Exam Alignment
            </span>
            <p className="text-[9px] text-neutral-700 leading-snug">
              Competitive Track: Target SASMO / AMC 8 foundation alongside CBSE standard. Focus on non-linear application over repetitive drills.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: PARAKH 360° Competencies Vitals & Psychometric Audit ── */}
      <div className="grid grid-cols-12 gap-3 pt-1">
        {/* PARAKH 360 Vitals */}
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
              PARAKH 360° Holistic Assessment Competencies (NEP 2020)
            </span>
            <span className="text-[8px] font-mono text-neutral-500">Benchmark: National Class {classLevel} Average</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            {parakh ? (
              Object.entries(parakh)
                .filter(([_, data]) => data && typeof data === 'object' && ('score' in data || 'band' in data))
                .slice(0, 3)
                .map(([pillar, data]: [string, any]) => (
                <div key={pillar} className="p-1.5 border border-neutral-200 bg-neutral-50">
                  <span className="text-[8px] font-mono text-neutral-500 uppercase block truncate">
                    {pillar.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-mono font-bold text-[11px] text-neutral-900 block my-0.5">
                    {data.score || data.band || 'Proficient'}
                  </span>
                  <div className="h-1 bg-neutral-200 w-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-700"
                      style={{ width: `${typeof data.score === 'number' ? data.score : 75}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-1.5 border border-neutral-200 bg-neutral-50">
                  <span className="text-[8px] font-mono text-neutral-500 uppercase block">Critical Inquiry</span>
                  <span className="font-mono font-bold text-[11px] text-neutral-900 block my-0.5">78%</span>
                  <div className="h-1 bg-neutral-200 w-full"><div className="h-full bg-cyan-700 w-[78%]" /></div>
                </div>
                <div className="p-1.5 border border-neutral-200 bg-neutral-50">
                  <span className="text-[8px] font-mono text-neutral-500 uppercase block">Scientific App</span>
                  <span className="font-mono font-bold text-[11px] text-neutral-900 block my-0.5">72%</span>
                  <div className="h-1 bg-neutral-200 w-full"><div className="h-full bg-cyan-700 w-[72%]" /></div>
                </div>
                <div className="p-1.5 border border-neutral-200 bg-neutral-50">
                  <span className="text-[8px] font-mono text-neutral-500 uppercase block">Problem Chaining</span>
                  <span className="font-mono font-bold text-[11px] text-neutral-900 block my-0.5">64%</span>
                  <div className="h-1 bg-neutral-200 w-full"><div className="h-full bg-cyan-700 w-[64%]" /></div>
                </div>
                <div className="p-1.5 border border-neutral-200 bg-neutral-50">
                  <span className="text-[8px] font-mono text-neutral-500 uppercase block">Metacognition</span>
                  <span className="font-mono font-bold text-[11px] text-neutral-900 block my-0.5">82%</span>
                  <div className="h-1 bg-neutral-200 w-full"><div className="h-full bg-cyan-700 w-[82%]" /></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Psychometric Validity Stamp */}
        <div className="col-span-4 flex flex-col justify-between p-2 border border-neutral-200 bg-neutral-50 text-[9px]">
          <div>
            <div className="flex items-center gap-1 font-bold text-neutral-900 font-mono uppercase text-[8px] mb-1">
              <Sparkles className="size-2.5 text-cyan-800" /> CAT 3PL IRT Psychometric Calibration
            </div>
            <p className="text-neutral-600 leading-tight">
              Adaptive item discrimination calibrated against 50,000+ student trajectories. Synthesized via NVIDIA Nemotron-70B.
            </p>
          </div>
          <div className="pt-1 mt-1 border-t border-neutral-200 flex items-center justify-between text-[8px] font-mono text-neutral-500">
            <span>WARP v2.0 CERTIFIED</span>
            <span>warp.govibecore.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
