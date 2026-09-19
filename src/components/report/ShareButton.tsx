import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Check, Copy, Link as LinkIcon, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { supabase } from '../../lib/supabase';

export interface ShareButtonProps {
  reportId?: string;
  assessmentId: string;
  studentId?: string;
  initialShareToken?: string;
  studentName?: string;
  className?: string;
  /** Called when a token is generated or verified */
  onTokenGenerated?: (token: string) => void;
  /** Optional callback when action concludes */
  onClose?: () => void;
}

export function ShareButton({
  reportId,
  assessmentId,
  studentId,
  initialShareToken,
  studentName = 'Candidate',
  className = '',
  onTokenGenerated,
  onClose,
}: ShareButtonProps) {
  const [shareToken, setShareToken] = useState<string | undefined>(initialShareToken);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Synchronize state if initialShareToken is loaded asynchronously
  useEffect(() => {
    if (initialShareToken) {
      setShareToken(initialShareToken);
    }
  }, [initialShareToken]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, onClose]);

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/?share=${token}`;
  };

  const handleShareClick = async () => {
    let token = shareToken;

    if (!token) {
      setIsLoading(true);
      try {
        // Generate a cryptographically secure token
        const randomBytes = new Uint8Array(8);
        crypto.getRandomValues(randomBytes);
        const randomPart = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
        const timePart = Date.now().toString(36).slice(-6);
        const newToken = `warp_${randomPart}${timePart}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 day validity

        let updated = false;

        if (reportId) {
          const { data, error } = await supabase
            .from('reports')
            .update({
              share_token: newToken,
              share_expires_at: expiresAt.toISOString(),
            })
            .eq('id', reportId)
            .select('id');
          if (!error && data && data.length > 0) updated = true;
        }

        if (!updated && assessmentId) {
          const { data, error } = await supabase
            .from('reports')
            .update({
              share_token: newToken,
              share_expires_at: expiresAt.toISOString(),
            })
            .eq('assessment_id', assessmentId)
            .select('id');
          if (!error && data && data.length > 0) updated = true;
        }

        if (!updated && studentId && assessmentId) {
          const { data, error } = await supabase
            .from('reports')
            .upsert({
              assessment_id: assessmentId,
              student_id: studentId,
              share_token: newToken,
              share_expires_at: expiresAt.toISOString(),
            }, { onConflict: 'assessment_id' })
            .select('id');
          if (!error && data && data.length > 0) updated = true;
        }

        if (updated) {
          setShareToken(newToken);
          token = newToken;
          onTokenGenerated?.(newToken);
        } else {
          console.error('[ShareButton] Failed to persist share token in database');
        }
      } catch (err) {
        console.error('[ShareButton] Failed to generate share token:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      const shareUrl = getShareUrl(token);

      // Try native share on mobile devices
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: `WARP STEM Benchmark - ${studentName}`,
            text: `Official diagnostic benchmark report for ${studentName}.`,
            url: shareUrl,
          });
          return;
        } catch {
          // User cancelled or share failed, fallback to modal dialog
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
      console.error('[ShareButton] Clipboard copy failed:', err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    onClose?.();
  };

  const shareModalContent = showModal && shareToken ? (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/95 p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        className="w-full max-w-md rounded-none border border-border-hairline bg-surface-card p-6 shadow-none space-y-4 text-foreground"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary font-display font-bold">
            <Sparkles className="size-4 text-primary" />
            <h3 id="share-dialog-title" className="text-sm font-semibold text-foreground tracking-tight">
              Share Official Diagnostic Report
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="text-foreground-secondary hover:text-foreground p-1 rounded-none text-xs transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-foreground-secondary leading-relaxed">
          Anyone with this private link can view <strong className="text-foreground">{studentName}</strong>&apos;s global standing, cognitive archetype, and educational blueprint without needing to log in.
        </p>

        <div className="flex items-center gap-2 rounded-none border border-border bg-surface p-2.5">
          <LinkIcon className="size-4 text-foreground-muted shrink-0" />
          <input
            type="text"
            readOnly
            value={getShareUrl(shareToken)}
            className="w-full bg-transparent text-xs text-foreground font-mono truncate focus:outline-none select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            size="sm"
            variant={copied ? 'primary' : 'secondary'}
            onClick={copyToClipboard}
            className="shrink-0 gap-1 text-xs font-semibold whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-foreground-muted font-mono">Valid for 30 days</span>
          <Button variant="ghost" size="sm" onClick={closeModal}>
            Done
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleShareClick}
        disabled={isLoading}
        className={`gap-1.5 text-xs font-semibold whitespace-nowrap ${className}`}
        aria-label="Share benchmark report"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="text-primary" />
            <span>Generating Link…</span>
          </>
        ) : (
          <>
            <Share2 className="size-3.5 text-primary" />
            <span>Share Report</span>
          </>
        )}
      </Button>

      {/* Render modal directly into document.body */}
      {typeof document !== 'undefined' && shareModalContent && createPortal(shareModalContent, document.body)}
    </>
  );
}
