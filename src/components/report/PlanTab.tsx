import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Flame, Sparkles, Target, Layers, CheckCircle2, Circle, BookOpen, Dumbbell, Search, Award, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PlanTabProps {
  benchmark: any;
  studentVariant: any;
  parentVariant: any;
  reportId?: string;
  isOwner?: boolean;
}

export function PlanTab({ benchmark, studentVariant, parentVariant, reportId, isOwner }: PlanTabProps) {
  const [view, setView] = useState<'student' | 'parent'>('student');

  const archetypeTitle = studentVariant?.archetypeTitle || benchmark?.cognitiveArchetype?.title || 'Analytical Strategist';
  const archetypeTagline = studentVariant?.archetypeTagline || benchmark?.cognitiveArchetype?.tagline || 'Deconstructs multi-variable systems with structural precision';
  const summary = studentVariant?.summary || 'Consistently demonstrates strong structural awareness when approaching complex, multi-step problems.';
  const primaryStrength = 'Parameter isolation & causal inference';
  
  const sprintEntries = Object.entries(studentVariant?.challengeSprint || benchmark?.studentChallengeSprint || {});

  // 30-Day Fanning Algorithm
  const totalDays = 30;
  const dailyPlan = Array.from({ length: totalDays }).map((_, index) => {
    const dayNum = index + 1;
    // Map to a week (4 weeks max)
    const weekIndex = Math.min(Math.floor((dayNum - 1) / 7), Math.max(0, sprintEntries.length - 1));
    const weekData: any = sprintEntries[weekIndex]?.[1] || { focus: 'Focus Area', activity: 'Activity description' };
    
    const dayOfWeek = (dayNum - 1) % 7; 
    let dayType = 'Practice';
    let title = 'Active Practice';
    let desc = weekData.activity;
    let Icon = Dumbbell;
    
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      dayType = 'Concept';
      title = `Theory & Concept: ${weekData.focus}`;
      desc = `Review fundamental concepts and understand the core mechanics of ${weekData.focus}.`;
      Icon = BookOpen;
    } else if (dayOfWeek >= 2 && dayOfWeek <= 4) {
      dayType = 'Practice';
      title = 'Targeted Practice';
      desc = weekData.activity || `Complete rigorous practice exercises for ${weekData.focus}.`;
      Icon = Dumbbell;
    } else if (dayOfWeek === 5) {
      dayType = 'Review';
      title = 'Reflection & Review';
      desc = `Review your mistakes from the week and consolidate your understanding.`;
      Icon = Search;
    } else {
      dayType = 'Test';
      title = 'Weekly Mock Assessment';
      desc = `Test yourself on ${weekData.focus} under timed conditions.`;
      Icon = Award;
    }
    
    // Special final days
    if (dayNum === 29) {
      dayType = 'Review';
      title = 'Comprehensive Review';
      desc = 'Review all concepts covered in the last 4 weeks.';
      Icon = Search;
    } else if (dayNum === 30) {
      dayType = 'Test';
      title = 'Final Sprint Assessment';
      desc = 'Take a full-length mock exam to measure your improvement.';
      Icon = Award;
    }

    return { dayNum, weekIndex: weekIndex + 1, dayType, title, desc, Icon };
  });

  const [progress, setProgress] = useState<Record<number, boolean>>(studentVariant?.sprintProgress || {});
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = async (dayNum: number) => {
    if (!isOwner && reportId) {
      alert("You need to own this report to save progress.");
      return;
    }
    
    const newProgress = { ...progress, [dayNum]: !progress[dayNum] };
    setProgress(newProgress);

    if (reportId && isOwner) {
      setIsSaving(true);
      try {
        const { error } = await supabase.from('reports').update({
          student_variant: {
            ...studentVariant,
            sprintProgress: newProgress
          }
        }).eq('id', reportId);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to save sprint progress:', err);
        setProgress(progress);
        alert('Failed to save progress. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const realityCheck = parentVariant?.realityCheck || benchmark?.realityCheck || {};
  const blueprint = parentVariant?.parentActionBlueprint || benchmark?.parentActionBlueprint || {};
  const verdict = realityCheck.verdict || 'Developing Foundation';
  const honestSummary = parentVariant?.realityCheckSummary || realityCheck.honestSummary || 'Good grasp of basics, but struggles with multi-step deduction under pressure.';
  const gradeInflationWarning = parentVariant?.gradeInflationWarning || realityCheck.gradeInflationWarning;

  const homeRoutines = parentVariant?.indianHomeRoutines?.length > 0 
    ? parentVariant.indianHomeRoutines 
    : parentVariant?.immediateHomeRoutines?.length > 0
      ? parentVariant.immediateHomeRoutines
      : blueprint.indianHomeRoutines?.length > 0 
        ? blueprint.indianHomeRoutines
        : blueprint.immediateHomeRoutines || [];

  const ptmGuide = parentVariant?.ptmDiscussionGuide?.length > 0
    ? parentVariant.ptmDiscussionGuide
    : blueprint.ptmDiscussionGuide || [];

  return (
    <div className="space-y-12 animate-in fade-in duration-200">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border-hairline pb-6 gap-4 no-print print:hidden">
        <div className="flex-1 hidden sm:block" /> {/* Spacer */}
        
        {/* Segmented Control */}
        <div className="inline-flex items-center p-1 bg-surface-card border border-border-hairline shrink-0">
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

        <div className="flex-1 flex justify-end w-full sm:w-auto">
          <button
            onClick={() => {
              document.body.classList.add('print-plan-mode');
              window.print();
              setTimeout(() => {
                document.body.classList.remove('print-plan-mode');
              }, 1000);
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 text-[14px] font-mono font-bold border border-border-hairline text-ink-secondary hover:text-ink-primary hover:bg-surface-page transition-colors no-print print:hidden"
            title="Print Current View"
          >
            <Printer className="size-4 shrink-0" />
            <span>Print {view === 'student' ? 'Sprint' : 'Blueprint'}</span>
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-8 border-b-2 border-border-strong pb-4">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-muted mb-1">WARP Official Action Plan</div>
        <h1 className="text-2xl font-display font-bold text-ink-primary uppercase tracking-tight">
          {view === 'student' ? '30-Day Student Sprint' : 'Parent Intervention Blueprint'}
        </h1>
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

          {dailyPlan.length > 0 && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between border-b border-border-hairline pb-4 mb-8">
                <h3 className="text-xl font-display font-bold text-ink-primary flex items-center gap-2">
                  <Target className="size-5 text-accent-default" />
                  30-Day Tactical Roadmap
                </h3>
                {isSaving && <span className="text-[12px] font-mono text-ink-muted">Saving...</span>}
              </div>

              <div className="relative pl-6 md:pl-8 space-y-8 border-l-2 border-border-hairline">
                {dailyPlan.map((day) => {
                  const isCompleted = progress[day.dayNum];
                  
                  return (
                    <div key={day.dayNum} className="relative group break-inside-avoid">
                      {/* Timeline Node */}
                      <div className="absolute -left-8.75 md:-left-10.75 top-1">
                        <button
                          onClick={() => toggleDay(day.dayNum)}
                          disabled={isSaving}
                          className="bg-background rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-default focus-visible:ring-offset-2"
                          aria-label={`Mark Day ${day.dayNum} as ${isCompleted ? 'incomplete' : 'complete'}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="size-6 text-semantic-ok bg-background" />
                          ) : (
                            <Circle className="size-6 text-border-strong bg-background group-hover:text-accent-default" />
                          )}
                        </button>
                      </div>

                      {/* Content Card */}
                      <div className={`p-5 transition-all duration-300 border bg-surface-page ${isCompleted ? 'border-border-hairline opacity-75 grayscale-[0.3]' : 'border-border-strong shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-ink-secondary">
                            Day {day.dayNum} <span className="mx-1 opacity-40">|</span> Week {day.weekIndex}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-accent-default px-2 py-0.5 border border-border-hairline bg-surface-card">
                            <day.Icon className="size-3" />
                            {day.dayType}
                          </span>
                        </div>
                        <h4 className={`text-[15px] font-semibold mb-2 leading-snug ${isCompleted ? 'text-ink-secondary line-through' : 'text-ink-primary'}`}>
                          {day.title}
                        </h4>
                        <p className="text-[14px] text-ink-secondary leading-relaxed">
                          {day.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                    <p className="text-[14px] text-ink-secondary leading-relaxed max-w-[75ch]">{honestSummary}</p>
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

          <div className="grid grid-cols-1 gap-8">
            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Layers className="size-5 text-accent-default" />
                   Immediate Home Routines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {homeRoutines.length > 0 ? homeRoutines.map((routine: any, i: number) => {
                    let rTitle = '';
                    let rDesc = '';
                    if (typeof routine === 'string') {
                      const splitIdx = routine.indexOf(':');
                      if (splitIdx > -1) {
                         rTitle = routine.substring(0, splitIdx).trim();
                         rDesc = routine.substring(splitIdx + 1).trim();
                      } else {
                         rTitle = routine;
                      }
                    } else {
                      rTitle = routine.routine || routine.title;
                      rDesc = routine.why || routine.description;
                    }

                    return (
                      <div key={i} className="flex gap-4 p-4 border border-border-hairline bg-surface-page group hover:border-border-strong transition-colors">
                         <div className="shrink-0 flex items-center justify-center size-8 bg-surface-card border border-border-hairline text-[13px] font-mono font-bold text-ink-primary">
                           {i+1}
                         </div>
                         <div>
                            <p className="text-[15px] font-semibold text-ink-primary mb-1">{rTitle}</p>
                            {rDesc && <p className="text-[14px] text-ink-secondary leading-relaxed">{rDesc}</p>}
                         </div>
                      </div>
                    )
                  }) : (
                    <div className="p-4 border border-border-hairline bg-surface-page text-[13px] text-ink-muted italic">No routines prescribed yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="break-inside-avoid mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Target className="size-5 text-accent-default" />
                   PTM Discussion Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ptmGuide.length > 0 ? ptmGuide.map((q: any, i: number) => {
                    let qText = '';
                    let qWhy = '';
                    if (typeof q === 'string') {
                      const splitIdx = q.indexOf(':');
                      if (splitIdx > -1 && q.toLowerCase().startsWith('question')) {
                         qText = q.substring(splitIdx + 1).trim();
                      } else {
                         qText = q;
                      }
                    } else {
                      qText = q.question || q.topic;
                      qWhy = q.why || q.rationale;
                    }

                    return (
                      <div key={i} className="flex gap-4 p-4 border border-border-hairline bg-surface-page group hover:border-border-strong transition-colors">
                         <div className="shrink-0 flex items-center justify-center size-8 bg-surface-card border border-border-hairline text-[13px] font-mono font-bold text-ink-primary">
                           Q{i+1}
                         </div>
                         <div>
                            <p className="text-[15px] font-medium text-ink-primary italic leading-snug">"{qText.replace(/^["']|["']$/g, '')}"</p>
                            {qWhy && <p className="text-[13px] text-ink-secondary mt-2">{qWhy}</p>}
                         </div>
                      </div>
                    )
                  }) : (
                    <div className="p-4 border border-border-hairline bg-surface-page text-[13px] text-ink-muted italic">No specific discussion points flagged.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
