import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hexagon } from 'lucide-react';
import { Header03 } from './ui/aliimam/Header03';
import { Button } from './ui/button';
import { ArrowRightIcon, SparklesIcon } from './ui/aliimam/AliImamIcons';
import { Marquee } from './ui/aliimam/Marquee';
import React, { Suspense } from 'react';
const StemCityCanvas = React.lazy(() => import('./StemCityCanvas').catch(err => {
  console.warn('Failed to load canvas chunk', err);
  return { default: () => <div className="absolute inset-0 bg-background/5" /> };
}));
import { Typewriter } from './ui/Typewriter';
import { WarpLottie } from './ui/warp-lottie';
import { GlyphMatrix } from './ui/glyph-matrix';
import { BorderBeam } from './ui/border-beam';
import starburstData from '../assets/lottie/star burst animation.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface LandingProps {
  onEnter(mode?: 'choose' | 'login' | 'register'): void;
}

const FAQS = [
  {
    q: "How quickly can WARP identify my child's real skill level?",
    a: "In as few as 30 questions. WARP's adaptive engine recalibrates after every single answer - serving the next question at precisely the right difficulty. The result is a pinpoint-accurate global benchmark that a traditional 100-question test cannot match, delivered in a fraction of the time.",
  },
  {
    q: 'What subjects and global standards does WARP cover?',
    a: "WARP benchmarks STEM (Science, Technology, Engineering, Mathematics) and English proficiency, calibrated against NGSS, PISA 2025, and India's NCF 2023 - the same international standards used to rank countries, award scholarships, and select students for elite programs. Your child competes on the world stage, not just their classroom.",
  },
  {
    q: 'What does a WARP report actually tell a parent?',
    a: "Your parent report maps exactly where your child stands globally - percentile rank across each STEM domain and English, the specific knowledge gaps holding them back, and a concrete action plan for how you can guide them forward. No vague letter grades. A clear GPS to academic excellence.",
  },
  {
    q: "Is my child's data private and safe?",
    a: "Completely. Registered accounts are protected by bank-grade Row-Level Security. We never sell student data, never share it with third parties, and never use it for advertising of any kind.",
  },
  {
    q: 'How is WARP different from practice apps and tutoring platforms?',
    a: 'Practice apps repeat content. Tutoring platforms teach what is available. WARP does something fundamentally different: it scientifically measures where your child actually is today, then generates an AI-powered report that maps the shortest path from their current ability to global competitiveness. Measurement first. Action plan second.',
  },
];



gsap.registerPlugin(ScrollTrigger);

