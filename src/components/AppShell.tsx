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

export function AppShell({
  children,
  scrollable = false,
  hideHeader = false,
}: PropsWithChildren<{ scrollable?: boolean; hideHeader?: boolean }>) {
  const { isSignedIn } = useSupabaseAuth();
  return (
    <div
      className={
        'flex flex-col bg-background text-foreground ' +
        (scrollable ? 'min-h-screen overflow-x-hidden' : 'h-screen overflow-hidden')
      }
    >
      {!hideHeader && (
      <header className="no-print sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 md:px-8">
        <div className="flex items-center gap-3">
          <WarpLogo className="h-8 w-auto" />
          <span className="hidden border-l border-border pl-3 text-[0.7rem] uppercase tracking-wider text-foreground-muted md:inline">
            Global STEAM evaluation
          </span>
        </div>

        <div className="flex items-center gap-4">
          <SaveStatus />
          {isSignedIn ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex size-8 items-center justify-center rounded-full bg-accent text-foreground-secondary hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <User className="size-4" />
            </button>
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
