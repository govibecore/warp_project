import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { SaveStatus } from './SaveStatus';
import { WarpLogo } from './WarpLogo';
import { Button } from './ui/button';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useWarpSession } from '../context/WarpSessionContext';
import { supabase, supabaseUrl } from '../lib/supabase';
import { LayoutDashboard, LogOut, User, ShieldCheck, Sliders } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ProfilePanel } from './ProfilePanel';
import { signOutUser } from '../lib/auth';

/**
 * The frame every student screen lives in.
 * Strict Nordic Lagom design system: restrained, 1px hairline elevation,
 * sharp 0px geometry, precision typography and clear identity telemetry.
 */
export function AppShell({
  children,
  scrollable = false,
  hideHeader = false,
}: PropsWithChildren<{ scrollable?: boolean; hideHeader?: boolean }>) {
  const { isSignedIn, isLoaded, user } = useSupabaseAuth();
  const { goHome, session } = useWarpSession();
  const profile = session?.profile;

  // Determine active view label for breadcrumb
  const isDashboardView = typeof window !== 'undefined' && (
    window.location.search.includes('dashboard') ||
    window.location.pathname.includes('dashboard')
  );
  const isReportView = typeof window !== 'undefined' && window.location.search.includes('assessment=');

  return (
    <div
      className={
        'flex flex-col bg-background text-foreground ' +
        (scrollable ? 'min-h-screen overflow-x-hidden' : 'h-screen overflow-hidden')
      }
    >
      {!hideHeader && (
        <header className="no-print sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 md:px-8 transition-colors">
          {/* ── Left Brand Lockup & Technical Telemetry ── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.search) {
                  window.history.pushState({}, '', window.location.pathname);
                }
                goHome();
              }}
              className="flex items-center gap-3 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary group"
              aria-label="Return to WARP Home"
            >
              <WarpLogo className="h-7 sm:h-8 w-auto" />
            </button>

            <span className="hidden sm:block h-3.5 w-px bg-border" aria-hidden="true" />

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 border border-border/70 bg-surface/60 text-[10px] font-mono uppercase tracking-[0.16em] text-foreground-secondary">
              <span className="size-1.5 rounded-none bg-emerald-500" aria-hidden="true" />
              <span>3PL IRT CAT</span>
            </div>
          </div>

          {/* ── Center Breadcrumbs / Context ── */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono tracking-wider text-foreground-muted">
            <span className="text-foreground-secondary font-semibold">WARP</span>
            <span className="text-border-strong">/</span>
            {isReportView ? (
              <span className="text-primary font-bold">CALIBRATED REPORT</span>
            ) : isDashboardView ? (
              <span className="text-primary font-bold">STUDENT DOSSIER</span>
            ) : (
              <span className="text-foreground-secondary">EVALUATION PLATFORM</span>
            )}
            {profile?.classLevel && (
              <>
                <span className="text-border-strong">/</span>
                <span className="text-foreground-muted">CLASS {profile.classLevel}</span>
              </>
            )}
          </div>

          {/* ── Right Status & Identity Controls ── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <SaveStatus />

            <span className="hidden sm:block h-3.5 w-px bg-border" aria-hidden="true" />

            {/* Auth-aware slot */}
            {isLoaded && (
              isSignedIn || profile
                ? <UserMenu user={user} />
                : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.search = '?login';
                      }
                    }}
                    className="text-xs font-mono font-semibold h-8 px-3 rounded-none"
                  >
                    Sign in
                  </Button>
                )
            )}
          </div>
        </header>
      )}

      <div className="flex min-h-0 flex-1 flex-col print:min-h-fit">{children}</div>
      <ProfilePanel hideTrigger />
    </div>
  );
}

// ── User Dropdown Menu ──────────────────────────────────────────────────────────

