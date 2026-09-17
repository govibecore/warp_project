import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MenuIcon as Menu,
  CloseIcon as X,
  UserIcon as User,
  LogoutIcon as LogOut,
  DashboardIcon as LayoutDashboard,
} from './AliImamIcons';
import { WarpLogo } from '../../WarpLogo';
import { Button } from '../button';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';
import { signOutUser } from '../../../lib/auth';

interface Header03Props {
  onEnter: (mode?: 'choose' | 'login' | 'register') => void;
}

const NAV_LINKS = [
  { id: 'evaluation', label: 'Evaluation', href: '#features' },
  { id: 'competencies', label: 'Competencies', href: '#competencies' },
  { id: 'frameworks', label: 'Global Norms', href: '#frameworks' },
  { id: 'governance', label: 'Governance', href: '#faq' },
];

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
      className="fixed top-0 left-0 z-50 w-full border-b border-border bg-background transition-colors duration-200"
      data-testid="header-03"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left Slot: Programmable Geometric Brandmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (window.location.search || window.location.pathname !== '/') {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="group flex items-center gap-2.5 cursor-pointer"
            aria-label="WARP Home"
          >
            <WarpLogo variant="lockup" className="h-6 sm:h-7 w-auto" />
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 border border-border bg-transparent font-mono text-[9px] uppercase tracking-widest text-foreground-secondary group-hover:border-[#00B4D8]/50 group-hover:text-[#00B4D8] transition-colors">
              Adaptive CAT
            </span>
          </a>
        </div>

        {/* Center Slot: Desktop Navigation Links (Nordic Lagom Sharp Tabs) */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll(link.href);
              }}
              className="relative flex h-16 items-center px-4 font-mono text-xs uppercase tracking-widest text-foreground-secondary hover:text-[#00B4D8] transition-colors group cursor-pointer"
            >
              {link.label}
              {/* Sharp Fjord Cyan Underline */}
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#00B4D8] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </a>
          ))}
        </nav>

        {/* Right Slot: Auth */}
        <div className="hidden lg:flex items-center gap-2.5">
          {isSignedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex size-9 items-center justify-center rounded-none border border-border bg-[#121212] text-foreground transition-colors hover:border-[#00B4D8] cursor-pointer"
                aria-label="User menu"
              >
                <div className="flex size-5.5 items-center justify-center rounded-none text-[#00B4D8] font-mono text-[11px]">
                  <User className="size-3" />
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-none border border-border bg-background p-1.5 z-50 font-mono text-xs shadow-none"
                  >
                    <a
                      href="/?dashboard"
                      className="flex items-center gap-2 rounded-none px-3 py-2 text-foreground hover:bg-surface transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-3.5 text-[#00B4D8]" />
                      Dashboard
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOutUser();
                      }}
                      className="flex w-full items-center gap-2 rounded-none px-3 py-2 text-red-500 hover:bg-surface transition-colors cursor-pointer"
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
              variant="outline"
              size="sm"
              onClick={() => onEnter('login')}
              className="h-9 px-6 text-xs font-mono uppercase tracking-widest font-medium rounded-none border border-border bg-transparent text-foreground-secondary hover:text-[#00B4D8] hover:border-[#00B4D8] transition-colors cursor-pointer shadow-none"
            >
              Sign in
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex size-9 items-center justify-center rounded-none border border-border bg-transparent text-foreground transition-colors hover:text-foreground-muted cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4.5 text-foreground" /> : <Menu className="size-4.5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer - Strict Black Block */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-background lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed top-16 right-0 z-50 h-[calc(100svh-4rem)] w-full border-l border-border bg-background p-6 overflow-y-auto lg:hidden flex flex-col justify-between"
            >
              <div className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      handleSmoothScroll(link.href);
                    }}
                    className="block border-b border-border py-6 text-2xl sm:text-3xl font-display uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-8 pt-6">
                {!isSignedIn ? (
                  <Button
                    id="mobile-landing-sign-in-btn"
                    variant="outline"
                    size="md"
                    block
                    onClick={() => {
                      setMobileOpen(false);
                      onEnter('login');
                    }}
                    className="w-full h-12 text-sm font-mono uppercase tracking-widest rounded-none border border-border bg-transparent text-foreground hover:border-primary cursor-pointer shadow-none"
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
                    className="w-full h-12 border border-border text-foreground rounded-none shadow-none text-sm font-mono uppercase tracking-widest hover:bg-surface cursor-pointer"
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
