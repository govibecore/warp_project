import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ParentVariant } from './report/ParentVariant';
import { WarpLogo } from './WarpLogo';
import { Spinner } from './ui/spinner';

/**
 * SharedReport — Surface #8 from PRODUCT-REDESIGN.md
 * 
 * Read-only render of the parent variant inside landing page chrome.
 * Uses the get_shared_report RPC instead of direct SELECT.
 * Expired token shows a calm mono notice, not a 404.
 */
export function SharedReport({ token }: { token: string }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase.rpc('get_shared_report', {
          p_token: token,
        });

        if (error || !data || data.length === 0) {
          setExpired(true);
          setLoading(false);
          return;
        }

        setReport(data[0]);
      } catch {
        setExpired(true);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [token]);

  // ── Loading ──
  if (loading) {
    return (
      <SharedChrome>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="md" />
          <p className="text-sm text-foreground-secondary">Loading shared report…</p>
        </div>
      </SharedChrome>
    );
  }

  // ── Expired / not found — calm mono notice ──
  if (expired || !report) {
    return (
      <SharedChrome>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="font-mono text-sm text-foreground-muted">
            This shared report link has expired or is no longer available.
          </p>
          <a
            href="/"
            className="text-xs text-primary hover:underline font-medium"
          >
            ← Go to WARP SIGNAL
          </a>
        </div>
      </SharedChrome>
    );
  }

  // ── Render the parent variant ──
  return (
    <SharedChrome>
      <div className="mx-auto w-full max-w-180 py-8 px-4 sm:px-6">
        <div className="mb-6 border-b border-border pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted font-mono">
            WARP SIGNAL · Shared Report
          </span>
          {report.generated_at && (
            <p className="mt-1 text-xs text-foreground-muted font-mono">
              Generated {new Date(report.generated_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>

        {report.parent_variant ? (
          <ParentVariant
            parentVariant={report.parent_variant}
            benchmark={report.parent_variant?.benchmark || {}}
            classLevel={report.parent_variant?.classLevel || 8}
          />
        ) : (
          <p className="text-sm text-foreground-secondary">
            Report content is not available for this shared link.
          </p>
        )}
      </div>
    </SharedChrome>
  );
}

/** Landing-page chrome wrapper: nav + footer */
function SharedChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-border px-6 py-4">
        <a href="/">
          <WarpLogo variant="lockup" className="h-6 w-auto" />
        </a>
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted font-mono">
          Shared Report
        </span>
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-[11px] text-foreground-muted">
          © {new Date().getFullYear()} WARP SIGNAL · STEM Benchmark Platform
        </p>
      </footer>
    </div>
  );
}
