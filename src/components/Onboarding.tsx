import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Sparkles, LogIn, Eye, EyeOff } from 'lucide-react';
import { useWarpSession } from '../context/WarpSessionContext';
import { Button } from './ui/button';
import { Input, Field } from './ui/input';
import { WarpLogo } from './WarpLogo';
import { WarpLottie } from './ui/warp-lottie';
import checkmarkData from '../assets/lottie/checkmark.json';

type FormMode = 'choose' | 'login' | 'register';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice || null);
  const [isSuccess, setIsSuccess] = useState(false);

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
        setIsSuccess(true);
      } else {
        setIsSuccess(true);
        setNotice('Registration successful! Please check your email to verify your account.');
      }
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) {
        setError(signInErr.message);
      } else {
        setIsSuccess(true);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      {/* Header Block */}
      <div className="flex flex-col items-center gap-1.5 text-center mb-1">
        <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight text-foreground">
          {type === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-muted-foreground text-[11px] text-balance">
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
      <Button type="submit" disabled={loading || isSuccess} block size="md" className="w-full mt-2 cursor-pointer font-semibold text-xs tracking-wider uppercase relative overflow-hidden transition-colors">
        {isSuccess ? (
          <span className="absolute inset-0 flex items-center justify-center bg-primary">
            <WarpLottie animationData={checkmarkData} className="w-8 h-8 opacity-90" loop={false} durationMs={3000} />
          </span>
        ) : loading ? 'Please wait...' : type === 'register' ? 'Sign up' : 'Sign in'}
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
        size="md"
        disabled={loading || isSuccess}
        className="w-full flex items-center justify-center gap-2.5 cursor-pointer border-border hover:bg-surface text-sm font-medium"
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
    </form>
  );
}

const FADE_SLIDE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

export function Onboarding() {
  const containerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    // 1. Initial Left Column Stagger
    gsap.from('.gsap-stagger-item', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      delay: 0.1,
    });

    // 2. Ambient subtle breath on the blueprint illustration
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1.03,
        duration: 25,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }, { scope: containerRef });

  const { goHome } = useWarpSession();
  const [mode, setMode] = useState<FormMode>(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const p = new URLSearchParams(window.location.search);
      if (p.has('login')) return 'login';
      if (p.has('register')) return 'register';
    }
    return 'choose';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search);
        if (p.has('login')) setMode('login');
        else if (p.has('register')) setMode('register');
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

  return (
    <main
      ref={containerRef}
      className="grid min-h-svh w-full lg:grid-cols-2 bg-background overflow-x-hidden"
      data-testid="onboarding-shell"
    >
      {/* ── Left Column: Form & Brand Navigation ── */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 z-10 min-h-svh w-full max-w-lg mx-auto lg:max-w-none lg:order-2">
        {/* Top brand header */}
        <div className="gsap-stagger-item flex items-center justify-between">
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
        <div className="gsap-stagger-item flex flex-1 items-center justify-center my-4 sm:my-6">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <motion.div key="choose" {...FADE_SLIDE} className="flex w-full flex-col gap-3">
                  <div className="flex flex-col items-center gap-1.5 text-center mb-3">
                    <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight text-foreground">
                      Get started
                    </h1>
                    <p className="text-muted-foreground text-[11px] text-balance max-w-xs mx-auto">
                      Sign in, create an account, or continue as a guest to benchmark your STEAM thinking.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => switchMode('login')}
                      className="card card-interactive group flex w-full items-center justify-between gap-3 p-4 text-left cursor-pointer border border-border bg-surface hover:border-primary/50 transition-all duration-200"
                    >
                      <span className="flex items-center gap-3">
                        <LogIn className="size-4 shrink-0 text-primary opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                        <span>
                          <span className="block font-sans font-medium text-foreground text-sm">Sign in</span>
                          <span className="block text-[10px] text-foreground-muted group-hover:text-foreground-secondary transition-colors mt-0.5">
                            Continue where you left off
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-foreground-muted group-hover:text-primary group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => switchMode('register')}
                      className="card card-interactive group flex w-full items-center justify-between gap-3 p-4 text-left cursor-pointer border border-border bg-surface hover:border-primary/50 transition-all duration-200"
                    >
                      <span className="flex items-center gap-3">
                        <Sparkles className="size-4 shrink-0 text-primary opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                        <span>
                          <span className="block font-sans font-medium text-foreground text-sm">Create free account</span>
                          <span className="block text-[10px] text-foreground-muted group-hover:text-foreground-secondary transition-colors mt-0.5">
                            Save longitudinal CAT history & reports
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-foreground-muted group-hover:text-primary group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </motion.button>

                  </div>
                </motion.div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <motion.div key={mode} {...FADE_SLIDE} className="w-full">
                  <AuthForm type={mode} onSwitchMode={switchMode} initialNotice={sharedNotice} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="gsap-stagger-item flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4 text-xs font-mono text-muted-foreground">
          <span>© 2026 WARP Benchmark Systems</span>
          <span>3PL IRT · Nordic Lagom Protocol</span>
        </div>
      </div>

      {/* ── Right Column: Illustration ── */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden lg:order-1 border-r border-border/40 p-8 lg:p-12">
        <img
          ref={imgRef}
          src="/blueprint_native_dark.jpg"
          alt="WARP Assessment Architecture"
          className="absolute inset-0 w-full h-full object-contain p-8 lg:p-12 opacity-90 mix-blend-lighten will-change-transform"
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
