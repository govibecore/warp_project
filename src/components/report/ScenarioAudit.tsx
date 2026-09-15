import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle, Sparkles, Layers } from 'lucide-react';

interface ScenarioAuditProps {
  responses: Array<{
    scenario_id?: string;
    prompt?: string;
    competency?: string;
    benchmarkStandard?: string;
    userSelectedOption?: string;
    correct?: boolean;
    option?: any;
    correctOption?: string;
    learning_objective?: string;
    hint?: string;
  }>;
  overallScore: number;
  classLevel: number;
  nationalPercentile?: number;
  boardGrade?: string;
  onAskTutor?: (scenarioIndex: number) => void;
}

export function ScenarioAudit({
  responses = [],
  overallScore,
  classLevel,
  nationalPercentile = 68,
  boardGrade = 'A2',
  onAskTutor,
}: ScenarioAuditProps) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    const handleBeforePrint = () => setFilter('all');
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  const total = responses.length;
  const correctCount = responses.filter((r) => r.correct === true).length;
  const incorrectCount = total - correctCount;
  const accuracyPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const filteredResponses = responses.filter((r) => {
    if (filter === 'correct') return r.correct === true;
    if (filter === 'incorrect') return r.correct !== true;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Score Transparency & IRT Derivation Banner ── */}
      <Card className="p-6 md:p-8 bg-card border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1 text-primary">
              <Layers className="size-4" />
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-primary">
                Score Transparency & Diagnostic Audit
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-foreground">
              Question-by-Question Diagnostic Breakdown
            </h2>
            <p className="text-xs text-foreground-secondary mt-1">
              Complete audit of every scenario calibrated in Class {classLevel} assessment session
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto font-mono text-center">
            <div className="px-3.5 py-2 bg-surface border border-border">
              <span className="text-[10px] uppercase text-foreground-secondary block">
                Total
              </span>
              <span className="text-lg font-bold tabular text-foreground">{total}</span>
            </div>
            <div className="px-3.5 py-2 bg-surface border border-border">
              <span className="text-[10px] uppercase text-foreground-secondary block">
                Correct
              </span>
              <span className="text-lg font-bold tabular text-foreground">
                {correctCount}
              </span>
            </div>
            <div className="px-3.5 py-2 bg-surface border border-border">
              <span className="text-[10px] uppercase text-foreground-secondary block">
                Needs Focus
              </span>
              <span className="text-lg font-bold tabular text-foreground">
                {incorrectCount}
              </span>
            </div>
            <div className="px-3.5 py-2 bg-surface border border-border">
              <span className="text-[10px] uppercase text-primary font-bold block">
                Accuracy
              </span>
              <span className="text-lg font-bold tabular text-primary">{accuracyPct}%</span>
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 text-xs text-foreground-secondary leading-relaxed border border-border">
          <span className="font-bold font-mono uppercase tracking-wider text-foreground block mb-1">
            How the Scaled Score ({overallScore}/900) is Derived:
          </span>
          Unlike conventional school unit tests where each question carries equal marks, this adaptive benchmark uses Item Response Theory (IRT). Questions of higher discrimination and difficulty (Olympiad & HOTS tier) carry greater psychometric weight. Your child achieved an accuracy of <strong className="text-foreground">{accuracyPct}%</strong>, yielding a Global Scaled Score of <strong className="text-foreground">{overallScore}/900</strong> and an estimated All-India rank in the <strong className="text-foreground">{nationalPercentile}th percentile</strong> (CBSE/ICSE Grade Band <strong className="text-primary">{boardGrade}</strong>).
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border no-print print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground-secondary mr-2">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded-none border transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-foreground-secondary hover:text-foreground'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded-none border transition-colors ${
                filter === 'incorrect'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-foreground-secondary hover:text-foreground'
              }`}
            >
              Traps Triggered ({incorrectCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded-none border transition-colors ${
                filter === 'correct'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-foreground-secondary hover:text-foreground'
              }`}
            >
              Verified Correct ({correctCount})
            </button>
          </div>
          <span className="text-[11px] font-mono text-foreground-muted">
            Showing {filteredResponses.length} of {total} items
          </span>
        </div>
      </Card>

      {/* ── Individual Scenario Cards ── */}
      <div className="space-y-4">
        {filteredResponses.length === 0 ? (
          <Card className="p-8 text-center text-foreground-secondary border border-border bg-card">
            No scenarios found matching the selected filter.
          </Card>
        ) : (
          filteredResponses.map((item, idx) => {
            const isCorrect = item.correct === true;
            const originalIndex = responses.indexOf(item);
            const userChoice = item.userSelectedOption || item.option?.text || 'Option selected by candidate';
            const compLabel = item.competency
              ? item.competency.replace(/([A-Z])/g, ' $1').trim()
              : 'Analytical Reasoning';

            return (
              <Card
                key={item.scenario_id || idx}
                className="p-6 border border-border bg-card transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-surface border border-border text-foreground">
                      Scenario #{originalIndex + 1}
                    </span>
                    <span className="text-xs font-semibold text-primary font-mono">
                      {compLabel}
                    </span>
                    <span className="text-[11px] text-foreground-muted">
                      Class {classLevel} Benchmark Standard
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-foreground font-bold px-2 py-0.5 bg-surface border border-border">
                        <CheckCircle2 className="size-3.5 text-foreground" /> Correct Answer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-foreground-secondary font-bold px-2 py-0.5 bg-surface border border-border">
                        <XCircle className="size-3.5 text-foreground-secondary" /> Trap Option Triggered
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="my-3">
                  <h4 className="text-sm font-semibold text-foreground leading-relaxed">
                    {item.prompt || 'STEM benchmark evaluation prompt'}
                  </h4>
                </div>

                {/* Candidate Selection */}
                <div className="my-3 space-y-2 text-xs">
                  <div className="p-3 rounded-none bg-surface border border-border flex items-start gap-2.5">
                    <span className="font-mono font-bold text-foreground shrink-0">Selected Choice:</span>
                    <span className="text-foreground-secondary leading-snug">{userChoice}</span>
                  </div>

                  {!isCorrect && item.correctOption && (
                    <div className="p-3 rounded-none bg-surface border border-border flex items-start gap-2.5">
                      <span className="font-mono font-bold text-primary shrink-0">Correct Principle:</span>
                      <span className="text-foreground leading-snug">{item.correctOption}</span>
                    </div>
                  )}
                </div>

                {/* AI Cognitive Trap Diagnosis */}
                <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">
                      {isCorrect ? 'Why this reasoning succeeded:' : 'Why the distractor trap was chosen:'}
                    </span>
                    <p className="text-foreground-secondary leading-relaxed">
                      {isCorrect
                        ? 'Successfully isolated key problem invariants and rejected superficial distractor patterns.'
                        : 'Vulnerable to surface pattern matching or hurried formula application without verifying boundary conditions.'}
                    </p>
                  </div>

                  {onAskTutor && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onAskTutor(originalIndex)}
                      className="no-print print:hidden shrink-0 gap-1.5 border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs"
                    >
                      <Sparkles className="size-3.5" />
                      <span>Ask Tutor About This</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
