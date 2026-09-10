import type { PropsWithChildren } from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { SaveStatus } from './SaveStatus';
import { WarpLogo } from './WarpLogo';
import { Button } from './ui/button';

/**
 * The frame every student screen lives in. One header, one hairline, no
 * gradient wash — the page behind it supplies the surface.
 */
export function AppShell({
  children,
  scrollable = false,
  hideHeader = false,
}: PropsWithChildren<{ scrollable?: boolean; hideHeader?: boolean }>) {
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
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </header>
      )}

      <div className="flex min-h-0 flex-1 flex-col print:min-h-fit">{children}</div>
    </div>
  );
}
