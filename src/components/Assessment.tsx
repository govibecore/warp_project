import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Lightbulb, Undo2, ArrowRight } from 'lucide-react';
import { getNextItem } from '../domain/assessment';
import { useAxiomSession } from '../context/AxiomSessionContext';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

/** Format milliseconds as M:SS countdown string. */
function formatTime(ms: number): string {
  const totalSecs = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Assessment() {
  const { session, answer, complete, undo } = useAxiomSession();
  const item = session.plan ? getNextItem(session.plan, Object.keys(session.responses)) : null;
  const [selectedOptionId, setSelectedOptionId] = useState<string>();
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    setHintVisible(false);
  }, [item?.id]);

  // ── Timer ────────────────────────────────────────────────────────────────
  const timeLimitMs = session.plan?.timeLimitMs ?? 0;
  const startedAtMs = useMemo(
    () => (session.assessmentStartedAt ? new Date(session.assessmentStartedAt).getTime() : Date.now()),
    [session.assessmentStartedAt],
  );

  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (timeLimitMs <= 0) return Infinity;
    return Math.max(0, timeLimitMs - (Date.now() - startedAtMs));
  });

  useEffect(() => {
    if (timeLimitMs <= 0) return;
    const tick = () => setRemainingMs(Math.max(0, timeLimitMs - (Date.now() - startedAtMs)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeLimitMs, startedAtMs]);

  const timeExpired = timeLimitMs > 0 && remainingMs <= 0;
  const timerFraction = timeLimitMs > 0 ? remainingMs / timeLimitMs : 1;

  // The timer is one of the few things on screen that genuinely changes state,
  // so it is one of the few things allowed to change colour.
  const timerTone =
    timerFraction > 0.5
      ? 'text-foreground-secondary'
      : timerFraction > 0.25
        ? 'text-warning'
        : 'text-destructive';
  // ─────────────────────────────────────────────────────────────────────────

  const selected = item?.options.find((option) => option.id === selectedOptionId);
  const lockedCount = Object.keys(session.responses).length;
  const calibrationCount = session.plan?.calibrationItems.length ?? 5;
  const totalItems = calibrationCount + (session.plan?.missionItems.length ?? 0);
  const canComplete = lockedCount >= calibrationCount;

  const lock = useCallback(() => {
    if (selected && item) {
      answer({
        itemId: item.id,
        missionId: item.missionId,
        prompt: item.prompt,
        optionId: selected.id,
        optionLabel: selected.label,
        evidence: [...selected.evidence],
        ...(selected.misconception ? { misconception: selected.misconception } : {}),
      });
      setSelectedOptionId(undefined);
    }
  }, [selected, item, answer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || timeExpired ||
        (e.target instanceof HTMLElement && (
          e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
          e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' ||
          e.target.closest('[contenteditable="true"]')
        )) ||
        !item
      ) return;

      const key = e.key.toLowerCase();
      const letters = ['a', 'b', 'c', 'd'];
      const digits = ['1', '2', '3', '4'];
      const index = letters.indexOf(key) !== -1 ? letters.indexOf(key) : digits.indexOf(key);

      if (index !== -1 && item.options[index]) {
        setSelectedOptionId(item.options[index].id);
      } else if (key === 'enter' && selectedOptionId) {
        lock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, selectedOptionId, lock, timeExpired]);

  // ── Time expired ─────────────────────────────────────────────────────────
  if (timeExpired) {
    return (
      <Centred>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-warning">
          Assessment time expired
        </p>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight">Time's up</h1>
        <p className="mb-2 text-sm text-foreground-secondary">
          You locked <strong className="text-foreground">{lockedCount}</strong> of{' '}
          <strong className="text-foreground">{totalItems}</strong> scenarios.
        </p>
        {canComplete ? (
          <>
            <p className="mb-6 text-sm text-foreground-secondary">
              Generate your projected benchmark from the decisions you locked.
            </p>
            <Button onClick={complete} size="lg" block>
              Generate results <ArrowRight className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-foreground-secondary">
              Too few scenarios answered to generate a valid benchmark. At least{' '}
              {calibrationCount} calibration items are required.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Start over
            </Button>
          </>
        )}
      </Centred>
    );
  }

  // ── All items answered ───────────────────────────────────────────────────
  if (!item) {
    return (
      <Centred>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Assessment complete
        </p>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight">
          Evidence captured
        </h1>
        <p className="mb-8 text-sm text-foreground-secondary">
          Generate your projected benchmark from the decisions you have locked.
        </p>
        <Button onClick={complete} size="lg" block>
          Generate benchmark <ArrowRight className="size-4" />
        </Button>
      </Centred>
    );
  }

  // Phase label: calibration items come first, then the named missions.
  const isCalibration = lockedCount < calibrationCount;
  const missionLabel = item.missionId.replace(/-/g, ' ');

  return (
    <main className="relative flex h-full w-full flex-1 flex-col" data-testid="assessment-shell">
      {/* ── Progress header ── */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
        <div className="flex w-1/3 items-center gap-3">
          {/* The plan runs calibration items first, then mission items — the
              badge has to say which phase the student is actually in. */}
          <Badge tone={isCalibration ? 'primary' : 'neutral'}>
            {isCalibration ? 'Calibration' : missionLabel}
          </Badge>
          <span className="hidden text-xs font-medium text-foreground-secondary sm:inline">
            Class {session.profile?.classLevel} · {session.profile?.difficulty}
          </span>
        </div>

        <div className="flex w-1/3 flex-col items-center gap-1.5">
          <span className="font-mono text-xs font-medium tabular text-foreground-secondary">
            Question {lockedCount + 1} of {totalItems}
          </span>
          <Progress
            value={lockedCount}
            max={totalItems}
            className="w-full max-w-50"
            label="Assessment progress"
          />
        </div>

        <div className="flex w-1/3 justify-end">
          {timeLimitMs > 0 && (
            <span
              className={`flex items-center gap-1.5 font-mono text-sm tabular ${timerTone}`}
              role="timer"
              aria-label="Time remaining"
            >
              <Timer className="size-4" aria-hidden="true" />
              {formatTime(remainingMs)}
            </span>
          )}
        </div>
      </header>

      {/* ── Scenario ── */}
      <div className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl p-4 pb-8 sm:p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-5">
            <h1 className="text-balance text-xl font-medium leading-normal md:text-2xl">
              {item.prompt}
            </h1>

            <div className="card corner-marks relative p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <strong className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
                  Scenario context
                </strong>
                {item.hint && (
                  <button
                    onClick={() => setHintVisible(!hintVisible)}
                    className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground-secondary transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Lightbulb className="size-3.5" aria-hidden="true" />
                    {hintVisible ? 'Hide hint' : 'Show hint'}
                  </button>
                )}
              </div>

              <p className="text-sm leading-relaxed text-foreground-secondary">{item.context}</p>

              <AnimatePresence initial={false}>
                {hintVisible && item.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-l-2 border-warning bg-warning-subtle p-3 text-xs text-foreground">
                      <strong>Hint: </strong>
                      {item.hint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Options ── */}
          <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Response options">
            {item.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <motion.label
                  key={option.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, ease: 'easeOut' }}
                  className={
                    'card card-interactive group relative flex cursor-pointer items-start gap-4 p-5 text-left ' +
                    (isSelected ? 'border-primary bg-primary-subtle' : '')
                  }
                >
                  <input
                    type="radio"
                    name="assessment-option"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="sr-only"
                  />
                  <span
                    className={
                      'flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-sm font-bold transition-colors ' +
                      (isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-foreground-secondary')
                    }
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="mt-0.5 text-sm font-medium leading-snug">{option.label}</span>
                </motion.label>
              );
            })}
          </fieldset>
        </div>
      </div>

      {/* ── Action bar ── */}
      <footer className="z-10 flex shrink-0 items-center justify-between border-t border-border bg-background p-4 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="hidden items-center gap-2 text-[11px] text-foreground-secondary md:flex"
        >
          <span>Select</span>
          <span className="kbd">A</span>
          <span className="kbd">B</span>
          <span className="kbd">C</span>
          <span className="kbd">D</span>
          <span className="mx-1">· lock</span>
          <span className="kbd">Enter</span>
        </motion.div>

        <div className="flex items-center text-xs text-foreground-secondary md:hidden">
          Response {lockedCount + 1}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {lockedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={undo}>
              <Undo2 className="size-4" />
              Undo last
            </Button>
          )}
          <Button disabled={!selected} onClick={lock} size="lg">
            Lock response <ArrowRight className="size-4" />
          </Button>
        </div>
      </footer>
    </main>
  );
}

/** Shared shell for the two terminal screens: one card, centred, no chrome. */
function Centred({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh-4rem)] flex-1 items-center justify-center overflow-hidden p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="card flex w-full max-w-lg flex-col items-center p-8"
      >
        {children}
      </motion.div>
    </main>
  );
}