export function Landing({ onEnter }: LandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLogoutAnim, setShowLogoutAnim] = useState(
    () => typeof window !== 'undefined' && window.sessionStorage.getItem('show_logout_animation') === 'true'
  );
  
  const [glyphColor, setGlyphColor] = useState("#6B7280");

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains("dark");
    setGlyphColor(isDark ? "#ffffff" : "#000000");
    
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setGlyphColor(isDarkNow ? "#ffffff" : "#000000");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showLogoutAnim) {
      window.sessionStorage.removeItem('show_logout_animation');
      const t = setTimeout(() => setShowLogoutAnim(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showLogoutAnim]);

  useGSAP(
    () => {
      // Hero Load Stagger
      gsap.fromTo(
        '.hero-stagger',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );

      // ScrollTrigger for Feature Cards
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
          }
        );
      });

      // ScrollTrigger for Schematics (subtle parallax)
      gsap.utils.toArray<HTMLElement>('.schematic-parallax').forEach((el) => {
        gsap.to(el, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // CTA Reveal
      gsap.fromTo(
        '.cta-reveal',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-w-0 w-full min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden max-w-7xl mx-auto border-x border-border">
      {showLogoutAnim && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/95 pointer-events-none">
          <WarpLottie animationData={starburstData} className="w-48 h-48 opacity-80 mix-blend-screen" loop={false} durationMs={3000} />
        </div>
      )}

      {/* NAVIGATION */}
      <Header03 onEnter={onEnter} />

      {/* HERO */}
      <main className="w-full min-w-0 overflow-hidden border-b border-border relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
          <GlyphMatrix
            glyphs="01·•+*/\<>="
            cellSize={14}
            mutationRate={0.04}
            interval={90}
            fadeBottom={0.6}
            color={glyphColor}
          />
        </div>

        <section className="relative mx-auto px-4 pb-0 pt-20 lg:pt-24 xl:pt-32 z-10">
          <div className="mx-auto max-w-5xl text-center">

            <div className="hero-stagger relative overflow-hidden inline-flex items-center gap-1.5 sm:gap-2 border border-border bg-surface/50 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono mb-6 sm:mb-8 uppercase tracking-widest rounded-none mx-auto">
              <SparklesIcon size={14} className="text-primary z-10 relative" />
              <span className="text-foreground-secondary z-10 relative">Forging Tomorrow's Global Champions</span>
              <BorderBeam duration={8} size={50} />
            </div>

            {/* HEADLINE */}
            <h1
              className="w-full min-w-0 hero-stagger font-display text-5xl min-[400px]:text-6xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] sm:leading-[1.05] tracking-tighter mb-8 sm:mb-10 max-w-6xl mx-auto min-h-36 flex flex-col items-center justify-center gap-y-2 sm:gap-y-3 px-2 sm:px-0"
            >
              <span className="text-center text-balance">Your child's <br className="sm:hidden" /> potential.</span>
              <span className="text-primary flex items-center justify-center text-center">
                <Typewriter words={["Measured.", "Proven.", "Unleashed."]} speed={60} delayBetweenWords={2500} />
              </span>
            </h1>

            <p className="hero-stagger text-base sm:text-lg text-foreground-secondary max-w-2xl mb-10 sm:mb-12 font-medium mx-auto px-2 sm:px-0">
              Benchmark STEM and English skills against global standards. 30 questions. A lifetime of advantage.
            </p>

            <div className="hero-stagger flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16 w-full max-w-xs mx-auto sm:max-w-none">
              <Button
                onClick={() => onEnter('choose')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 sm:h-10 px-8 font-mono uppercase tracking-widest font-medium text-xs sm:text-sm border-none w-full sm:w-auto cursor-pointer"
              >
                Start Benchmark
              </Button>
            </div>

            <div className="hero-stagger border border-border bg-card py-3 sm:py-4 overflow-hidden mx-auto max-w-3xl rounded-none relative z-20">
              <Marquee className="text-foreground-secondary font-mono text-[10px] sm:text-xs uppercase tracking-widest" repeat={6} pauseOnHover={false}>
                <span className="px-4 sm:px-8 flex items-center gap-2">■ NGSS GLOBAL STANDARD</span>
                <span className="px-4 sm:px-8 flex items-center gap-2">■ PISA 2025 ALIGNED</span>
                <span className="px-4 sm:px-8 flex items-center gap-2">■ INDIA NCF 2023</span>
                <span className="px-4 sm:px-8 flex items-center gap-2">■ ZERO DATA SOLD</span>
                <span className="px-4 sm:px-8 flex items-center gap-2">■ AI-POWERED REPORTS</span>
                <span className="px-4 sm:px-8 flex items-center gap-2">■ EMERGING TECH READY</span>
              </Marquee>
            </div>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-none pt-12 pb-24 max-w-5xl mx-auto border-x-0 sm:border-x border-t border-border">
            <div className="relative z-10 flex justify-center w-full px-4 sm:px-12">
              <div className="relative w-full max-w-4xl aspect-video overflow-hidden border border-border bg-surface rounded-none z-10 shadow-2xl">
                <img
                  src="/hero_wc_bg.jpg"
                  alt="Students collaborating"
                  className="w-full h-full object-cover opacity-90 dark:hidden"
                />
                <img
                  src="/hero_native_dark.jpg"
                  alt="Students collaborating"
                  className="w-full h-full object-cover opacity-90 hidden dark:block"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* METRICS */}
      <section id="features" className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="feature-card px-6">
            <div className="font-display text-6xl sm:text-7xl font-bold text-foreground mb-4 tracking-tighter">30<span className="text-3xl text-foreground-muted">Qs</span></div>
            <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-widest">Pinpoint Accuracy</h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">30 adaptive questions deliver a global benchmark more accurate than a 100-item traditional exam. Precision without exhaustion.</p>
          </div>
          <div className="feature-card px-6 pt-12 md:pt-0">
            <div className="font-display text-6xl sm:text-7xl font-bold text-foreground mb-4 tracking-tighter">5</div>
            <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-widest">STEM + English Domains</h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">Science, Technology, Engineering, Mathematics, and English the five pillars of global academic competitiveness, measured in a single session.</p>
          </div>
          <div className="feature-card px-6 pt-12 md:pt-0">
            <div className="font-display text-6xl sm:text-7xl font-bold text-foreground mb-4 tracking-tighter">2x</div>
            <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-widest">Dual AI Reports</h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">Every benchmark generates two reports: one for the student (motivational, actionable) and one for the parent (analytical, strategic).</p>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="competencies" className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-border">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">Built for the World Stage</h2>
          <p className="text-foreground-secondary text-sm leading-relaxed">Local grades do not predict global success. WARP competes on NGSS, PISA 2025, and NCF 2023 the international benchmarks that universities, scholarship boards, and future employers actually use.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="feature-card group border border-border bg-card rounded-none overflow-hidden hover:border-border-strong transition-colors cursor-pointer">
            <div className="aspect-4/3 bg-surface relative overflow-hidden">
              <img src="/adaptive_wc_bg.jpg" alt="Adaptive Intelligence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 dark:hidden" />
              <img src="/adaptive_native_dark.jpg" alt="Adaptive Intelligence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 hidden dark:block" />
            </div>
            <div className="p-5 flex justify-between items-start border-t border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Adaptive Intelligence</h3>
                <p className="text-xs text-foreground-secondary">Every question recalibrates to your child's exact ability level</p>
              </div>
              <ArrowRightIcon size={16} className="text-foreground-muted group-hover:text-foreground transition-colors mt-0.5" />
            </div>
          </div>

          <div className="feature-card group border border-border bg-card rounded-none overflow-hidden hover:border-border-strong transition-colors cursor-pointer">
            <div className="aspect-4/3 bg-surface relative overflow-hidden">
              <img src="/mapping_wc_bg.jpg" alt="Precision Gap Mapping" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 dark:hidden" />
              <img src="/mapping_native_dark.jpg" alt="Precision Gap Mapping" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 hidden dark:block" />
            </div>
            <div className="p-5 flex justify-between items-start border-t border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Precision Gap Mapping</h3>
                <p className="text-xs text-foreground-secondary">Not just what they got wrong exactly why, and the shortest path to correct it</p>
              </div>
              <ArrowRightIcon size={16} className="text-foreground-muted group-hover:text-foreground transition-colors mt-0.5" />
            </div>
          </div>

          <div className="feature-card group border border-border bg-card rounded-none overflow-hidden hover:border-border-strong transition-colors cursor-pointer">
            <div className="aspect-4/3 bg-surface relative overflow-hidden">
              <img src="/global_wc_bg.jpg" alt="Global Rank Engine" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 object-bottom dark:hidden" />
              <img src="/global_native_dark.jpg" alt="Global Rank Engine" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 object-bottom hidden dark:block" />
            </div>
            <div className="p-5 flex justify-between items-start border-t border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Global Rank Engine</h3>
                <p className="text-xs text-foreground-secondary">See exactly where your child stands against peers worldwide not just their classroom</p>
              </div>
              <ArrowRightIcon size={16} className="text-foreground-muted group-hover:text-foreground transition-colors mt-0.5" />
            </div>
          </div>
        </div>
      </section>

      {/* STEM CITY */}
      <section id="frameworks" className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-border">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">The Blueprint of Global Competence</h2>
          <p className="text-foreground-secondary text-sm leading-relaxed">WARP maps your child's 5 core competencies into an interactive STEM City blueprint, contrasting their proficiency directly against the global cohort standard.</p>
        </div>
        <div className="w-full h-96 md:h-125 border border-border bg-card overflow-hidden relative group">
          <Suspense fallback={<div className="w-full h-full bg-surface flex items-center justify-center font-mono text-xs text-foreground-muted">INITIALIZING SCENE...</div>}>
            <StemCityCanvas className="w-full h-full" />
          </Suspense>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-16 text-left">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">Questions Parents Ask</h2>
          <p className="text-foreground-secondary text-sm">Everything you need to know before starting your child's global benchmark.</p>
        </div>
        <div className="w-full">
          <Accordion
            type="single"
            className="w-full"
            defaultValue="item-0"
          >
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="space-y-4 border-none mb-8"
              >
                <AccordionTrigger className="group flex w-full justify-end py-0 hover:no-underline [&_svg]:hidden">
                  <div className="bg-primary text-primary-foreground max-w-[80%] cursor-pointer px-5 py-4 text-left text-base transition relative">
                    {faq.q}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="flex justify-start">
                  <div className="bg-muted text-muted-foreground max-w-[80%] px-5 py-4 text-base relative">
                    {faq.a}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 70%)',
                backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                height: '100%',
                left: '0',
                maskImage: 'linear-gradient(to bottom, #000 0%, transparent 70%)',
                opacity: '0.5',
                pointerEvents: 'none',
                position: 'absolute',
                top: '0',
                width: '100%'
              }}
            />
          </div>
          <h2 className="cta-reveal font-display text-3xl sm:text-4xl font-bold text-foreground mb-6 tracking-tight relative z-10">
            Your child's global rank starts here.
          </h2>
          <p className="cta-reveal text-foreground-secondary max-w-lg mx-auto mb-10 text-sm leading-relaxed relative z-10">
            Join families worldwide using WARP to discover hidden potential, close critical gaps, and forge students ready to lead in STEM, technology, and the AI-driven world ahead.
          </p>
          <div className="cta-reveal relative z-10">
            <Button
              onClick={() => onEnter('choose')}
              className="bg-foreground text-background hover:opacity-90 rounded-none h-12 px-8 font-medium text-base border-none shadow-[0_0_30px_rgba(var(--foreground-rgb),0.15)] cursor-pointer"
            >
              Start Free Benchmark
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full pb-16">
        <div className="max-w-5xl mx-auto flex h-auto flex-col items-stretch justify-between md:flex-row pt-16 pb-12 px-4 sm:px-6 lg:px-8 gap-12 md:gap-8 border-x-0 sm:border-x border-t border-border">
          <div className="flex h-auto flex-col items-start justify-start gap-8 md:pr-8">
            <div className="flex items-center gap-2 font-display tracking-widest uppercase text-xl font-semibold text-foreground">
              <Hexagon className="text-foreground w-6 h-6" />
              WARP
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2 font-display tracking-tight">Forge the next generation.</h2>
              <p className="text-foreground-secondary max-w-sm text-xs leading-relaxed font-mono">
                WARP benchmarks STEM and English skills against global standards, then maps the exact path for your child to outperform peers worldwide and lead in an emerging-tech future.
              </p>
            </div>
            <div className="flex items-start gap-6 text-foreground-secondary">
              <a href="#" className="hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="hover:text-foreground transition-colors" aria-label="X">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              </a>
              <a href="#" className="hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-16 font-mono flex-1 w-full md:w-auto mt-8 md:mt-0">
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">Platform</div>
              <div className="flex flex-col gap-3">
                <a href="?page=stem-benchmark" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">STEM Benchmark</a>
                <a href="?page=english-assessment" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">English Assessment</a>
                <a href="?page=ai-reports" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">AI Reports</a>
                <a href="?page=global-rankings" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Global Rankings</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">For Families</div>
                <div className="flex flex-col gap-3">
                  <a href="?page=parent-reports" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Parent Reports</a>
                  <a href="?dashboard" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Student Dashboard</a>
                  <a href="?page=pricing" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Pricing</a>
                </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">Company</div>
              <div className="flex flex-col gap-3">
                <a href="?page=about" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">About WARP</a>
                <a href="?page=research" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Research</a>
                <a href="?page=privacy-policy" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Privacy Policy</a>
                <a href="?page=terms-of-use" className="text-foreground-secondary hover:text-foreground cursor-pointer text-xs transition-colors">Terms of Use</a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto relative h-12 overflow-hidden border-x-0 sm:border-x border-t border-border">
          <div className="absolute inset-0 h-full w-full overflow-hidden">
            <div className="relative h-full w-full opacity-30">
              {Array.from({ length: 300 }).map((_, i) => (
                <div key={i} className="absolute h-4 w-full origin-top-left -rotate-45 border-t border-border" style={{ top: `${i * 16 - 120}px`, left: '-100%', width: '300%' }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto py-6 flex items-center justify-center border-x-0 sm:border-x border-b border-border">
          <p className="text-foreground-secondary text-xs font-mono uppercase tracking-widest text-center px-4">
            Built with ☕, 💻, and a lot of love by <span className="text-foreground font-bold">Oliver Oinam (Arra-Core)</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
