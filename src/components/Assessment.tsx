import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, AlertTriangle, RotateCcw, Lightbulb, Sparkles } from 'lucide-react';
import { useAssessment } from '../hooks/useAssessment';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useWarpSession } from '../context/WarpSessionContext';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { getNemotronSocraticHint } from '../lib/nvidiaService';
import { AssessmentTutorial } from './AssessmentTutorial';
import { COMPETENCY_LABELS, CompetencyKey } from '../lib/irt/globalBenchmark';

function getGuestId(): string {
  let id = localStorage.getItem('warp_guest_student_id');
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    id = crypto.randomUUID();
    localStorage.setItem('warp_guest_student_id', id);
  }
  return id;
}

async function ensureGuestStudent(name: string, classLevel: number, difficulty: string, schoolName?: string): Promise<string> {
  const guestId = getGuestId();
  const { error } = await supabase.from('students').upsert({
    id: guestId,
    full_name: name || 'Guest Candidate',
    school_name: schoolName,
    current_class: classLevel,
    difficulty_pref: difficulty,
    consent_status: 'guest_provisional'
  }, { onConflict: 'id' });
  if (error) {
    console.error('Failed to ensure guest student:', error);
    throw error;
  }
  return guestId;
}

export function Assessment() {
  const { user } = useSupabaseAuth();
  const { isGuest } = useAuthStore();
  const { session } = useWarpSession();
  const {
    currentScenario: item,
    submitResponse,
    finishAssessment,
    seenScenarios,
    status,
    loading,
    errorMessage,
    startAssessment,
    assessmentId,
    startTime,
  } = useAssessment();
  const [selectedOptionId, setSelectedOptionId] = useState<string>();
  const [socraticHint, setSocraticHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Live timer tracking
  useEffect(() => {
    if (status !== 'in_progress') return;
    const interval = setInterval(() => {
      if (startTime) {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
      } else {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-start assessment when mounted and idle
  useEffect(() => {
    if (status === 'idle' && !showTutorial) {
      const classLevel = session.profile?.classLevel || 8;
      const difficulty = session.profile?.difficulty?.toLowerCase() || 'standard';
      const rawSubject = session.plan?.subject || 'STEM';
      const subject = rawSubject === 'English' ? 'English Literacy' : rawSubject;
      if (user) {
        startAssessment(user.id, classLevel, difficulty, subject);
      } else if (isGuest) {
        ensureGuestStudent(session.profile?.name || 'Guest Candidate', classLevel, difficulty, session.profile?.schoolName)
          .then((guestId) => startAssessment(guestId, classLevel, difficulty, subject))
          .catch((err) => {
            console.error('Failed to start guest assessment:', err);
            useAssessment.setState({ 
              status: 'error', 
              errorMessage: 'Failed to create guest session. Please verify your details and try again.' 
            });
          });
      }
    }
  }, [status, user, isGuest, session.profile, startAssessment, showTutorial]);

  const selected = item?.options.find((option: any) => option.text === selectedOptionId);
  const lockedCount = seenScenarios.length;
  // Full international benchmark pool: 30 items per class
  const totalItems = 30;
  const progressPercent = (lockedCount / totalItems) * 100;
  
  const lock = useCallback(() => {
    if (selected && item && !loading) {
      submitResponse(selected.correct, selected);
      setSelectedOptionId(undefined);
      setSocraticHint(null);
    }
  }, [selected, item, submitResponse, loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey ||
        (e.target instanceof HTMLElement && (
          e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
          e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' ||
          e.target.closest('[contenteditable="true"]')
        )) ||
        !item || loading
      ) return;

      const key = e.key.toLowerCase();
      const letters = ['a', 'b', 'c', 'd'];
      const digits = ['1', '2', '3', '4'];
      const index = letters.indexOf(key) !== -1 ? letters.indexOf(key) : digits.indexOf(key);

      if (index !== -1 && item.options[index]) {
        setSelectedOptionId(item.options[index].text);
      } else if (key === 'enter' && selectedOptionId) {
        lock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, selectedOptionId, lock, loading]);

  // ── Error state ──────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <Centred>
        <div className="mb-4 inline-flex p-3 bg-destructive-subtle text-destructive border border-destructive/20">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold tracking-tight">
          Unable to load assessment
        </h1>
        <p className="mb-6 text-sm text-foreground-secondary max-w-sm">
          {errorMessage || 'There was an issue fetching the scenario. Please check your connection and try again.'}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              const classLevel = session.profile?.classLevel || 8;
              const difficulty = session.profile?.difficulty?.toLowerCase() || 'standard';
              const rawSubject = session.plan?.subject || 'STEM';
              const subject = rawSubject === 'English' ? 'English Literacy' : rawSubject;
              if (user) {
                startAssessment(user.id, classLevel, difficulty, subject);
              } else if (isGuest) {
                ensureGuestStudent(session.profile?.name || 'Guest Candidate', classLevel, difficulty, session.profile?.schoolName)
                  .then((guestId) => startAssessment(guestId, classLevel, difficulty, subject))
                  .catch((err) => {
                    console.error('Failed to retry guest assessment:', err);
                    useAssessment.setState({ 
                      status: 'error', 
                      errorMessage: 'Failed to create guest session. Please verify your details and try again.' 
                    });
                  });
              }
            }}
            size="md"
          >
            <RotateCcw className="size-4" /> Try Again
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              window.location.search = '?dashboard';
            }}
            size="md"
          >
            Go to Dashboard
          </Button>
        </div>
      </Centred>
    );
  }

  // ── Unauthenticated state ────────────────────────────────────────────────
  if (!user && !isGuest && status === 'idle') {
    return (
      <Centred>
        <h1 className="mb-2 font-display text-2xl font-bold tracking-tight">
          Sign In Required
        </h1>
        <p className="mb-6 text-sm text-foreground-secondary max-w-sm">
          Please sign in or continue as a guest to begin your adaptive STEM benchmark assessment.
        </p>
        <Button onClick={() => { window.location.href = '/'; }} size="md">
          Go to Sign In
        </Button>
      </Centred>
    );
  }

  if (showTutorial && status === 'idle') {
    return <AssessmentTutorial onStart={() => setShowTutorial(false)} />;
  }

  // ── All items answered — no confetti, just a calm chip ─────────────────
  if (status === 'completed') {
    return (
      <Centred>
        <div className="mb-4 flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary-subtle text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            Assessment complete
          </span>
          <span className="inline-flex items-center gap-2 px-2 py-0.5 border border-[#8FCFE8]/30 bg-[#8FCFE8]/10 text-[#8FCFE8] text-[10px] font-mono uppercase tracking-wider">
            New Personal Best
          </span>
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight">
          Evidence captured
        </h1>
        <p className="mb-8 text-sm text-foreground-secondary">
          Generate your projected benchmark from the decisions you have locked.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {assessmentId && (
            <Button onClick={() => { window.location.search = `?assessment=${assessmentId}`; }} size="lg" block>
              View Report <ArrowRight className="size-4" />
            </Button>
          )}
          <Button
            variant={assessmentId ? 'secondary' : 'primary'}
            onClick={() => { window.location.search = '?dashboard'; }}
            size="lg"
            block
          >
            View Dashboard <ArrowRight className="size-4" />
          </Button>
        </div>
      </Centred>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (status === 'in_progress' && !item) {
    return (
      <Centred>
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" />
          <p className="text-sm text-foreground-secondary">Loading scenario...</p>
        </div>
      </Centred>
    );
  }

  if (status === 'idle') {
    return (
      <Centred>
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" />
          <p className="text-sm text-foreground-secondary">Preparing assessment...</p>
        </div>
      </Centred>
    );
  }

  if (!item) return null;

  return (
    <main className="relative flex h-full w-full flex-1 flex-col" data-testid="assessment-shell">
      {/* ── Progress header ── */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge tone="primary">Adaptive Phase</Badge>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-xs font-medium tabular text-foreground-secondary">
            Question {lockedCount + 1} of {totalItems}
          </span>
          {/* 2px hairline progress in accent — replaces the chunky <Progress> bar */}
          <div className="relative w-48 h-0.5 bg-border overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-300"
              style={{ width: `${progressPercent}%`, transitionTimingFunction: 'var(--ease-lagom)' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quiet mono elapsed-time — no pulse, no icon animation */}
          <span className="font-mono text-xs tabular text-foreground-muted">
            {formatTimer(elapsedSeconds)}
          </span>
          <Button variant="ghost" size="sm" onClick={finishAssessment}>Finish Early</Button>
        </div>
      </header>

      {/* ── Scenario ── */}
      <div className="w-full flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="mx-auto w-full max-w-180 p-4 pb-8 sm:p-6 md:p-8"
          >
            <div className="mb-8 flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {COMPETENCY_LABELS[item.competency as CompetencyKey] || item.competency}
              </span>

              <h1 className="text-balance text-xl font-medium leading-normal md:text-2xl">
                {item.prompt}
              </h1>

              {item.context_image && (
                <div className="card corner-marks relative p-5">
                  <img src={item.context_image} alt="Context" className="w-full h-auto" />
                </div>
              )}

              {/* Socratic Hint powered by NVIDIA Nemotron */}
              {!socraticHint ? (
                <div className="flex items-center pt-1">
                  <button
                    type="button"
                    disabled={hintLoading}
                    onClick={async () => {
                      setHintLoading(true);
                      try {
                        const hint = await getNemotronSocraticHint(
                          item.prompt,
                          item.competency,
                          session.profile?.classLevel || 8
                        );
                        setSocraticHint(hint);
                      } finally {
                        setHintLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 border border-border bg-accent/30 px-3 py-1 text-xs font-medium text-foreground-secondary hover:border-primary/40 hover:bg-primary-subtle hover:text-primary transition-colors disabled:opacity-50"
                    style={{ transitionDuration: '200ms', transitionTimingFunction: 'var(--ease-lagom)' }}
                  >
                    <Sparkles className="size-3 text-primary" />
                    <span>{hintLoading ? 'Formulating Socratic hint...' : 'Need a hint? Ask Nemotron'}</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                  className="border border-primary/20 bg-primary-subtle p-3.5 text-xs text-foreground flex items-start gap-3"
                >
                  <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-primary">
                      Socratic Invariant Guide (NVIDIA Nemotron)
                    </span>
                    <p className="leading-relaxed text-foreground-secondary">{socraticHint}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Options: single-column, full-width hairline rows ── */}
            <fieldset className="flex flex-col gap-0" aria-label="Response options">
              {item.options.map((option: any, index: number) => {
                const isSelected = selectedOptionId === option.text;
                return (
                  <label
                    key={index}
                    className={
                      'group relative flex cursor-pointer items-center gap-4 border border-border px-5 py-4 text-left transition-colors -mt-px first:mt-0 ' +
                      (isSelected
                        ? 'z-10 border-primary bg-primary/8'
                        : 'hover:border-border-strong')
                    }
                    style={{ transitionDuration: '200ms', transitionTimingFunction: 'var(--ease-lagom)' }}
                  >
                    <input
                      type="radio"
                      name="assessment-option"
                      value={option.text}
                      checked={isSelected}
                      onChange={() => setSelectedOptionId(option.text)}
                      className="sr-only"
                    />
                    <span
                      className={
                        'flex size-7 shrink-0 items-center justify-center text-xs font-bold transition-colors ' +
                        (isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-foreground-secondary')
                      }
                      aria-hidden="true"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium leading-snug">{option.text}</span>
                  </label>
                );
              })}
            </fieldset>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Action bar ── */}
      <footer className="z-10 flex shrink-0 items-center justify-between border-t border-border bg-background p-4 px-6">
        <div className="hidden items-center gap-2 text-[11px] text-foreground-secondary md:flex">
          <span>Select</span>
          <span className="kbd">A</span>
          <span className="kbd">B</span>
          <span className="kbd">C</span>
          <span className="kbd">D</span>
          <span className="mx-1">· lock</span>
          <span className="kbd">Enter</span>
        </div>

        <div className="flex items-center text-xs text-foreground-secondary md:hidden">
          Response {lockedCount + 1}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button disabled={!selected || loading} onClick={lock} size="lg">
            {loading ? 'Processing...' : 'Lock response'} <ArrowRight className="size-4" />
          </Button>
        </div>
      </footer>
    </main>
  );
}

function Centred({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh-4rem)] flex-1 items-center justify-center overflow-hidden p-6 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
        className="card flex w-full max-w-lg flex-col items-center p-8"
      >
        {children}
      </motion.div>
    </main>
  );
}
