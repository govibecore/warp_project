import type { PropsWithChildren } from 'react';
import { SaveStatus } from './SaveStatus';
import { WarpLogo } from './WarpLogo';
import { Button } from './ui/button';

/**
 * The frame every student screen lives in. One header, one hairline, no
 * gradient wash — the page behind it supplies the surface.
 */
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

import { useWarpSession } from '../context/WarpSessionContext';

export function AppShell({
  children,
  scrollable = false,
  hideHeader = false,
}: PropsWithChildren<{ scrollable?: boolean; hideHeader?: boolean }>) {
  const { isSignedIn } = useSupabaseAuth();
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

        <div className="flex items-center gap-4">
          <SaveStatus />
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.search = '?dashboard'; }}
                className="text-xs"
              >
                Dashboard
              </Button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex size-8 items-center justify-center rounded-none bg-accent text-foreground-secondary hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <User className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.location.search = '?choose'}>
                Sign in
              </Button>
            </div>
          )}
        </div>
      </header>
      )}

      <div className="flex min-h-0 flex-1 flex-col print:min-h-fit">{children}</div>
    </div>
  );
}
