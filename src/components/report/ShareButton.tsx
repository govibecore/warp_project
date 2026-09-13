import { useState } from 'react';
import { Share2, Check, Copy, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { supabase } from '../../lib/supabase';

interface ShareButtonProps {
  reportId?: string;
  assessmentId: string;
  initialShareToken?: string;
  studentName?: string;
  className?: string;
}

export function ShareButton({
  reportId,
  assessmentId,
  initialShareToken,
  studentName = 'Candidate',
  className = '',
}: ShareButtonProps) {
  const [shareToken, setShareToken] = useState<string | undefined>(initialShareToken);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/?share=${token}`;
  };

  const handleShareClick = async () => {
    let token = shareToken;

    if (!token) {
      setIsLoading(true);
      try {
        // Generate a clean 16-character alphanumeric token
        const randomPart = Math.random().toString(36).substring(2, 10);
        const timePart = Date.now().toString(36).slice(-6);
        const newToken = `warp_${randomPart}${timePart}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 day validity

        if (reportId) {
          await supabase
            .from('reports')
            .update({
              share_token: newToken,
              share_expires_at: expiresAt.toISOString(),
            })
            .eq('id', reportId);
        } else {
          // Update by assessment_id if reportId wasn't passed directly
          await supabase
            .from('reports')
            .update({
              share_token: newToken,
              share_expires_at: expiresAt.toISOString(),
            })
            .eq('assessment_id', assessmentId);
        }

        setShareToken(newToken);
        token = newToken;
      } catch (err) {
        console.error('Failed to generate share token:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      const shareUrl = getShareUrl(token);

      // Try native share on mobile/supported devices first
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: `WARP STEM Benchmark — ${studentName}`,
            text: `View the official STEM psychometric diagnostic report for ${studentName}.`,
            url: shareUrl,
          });
          return;
        } catch {
          // User cancelled or share failed, fallback to modal/clipboard
        }
      }

      setShowModal(true);
    }
  };

  const copyToClipboard = async () => {
    if (!shareToken) return;
    const shareUrl = getShareUrl(shareToken);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleShareClick}
        disabled={isLoading}
        className={`gap-2 ${className}`}
        aria-label="Share benchmark report"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="text-primary" />
            <span>Generating Link…</span>
          </>
        ) : (
          <>
            <Share2 className="size-4 text-primary" />
            <span>Share Report</span>
          </>
        )}
      </Button>

      {/* Share Dialog Modal */}
      {showModal && shareToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-none border border-border bg-background p-6 shadow-2xl space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-primary font-display font-bold">
                <Sparkles className="size-4" />
                <h3 id="share-dialog-title" className="text-base font-semibold text-foreground">
                  Share Official Diagnostic
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-foreground-secondary hover:text-foreground p-1 rounded-none text-sm"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-foreground-secondary leading-relaxed">
              Anyone with this link can view the candidate’s global standing, cognitive archetype, and action blueprint without signing in.
            </p>

            <div className="flex items-center gap-2 rounded-none border border-border bg-surface p-2.5">
              <LinkIcon className="size-4 text-foreground-muted shrink-0" />
              <input
                type="text"
                readOnly
                value={getShareUrl(shareToken)}
                className="w-full bg-transparent text-xs text-foreground font-mono truncate focus:outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                size="sm"
                variant={copied ? 'primary' : 'secondary'}
                onClick={copyToClipboard}
                className="shrink-0 gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-2 border-t border-border">
              <span>Valid for 30 days</span>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
