import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import {
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { signOutUser } from '../lib/auth';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BentoGrid, BentoGridItem } from './ui/bento';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import { Typewriter } from './ui/aliimam/Typewriter';
import { DotPattern } from './ui/aliimam/DotPattern';
import { GridPattern } from './ui/aliimam/GridPattern';
import { WarpLogo } from './WarpLogo';
import { CinematicHero } from './CinematicHero';
import { TextMatrixDecode, IntersectionScope, ChromeGlowButton } from './ui/pixel-perfect';

/**
 * The glade is lazy-loaded: three.js lands in its own chunk and never delays
 * first paint. Until it arrives the hero simply shows its own backdrop.
 */
const GladeCanvas = lazy(() => import('./GladeCanvas'));
const StemCityCanvas = lazy(() => import('./StemCityCanvas'));

interface LandingProps {
  onEnter(mode?: 'choose' | 'login' | 'register' | 'guest'): void;
}

const STATS = [
  { value: '5', label: 'Competency domains' },
  { value: '30', label: 'Adaptive items' },
  { value: '3–12', label: 'Class levels' },
  { value: '5', label: 'Global benchmark cohorts' },
];

const HERO_NAV = [
  { label: 'Telemetry', href: '#features' },
  { label: 'STEM City', href: '#stem-city' },
  { label: 'Competencies', href: '#competencies' },
  { label: 'Frameworks', href: '#frameworks' },
  { label: 'Report', href: '#report' },
  { label: 'Access', href: '#access' },
  { label: 'FAQ', href: '#faq' },
];

const COMPETENCIES = [
  {
    n: '01',
    name: 'Scientific Inquiry',
    mission: 'Ecology',
    color: 'var(--chart-1)',
    body: 'Read the empirical evidence, run the controlled comparison, state what the data actually demonstrates — not what intuition anticipated.',
  },
  {
    n: '02',
    name: 'Computational Thinking',
    mission: 'Data',
    color: 'var(--chart-2)',
    body: 'Deconstruct a non-linear problem into algorithmic, modular steps precise enough that a machine or automated check can verify them.',
  },
  {
    n: '03',
    name: 'Engineering Design',
    mission: 'Infrastructure',
    color: 'var(--chart-3)',
    body: 'Weigh trade-offs against physical and material constraints, then choose what to build first — and what to deliberately omit.',
  },
  {
    n: '04',
    name: 'Mathematical Reasoning',
    mission: 'Energy',
    color: 'var(--chart-4)',
    body: 'Translate an ambiguous operational situation into quantitative models, then convert the calculated outputs back into a decision.',
  },
  {
    n: '05',
    name: 'Systems Thinking',
    mission: 'Space',
    color: 'var(--chart-5)',
    body: 'Model the complete feedback loop: stocks, flows, delays, and second-order dynamics that cause systemic behaviors to compound.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Initialize Session',
    body: 'Select your class level (Classes 3–12). Guest mode runs completely in-browser on your device; account creation unlocks longitudinal syncing.',
  },
  {
    num: '02',
    title: 'Work the Scenarios',
    body: 'Thirty Computerized Adaptive Testing (CAT) items across five STEAM missions — energy, ecology, space, data, and infrastructure. Each asks you to decide under constraints.',
  },
  {
    num: '03',
    title: 'Read Your Signal',
    body: 'Instant normative report with latent ability (θ), standard error boundaries, global cohort standing, and one prioritized learning vector for the week.',
  },
];

const REPORT_ROWS = [
  { name: 'Scientific Inquiry', you: 71, cohort: 59, color: 'var(--chart-1)' },
  { name: 'Computational Thinking', you: 63, cohort: 58, color: 'var(--chart-2)' },
  { name: 'Engineering Design', you: 52, cohort: 58, color: 'var(--chart-3)' },
  { name: 'Mathematical Reasoning', you: 66, cohort: 59, color: 'var(--chart-4)' },
  { name: 'Systems Thinking', you: 57, cohort: 61, color: 'var(--chart-5)' },
];

const FRAMEWORK_STANDARDS = [
  {
    code: 'SG-MOE',
    title: 'Singapore MOE',
    description: 'Syllabus & heuristic reasoning framework',
    domain: 'Math & Science Curricula',
  },
  {
    code: 'OECD-PISA',
    title: 'OECD PISA',
    description: 'Scientific & mathematical literacy scale',
    domain: 'Comparative Global Norms',
  },
  {
    code: 'IEA-TIMSS',
    title: 'IEA TIMSS',
    description: 'Cognitive domains: Knowing, Applying, Reasoning',
    domain: 'International Benchmarks',
  },
  {
    code: 'US-NGSS',
    title: 'NGSS Science',
    description: 'Three-dimensional science & engineering design',
    domain: 'Cross-Cutting Concepts',
  },
  {
    code: 'CAMBRIDGE',
    title: 'Cambridge STEM',
    description: 'IGCSE inquiry & analytical validation standards',
    domain: 'Secondary STEM Standards',
  },
  {
    code: 'IB-SCI',
    title: 'IB Science',
    description: 'Systems inquiry, experimental design & ethics',
    domain: 'Diploma & MYP Framework',
  },
];

const FAQ = [
  {
    q: 'How long does the assessment take?',
    a: 'Approximately 10 to 12 minutes: thirty adaptive scenario items calibrated via 3PL Item Response Theory, plus five calibration baseline items. No countdown pressure.',
  },
  {
    q: 'How does cohort norming work across different class levels?',
    a: 'Students in Classes 3–12 are strictly normed against their specific class-level cohort. A Class 4 student is calibrated against international Class 4 baselines, never secondary cohorts.',
  },
  {
    q: 'What is Computerized Adaptive Testing (CAT)?',
    a: 'Our server-authoritative 3PL IRT engine recalculates your latent ability estimate (θ) after every item. As you answer correctly, difficulty (b) dynamically scales to find your boundary with mathematical precision.',
  },
  {
    q: 'Can I test without creating an account?',
    a: 'Yes. Full guest mode is supported. All psychometric calculations run securely, and data remains on this device until you choose to link an account for longitudinal tracking.',
  },
  {
    q: 'Is student data private and protected?',
    a: 'All data is encrypted in transit and at rest using strict row-level security. We never sell student data or serve ads. Full compliance with student privacy standards.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'WARP gives us something standardized tests never could: a true diagnostic of how students think under constraints, rather than what formula they memorized.',
    name: 'Dr. Aris Thorne',
    role: 'Head of STEM Curriculum',
    institution: 'Singapore International Academy',
    badge: 'Curriculum Director',
  },
  {
    quote:
      'Seeing my gap in Systems Thinking compared to the global cohort showed me exactly what to practice. Two months later my score jumped +14 points.',
    name: 'Maya Lin',
    role: 'Class 9 Student',
    institution: 'Global Cohort Pilot',
    badge: 'Student Participant',
  },
  {
    quote:
      'The parent report was written in clear, actionable language without statistical haze. For once, our staff and parents were on the exact same page.',
    name: 'Marcus Vance',
    role: 'District STEM Coordinator',
    institution: 'Pacific Innovation Network',
    badge: 'District Administrator',
  },
];

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

