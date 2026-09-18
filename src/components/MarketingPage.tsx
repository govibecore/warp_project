import { Hexagon } from 'lucide-react';
import { Header03 } from './ui/aliimam/Header03';
import { MARKETING_PAGES } from '../data/marketingPages';

interface MarketingPageProps {
  slug: string;
  onEnter?: (mode?: 'choose' | 'login' | 'register') => void;
}

export function MarketingPage({ slug, onEnter }: MarketingPageProps) {
  const pageData = MARKETING_PAGES[slug];

  if (!pageData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-mono">
        <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
        <a href="/" className="text-primary hover:underline">Return to Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
      {/* Background Grid Pattern for Lagom aesthetic */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      <Header03 onEnter={onEnter || (() => {})} />

      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Header Block */}
        <div className="mb-16 border-b border-border/40 pb-12">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
            {pageData.title}
          </h1>
          <p className="font-mono text-sm uppercase tracking-widest text-primary">
            {pageData.subtitle}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {pageData.sections.map((section, idx) => (
            <section key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-8 border-l border-border/40 pl-6 sm:pl-8 relative">
              {/* Hairline indicator */}
              <div className="absolute -left-px top-0 h-8 w-px bg-primary" />
              
              <div className="md:col-span-4">
                <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
                  {section.heading}
                </h2>
              </div>
              
              <div className="md:col-span-8 space-y-6">
                {section.body.map((paragraph, pIdx) => (
                  <p key={pIdx} className="font-sans text-sm sm:text-base leading-relaxed text-foreground-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER - Replicated from Landing.tsx to maintain aesthetic */}
      <footer className="w-full pb-16 relative z-10">
        <div className="max-w-5xl mx-auto flex h-auto flex-col items-stretch justify-between md:flex-row pt-16 pb-12 px-4 sm:px-6 lg:px-8 gap-12 md:gap-8 border-x-0 sm:border-x border-t border-border/40 bg-background">
          <div className="flex h-auto flex-col items-start justify-start gap-8 md:pr-8">
            <a href="/" className="flex items-center gap-2 font-display tracking-widest uppercase text-xl font-semibold text-foreground">
              <Hexagon className="text-foreground w-6 h-6" />
              WARP
            </a>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-16 font-mono flex-1 w-full md:w-auto mt-8 md:mt-0 bg-background">
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">Platform</div>
              <div className="flex flex-col gap-3">
                <a href="?page=stem-benchmark" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">STEM Benchmark</a>
                <a href="?page=english-assessment" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">English Assessment</a>
                <a href="?page=ai-reports" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">AI Reports</a>
                <a href="?page=global-rankings" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Global Rankings</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">For Families</div>
              <div className="flex flex-col gap-3">
                <a href="?page=parent-reports" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Parent Reports</a>
                <a href="?dashboard" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Student Dashboard</a>
                <a href="?page=pricing" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Pricing</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">Company</div>
              <div className="flex flex-col gap-3">
                <a href="?page=about" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">About WARP</a>
                <a href="?page=research" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Research</a>
                <a href="?page=privacy-policy" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Privacy Policy</a>
                <a href="?page=terms-of-use" className="text-foreground-secondary hover:text-foreground text-xs transition-colors">Terms of Use</a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto relative h-12 overflow-hidden border-x-0 sm:border-x border-t border-border/40 bg-background">
          <div className="absolute inset-0 h-full w-full overflow-hidden">
            <div className="relative h-full w-full opacity-30">
              {Array.from({ length: 300 }).map((_, i) => (
                <div key={i} className="absolute h-4 w-full origin-top-left -rotate-45 border-t border-border/40" style={{ top: `${i * 16 - 120}px`, left: '-100%', width: '300%' }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto py-6 flex items-center justify-center border-x-0 sm:border-x border-b border-border/40 bg-background">
          <p className="text-foreground-secondary text-xs font-mono uppercase tracking-widest text-center px-4">
            Built with ⚡, ☕, and a lot of love by <span className="text-foreground font-bold">Oliver Oinam (Arra-Core)</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
