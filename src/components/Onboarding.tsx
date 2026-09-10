import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Sparkles, LogIn, TriangleAlert } from 'lucide-react';
import { useAxiomSession } from '../context/AxiomSessionContext';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { Input, Select, Field } from './ui/input';

type FormMode = 'choose' | 'login' | 'register' | 'guest';

const CLASSES = Array.from({ length: 10 }, (_, i) => i + 3);
const DIFFICULTIES = ['Standard', 'Advanced', 'Olympiad'] as const;

function AuthForm({
  type,
  onSwitchMode,
}: {
  type: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (type === 'register') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user && !data.session) {
        setNotice('Registration successful! Please check your email inbox to confirm your account before signing in.');
      } else if (data.user && data.session) {
        setNotice('Account created successfully! Signing you in...');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid login credentials. If you haven\'t created an account yet, please sign up first.');
        } else {
          setError(error.message);
        }
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card flex w-full flex-col gap-4 p-6">
      {notice && (
        <div className="rounded-(--radius-control) border border-primary/30 bg-primary-subtle p-3 text-xs text-primary">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-(--radius-control) border border-destructive/30 bg-destructive-subtle p-3 text-xs text-destructive">
          {error}
        </div>
      )}
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" disabled={loading} block>
        {loading ? 'Please wait...' : type === 'register' ? 'Sign up' : 'Sign in'}
      </Button>

      <div className="text-center text-xs text-foreground-secondary pt-2">
        {type === 'login' ? (
          <span>
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
                onSwitchMode('register');
              }}
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
                onSwitchMode('login');
              }}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </span>
        )}
      </div>
    </form>
  );
}

const FADE_SLIDE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

const HEADINGS: Record<FormMode, { title: string; body: string }> = {
  choose: {
    title: 'Get started',
    body: 'Sign in, create an account, or continue without one to benchmark your STEM thinking.',
  },
  login: { title: 'Welcome back', body: 'Sign in to pick up where you left off.' },
  register: {
    title: 'Create your account',
    body: 'An account keeps your history and unlocks the written report.',
  },
  guest: {
    title: 'Quick start',
    body: 'No account needed. Results are saved on this device only.',
  },
};

export function Onboarding() {
  const { setProfile, goHome } = useAxiomSession();
  const { setGuest } = useAuthStore();
  const [mode, setMode] = useState<FormMode>('choose');

  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('8');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('Standard');

  const handleGuest = (e: FormEvent) => {
    e.preventDefault();
    setGuest();
    setProfile({ name: name.trim() || 'Learner', classLevel: Number(classLevel), difficulty });
  };

  const heading = HEADINGS[mode];

  return (
    <main
      className="flex h-full w-full flex-1 items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6"
      data-testid="onboarding-shell"
    >
      <div className="z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            International STEM benchmark
          </p>
          <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
            {heading.title}
          </h1>
          <p className="text-sm leading-relaxed text-foreground-secondary">{heading.body}</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" {...FADE_SLIDE} className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="card card-interactive flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-bold">Create free account</span>
                    <span className="block text-xs text-foreground-secondary">
                      Written report · history · global benchmarks
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-foreground-secondary" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="card card-interactive flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <span className="flex items-center gap-3">
                  <LogIn className="size-5 shrink-0 text-foreground-secondary" aria-hidden="true" />
                  <span>
                    <span className="block font-bold">Sign in</span>
                    <span className="block text-xs text-foreground-secondary">
                      Continue where you left off
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-foreground-secondary" aria-hidden="true" />
              </button>

              <Button variant="ghost" size="sm" onClick={() => setMode('guest')}>
                Continue without an account
              </Button>

              <Button variant="ghost" size="sm" onClick={goHome}>
                <ArrowLeft className="size-4" />
                Back to home
              </Button>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div key="login" {...FADE_SLIDE} className="flex w-full flex-col items-center gap-4">
              <AuthForm type="login" onSwitchMode={setMode} />
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div key="register" {...FADE_SLIDE} className="flex w-full flex-col items-center gap-4">
              <AuthForm type="register" onSwitchMode={setMode} />
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </motion.div>
          )}

          {mode === 'guest' && (
            <motion.form
              key="guest"
              {...FADE_SLIDE}
              onSubmit={handleGuest}
              className="card flex w-full flex-col gap-4 p-6"
            >
              <div className="flex items-start gap-3 rounded-(--radius-control) border border-warning/30 bg-warning-subtle p-3">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-foreground-secondary">
                  Guest mode saves results to this device only. You won't get a written report,
                  and your history won't follow you.
                </p>
              </div>

              <Field label="What should we call you?" htmlFor="guest-name">
                <Input
                  id="guest-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="given-name"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Class" htmlFor="guest-class">
                  <Select
                    id="guest-class"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                  >
                    {CLASSES.map((l) => (
                      <option key={l} value={l}>
                        Class {l}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Difficulty" htmlFor="guest-difficulty">
                  <Select
                    id="guest-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as (typeof DIFFICULTIES)[number])}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Button type="submit" size="lg" block data-testid="onboarding-submit">
                Begin assessment
                <ArrowRight className="size-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
