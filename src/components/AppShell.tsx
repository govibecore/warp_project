import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { SaveStatus } from './SaveStatus';
import { WarpLogo } from './WarpLogo';
import { Button } from './ui/button';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useWarpSession } from '../context/WarpSessionContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ProfilePanel } from './ProfilePanel';
import { signOutUser } from '../lib/auth';

const SUPABASE_URL = 'https://uanqjksfodudwkakyglt.supabase.co';

/**
 * The frame every student screen lives in. One header, one hairline, no
 * gradient wash — the page behind it supplies the surface.
 */
export function AppShell({
  children,
  scrollable = false,
  hideHeader = false,
}: PropsWithChildren<{ scrollable?: boolean; hideHeader?: boolean }>) {
  const { isSignedIn, isLoaded, user } = useSupabaseAuth();
  const { goHome } = useWarpSession();

  return (
    <div
      className={
        'flex flex-col bg-background text-foreground ' +
        (scrollable ? 'min-h-screen overflow-x-hidden' : 'h-screen overflow-hidden')
      }
    >
      {!hideHeader && (
        <header className="no-print sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 md:px-8">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.location.search) {
                window.history.pushState({}, '', window.location.pathname);
              }
              goHome();
            }}
            className="flex items-center gap-3 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Return to WARP Home"
          >
            <WarpLogo className="h-8 w-auto" />
            <span className="hidden border-l border-border pl-3 text-[0.7rem] uppercase tracking-wider text-foreground-muted md:inline">
              Global STEAM evaluation
            </span>
          </button>

          <div className="flex items-center gap-3">
            <SaveStatus />

            {/* Auth-aware right slot */}
            {isLoaded && (
              isSignedIn
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
                    className="text-xs"
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
  const ref = useRef<HTMLDivElement>(null);

  // Resolve display name & avatar
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Student';

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Fetch avatar from students table (gracefully degrades to Google avatar or initials)
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
          setAvatarUrl(`${SUPABASE_URL}/storage/v1/object/public/avatars/${row.avatar_url}`);
        }
      });
  }, [user?.id]);

  const resolvedAvatar =
    avatarUrl ||
    user?.user_metadata?.avatar_url ||
    null;

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
    await signOutUser();
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        id="user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-none border border-border bg-surface px-2 py-1.5 text-foreground hover:border-primary hover:bg-surface/80 transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {/* Avatar */}
        <span className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-none border border-border bg-background">
          {resolvedAvatar ? (
            <img
              src={resolvedAvatar}
              alt="Avatar"
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-[9px] font-bold font-mono">{initials}</span>
          )}
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 size-1.5 bg-emerald-500 rounded-full border border-background" />
        </span>

        {/* Name (hidden on mobile) */}
        <span className="hidden sm:block text-[11px] font-mono font-semibold max-w-30 truncate">
          {displayName}
        </span>

        <ChevronDown
          className={`size-3 text-foreground-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="user-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 top-[calc(100%+6px)] z-60 w-52 border border-border bg-background shadow-xl"
            role="menu"
          >
            {/* Identity header */}
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-[11px] font-bold text-foreground truncate">{displayName}</p>
              {user?.email && (
                <p className="text-[10px] text-foreground-muted font-mono truncate mt-0.5">{user.email}</p>
              )}
            </div>

            {/* Actions */}
            <div className="py-1">
              <DropdownItem
                icon={<LayoutDashboard className="size-3.5" />}
                label="Dashboard"
                onClick={() => { setOpen(false); window.location.href = '/?dashboard'; }}
              />
              <DropdownItem
                icon={<User className="size-3.5" />}
                label="Profile"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent('warp:open-profile', { detail: { tab: 'profile' } }));
                  const trigger = document.getElementById('profile-panel-trigger') as HTMLButtonElement | null;
                  if (trigger) trigger.click();
                }}
              />
              <DropdownItem
                icon={<Settings className="size-3.5" />}
                label="Settings"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent('warp:open-profile', { detail: { tab: 'settings' } }));
                  const trigger = document.getElementById('profile-panel-trigger') as HTMLButtonElement | null;
                  if (trigger) trigger.click();
                }}
              />
            </div>

            <div className="border-t border-border py-1">
              <DropdownItem
                icon={<LogOut className="size-3.5" />}
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
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-[11px] font-mono font-medium transition-colors ${
        danger
          ? 'text-foreground-muted hover:text-destructive hover:bg-destructive/5'
          : 'text-foreground-secondary hover:text-foreground hover:bg-surface'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