function UserMenu({ user }: { user: import('@supabase/supabase-js').User | null }) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { session } = useWarpSession();
  const profile = session.profile;

  // Resolve display name & avatar
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    profile?.name ||
    'Student';

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Fetch avatar from students table on mount
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('students')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as any;
        if (row?.avatar_url) {
          setAvatarUrl(
            row.avatar_url.startsWith('http')
              ? row.avatar_url
              : `${supabaseUrl}/storage/v1/object/public/avatars/${row.avatar_url}?t=${Date.now()}`
          );
        }
      });
  }, [user?.id]);

  // Keep navbar avatar in sync when the user updates it via ProfilePanel
  useEffect(() => {
    function onAvatarUpdated(e: Event) {
      const { path } = (e as CustomEvent<{ path: string | null }>).detail;
      if (path) {
        setAvatarUrl(
          path.startsWith('http')
            ? path
            : `${supabaseUrl}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`
        );
      } else {
        setAvatarUrl(null);
      }
    }
    window.addEventListener('warp:avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('warp:avatar-updated', onAvatarUpdated);
  }, []);

  const resolvedAvatar =
    avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  useEffect(() => {
    setImgError(false);
  }, [resolvedAvatar]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('show_logout_animation', 'true');
    }
    await signOutUser();
  }

  const classDisplay = profile?.classLevel ? `Class ${profile.classLevel}` : 'Standard';

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button (Minimal single profile icon: no name, no badge, no chevron) */}
      <button
        id="user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        className="relative group flex size-8 shrink-0 items-center justify-center rounded-none border border-border bg-card text-foreground hover:border-primary hover:bg-surface transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
        aria-label={`Open profile menu for ${displayName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        title={displayName}
      >
        {resolvedAvatar && !imgError ? (
          <img
            src={resolvedAvatar}
            alt={displayName}
            className="size-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[11px] font-bold font-mono text-foreground-secondary group-hover:text-primary transition-colors">
            {initials}
          </span>
        )}
        {/* Active online pip */}
        <span className="absolute bottom-0 right-0 size-1.5 bg-emerald-500 rounded-none border border-card" />
      </button>

      {/* Dropdown Menu (Executive Scandinavian Identity Card) */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="user-dropdown"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+6px)] z-60 w-72 border border-border bg-card shadow-none rounded-none overflow-hidden"
            role="menu"
          >
            {/* Identity Header */}
            <div className="border-b border-border p-4 bg-surface/30">
              <div className="flex items-center gap-3">
                <div className="size-10 shrink-0 overflow-hidden border border-border bg-surface flex items-center justify-center text-foreground-secondary font-mono font-bold text-xs">
                  {resolvedAvatar && !imgError ? (
                    <img
                      src={resolvedAvatar}
                      alt="Profile"
                      className="size-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-display font-bold truncate bg-linear-to-br from-(--gradient-flowdesk-1) to-(--gradient-flowdesk-2) bg-clip-text text-transparent">
                      {displayName}
                    </p>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 border border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      ACTIVE
                    </span>
                  </div>
                  {user?.email && (
                    <p className="text-[10px] text-foreground-muted font-mono truncate mt-0.5">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] font-mono tracking-widest text-foreground-secondary">
                <span className="uppercase">{classDisplay} · STEM</span>
                <span className="text-primary font-bold">3PL IRT READY</span>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="py-1.5">
              <DropdownItem
                icon={<LayoutDashboard className="size-4" />}
                label="Student Dossier"
                description="Longitudinal arc & performance"
                onClick={() => { setOpen(false); window.location.href = '/?dashboard'; }}
              />
              <DropdownItem
                icon={<User className="size-4" />}
                label="Academic Identity"
                description="Profile, school & WhatsApp report"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent('warp:open-profile', { detail: { tab: 'profile' } }));
                  const trigger = document.getElementById('profile-panel-trigger') as HTMLButtonElement | null;
                  if (trigger) trigger.click();
                }}
              />
              <DropdownItem
                icon={<Sliders className="size-4" />}
                label="Calibration Settings"
                description="IRT difficulty baseline & alerts"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent('warp:open-profile', { detail: { tab: 'settings' } }));
                  const trigger = document.getElementById('profile-panel-trigger') as HTMLButtonElement | null;
                  if (trigger) trigger.click();
                }}
              />
              <DropdownItem
                icon={<ShieldCheck className="size-4" />}
                label="Account & Consent"
                description="DPDP 2023 compliance & ID"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent('warp:open-profile', { detail: { tab: 'account' } }));
                  const trigger = document.getElementById('profile-panel-trigger') as HTMLButtonElement | null;
                  if (trigger) trigger.click();
                }}
              />
            </div>

            {/* Sign Out Action */}
            <div className="border-t border-border p-1.5 bg-surface/20">
              <DropdownItem
                icon={<LogOut className="size-4" />}
                label="Sign out"
                onClick={handleSignOut}
                danger
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  description,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-all cursor-pointer relative group ${
        danger
          ? 'text-foreground-secondary hover:text-destructive hover:bg-destructive/5'
          : 'text-foreground-secondary hover:text-foreground hover:bg-surface'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors ${
        danger ? 'group-hover:bg-destructive' : 'group-hover:bg-primary'
      }`} />
      
      <span className={`mt-0.5 shrink-0 transition-colors ${
        danger ? '' : 'text-foreground-muted group-hover:text-primary'
      }`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-sans font-medium transition-colors ${
          danger ? '' : 'group-hover:text-foreground'
        }`}>
          {label}
        </p>
        {description && (
          <p className="text-[10px] text-foreground-muted truncate mt-0.5 transition-colors group-hover:text-foreground-secondary">{description}</p>
        )}
      </div>
    </button>
  );
}
