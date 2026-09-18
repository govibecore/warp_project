import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { ParakhRadarChart } from './ParakhRadarChart';
import { Button } from '../ui/button';
import { useState } from 'react';

interface StrengthsGapsTabProps {
  parakhVitals: any[];
  benchmark: any;
  studentVariant: any;
  responses: any[];
  onAskTutor: (idx: number) => void;
}

export function StrengthsGapsTab({
  parakhVitals,
  benchmark,
  studentVariant,
  responses,
  onAskTutor
}: StrengthsGapsTabProps) {
  const keyStrengths = studentVariant?.keyStrengths || [benchmark?.cognitiveArchetype?.primaryStrength || 'Parameter isolation & causal inference'];
  const blindspots = studentVariant?.blindspots || [benchmark?.cognitiveArchetype?.criticalBlindspot || 'Premature optimization under time pressure'];

  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const total = responses.length;
  const correctCount = responses.filter((r) => r.correct === true).length;
  const incorrectCount = total - correctCount;

  const filteredResponses = responses.filter((r) => {
    if (filter === 'correct') return r.correct === true;
    if (filter === 'incorrect') return r.correct !== true;
    return true;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-200">
      
      {/* Top 2-up Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border-hairline bg-surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-semantic-positive">
                  <CheckCircle2 className="size-5" />
                  Verified Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {keyStrengths.map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-ink-secondary">
                      <span className="font-mono text-ink-muted text-xs mt-0.5">0{i+1}</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border-hairline bg-surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-semantic-critical">
                  <XCircle className="size-5" />
                  Critical Blindspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {blindspots.map((bs: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-ink-secondary">
                      <span className="font-mono text-ink-muted text-xs mt-0.5">0{i+1}</span>
                      <span>{bs}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Domain vitals simple list */}
          <Card>
            <CardHeader>
               <CardTitle>Competency Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {parakhVitals.map((v) => (
                    <div key={v.label} className="flex justify-between items-center border-b border-border-hairline pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-[11px] font-mono uppercase text-ink-muted">{v.domain}</p>
                        <p className="text-[14px] font-medium text-ink-primary">{v.label}</p>
                      </div>
                      <div className="text-right">
                         <span className="text-lg font-bold font-display text-ink-primary">
                          {v.band === 'Not Assessed' ? '---' : `${v.value}${v.suffix}`}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col justify-center items-center bg-surface-page">
            <h4 className="font-display font-medium text-ink-primary mb-6 text-center">Radar Profile</h4>
            <div className="mx-auto w-full max-w-70 aspect-square">
              <ParakhRadarChart pillars={parakhVitals} baseline={50} />
            </div>
          </Card>
        </div>
      </div>

      {/* Scenario Audit List */}
      <div className="space-y-6 pt-12 border-t border-border-hairline">
        <div>
           <h3 className="text-2xl font-display font-medium text-ink-primary">Scenario Audit</h3>
           <p className="text-[14px] text-ink-secondary mt-1">Question-by-question breakdown of the evaluation.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-xs font-mono font-semibold transition-colors border ${
              filter === 'all'
                ? 'bg-accent-default text-ink-inverse border-accent-default'
                : 'bg-surface-card border-border-hairline text-ink-secondary hover:text-ink-primary'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-4 py-1.5 text-xs font-mono font-semibold transition-colors border ${
              filter === 'incorrect'
                ? 'bg-accent-default text-ink-inverse border-accent-default'
                : 'bg-surface-card border-border-hairline text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Traps Triggered ({incorrectCount})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-4 py-1.5 text-xs font-mono font-semibold transition-colors border ${
              filter === 'correct'
                ? 'bg-accent-default text-ink-inverse border-accent-default'
                : 'bg-surface-card border-border-hairline text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Verified Correct ({correctCount})
          </button>
        </div>

        <div className="space-y-4">
          {filteredResponses.length === 0 ? (
            <Card className="p-8 text-center text-ink-secondary">
              No scenarios found matching the filter.
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
                <Card key={item.scenario_id || idx} className="p-6 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border-hairline">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[11px] font-bold font-mono px-2 py-0.5 bg-surface-page border border-border-hairline text-ink-primary">
                        #{originalIndex + 1}
                      </span>
                      <span className="text-[12px] font-semibold text-accent-default font-mono">
                        {compLabel}
                      </span>
                    </div>
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 text-ink-primary font-bold text-xs">
                          <CheckCircle2 className="size-3.5" /> Correct Answer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-semantic-critical font-bold text-xs">
                          <XCircle className="size-3.5" /> Trap Triggered
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-[14px] font-semibold text-ink-primary mb-4 leading-relaxed">
                    {item.prompt || 'Benchmark evaluation prompt'}
                  </h4>

                  <div className="space-y-2 text-[13px]">
                    <div className="p-3 bg-surface-page border border-border-hairline flex items-start gap-2.5">
                      <span className="font-mono font-bold text-ink-primary shrink-0">Selected:</span>
                      <span className="text-ink-secondary">{userChoice}</span>
                    </div>

                    {!isCorrect && item.correctOption && (
                      <div className="p-3 bg-surface-page border border-border-hairline flex items-start gap-2.5">
                        <span className="font-mono font-bold text-accent-default shrink-0">Correct:</span>
                        <span className="text-ink-primary">{item.correctOption}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                     <p className="text-[13px] text-ink-secondary max-w-[60ch]">
                      {isCorrect
                        ? 'Successfully isolated key problem invariants.'
                        : 'Vulnerable to surface pattern matching or hurried formula application.'}
                     </p>

                     <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onAskTutor(originalIndex)}
                        className="shrink-0 text-[12px]"
                      >
                        <Sparkles className="size-3.5 mr-1.5" />
                        Ask Tutor
                      </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