/** Architectural 45-degree diagonal hatched accent bar (Ali Imam landing-01 inspired) */
function HatchedAccentBar({ height = 'h-6' }: { height?: string }) {
  return (
    <div className={`relative ${height} w-full overflow-hidden border-y border-border/40 opacity-40`} aria-hidden="true">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <div className="relative h-full w-full">
          {Array.from({ length: 180 }).map((_, i) => (
            <div
              key={i}
              className="outline-primary/30 absolute h-3.5 w-full origin-top-left -rotate-45 outline-[0.5px] outline-offset-[-0.25px]"
              style={{
                top: `${i * 14 - 80}px`,
                left: '-100%',
                width: '300%',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Flanking diagonal hatched wings for technical section headers */
function HatchedWing() {
  return (
    <div className="relative w-4 self-stretch overflow-hidden sm:w-6 md:w-8 lg:w-12 border-x border-border/40" aria-hidden="true">
      <div className="absolute -top-30 -left-10 flex w-40 flex-col items-start justify-start opacity-30">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="outline-primary/40 h-4 origin-top-left -rotate-45 self-stretch outline-[0.5px] outline-offset-[-0.25px]"
          />
        ))}
      </div>
    </div>
  );
}

/** GSAP-powered cinematic hero text block with staggered reveal. */
function HeroCopy({ onEnter }: { onEnter: () => void }) {
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;

    const children = el.querySelectorAll('[data-hero-reveal]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        { opacity: 0, y: 32, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3,
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-2 flex flex-1 flex-col justify-center px-6 py-8 sm:px-12 sm:py-10 md:px-20 lg:px-28">
      <div className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl">
        {/* Soft radial backdrop aura behind hero text block for enhanced legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-10 -z-1 bg-[radial-gradient(ellipse_at_20%_40%,oklch(0.235_0.016_245/0.95)_0%,oklch(0.275_0.018_245/0.65)_50%,transparent_75%)] blur-xl"
        />

        <div ref={copyRef} className="flex flex-col items-start">
          {/* Calibrated scientific badge */}
          <a
            href="#stem-city"
            data-hero-reveal
            className="group mb-5 inline-flex items-center gap-2.5 border border-border bg-surface/85 px-3 py-1.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-surface"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-primary opacity-75" />
              <span className="relative inline-flex size-2 bg-primary" />
            </span>
            <TextMatrixDecode
              trigger="mount"
              delay={0.3}
              duration={0.8}
              className="text-[10px] font-semibold tracking-wider text-primary uppercase"
            >
              GLOBAL NORM
            </TextMatrixDecode>
            <span className="h-3 w-px bg-border-strong" />
            <span className="text-xs font-medium text-foreground-secondary">
              Five competencies · adaptive cohort
            </span>
            <ArrowRight className="size-3 text-foreground-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
          </a>

          {/* Heading with fluid single-line typewriter */}
          <h1
            data-hero-reveal
            className="mb-4 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-none tracking-tight text-foreground whitespace-nowrap min-h-[1.15em] flex items-center sm:mb-5"
          >
            <Typewriter
              words={[
                "Close the gap.",
                "Measure real ability.",
                "Benchmark your mind.",
                "Master five domains.",
              ]}
              typingSpeed={85}
              deletingSpeed={40}
              pauseDuration={2400}
              loop={true}
            />
          </h1>

          {/* Subtitle with balanced 2-line cadence */}
          <p
            data-hero-reveal
            className="mb-7 max-w-xl text-base sm:text-lg leading-relaxed text-foreground-secondary font-normal antialiased"
          >
            WARP benchmarks how you think across five STEAM competencies against the
            global cohort — revealing your exact gap vector and how to close it.
          </p>

          {/* Harmonized CTA button pair */}
          <div data-hero-reveal className="flex flex-wrap items-center gap-3.5">
            <ChromeGlowButton
              id="landing-start-btn"
              size="lg"
              onClick={onEnter}
              data-testid="landing-cta"
            >
              Start your assessment
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </ChromeGlowButton>
            <Button
              variant="ghost"
              size="lg"
              className="h-11 px-6 border border-border bg-surface/85 text-foreground hover:border-primary/50 hover:bg-elevated hover:text-foreground backdrop-blur-sm shadow-xs transition-all duration-200 font-medium"
              onClick={() =>
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <Activity className="size-3.5 text-primary" />
              Explore telemetry
            </Button>
          </div>

          {/* Calibrated telemetry footnote strip */}
          <div
            data-hero-reveal
            className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-foreground-muted"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-primary" />
              <TextMatrixDecode trigger="mount" delay={0.6} duration={0.9}>
                Free & open access
              </TextMatrixDecode>
            </span>
            <span className="text-border-strong">/</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3 text-primary" />
              <TextMatrixDecode trigger="mount" delay={0.8} duration={0.9}>
                ~10 min adaptive benchmark
              </TextMatrixDecode>
            </span>
            <span className="text-border-strong">/</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-primary" />
              <TextMatrixDecode trigger="mount" delay={1.0} duration={0.9}>
                Zero tracking or ads
              </TextMatrixDecode>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 
 * Interactive 3-Card Auto-Advancing Feature Spotlight
 * Direct architectural adaptation of Ali Imam's feature-cards.tsx with Nordic Lagom hardening
 */
function FeatureSpotlight({ onEnter }: { onEnter: () => void }) {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return;
      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((curr) => (curr + 1) % 3);
          }
          return 0;
        }
        return prev + 2; // 2% per 100ms = 5000ms (5 seconds total cycle)
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      mountedRef.current = false;
    };
  }, []);

  const handleCardClick = (index: number) => {
    setActiveCard(index);
    setProgress(0);
  };

  return (
    <section id="features" className="section relative w-full scroll-mt-16 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-3 font-mono text-[11px] uppercase tracking-wider text-primary">
            Psychometric Architecture
          </Badge>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Precision cognitive measurement
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-foreground-secondary">
            No memorization recall drills or arbitrary streak counters. An instrument calibrated to
            surface your true ability boundary.
          </p>
        </div>

        {/* Live Synchronized Telemetry Viewport (480px height) */}
        <div className="relative mx-auto flex h-120 w-full max-w-5xl flex-col items-start justify-start overflow-hidden border border-border bg-surface/30 shadow-sm">
          {/* Top Telemetry Header Bar */}
          <div className="flex h-10 w-full items-center justify-between border-b border-border bg-background/80 px-4 font-mono text-xs text-foreground-secondary">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-primary" aria-hidden="true" />
              <span className="uppercase tracking-[0.15em] text-foreground font-semibold">
                WARP-CALIBRATION-VIEW // {activeCard === 0 ? 'IRT-3PL-ENGINE' : activeCard === 1 ? '5-DOMAIN-STEAM' : 'NORM-DISTRIBUTION'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">CYCLE: 5.0s</span>
              <span className="text-primary font-bold">LIVE TELEMETRY</span>
            </div>
          </div>

          {/* Viewport Content with Smooth Blur-Scale Crossfade */}
          <div className="relative flex flex-1 w-full items-center justify-center p-6">
            {/* ── Viewport 0: Adaptive 3PL IRT Engine ── */}
            <div
              className={`absolute inset-0 flex flex-col justify-between p-6 sm:p-10 transition-all duration-500 ease-out ${
                activeCard === 0 ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-0 blur-sm pointer-events-none'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-primary">Item Response Theory</span>
                  <h3 className="font-display text-2xl font-bold">Adaptive Ability Convergence (θ)</h3>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="border border-border bg-background px-3 py-1.5">
                    ESTIMATED θ: <span className="font-bold text-primary">+1.42</span>
                  </div>
                  <div className="border border-border bg-background px-3 py-1.5">
                    SE(θ): <span className="font-bold text-success">0.24</span>
                  </div>
                </div>
              </div>

              {/* Simulated IRT Calibration Trajectory Graph */}
              <div className="my-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 border border-border bg-background p-5">
                  <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-foreground-secondary">
                    <span>ITEM PRESENTATION TRAJECTORY (30 STEPS)</span>
                    <span className="text-primary">CONVERGED AT ITEM 24</span>
                  </div>
                  {/* Step line chart representation */}
                  <div className="relative h-40 w-full border-b border-l border-border/80 flex items-end">
                    {/* Background gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none">
                      <div className="border-b border-dashed border-foreground" />
                      <div className="border-b border-dashed border-foreground" />
                      <div className="border-b border-dashed border-foreground" />
                    </div>
                    {/* Trajectory points */}
                    <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 120">
                      <polyline
                        fill="none"
                        stroke="var(--color-ink-3)"
                        strokeDasharray="4,4"
                        strokeWidth="1.5"
                        points="0,60 300,60"
                      />
                      <polyline
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="2.5"
                        points="10,80 40,55 70,35 100,45 130,25 160,20 190,22 220,18 250,19 280,18"
                      />
                      {[
                        [10,80], [40,55], [70,35], [100,45], [130,25],
                        [160,20], [190,22], [220,18], [250,19], [280,18]
                      ].map(([x, y], idx) => (
                        <circle key={idx} cx={x} cy={y} r="3.5" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2" />
                      ))}
                    </svg>
                  </div>
                  <div className="mt-3 flex justify-between font-mono text-[10px] text-foreground-secondary">
                    <span>Item 01 (Baseline)</span>
                    <span>Item 15 (Calibration)</span>
                    <span>Item 30 (Asymptotic θ)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="border border-border bg-background p-4">
                    <p className="text-[11px] text-foreground-secondary uppercase mb-1">Discrimination Parameter (a)</p>
                    <p className="text-xl font-bold text-foreground">1.48 <span className="text-[11px] text-success">HIGH SIGNAL</span></p>
                  </div>
                  <div className="border border-border bg-background p-4">
                    <p className="text-[11px] text-foreground-secondary uppercase mb-1">Difficulty Floor (b)</p>
                    <p className="text-xl font-bold text-foreground">+0.82 <span className="text-[11px] text-primary">ADAPTIVE</span></p>
                  </div>
                  <div className="border border-border bg-background p-4">
                    <p className="text-[11px] text-foreground-secondary uppercase mb-1">Pseudo-Guessing (c)</p>
                    <p className="text-xl font-bold text-foreground">0.20 <span className="text-[11px] text-foreground-secondary">BOUNDED</span></p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                <span>Algorithm: 3-Parameter Logistic Model with Bayes Modal Estimation</span>
                <span className="font-mono text-primary cursor-pointer hover:underline" onClick={onEnter}>Run item calibration →</span>
              </div>
            </div>

            {/* ── Viewport 1: Five-Domain STEAM Diagnostics ── */}
            <div
              className={`absolute inset-0 flex flex-col justify-between p-6 sm:p-10 transition-all duration-500 ease-out ${
                activeCard === 1 ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-0 blur-sm pointer-events-none'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-primary">STEAM Dimensions</span>
                  <h3 className="font-display text-2xl font-bold">Competency Domain Matrix</h3>
                </div>
                <div className="border border-border bg-background px-3 py-1.5 font-mono text-xs">
                  COHORT BASELINE: <span className="font-bold text-foreground">CLASS 8 REFERENCE</span>
                </div>
              </div>

              <div className="my-auto grid grid-cols-1 sm:grid-cols-5 gap-3">
                {COMPETENCIES.map((c) => (
                  <div key={c.n} className="border border-border bg-background p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="size-2 rounded-none" style={{ background: c.color }} />
                        <span className="font-mono text-[10px] text-foreground-secondary">{c.n}</span>
                      </div>
                      <h4 className="font-display text-sm font-bold leading-snug mb-1">{c.name}</h4>
                      <p className="font-mono text-[10px] text-primary uppercase">{c.mission}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/60 font-mono">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground-secondary">SCORE</span>
                        <span className="font-bold text-foreground">74%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface">
                        <div className="h-full" style={{ width: '74%', background: c.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                <span>Every scenario item evaluates decision trade-offs, not rote recall</span>
                <span className="font-mono text-primary">5 Missions · Energy, Ecology, Space, Data, Infrastructure</span>
              </div>
            </div>

            {/* ── Viewport 2: Normed Global Reference Benchmarks ── */}
            <div
              className={`absolute inset-0 flex flex-col justify-between p-6 sm:p-10 transition-all duration-500 ease-out ${
                activeCard === 2 ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-0 blur-sm pointer-events-none'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-primary">Multi-Nation Norms</span>
                  <h3 className="font-display text-2xl font-bold">International Distribution Comparison</h3>
                </div>
                <div className="border border-border bg-background px-3 py-1.5 font-mono text-xs">
                  PERCENTILE: <span className="font-bold text-success">88th GLOBAL</span>
                </div>
              </div>

              {/* Comparative Regional Bars */}
              <div className="my-auto space-y-3 max-w-2xl mx-auto w-full">
                {[
                  { region: 'Your Standing', score: 78, delta: '+19 vs global', highlight: true },
                  { region: 'Singapore Reference Cohort', score: 74, delta: '+15 vs global' },
                  { region: 'United States Cohort', score: 62, delta: '+3 vs global' },
                  { region: 'Europe Region Baseline', score: 61, delta: '+2 vs global' },
                  { region: 'Global Reference Median', score: 59, delta: '0.0 baseline' },
                ].map((item) => (
                  <div key={item.region} className={`p-3 border ${item.highlight ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className={`font-medium ${item.highlight ? 'text-primary font-bold' : 'text-foreground'}`}>{item.region}</span>
                      <span className="font-mono text-[11px] text-foreground-secondary">{item.delta}</span>
                    </div>
                    <div className="relative h-2.5 w-full bg-surface">
                      <div
                        className={`h-full ${item.highlight ? 'bg-primary' : 'bg-foreground-secondary'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                <span>Normative benchmarks continuously calibrated against standardized curricula</span>
                <span className="font-mono text-primary">Class-level specific standardization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 3-Tab Card Strip with Active Progress Bar */}
        <div className="mt-8 flex flex-col md:flex-row border-y border-border">
          <HatchedWing />

          <div className="flex flex-1 flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Tab 0 */}
            <div
              onClick={() => handleCardClick(0)}
              className={`relative flex flex-1 cursor-pointer flex-col p-6 transition-colors ${
                activeCard === 0 ? 'bg-surface/60' : 'hover:bg-surface/30'
              }`}
            >
              {activeCard === 0 && (
                <div className="absolute top-0 left-0 h-1 w-full bg-surface">
                  <div className="h-full bg-primary transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
              )}
              <span className="font-mono text-xs uppercase tracking-wider text-primary mb-2">01 · Adaptive Engine</span>
              <h4 className="font-display text-base font-bold mb-2">3PL Item Response Theory</h4>
              <p className="text-sm leading-relaxed text-foreground-secondary">
                Dynamically adjusts scenario difficulty per item to pinpoint cognitive ability with zero ceiling effect.
              </p>
            </div>

            {/* Tab 1 */}
            <div
              onClick={() => handleCardClick(1)}
              className={`relative flex flex-1 cursor-pointer flex-col p-6 transition-colors ${
                activeCard === 1 ? 'bg-surface/60' : 'hover:bg-surface/30'
              }`}
            >
              {activeCard === 1 && (
                <div className="absolute top-0 left-0 h-1 w-full bg-surface">
                  <div className="h-full bg-primary transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
              )}
              <span className="font-mono text-xs uppercase tracking-wider text-primary mb-2">02 · Multidimensional</span>
              <h4 className="font-display text-base font-bold mb-2">Five-Domain STEAM Scenarios</h4>
              <p className="text-sm leading-relaxed text-foreground-secondary">
                Evaluates Inquiry, Computation, Engineering, Math, and Systems across five authentic mission contexts.
              </p>
            </div>

            {/* Tab 2 */}
            <div
              onClick={() => handleCardClick(2)}
              className={`relative flex flex-1 cursor-pointer flex-col p-6 transition-colors ${
                activeCard === 2 ? 'bg-surface/60' : 'hover:bg-surface/30'
              }`}
            >
              {activeCard === 2 && (
                <div className="absolute top-0 left-0 h-1 w-full bg-surface">
                  <div className="h-full bg-primary transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
              )}
              <span className="font-mono text-xs uppercase tracking-wider text-primary mb-2">03 · Global Standard</span>
              <h4 className="font-display text-base font-bold mb-2">Normed Reference Cohorts</h4>
              <p className="text-sm leading-relaxed text-foreground-secondary">
                Direct comparative analysis against Singapore, US, China, and Europe rather than isolated classroom averages.
              </p>
            </div>
          </div>

          <HatchedWing />
        </div>
      </div>
    </section>
  );
}

/**
 * Global Framework Standards Section (Ali Imam logo-section.tsx adaptation)
 * Displays educational frameworks WARP aligns against with flanking hatched wing margins
 */
function FrameworkStandards() {
  return (
    <section id="frameworks" className="section w-full scroll-mt-16 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-3 font-mono text-[11px] uppercase tracking-wider text-primary">
            Curricular Alignment
          </Badge>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Calibrated against international standards
          </h2>
          <p className="mx-auto max-w-xl text-balance text-foreground-secondary text-sm">
            Our item response parameters and cognitive dimensions are mapped directly to global curricular benchmarks.
          </p>
        </div>

        <div className="flex items-start justify-center border-y border-border">
          <HatchedWing />

          <div className="grid flex-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-border">
            {FRAMEWORK_STANDARDS.map((f) => (
              <div key={f.code} className="flex flex-col justify-between p-5 bg-background hover:bg-surface/40 transition-colors">
                <div className="mb-4">
                  <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{f.code}</span>
                  <h4 className="font-display text-sm font-bold mt-1 text-foreground">{f.title}</h4>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary leading-snug">{f.description}</p>
                  <p className="mt-3 font-mono text-[10px] text-foreground-muted border-t border-border/60 pt-2">{f.domain}</p>
                </div>
              </div>
            ))}
          </div>

          <HatchedWing />
        </div>
      </div>
    </section>
  );
}

/**
 * Interactive Multi-Slide Telemetry Carousel
 * Adaptation of Ali Imam's documentation-section.tsx showcasing sample reports and artifacts
 */
function TelemetryCarousel({ onEnter }: { onEnter: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Individual Competency Profile',
      tag: 'Artifact 01 // Score Signal',
      description: 'Precise score vector across five dimensions with exact delta to international class-level median.',
      content: (
        <div className="space-y-3.5 font-mono text-xs w-full">
          {REPORT_ROWS.map((row) => {
            const delta = row.you - row.cohort;
            return (
              <div key={row.name} className="border border-border bg-background p-3">
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span className="font-sans font-semibold text-foreground">{row.name}</span>
                  <span className={delta >= 0 ? 'text-success font-bold' : 'text-highlight font-bold'}>
                    {delta >= 0 ? `+${delta}` : delta} PTS
                  </span>
                </div>
                <div className="relative h-2 w-full bg-surface">
                  <div className="h-full" style={{ width: `${row.you}%`, background: row.color }} />
                  <div className="absolute -top-1 h-4 w-px bg-foreground" style={{ left: `${row.cohort}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Parent Plain-Language Synthesis',
      tag: 'Artifact 02 // Narrative Analysis',
      description: 'Actionable evaluation written for parents and educators, detailing cognitive strengths and concrete next steps.',
      content: (
        <div className="border border-border bg-background p-5 text-sm space-y-4 font-sans">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <GraduationCap className="size-4 text-primary" />
            <span className="font-mono text-xs uppercase text-foreground-secondary font-bold">Executive Parent Summary</span>
          </div>
          <p className="leading-relaxed text-foreground-secondary">
            <strong className="text-foreground">Observed Cognitive Style:</strong> Strong intuitive grasp of empirical scientific inquiry (+12 above cohort) combined with high mathematical modeling ability (+7). When presented with ambiguous trade-offs in systems design, the student showed a tendency to optimize local components before verifying overall systemic equilibrium.
          </p>
          <div className="border-l-2 border-primary pl-3 py-1 font-mono text-xs text-primary">
            RECOMMENDED FOCUS: Systems feedback loops & second-order constraint modeling.
          </div>
        </div>
      ),
    },
    {
      title: 'Longitudinal Growth Tracking',
      tag: 'Artifact 03 // Longitudinal Trajectory',
      description: 'Historical attempt tracking showing dimensional growth over weeks and months rather than single-exam anxiety.',
      content: (
        <div className="border border-border bg-background p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3 font-mono text-xs">
            <span className="uppercase text-foreground-secondary">THREE ATTEMPTS // 90 DAYS</span>
            <span className="text-success font-bold">+16.4% AGGREGATE GAIN</span>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between text-foreground-secondary">
              <span>OCTOBER (BASELINE): 58.2</span>
              <span>NOVEMBER: 64.8</span>
              <span className="text-primary font-bold">JANUARY: 74.6</span>
            </div>
            <div className="h-2 w-full bg-surface flex">
              <div className="h-full bg-foreground-muted" style={{ width: '58%' }} />
              <div className="h-full bg-primary/40" style={{ width: '7%' }} />
              <div className="h-full bg-primary" style={{ width: '10%' }} />
            </div>
          </div>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Persistent psychometric telemetry eliminates exam-day variance and tracks authentic cognitive development.
          </p>
        </div>
      ),
    },
    {
      title: 'Psychometric Reliability & 3PL Parameters',
      tag: 'Artifact 04 // Calibration Quality',
      description: 'Item discrimination, difficulty parameters, and Cronbach alpha coefficient verification.',
      content: (
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="border border-border bg-background p-3.5">
            <span className="text-[10px] text-foreground-secondary">RELIABILITY INDEX</span>
            <p className="text-2xl font-bold text-success mt-1">α = 0.91</p>
            <span className="text-[10px] text-foreground-secondary">Excellent psychometric validity</span>
          </div>
          <div className="border border-border bg-background p-3.5">
            <span className="text-[10px] text-foreground-secondary">STANDARD ERROR (SE)</span>
            <p className="text-2xl font-bold text-primary mt-1">0.24</p>
            <span className="text-[10px] text-foreground-secondary">Asymptotic convergence</span>
          </div>
          <div className="col-span-2 border border-border bg-background p-3.5">
            <div className="flex justify-between text-[11px] mb-1">
              <span>TEST INFORMATION PEAK</span>
              <span className="text-primary font-bold">θ ∈ [-1.5, +2.0]</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Balanced item pool ensures high discrimination across both remediation and gifted talent ranges.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="report" className="section relative w-full scroll-mt-16 border-t border-border bg-background">
      {/* Subtle radial aura behind documentation */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, var(--primary) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Badge variant="outline" className="mb-3 font-mono text-[11px] uppercase tracking-wider text-primary">
              Diagnostic Output
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A report you can act on this week
            </h2>
            <p className="mt-2 max-w-xl text-balance text-foreground-secondary text-sm">
              Not a percentile and a pat on the back. Five scores against the cohort, the gap on each,
              and one actionable learning path sized to seven days.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="flex size-10 items-center justify-center border border-border bg-background text-foreground hover:bg-surface transition-colors cursor-pointer"
              aria-label="Previous report slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="font-mono text-xs px-2 text-foreground-secondary">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="flex size-10 items-center justify-center border border-border bg-background text-foreground hover:bg-surface transition-colors cursor-pointer"
              aria-label="Next report slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Carousel Showcase Card */}
        <div className="border border-border bg-surface/30 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-primary block mb-2">
                  {slides[currentSlide].tag}
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground-secondary">
                  {slides[currentSlide].description}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button size="md" onClick={onEnter} className="w-full sm:w-auto">
                  Generate sample assessment
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Cohort & Educator Voices (Ali Imam testimonials-section.tsx adaptation)
 * Smooth blur-filtered cycling quotes from students and STEM department heads
 */
function CohortVoices() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNav(1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (step: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTestimonial((prev) => (prev + step + TESTIMONIALS.length) % TESTIMONIALS.length);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 250);
  };

  return (
    <section className="section w-full border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-3 font-mono text-[11px] uppercase tracking-wider text-primary">
            Cohort & Educator Perspectives
          </Badge>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by schools and students
          </h2>
          <p className="mx-auto max-w-lg text-balance text-foreground-secondary text-sm">
            Independent evaluation feedback from pilot classrooms and student participants.
          </p>
        </div>

        <div className="border border-border bg-surface/20 p-6 sm:p-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div
                className="text-xl sm:text-2xl font-display font-medium leading-relaxed tracking-tight text-foreground transition-all duration-500 ease-out"
                style={{
                  filter: isTransitioning ? 'blur(6px)' : 'blur(0px)',
                  opacity: isTransitioning ? 0.3 : 1,
                  transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                "{TESTIMONIALS[activeTestimonial].quote}"
              </div>

              <div
                className="flex items-center gap-3 transition-all duration-500 ease-out"
                style={{
                  filter: isTransitioning ? 'blur(4px)' : 'blur(0px)',
                  opacity: isTransitioning ? 0.4 : 1,
                }}
              >
                <div>
                  <h4 className="font-display font-bold text-foreground text-sm">
                    {TESTIMONIALS[activeTestimonial].name}
                  </h4>
                  <p className="text-xs text-foreground-secondary font-mono">
                    {TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].institution}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                  {TESTIMONIALS[activeTestimonial].badge}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleNav(-1)}
                className="flex size-10 items-center justify-center border border-border bg-background text-foreground hover:bg-surface transition-colors cursor-pointer"
                aria-label="Previous quote"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => handleNav(1)}
                className="flex size-10 items-center justify-center border border-border bg-background text-foreground hover:bg-surface transition-colors cursor-pointer"
                aria-label="Next quote"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Access Spectrum & Institutional Tiers (Ali Imam pricing-section.tsx adaptation)
 * Clear distinction between free student explorer, classroom cohort, and district pro
 */
function AccessSpectrum({ onEnter }: { onEnter: () => void }) {
  const [billingPeriod, setBillingPeriod] = useState<'term' | 'annual'>('annual');

  const tiers = [
    {
      name: 'Student Explorer',
      badge: 'Free Forever',
      description: 'Individual diagnostics for any student in Classes 3–12 worldwide.',
      price: { term: 0, annual: 0 },
      cta: 'Start Free Assessment',
      features: [
        'Full 30-item adaptive CAT assessment',
        'Five competency scores & radar vector',
        'Normed against global cohort median',
        'One weekly targeted learning step',
        'Guest mode or synced personal account',
        'Zero advertisements or data tracking',
      ],
      featured: false,
    },
    {
      name: 'Classroom & Cohort Studio',
      badge: 'Popular for Schools',
      description: 'For STEM educators managing class-wide diagnostic benchmarking.',
      price: { term: 18, annual: 14 },
      cta: 'Pilot in Your Classroom',
      features: [
        'Everything in Student Explorer',
        'Teacher dashboard with class distributions',
        'Parent executive summaries in plain English',
        'Item response difficulty breakdown',
        'Longitudinal pre/post semester comparisons',
        'Exportable CSV & printable PDF reports',
        'Dedicated educator support desk',
      ],
      featured: true,
    },
    {
      name: 'Institutional District Pro',
      badge: 'District License',
      description: 'Full-scale normative infrastructure for school systems and research.',
      price: { term: 48, annual: 38 },
      cta: 'Request District Briefing',
      features: [
        'Everything in Classroom Studio',
        'Custom regional norming baselines',
        'Direct SIS & LMS automated roster sync',
        '3PL IRT Item parameter data API',
        'Longitudinal cohort analytics dashboard',
        'FERPA, COPPA & GDPR compliance guarantees',
        'Custom psychometric calibration review',
      ],
      featured: false,
    },
  ];

  return (
    <section id="access" className="section w-full scroll-mt-16 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-3 font-mono text-[11px] uppercase tracking-wider text-primary">
            Access Spectrum
          </Badge>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Transparent access for students & schools
          </h2>
          <p className="mx-auto max-w-xl text-balance text-foreground-secondary text-sm">
            Student testing is always 100% free. Classrooms and districts scale with advanced cohort telemetry.
          </p>

          {/* Term / Annual billing toggle */}
          <div className="mt-6 inline-flex items-center border border-border bg-surface/50 p-1">
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                billingPeriod === 'annual' ? 'bg-background text-primary shadow-xs' : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Annual Cohort (-20%)
            </button>
            <button
              onClick={() => setBillingPeriod('term')}
              className={`px-4 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                billingPeriod === 'term' ? 'bg-background text-primary shadow-xs' : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Single Term
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col justify-between p-6 sm:p-8 border ${
                tier.featured
                  ? 'border-primary bg-primary/3 shadow-sm'
                  : 'border-border bg-background'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 right-6 bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-background">
                  RECOMMENDED
                </div>
              )}

              <div>
                <div className="mb-4">
                  <span className="font-mono text-[11px] text-primary uppercase font-bold">{tier.badge}</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">{tier.name}</h3>
                  <p className="text-xs text-foreground-secondary mt-1.5 leading-relaxed">{tier.description}</p>
                </div>

                {/* Animated Numeric Price Display */}
                <div className="my-6 border-y border-border/60 py-4 font-mono">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      ${tier.price[billingPeriod]}
                    </span>
                    <span className="text-xs text-foreground-secondary">
                      {tier.price[billingPeriod] === 0 ? 'no fees' : '/ student / term'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground-secondary">
                      <Check className="size-4 text-primary shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="md"
                variant={tier.featured ? 'primary' : 'outline'}
                onClick={onEnter}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Atmospheric Repeating Conic-Ray Closing CTA (Ali Imam cta-section.tsx adaptation)
 */
function ClosingCTA({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="section relative w-full overflow-hidden border-t border-border bg-background py-20 px-4 text-center">
      {/* Repeating conic-ray background with vertical fade */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="relative h-full w-full"
          style={{
            background:
              'linear-gradient(to bottom, var(--background) 0%, var(--background) 25%, transparent 100%), radial-gradient(ellipse at 50% 100%, var(--primary) 0%, transparent 60%)',
          }}
        >
          <div
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
              backgroundImage:
                'repeating-conic-gradient(from 0deg at 50% 100%, var(--primary) 0deg, var(--primary) 1deg, transparent 1deg, transparent 9deg)',
              bottom: '-10%',
              height: '120%',
              left: '50%',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
              opacity: 0.12,
              pointerEvents: 'none',
              position: 'absolute',
              transform: 'translateX(-50%)',
              width: '200%',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <WarpLogo variant="icon" className="mx-auto mb-6 size-12" />
        <h2 className="mb-4 font-display text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
          Ready to close the gap?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-balance text-base text-foreground-secondary leading-relaxed">
          Join students and schools who know exactly where they stand — and what to do next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <ChromeGlowButton size="lg" onClick={onEnter} className="w-full sm:w-auto">
            Start free assessment
            <ArrowRight className="size-4" />
          </ChromeGlowButton>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Review sample report
          </Button>
        </div>

        <p className="mt-5 font-mono text-xs text-foreground-muted">
          No sign up required for guest trial · Instant cognitive report
        </p>
      </div>
    </section>
  );
}

/**
 * Multi-Column Instrument Footer (Ali Imam footer-section.tsx adaptation)
 */
function InstrumentFooter({ onEnter }: { onEnter: () => void }) {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <WarpLogo variant="lockup" className="h-9 w-auto" />
            <p className="text-xs text-foreground-secondary leading-relaxed max-w-sm">
              Standardized Computerized Adaptive Testing (CAT) for STEM competencies in Classes 3–12.
              Calibrated against international curricula and reference cohorts.
            </p>
            <div className="pt-2">
              <Badge variant="outline" dot className="font-mono text-[11px] text-foreground-secondary">
                All systems operational · 3PL IRT active
              </Badge>
            </div>
          </div>

          {/* Col 1: Telemetry */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-sans font-bold text-foreground text-sm uppercase tracking-wider">Signal</h5>
            <ul className="space-y-2 text-foreground-secondary">
              <li><a href="#features" className="hover:text-primary transition-colors">Adaptive 3PL</a></li>
              <li><a href="#stem-city" className="hover:text-primary transition-colors">STEM City 3D</a></li>
              <li><a href="#competencies" className="hover:text-primary transition-colors">5 Competencies</a></li>
              <li><a href="#report" className="hover:text-primary transition-colors">Signal Report</a></li>
            </ul>
          </div>

          {/* Col 2: Frameworks */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-sans font-bold text-foreground text-sm uppercase tracking-wider">Norms</h5>
            <ul className="space-y-2 text-foreground-secondary">
              <li><a href="#frameworks" className="hover:text-primary transition-colors">Singapore MOE</a></li>
              <li><a href="#frameworks" className="hover:text-primary transition-colors">OECD PISA</a></li>
              <li><a href="#frameworks" className="hover:text-primary transition-colors">IEA TIMSS</a></li>
              <li><a href="#frameworks" className="hover:text-primary transition-colors">NGSS Science</a></li>
            </ul>
          </div>

          {/* Col 3: Privacy */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-sans font-bold text-foreground text-sm uppercase tracking-wider">Governance</h5>
            <ul className="space-y-2 text-foreground-secondary">
              <li><span className="hover:text-primary transition-colors cursor-pointer">Student Privacy</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Zero Ads Policy</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Data Export</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">RLS Encryption</span></li>
            </ul>
          </div>

          {/* Col 4: Access */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-sans font-bold text-foreground text-sm uppercase tracking-wider">Access</h5>
            <ul className="space-y-2 text-foreground-secondary">
              <li><button onClick={onEnter} className="hover:text-primary transition-colors text-left cursor-pointer">Start Test</button></li>
              <li><a href="#access" className="hover:text-primary transition-colors">Classroom Pilot</a></li>
              <li><a href="#access" className="hover:text-primary transition-colors">District SLA</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 text-xs font-mono text-foreground-secondary">
          <p>© 2026 WARP Benchmark Systems. All rights reserved.</p>
          <p>Client-Authoritative 3PL IRT · Nordic Lagom Protocol · v2.0</p>
        </div>
      </div>
    </footer>
  );
}

export function Landing({ onEnter }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useSupabaseAuth();

  return (
    <main className="relative flex w-full flex-col overflow-x-hidden" data-testid="landing-shell">
      {/* ── Dual Architectural Margins (Ali Imam landing-01 inspired) ── */}
      <div className="pointer-events-none absolute top-0 left-4 z-0 h-full w-px bg-border/40 sm:left-6 md:left-8 lg:left-12" aria-hidden="true" />
      <div className="pointer-events-none absolute top-0 right-4 z-0 h-full w-px bg-border/40 sm:right-6 md:right-8 lg:right-12" aria-hidden="true" />

      {/* Top hatched bar */}
      <HatchedAccentBar height="h-5" />

      {/* ── Hero — full-bleed glade, floating nav, copy anchored bottom-left ── */}
      <section
        className="relative flex min-h-screen flex-col overflow-hidden"
        data-testid="landing-hero"
      >
        {/* The self-playing world: full-bleed, decorative, never interactive. */}
        <Suspense fallback={null}>
          <GladeCanvas className="z-0" />
        </Suspense>

        {/* Cinematic GSAP-powered aurora / orb overlay */}
        <CinematicHero className="z-0" />

        {/* Scrims */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(38deg,oklch(0.12_0.01_260)_0%,oklch(0.12_0.01_260/0.95)_16%,oklch(0.12_0.01_260/0.6)_42%,oklch(0.12_0.01_260/0.2)_62%,transparent_80%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-1 h-24 bg-linear-to-b from-[oklch(0.12_0.01_260/0.8)] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-36 bg-linear-to-t from-background to-transparent"
        />
        <DotPattern className="opacity-20 mix-blend-overlay" />

        {/* Floating nav — Ali Imam header-01 inspired instrument bar with glass transition & corner markers */}
        <nav className="relative z-3 px-6 pt-4 sm:px-12 sm:pt-6 md:px-20 lg:px-28">
          <div className="relative flex h-14 w-full items-stretch justify-between border border-border/80 bg-background/85 backdrop-blur-md shadow-xs transition-colors duration-300 hover:border-primary/40">
            {/* Technical corner brackets */}
            <span aria-hidden="true" className="pointer-events-none absolute -top-1 -left-1 select-none font-mono text-[9px] text-border/80">+</span>
            <span aria-hidden="true" className="pointer-events-none absolute -top-1 -right-1 select-none font-mono text-[9px] text-border/80">+</span>
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -left-1 select-none font-mono text-[9px] text-border/80">+</span>
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -right-1 select-none font-mono text-[9px] text-border/80">+</span>

            <div className="flex h-full items-center">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex h-full items-center border-r border-border px-4 sm:px-6"
                aria-label="WARP home"
              >
                <WarpLogo variant="lockup" className="h-8 sm:h-10 w-auto" />
              </a>

              {/* Desktop links */}
              <div className="hidden lg:flex h-full">
                {HERO_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center border-r border-border px-4 text-[13px] font-medium text-foreground-secondary transition-colors duration-200 hover:bg-surface hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex h-full items-stretch">
              {/* Telemetry live status indicator to balance instrument bar */}
              <div className="hidden xl:flex items-center border-l border-border px-4 font-mono text-[11px] text-foreground-secondary gap-2 select-none">
                <span className="size-1.5 bg-emerald-400 animate-pulse" />
                <TextMatrixDecode trigger="mount" delay={0.4} duration={1.0} className="tracking-wider">
                  3PL IRT · ACTIVE
                </TextMatrixDecode>
              </div>

              {!isSignedIn ? (
                <button
                  id="landing-sign-in-btn"
                  onClick={() => onEnter('login')}
                  className="flex h-full items-center border-l border-border px-4 sm:px-6 text-[13px] sm:text-[14px] font-semibold text-foreground-secondary transition-colors duration-200 hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring cursor-pointer"
                >
                  Sign in
                </button>
              ) : (
                <div className="flex h-full items-center border-l border-border px-3 sm:px-4">
                  <button
                    onClick={() => signOutUser()}
                    className="flex size-8 items-center justify-center bg-surface text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Sign out"
                  >
                    <User className="size-4" />
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex lg:hidden h-full items-center justify-center border-l border-border px-3.5 text-foreground-secondary hover:bg-surface hover:text-foreground cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mt-2 flex flex-col border border-border bg-background p-4 lg:hidden shadow-lg"
              >
                <div className="flex flex-col divide-y divide-border">
                  {HERO_NAV.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex py-3 text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2 pt-2">
                  {!isSignedIn && (
                    <Button
                      id="mobile-landing-sign-in-btn"
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onEnter('login');
                      }}
                      className="w-full"
                    >
                      Sign in
                    </Button>
                  )}
                  <Button
                    size="md"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onEnter();
                    }}
                    className="w-full"
                  >
                    Start your assessment
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Copy — cinematic block with GSAP staggered reveal */}
        <HeroCopy onEnter={onEnter} />
      </section>

      {/* ── Stats band: Dashed metric grid with IntersectionScope technical framing ── */}
      <section className="border-y border-dashed border-border bg-surface/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-dashed divide-border sm:grid-cols-4">
          {STATS.map((stat, idx) => (
            <IntersectionScope
              key={stat.label}
              variant="crosshair"
              className="border-none bg-transparent flex flex-col items-center justify-center gap-1 p-6 sm:p-8"
            >
              <span className="font-display text-3xl font-bold tabular sm:text-4xl text-foreground">
                <TextMatrixDecode trigger="in-view" delay={idx * 0.1} duration={0.75}>
                  {stat.value}
                </TextMatrixDecode>
              </span>
              <span className="text-center font-mono text-[10px] uppercase tracking-[0.15em] text-foreground-secondary">
                {stat.label}
              </span>
            </IntersectionScope>
          ))}
        </div>
      </section>

      {/* ── Feature Spotlight: Auto-advancing 3-card spotlight with synchronized live viewports ── */}
      <FeatureSpotlight onEnter={onEnter} />

      {/* ── STEM City: the gap, built in 3D ── */}
      <section id="stem-city" className="section w-full scroll-mt-16 border-t border-border bg-background">
        <div className="mx-auto w-full max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <Badge variant="outline" className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">
                  Interactive Spatial Engine
                </Badge>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Your cohort, as a city you can walk around
                </h2>
                <p className="mt-3 max-w-2xl text-balance text-foreground-secondary text-sm">
                  Five competencies, scored against the global reference cohort. Each district raises
                  a tower to your result; a ring on that tower marks the cohort average. Above the ring
                  you are ahead. Below it, that is the gap.
                </p>
              </div>
              <a
                href="#competencies"
                className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-primary"
              >
                What each tower measures
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <figure className="relative border border-border bg-background">
              <Suspense
                fallback={
                  <div className="flex h-112 items-center justify-center font-mono text-sm text-foreground-secondary sm:h-136">
                    Assembling STEM City…
                  </div>
                }
              >
                <StemCityCanvas className="h-112 sm:h-136" />
              </Suspense>
              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs uppercase tracking-[0.15em] text-foreground-secondary">
                <span>Your position vs the reference cohort</span>
                <span className="font-mono normal-case tracking-normal text-foreground-secondary">
                  procedural · zero external 3D assets · illustrative sample
                </span>
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </section>

      {/* ── Five Competencies Bento Grid with GridPattern Background ── */}
      <section id="competencies" className="section relative w-full scroll-mt-16 border-t border-border bg-background">
        <GridPattern width={48} height={48} className="opacity-15 pointer-events-none" />

        <div className="relative z-1 mx-auto max-w-5xl px-4">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge variant="outline" className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">
                Cognitive Matrix
              </Badge>
              <h2 className="mb-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Five ways of thinking, measured
              </h2>
              <p className="max-w-xl text-balance text-foreground-secondary text-sm">
                Every item is a scenario with a decision in it. Each decision feeds one of
                five competencies — and one of five missions.
              </p>
            </div>
          </div>

          <BentoGrid cols={{ base: 1, sm: 2, lg: 6 }} gap={{ base: 3, md: 4 }}>
            {COMPETENCIES.map((c, index) => {
              const colSpan = index < 2 ? ({ base: 1, sm: 1, lg: 3 } as const) : ({ base: 1, sm: 1, lg: 2 } as const);
              return (
                <BentoGridItem
                  key={c.n}
                  colSpan={colSpan}
                  className="group relative flex flex-col justify-between border border-border bg-background/80 p-6 shadow-xs hover:border-primary/50 hover:bg-surface/40 transition-all duration-300"
                >
                  {/* Technical scope corner markers */}
                  <span aria-hidden="true" className="pointer-events-none absolute -top-1 -left-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
                  <span aria-hidden="true" className="pointer-events-none absolute -top-1 -right-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
                  <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -left-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
                  <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -right-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className="size-3"
                        style={{ background: c.color }}
                        aria-hidden="true"
                      />
                      <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
                        {c.n} · {c.mission}
                      </Badge>
                    </div>
                    <h3 className="mb-2 font-display text-lg font-bold leading-snug">{c.name}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground-secondary mt-2">{c.body}</p>
                </BentoGridItem>
              );
            })}
          </BentoGrid>
        </div>
      </section>

      {/* ── International Frameworks & Standards Grid ── */}
      <FrameworkStandards />

      {/* ── How it works: 3-step sequence ── */}
      <section id="how-it-works" className="section mx-auto w-full max-w-5xl scroll-mt-16 px-4">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">
            Session Protocol
          </Badge>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to your signal
          </h2>
          <p className="mx-auto max-w-xl text-balance text-foreground-secondary text-sm">
            A short, rigorous process: one sitting, one report, something to act on next.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="relative grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={fade}
              className="group relative flex flex-col items-center text-center p-6 border border-border bg-background hover:border-primary/40 hover:bg-surface/30 transition-all duration-200"
            >
              {/* Technical scope corner markers */}
              <span aria-hidden="true" className="pointer-events-none absolute -top-1 -left-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
              <span aria-hidden="true" className="pointer-events-none absolute -top-1 -right-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -left-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -right-1 font-mono text-[9px] text-border group-hover:text-primary transition-colors">+</span>
              <div className="relative z-1 mb-5 flex size-12 items-center justify-center border border-border bg-surface font-mono text-sm font-bold tabular text-primary">
                {step.num}
              </div>
              <h3 className="mb-2 font-display text-lg font-bold">{step.title}</h3>
              <p className="text-balance text-sm leading-relaxed text-foreground-secondary">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Telemetry Carousel: Multi-Slide Interactive Report Showcase ── */}
      <TelemetryCarousel onEnter={onEnter} />

      {/* ── Cohort & Educator Voices ── */}
      <CohortVoices />

      {/* ── Access Spectrum (Pricing & Tiers) ── */}
      <AccessSpectrum onEnter={onEnter} />

      {/* ── FAQ: Accordion ── */}
      <section id="faq" className="section w-full scroll-mt-16 border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">
              Clarifications
            </Badge>
            <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Straight answers
            </h2>
            <p className="text-sm text-foreground-secondary">
              Everything you need to know about methodology, security, and scoring.
            </p>
          </div>

          <Accordion type="multiple" defaultValue={['item-0']}>
            {FAQ.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Security Guarantee Card */}
          <div className="mt-8 flex items-start gap-4 border border-dashed border-border bg-surface/50 p-5">
            <div className="inline-flex p-2 bg-background border border-border shrink-0">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold">Your data stays strictly yours</p>
              <p className="text-xs leading-relaxed text-foreground-secondary">
                Assessment data is encrypted in transit and at rest using Supabase Row-Level Security. We never sell data or monetize advertising. Export or erase your session data at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA: Conic Ray Backdrop ── */}
      <ClosingCTA onEnter={onEnter} />

      {/* Bottom hatched bar */}
      <HatchedAccentBar height="h-6" />

      {/* ── Instrument Footer ── */}
      <InstrumentFooter onEnter={onEnter} />
    </main>
  );
}
