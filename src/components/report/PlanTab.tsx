import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Flame, Sparkles, Target, Layers } from 'lucide-react';

interface PlanTabProps {
  benchmark: any;
  studentVariant: any;
  parentVariant: any;
}

export function PlanTab({ benchmark, studentVariant, parentVariant }: PlanTabProps) {
  const [view, setView] = useState<'student' | 'parent'>('student');

  const archetypeTitle = studentVariant?.archetypeTitle || benchmark?.cognitiveArchetype?.title || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || benchmark?.cognitiveArchetype?.tagline || 'Deconstructs multi-variable systems with structural precision';
  const summary = studentVariant?.summary || 'Consistently demonstrates strong structural awareness when approaching complex, multi-step problems.';
  const primaryStrength = 'Parameter isolation & causal inference';
  
  const sprintEntries = Object.entries(studentVariant?.challengeSprint || {});

  const realityCheck = parentVariant?.realityCheck || {};
  const blueprint = parentVariant?.parentActionBlueprint || {};
  const verdict = realityCheck.verdict || 'Developing Foundation';
  const honestSummary = parentVariant?.realityCheckSummary || realityCheck.honestSummary || 'Good grasp of basics, but struggles with multi-step deduction under pressure.';
  const gradeInflationWarning = parentVariant?.gradeInflationWarning || realityCheck.gradeInflationWarning;

  const homeRoutines = parentVariant?.immediateHomeRoutines || blueprint.immediateHomeRoutines || [];
  const ptmGuide = parentVariant?.ptmDiscussionGuide || blueprint.ptmDiscussionGuide || [];

  return (
    <div className="space-y-12 animate-in fade-in duration-200">
      
      {/* Segmented Control */}
      <div className="flex justify-center border-b border-border-hairline pb-6">
        <div className="inline-flex items-center p-1 bg-surface-card border border-border-hairline">
          <button
            onClick={() => setView('student')}
            className={`px-8 py-2 text-[14px] font-mono font-bold transition-colors ${
              view === 'student'
                ? 'bg-accent-default text-ink-inverse shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-page'
            }`}
          >
            Student Sprint
          </button>
          <button
            onClick={() => setView('parent')}
            className={`px-8 py-2 text-[14px] font-mono font-bold transition-colors ${
              view === 'parent'
                ? 'bg-accent-default text-ink-inverse shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-page'
            }`}
          >
            Parent Blueprint
          </button>
        </div>
      </div>

      {view === 'student' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2 text-accent-default">
                <Sparkles className="size-4" />
                <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-accent-default">Cognitive Profile</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-ink-primary mb-2">
                {archetypeTitle}
              </h2>
              <p className="text-[14px] text-ink-secondary italic font-medium mb-4">
                "{archetypeTagline}"
              </p>
              <div className="text-[14px] leading-relaxed text-ink-secondary whitespace-pre-wrap max-w-[80ch]">
                {summary}
              </div>

              <div className="mt-8 pt-6 border-t border-border-hairline">
                <div className="flex items-center gap-2 text-[14px]">
                  <Flame className="size-4 text-ink-secondary" />
                  <span className="font-semibold text-ink-primary">
                    Primary Superpower: <span className="font-normal text-ink-secondary">{primaryStrength}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {sprintEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-accent-default" />
                  30-Day Targeted Sprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sprintEntries.map(([key, item]: [string, any], idx: number) => (
                    <div key={key} className="p-5 border border-border-hairline bg-surface-page">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase text-ink-secondary tracking-widest">
                          Week {idx + 1}
                        </span>
                        <span className="text-[12px] font-mono font-bold text-accent-default uppercase px-2 py-0.5 border border-border-hairline bg-surface-card">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <h4 className="text-[14px] font-semibold text-ink-primary mb-2 leading-snug">
                        {item.focus || item.challengeName || 'Focus Area'}
                      </h4>
                      <p className="text-[13px] text-ink-secondary leading-relaxed line-clamp-3">
                        {item.activity || item.description || 'Sprint activity description goes here.'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {view === 'parent' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <Card>
            <CardHeader>
               <CardTitle className="text-xl">Diagnostic Verdict: <span className="font-medium text-ink-secondary">{verdict}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                 <div>
                    <h4 className="text-[14px] font-bold font-mono text-ink-primary mb-2">Honest Summary</h4>
                    <p className="text-[14px] text-ink-secondary leading-relaxed">{honestSummary}</p>
                 </div>
                 {gradeInflationWarning && (
                   <div className="p-4 border-l-2 border-semantic-critical bg-semantic-critical/5">
                      <h4 className="text-[14px] font-bold font-mono text-semantic-critical mb-2">Grade Inflation Warning</h4>
                      <p className="text-[14px] text-ink-secondary leading-relaxed">{gradeInflationWarning}</p>
                   </div>
                 )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Layers className="size-5 text-accent-default" />
                   Immediate Home Routines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {homeRoutines.map((routine: any, i: number) => {
                    const rTitle = typeof routine === 'string' ? routine : routine.routine || routine.title;
                    const rDesc = typeof routine === 'string' ? '' : routine.why || routine.description;
                    return (
                      <li key={i} className="flex gap-3">
                         <span className="font-mono text-ink-muted text-[12px] mt-0.5">0{i+1}</span>
                         <div>
                            <p className="text-[14px] font-medium text-ink-primary leading-snug">{rTitle}</p>
                            {rDesc && <p className="text-[13px] text-ink-secondary mt-1">{rDesc}</p>}
                         </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Target className="size-5 text-accent-default" />
                   PTM Discussion Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {ptmGuide.map((q: any, i: number) => {
                    const qText = typeof q === 'string' ? q : q.question || q.topic;
                    const qWhy = typeof q === 'string' ? '' : q.why || q.rationale;
                    return (
                      <li key={i} className="flex gap-3">
                         <span className="font-mono text-ink-muted text-[12px] mt-0.5">0{i+1}</span>
                         <div>
                            <p className="text-[14px] font-medium text-ink-primary leading-snug">"{qText}"</p>
                            {qWhy && <p className="text-[13px] text-ink-secondary mt-1 text-ink-muted">{qWhy}</p>}
                         </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
