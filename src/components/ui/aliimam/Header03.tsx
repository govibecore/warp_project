import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { WarpLogo } from '../../WarpLogo';
import { Button } from '../button';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';
import { signOutUser } from '../../../lib/auth';

interface Header03Props {
  onEnter: (mode?: 'choose' | 'login' | 'register' | 'guest') => void;
}


const NAV_LINKS = [
  { id: 'evaluation', label: 'Evaluation', href: '#features' },
  { id: 'competencies', label: 'Competencies', href: '#competencies' },
  { id: 'frameworks', label: 'Global Norms', href: '#frameworks' },
  { id: 'governance', label: 'Governance', href: '#faq' },
];

// ── Header03 Main Component ───────────────────────────────────────────────────

export function Header03({ onEnter }: Header03Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, user } = useSupabaseAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSmoothScroll = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Student';

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors duration-300"
      data-testid="header-03"
    >
      <div className="mx-auto flex h-18 sm:h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Left Slot: Branded Tile Pill ── */}
        <div className="flex items-center gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex h-12 items-center gap-3 rounded border border-border/80 bg-surface/80 px-3.5 backdrop-blur-md transition-all duration-200 hover:border-primary/60 hover:bg-surface cursor-pointer"
            aria-label="WARP Home"
          >
            <WarpLogo variant="lockup" className="h-7 sm:h-8 w-auto transition-transform duration-200 group-hover:scale-[1.02]" />
            <span className="hidden sm:inline border-l border-border/80 pl-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              Adaptive CAT
            </span>
          </a>
        </div>

        {/* ── Center Slot: Desktop Navigation Links ── */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll(link.href);
              }}
              className="flex h-11 items-center rounded px-3.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface/60 hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Right Slot: Auth ── */}
        <div className="hidden lg:flex items-center gap-2.5">
          {isSignedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex size-11 items-center justify-center rounded border border-border/80 bg-surface/80 text-foreground transition-colors hover:border-primary/50 cursor-pointer"
                aria-label="User menu"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary font-mono text-xs">
                  <User className="size-3.5" />
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded border border-border/80 bg-background/95 p-1.5 shadow-xl backdrop-blur-xl z-50 font-mono text-xs"
                  >
                    <a
                      href="/?dashboard"
                      className="flex items-center gap-2 rounded px-3 py-2 text-foreground hover:bg-surface transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-3.5 text-primary" />
                      Dashboard
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOutUser();
                      }}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-destructive hover:bg-destructive-subtle transition-colors cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button
              id="landing-sign-in-btn"
              size="md"
              onClick={() => onEnter('login')}
              className="h-11 px-4 sm:px-5 text-xs font-semibold tracking-wide cursor-pointer shadow-md hover:shadow-primary/20"
            >
              Sign in
            </Button>
          )}
        </div>

        {/* ── Mobile Hamburger Trigger ── */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex size-10 items-center justify-center rounded border border-border/80 bg-surface/70 text-foreground transition-colors hover:bg-surface cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5 text-foreground" /> : <Menu className="size-5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Slide-Out Drawer (Ali Imam Sheet + Accordion Pattern) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-18 sm:top-20 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-out Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed top-18 sm:top-20 right-0 z-50 h-[calc(100svh-4.5rem)] sm:h-[calc(100svh-5rem)] w-full sm:w-115 border-l border-border bg-background/95 backdrop-blur-2xl p-6 overflow-y-auto lg:hidden shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      handleSmoothScroll(link.href);
                    }}
                    className="block rounded px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface/80"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="mt-8 border-t border-border/80 pt-6 space-y-3">
                {!isSignedIn ? (
                  <Button
                    id="mobile-landing-sign-in-btn"
                    size="lg"
                    block
                    onClick={() => {
                      setMobileOpen(false);
                      onEnter('login');
                    }}
                    className="w-full text-xs font-mono cursor-pointer shadow-md"
                  >
                    Sign in to account
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    block
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      signOutUser();
                    }}
                    className="w-full text-xs font-mono text-destructive cursor-pointer"
                  >
                    Sign out ({displayName})
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
