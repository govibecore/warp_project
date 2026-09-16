import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Sparkles, LogIn, TriangleAlert, Eye, EyeOff } from 'lucide-react';
import { useWarpSession } from '../context/WarpSessionContext';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { Input, Select, Field } from './ui/input';
import { WarpLogo } from './WarpLogo';

type FormMode = 'choose' | 'login' | 'register' | 'guest';

const CLASSES = Array.from({ length: 10 }, (_, i) => i + 3);
const DIFFICULTIES = ['Standard', 'Advanced', 'Olympiad'] as const;

function AuthForm({
  type,
  onSwitchMode,
  initialNotice,
}: {
  type: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register' | 'guest', notice?: string) => void;
  initialNotice?: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice || null);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email above to receive password reset instructions.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/?reset-password`,
    });
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
    } else {
      setNotice('Password reset instructions have been sent to your email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (type === 'register') {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            app_role: 'student',
          },
        },
      });
      if (signUpErr) {
        setError(signUpErr.message);
      } else if (data.session) {
        // Automatically signed in
      } else {
        setNotice('Registration successful! Please check your email to verify your account.');
      }
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) {
        setError(signInErr.message);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {/* Header Block */}
      <div className="flex flex-col items-center gap-1.5 text-center mb-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {type === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {type === 'login'
            ? 'Enter your credentials to access your profile and assessment reports'
            : 'Benchmark your latent STEAM ability across five core competencies'}
        </p>
      </div>

      {notice && (
        <div className="border border-primary/30 bg-primary-subtle p-3 text-xs text-primary">
          {notice}
        </div>
      )}
      {error && (
        <div className="border border-destructive/30 bg-destructive-subtle p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Email Field */}
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </Field>

      {/* Password Field with Visibility Toggle */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary"
          >
            Password
          </label>
          {type === 'login' && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Forgot your password?
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={type === 'login' ? 'current-password' : 'new-password'}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
            aria-label="Toggle password visibility"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} block size="lg" className="w-full mt-1 cursor-pointer">
        {loading ? 'Please wait...' : type === 'register' ? 'Sign up' : 'Sign in'}
      </Button>

      {/* Separator */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground tracking-wider font-mono text-[11px]">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        block
        size="lg"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 cursor-pointer border-border hover:bg-surface"
        onClick={async () => {
          setLoading(true);
          const { error: oauthErr } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/?dashboard` },
          });
          if (oauthErr) {
            setError(oauthErr.message);
            setLoading(false);
          }
        }}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      {/* Footer Switcher */}
      <div className="text-center text-sm text-muted-foreground pt-1">
        {type === 'login' ? (
          <span>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
                onSwitchMode('register');
              }}
              className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
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
              className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </span>
        )}
      </div>

      {/* Guest Mode fallback */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={() => onSwitchMode('guest')}
          className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Continue without an account (Guest mode) →
        </button>
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

  return (
    <main
      className="grid min-h-svh w-full lg:grid-cols-2 bg-background overflow-x-hidden"
      data-testid="onboarding-shell"
    >
      {/* ── Left Column: Form & Brand Navigation ── */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 z-10 min-h-svh w-full max-w-lg mx-auto lg:max-w-none lg:order-2">
        {/* Top brand header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToHome}
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
            aria-label="WARP Home"
          >
            <WarpLogo variant="lockup" className="h-8 sm:h-9 w-auto" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className="text-xs font-mono text-foreground-secondary hover:text-foreground cursor-pointer"
            data-testid="back-to-home-btn"
          >
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Home
          </Button>
        </div>

        {/* Center Auth Container */}
        <div className="flex flex-1 items-center justify-center my-4 sm:my-6">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <motion.div key="choose" {...FADE_SLIDE} className="flex w-full flex-col gap-5">
                  <div className="flex flex-col items-center gap-1.5 text-center mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Get started
                    </h1>
                    <p className="text-muted-foreground text-sm text-balance">
                      Sign in, create an account, or continue as a guest to benchmark your STEAM thinking.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="card card-interactive flex w-full items-center justify-between gap-3 p-4 text-left cursor-pointer border border-border hover:border-primary/50"
                    >
                      <span className="flex items-center gap-3">
                        <LogIn className="size-5 shrink-0 text-primary" aria-hidden="true" />
                        <span>
                          <span className="block font-semibold text-foreground text-sm">Sign in</span>
                          <span className="block text-xs text-foreground-secondary">
                            Continue where you left off
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-foreground-secondary" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="card card-interactive flex w-full items-center justify-between gap-3 p-4 text-left cursor-pointer border border-border hover:border-primary/50"
                    >
                      <span className="flex items-center gap-3">
                        <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
                        <span>
                          <span className="block font-semibold text-foreground text-sm">Create free account</span>
                          <span className="block text-xs text-foreground-secondary">
                            Save longitudinal CAT history & reports
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-foreground-secondary" aria-hidden="true" />
                    </button>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground tracking-widest font-mono text-[10px]">
                          Quick test
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => switchMode('guest')}
                      className="w-full text-xs font-mono border-dashed hover:border-primary cursor-pointer"
                    >
                      Continue without an account (Guest mode)
                    </Button>
                  </div>
                </motion.div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <motion.div key={mode} {...FADE_SLIDE} className="w-full">
                  <AuthForm type={mode} onSwitchMode={switchMode} initialNotice={sharedNotice} />
                </motion.div>
              )}

              {mode === 'guest' && (
                <motion.form
                  key="guest"
                  {...FADE_SLIDE}
                  onSubmit={handleGuest}
                  className="flex w-full flex-col gap-4"
                >
                  <div className="flex flex-col items-center gap-1.5 text-center mb-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Quick start
                    </h1>
                    <p className="text-muted-foreground text-sm text-balance">
                      No account needed. Results are saved locally on this device.
                    </p>
                  </div>

                  {formError && (
                    <div className="border border-destructive/30 bg-destructive-subtle p-3 text-xs text-destructive">
                      {formError}
                    </div>
                  )}

                  <div className="flex items-start gap-3 border border-warning/30 bg-warning-subtle p-3">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-foreground-secondary">
                      Guest mode stores benchmark telemetry locally. Select your grade and difficulty to begin.
                    </p>
                  </div>

                  <Field label="Candidate Name" htmlFor="guest-name">
                    <Input
                      id="guest-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      autoComplete="name"
                      required
                    />
                  </Field>

                  <Field label="School / Institution" htmlFor="guest-school">
                    <Input
                      id="guest-school"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Horizon STEM Academy"
                      autoComplete="organization"
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Class Level" htmlFor="guest-class">
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

                  <Button type="submit" size="lg" block className="mt-2 cursor-pointer" data-testid="onboarding-submit">
                    Begin assessment
                    <ArrowRight className="size-4 ml-1" />
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('choose')}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      ← Back to options
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4 text-xs font-mono text-muted-foreground">
          <span>© 2026 WARP Benchmark Systems</span>
          <span>3PL IRT · Nordic Lagom Protocol</span>
        </div>
      </div>

      {/* ── Right Column: Illustration ── */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden lg:order-1 border-r border-border/40">
        <img
          src="/blender-login.jpg"
          alt="Futuristic Learning Concept"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          draggable={false}
        />
        {/* Ambient radial lighting overlay for blending */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_at_50%_50%,transparent_0%,var(--background)_100%)] opacity-30"
        />
      </div>
    </main>
  );
}
