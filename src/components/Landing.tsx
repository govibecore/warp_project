import { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Cloud, Sparkles, Globe, ShieldCheck, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BentoGrid, BentoGridItem } from './ui/bento';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import { WarpLogo } from './WarpLogo';

/**
 * The glade is lazy-loaded: three.js lands in its own chunk and never delays
 * first paint. Until it arrives the hero simply shows its own backdrop.
 */
const GladeCanvas = lazy(() => import('./GladeCanvas'));
const StemCityCanvas = lazy(() => import('./StemCityCanvas'));

interface LandingProps {
  onEnter(): void;
}

const STATS = [
  { value: '5', label: 'Competency domains' },
  { value: '30', label: 'Assessment items' },
  { value: '3–12', label: 'Class levels' },
  { value: '5', label: 'Global benchmarks' },
];

const HERO_NAV = [
  { label: 'STEM City', href: '#stem-city' },
  { label: 'Competencies', href: '#competencies' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const COMPETENCIES = [
  {
    n: '01',
    name: 'Scientific Inquiry',
    mission: 'Ecology',
    color: 'var(--chart-1)',
    body: 'Read the evidence, run the comparison, say what it actually shows — not what you expected.',
  },
  {
    n: '02',
    name: 'Computational Thinking',
    mission: 'Data',
    color: 'var(--chart-2)',
    body: 'Break a messy problem into steps precise enough that a machine could check them.',
  },
  {
    n: '03',
    name: 'Engineering Design',
    mission: 'Infrastructure',
    color: 'var(--chart-3)',
    body: 'Weigh the constraints, then choose what to build first — and what to leave out.',
  },
  {
    n: '04',
    name: 'Mathematical Reasoning',
    mission: 'Energy',
    color: 'var(--chart-4)',
    body: 'Turn a situation into numbers, then turn the numbers back into a decision.',
  },
  {
    n: '05',
    name: 'Systems Thinking',
    mission: 'Space',
    color: 'var(--chart-5)',
    body: 'See the loop: stocks, flows, and the feedback that makes outcomes compound.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create your account',
    body: 'Register with your email and class level — results sync across your devices. Or continue as a guest and keep everything on this one.',
  },
  {
    num: '02',
    title: 'Work the scenarios',
    body: 'Thirty scenario items across five STEAM missions — energy, ecology, space, data, and infrastructure — plus five calibration items. Each one asks you to decide, not recall.',
  },
  {
    num: '03',
    title: 'Read your signal',
    body: 'A written report with competency scores, global standing and a learning path you can act on this week.',
  },
];

/** Illustrative sample — the same shape a real report takes. */
const REPORT_ROWS = [
  { name: 'Scientific Inquiry', you: 71, cohort: 59, color: 'var(--chart-1)' },
  { name: 'Computational Thinking', you: 63, cohort: 58, color: 'var(--chart-2)' },
  { name: 'Engineering Design', you: 52, cohort: 58, color: 'var(--chart-3)' },
  { name: 'Mathematical Reasoning', you: 66, cohort: 59, color: 'var(--chart-4)' },
  { name: 'Systems Thinking', you: 57, cohort: 61, color: 'var(--chart-5)' },
];

const REGIONS = ['Singapore', 'United States', 'China', 'Europe', 'Global cohort'];

const FEATURES = [
  {
    icon: Cloud,
    title: 'Synced history',
    body: 'Every attempt is saved to your account. Watch a competency move over months rather than guessing from one score.',
  },
  {
    icon: Sparkles,
    title: 'Written analysis',
    body: 'Each completed assessment gets a narrative report, including a section written for parents.',
  },
  {
    icon: Globe,
    title: 'Real benchmarks',
    body: 'See where you sit against Singapore, the USA, China, Europe and the global cohort — not just your class.',
  },
];

const FAQ = [
  {
    q: 'How long does it take?',
    a: 'About ten minutes: thirty scenario items plus five calibration items, in one sitting. No timers, no pressure.',
  },
  {
    q: 'Who is it for?',
    a: 'Students in Classes 3–12. Every benchmark adjusts to class level, so a Class 4 student is never compared with a Class 10 student.',
  },
  {
    q: 'What do I get at the end?',
    a: 'A written report: five competency scores, your standing against the global cohort, and one learning path you can act on this week.',
  },
  {
    q: 'Can I try it without an account?',
    a: 'Yes. Guest mode keeps everything on this device. Create an account later and your history syncs across your devices.',
  },
  {
    q: 'Is my data safe?',
    a: 'Encrypted in transit and at rest, never sold. Export your reports, or delete your account and history, at any time.',
  },
];

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export function Landing({ onEnter }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="flex w-full flex-col" data-testid="landing-shell">
      {/* ── Hero — full-bleed glade, floating nav, copy anchored bottom-left ── */}
      <section
        className="relative flex min-h-screen flex-col overflow-hidden"
        data-testid="landing-hero"
      >
        {/* The self-playing world: full-bleed, decorative, never interactive. */}
        <Suspense fallback={null}>
          <GladeCanvas className="z-0" />
        </Suspense>

        {/* Scrims — a diagonal wash out of the bottom-left corner so the copy
            stays legible, plus thin top/bottom edges for the chrome. Everything
            reads from --background and fades out well before the glade's
            sunlight on the right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(38deg,var(--background)_0%,var(--background)_16%,color-mix(in_oklab,var(--background)_80%,transparent)_42%,transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-1 h-20 bg-linear-to-b from-background/70 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-28 bg-linear-to-t from-background to-transparent"
        />

        {/* Floating nav — Ali Imam header-01 inspired instrument bar:
            Single hairline-framed strip divided into cells with corner marks.
            The brand cell carries the blueprint grid and the full lockup;
            links are cells with fill-on-hover; sign-in integrates seamlessly. */}
        <nav className="relative z-3 px-4 pt-4 sm:px-12 sm:pt-6 md:px-20 lg:px-28">
          <div className="corner-marks relative flex h-14 w-full items-stretch justify-between border border-border bg-background">
            <div className="flex h-full items-center">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-warp-grid flex h-full items-center border-r border-border px-4 sm:px-6"
                aria-label="WARP home"
              >
                <WarpLogo variant="lockup" className="h-8 sm:h-10 w-auto" />
              </a>

              {/* Desktop links */}
              <div className="hidden sm:flex h-full">
                {HERO_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center border-r border-border px-4 text-[14px] font-medium text-foreground-secondary transition-colors duration-200 hover:bg-accent hover:text-foreground md:px-5"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex h-full items-stretch">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex h-full items-center border-l border-border px-4 sm:px-6 text-[13px] sm:text-[14px] font-semibold text-foreground-secondary transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex h-full items-center border-l border-border px-3 sm:px-4">
                  <UserButton />
                </div>
              </SignedIn>

              {/* Mobile menu toggle button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex sm:hidden h-full items-center justify-center border-l border-border px-3.5 text-foreground-secondary hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile navigation drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="corner-marks mt-2 flex flex-col border border-border bg-background p-4 sm:hidden shadow-lg"
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
                  <a
                    href="#report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex py-3 text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"
                  >
                    The report
                  </a>
                </div>
                <div className="mt-4 pt-2">
                  <Button
                    size="md"
                    block
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onEnter();
                    }}
                  >
                    Start your assessment
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Copy — compact block pinned to the bottom-left, small type, so the
            painting stays the loudest thing on screen. */}
        <div className="relative z-2 flex flex-1 items-end px-6 pb-14 sm:px-12 sm:pb-16 md:px-20 lg:px-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex max-w-sm flex-col items-start"
          >
            <a
              href="#stem-city"
              className="group mb-4 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-200 hover:text-foreground"
            >
              Five competencies · one global cohort
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="size-3.5" />
              </span>
            </a>

            <h1 className="mb-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Close the gap.
            </h1>

            <p className="mb-6 text-sm leading-relaxed text-foreground-secondary">
              WARP benchmarks how you think across five STEAM competencies against the
              global cohort — then shows you the exact gap, and how to close it.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                id="landing-start-btn"
                size="lg"
                onClick={onEnter}
                data-testid="landing-cta"
                className="group"
              >
                Start your assessment
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" />
                </span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() =>
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                See how it works
              </Button>
            </div>

            <p className="mt-4 text-xs text-foreground-secondary">
              Free · about 10 minutes · guest or account · delete your history anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats band: Ali Imam stats-01 / feature-01 inspired dashed metric grid ── */}
      <section className="border-y border-dashed border-border bg-surface/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-dashed divide-border sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center gap-1 p-6 sm:p-8">
              <span className="font-display text-3xl font-bold tabular sm:text-4xl text-foreground">
                {stat.value}
              </span>
              <span className="text-center text-[11px] uppercase tracking-[0.15em] text-foreground-secondary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STEM City: the gap, built ── */}
      <section id="stem-city" className="section w-full scroll-mt-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  STEM City
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Your cohort, as a city you can walk around
                </h2>
                <p className="mt-3 max-w-2xl text-balance text-foreground-secondary">
                  Five competencies, scored against the global reference cohort. Each
                  district raises a tower to your result; a ring on that tower marks the
                  cohort average. Above the ring you are ahead. Below it, that is the gap.
                </p>
              </div>
              <a
                href="#competencies"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                What each one measures
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <figure className="corner-marks relative border border-border bg-background">
              <Suspense
                fallback={
                  <div className="flex h-112 items-center justify-center text-sm text-foreground-secondary sm:h-136">
                    Assembling STEM City…
                  </div>
                }
              >
                <StemCityCanvas className="h-112 sm:h-136" />
              </Suspense>
              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs uppercase tracking-[0.15em] text-foreground-secondary">
                <span>Your position vs the reference cohort</span>
                <span className="font-mono normal-case tracking-normal text-foreground-secondary">
                  procedural · zero assets · illustrative sample
                </span>
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </section>

      {/* ── Five competencies: Ali Imam bento-grid-02 inspired responsive BentoGrid ── */}
      <section id="competencies" className="section w-full scroll-mt-16 border-t border-border bg-warp-grid">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-4 flex items-end justify-between gap-6">
            <div>
              <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Five ways of thinking, measured
              </h2>
              <p className="max-w-xl text-balance text-foreground-secondary">
                Every item is a scenario with a decision in it. Each decision feeds one of
                five competencies — and one of five missions.
              </p>
            </div>
          </div>
          <div className="ruler-x mb-8" aria-hidden="true" />

          {/* Asymmetric Bento layout: Items 01 & 02 span 3 columns, Items 03, 04, 05 span 2 columns */}
          <BentoGrid cols={{ base: 1, sm: 2, lg: 6 }} gap={{ base: 3, md: 4 }}>
            {COMPETENCIES.map((c, index) => {
              const colSpan = index < 2 ? { base: 1, sm: 1, lg: 3 } as const : { base: 1, sm: 1, lg: 2 } as const;
              return (
                <BentoGridItem
                  key={c.n}
                  colSpan={colSpan}
                  className="corner-marks flex flex-col justify-between bg-background p-6 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className="size-3 rounded-full"
                        style={{ background: c.color }}
                        aria-hidden="true"
                      />
                      <Badge variant="outline" className="text-[10px] tracking-wider">
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

      {/* ── How it works: Ali Imam step card sequence ── */}
      <section id="how-it-works" className="section mx-auto w-full max-w-5xl scroll-mt-16 px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to your signal
          </h2>
          <p className="mx-auto max-w-xl text-balance text-foreground-secondary">
            A short process, deliberately: one sitting, one report, something to do next.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {/* Dashed connecting vector line */}
          <div className="absolute top-7 right-[18%] left-[18%] hidden h-px border-t border-dashed border-border md:block" />

          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={fade}
              className="relative flex flex-col items-center text-center p-6 border border-border bg-background corner-marks hover:border-primary/30 transition-colors"
            >
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

      {/* ── The report: Ali Imam bento-01 framed card layout ── */}
      <section id="report" className="section w-full scroll-mt-16 border-t border-border">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A report you can act on Monday
            </h2>
            <p className="mb-6 max-w-md text-balance leading-relaxed text-foreground-secondary">
              Not a percentile and a pat on the back. Five scores against the cohort, the gap
              on each, and one learning path sized to a school week — plus a paragraph
              written for parents, in plain language.
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-foreground-secondary">
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-primary shrink-0" aria-hidden="true" />
                Your score vs the cohort, per competency
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-primary shrink-0" aria-hidden="true" />
                The exact gap, as a number you can watch shrink
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-primary shrink-0" aria-hidden="true" />
                One next step — not a syllabus
              </li>
            </ul>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-foreground-secondary">
              Benchmarked: {REGIONS.join(' · ')}
            </p>
          </motion.div>

          {/* Mock report — angular, hairlines, registration marks */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="corner-marks border border-border bg-background p-6 shadow-xs"
            aria-label="Illustrative sample of a WARP report"
          >
            <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                WARP signal
              </span>
              <Badge variant="outline" className="font-mono text-[10px] tracking-[0.15em]">
                Class 8 · sample
              </Badge>
            </div>
            <div className="space-y-4">
              {REPORT_ROWS.map((row) => {
                const delta = row.you - row.cohort;
                return (
                  <div key={row.name}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold">{row.name}</span>
                      <span
                        className={
                          'font-mono text-[11px] tabular ' +
                          (delta >= 0 ? 'text-success' : 'text-highlight')
                        }
                      >
                        {delta >= 0 ? '+' : '−'}
                        {Math.abs(delta)}
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-input">
                      <div
                        className="h-full"
                        style={{ width: `${row.you}%`, background: row.color }}
                      />
                      {/* cohort marker */}
                      <div
                        className="absolute -top-0.75 h-3.5 w-px bg-foreground"
                        style={{ left: `${row.cohort}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 border-t border-border pt-3 text-xs text-foreground-secondary">
              Bar: your score · tick: cohort · includes a parent summary
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features: Ali Imam feature-01 inspired dashed border bento cards ── */}
      <section className="section w-full border-t border-border">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for students who want the real number
            </h2>
            <p className="mx-auto max-w-xl text-balance text-foreground-secondary">
              No streaks, no badges, no confetti. A measurement, an explanation, and a next
              step.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={fade}
                className="corner-marks border border-dashed border-border bg-background p-6 hover:border-primary/40 transition-colors"
              >
                <div className="mb-4 inline-flex p-2.5 bg-surface border border-border">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-display text-base font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-foreground-secondary">{body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Security guarantee card */}
          <div className="mt-5 flex items-start gap-4 border border-dashed border-border bg-surface/50 p-6 corner-marks">
            <div className="inline-flex p-2 bg-background border border-border shrink-0">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold">Your data stays yours</p>
              <p className="text-sm leading-relaxed text-foreground-secondary">
                Assessment data is encrypted in transit and at rest. We never sell it. You
                can export your reports or delete your account and history at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ: Ali Imam faq-01 / accordion-01 integrated Accordion ── */}
      <section id="faq" className="section w-full scroll-mt-16 border-t border-border">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Straight answers
            </h2>
          </div>

          <Accordion type="multiple" defaultValue={['item-0']}>
            {FAQ.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Closing: Ali Imam cta-01 inspired framed action section ── */}
      <section className="section border-t border-border bg-warp-grid px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-2xl flex-col items-center corner-marks border border-border bg-background p-8 sm:p-12 shadow-sm"
        >
          <WarpLogo variant="icon" className="mb-6 h-14 w-14" />
          <h2 className="mb-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to close the gap?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-balance text-lg text-foreground-secondary">
            Join students who know exactly where they stand — and what to do about it.
          </p>
          <Button size="lg" onClick={onEnter}>
            Create free account
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </section>

      {/* ── Footer: Ali Imam footer-01 inspired modular footer ── */}
      <footer className="border-t border-border bg-surface/30">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-12">
          <WarpLogo variant="stacked" className="h-28 w-auto" />
          
          {/* Live system status indicator pill */}
          <Badge variant="outline" dot className="font-mono text-[11px] text-foreground-secondary">
            All systems operational
          </Badge>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.15em] text-foreground-secondary">
            <a
              href="#competencies"
              className="flex min-h-7 items-center transition-colors hover:text-foreground"
            >
              Competencies
            </a>
            <a
              href="#how-it-works"
              className="flex min-h-7 items-center transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#report"
              className="flex min-h-7 items-center transition-colors hover:text-foreground"
            >
              The report
            </a>
            <a
              href="#faq"
              className="flex min-h-7 items-center transition-colors hover:text-foreground"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={onEnter}
              className="flex min-h-7 items-center font-bold text-primary transition-colors hover:text-foreground cursor-pointer"
            >
              Start
            </button>
          </nav>
          <p className="font-mono text-xs text-foreground-secondary">
            generated live · no assets · © 2026 WARP
          </p>
        </div>
      </footer>
    </main>
  );
}
