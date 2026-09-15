import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Sparkles, LogIn, TriangleAlert } from 'lucide-react';
import { useWarpSession } from '../context/WarpSessionContext';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { Input, Select, Field } from './ui/input';

type FormMode = 'choose' | 'login' | 'register' | 'guest';

const CLASSES = Array.from({ length: 10 }, (_, i) => i + 3);
const DIFFICULTIES = ['Standard', 'Advanced', 'Olympiad'] as const;

function AuthForm({
  type,
  onSwitchMode,
  initialNotice,
}: {
  type: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register', notice?: string) => void;
  initialNotice?: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (type === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: email.trim().split('@')[0],
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        setNotice('Account created successfully! Signing you in...');
      } else if (data.user) {
        // Automatic immediate sign in — account is auto-confirmed in database
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (!signInErr && signInData.session) {
          setNotice('Account created successfully! Signing you in...');
        } else {
          onSwitchMode('login', 'Account created! Please enter your password to sign in.');
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid login credentials. If you have not created an account yet, please click "Sign up" below.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setError('Account is being activated. Please try clicking "Sign in" again.');
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
      
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-foreground-secondary tracking-widest font-bold">Or</span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="secondary" 
        block 
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/?dashboard` },
          });
          if (error) {
            setError(error.message);
            setLoading(false);
          }
        }}
      >
        <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
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
    body: 'Sign in, create an account, or continue without one to benchmark your STEM or English thinking.',
  },
  login: { title: 'Welcome back', body: 'Sign in to pick up where you left off.' },
  register: {
    title: 'Create your account',
    body: 'An account keeps your history and unlocks the written report.',
  },
  guest: {
    title: 'Quick start',
    body: 'No account needed. Results are saved on this device only. Choose your STEM or English track after setup.',
  },
};

export function Onboarding() {
  const { setProfile, goHome } = useWarpSession();
  const { setGuest } = useAuthStore();
  const [mode, setMode] = useState<FormMode>(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const p = new URLSearchParams(window.location.search);
      if (p.has('login')) return 'login';
      if (p.has('register')) return 'register';
      if (p.has('guest')) return 'guest';
    }
    return 'choose';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search);
        if (p.has('login')) setMode('login');
        else if (p.has('register')) setMode('register');
        else if (p.has('guest')) setMode('guest');
        else setMode('choose');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [sharedNotice, setSharedNotice] = useState<string | null>(null);

  const switchMode = (newMode: FormMode, notice?: string) => {
    setMode(newMode);
    setSharedNotice(notice || null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newMode === 'choose' ? window.location.pathname : `?${newMode}`);
    }
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    goHome();
  };

  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('8');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('Standard');
  const [schoolName, setSchoolName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleGuest = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !schoolName.trim()) {
      setFormError('Please fill in your name and school to continue.');
      return;
    }
    setFormError(null);
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setGuest();
    setProfile({ name: name.trim(), classLevel: Number(classLevel), difficulty, schoolName: schoolName.trim() });
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
            International STEM & English benchmark
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
                onClick={() => switchMode('register')}
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
                onClick={() => switchMode('login')}
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

              <Button variant="ghost" size="sm" onClick={() => switchMode('guest')}>
                Continue without an account
              </Button>

              <Button variant="ghost" size="sm" onClick={handleBackToHome} data-testid="back-to-home-btn">
                <ArrowLeft className="size-4" />
                Back to home
              </Button>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div key="login" {...FADE_SLIDE} className="flex w-full flex-col items-center gap-4">
              <AuthForm type="login" onSwitchMode={switchMode} initialNotice={sharedNotice} />
              <Button variant="ghost" size="sm" onClick={() => switchMode('choose')}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div key="register" {...FADE_SLIDE} className="flex w-full flex-col items-center gap-4">
              <AuthForm type="register" onSwitchMode={switchMode} initialNotice={sharedNotice} />
              <Button variant="ghost" size="sm" onClick={() => switchMode('choose')}>
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
              {formError && (
                <div className="rounded-(--radius-control) border border-destructive/30 bg-destructive-subtle p-3 text-xs text-destructive">
                  {formError}
                </div>
              )}
              <div className="flex items-start gap-3 rounded-(--radius-control) border border-warning/30 bg-warning-subtle p-3">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-foreground-secondary">
                  Guest mode saves results to this device only. You will choose between STEM and English Literacy tracks on the next screen.
                </p>
              </div>

              <Field label="What should we call you?" htmlFor="guest-name">
                <Input
                  id="guest-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </Field>

              <Field label="School Name" htmlFor="guest-school">
                <Input
                  id="guest-school"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Kendriya Vidyalaya"
                  autoComplete="organization"
                  required
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

              <Button variant="ghost" size="sm" onClick={() => switchMode('choose')}>
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
