import { useWarpSession } from '../context/WarpSessionContext';
import { Cloud, Check, RefreshCw, AlertCircle } from 'lucide-react';

export function SaveStatus() {
  const { persistenceStatus } = useWarpSession();
  const status = persistenceStatus.state;

  const config = {
    saved: {
      text: 'SYNCED · CLOUD & LOCAL',
      shortText: 'SYNCED',
      dotClass: 'bg-emerald-500',
      icon: Check,
      textClass: 'text-foreground-secondary',
      borderClass: 'border-border bg-surface/40',
    },
    saving: {
      text: 'SYNCING CHANGES…',
      shortText: 'SYNCING…',
      dotClass: 'bg-amber-500 animate-pulse',
      icon: RefreshCw,
      textClass: 'text-amber-500',
      borderClass: 'border-amber-500/30 bg-amber-500/5',
    },
    offline_sync_pending: {
      text: 'CACHED LOCALLY (OFFLINE)',
      shortText: 'CACHED',
      dotClass: 'bg-amber-500',
      icon: Cloud,
      textClass: 'text-amber-500',
      borderClass: 'border-amber-500/30 bg-amber-500/5',
    },
    unavailable: {
      text: 'SYNC UNAVAILABLE',
      shortText: 'OFFLINE',
      dotClass: 'bg-destructive',
      icon: AlertCircle,
      textClass: 'text-destructive',
      borderClass: 'border-destructive/30 bg-destructive/5',
    },
  }[status] || {
    text: 'STANDBY',
    shortText: 'STANDBY',
    dotClass: 'bg-foreground-muted',
    icon: Cloud,
    textClass: 'text-foreground-muted',
    borderClass: 'border-border bg-surface/40',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 border rounded-none text-[10px] font-mono tracking-wider transition-colors ${config.borderClass}`}
      role="status"
      title={config.text}
    >
      <span className="relative flex items-center justify-center">
        <span aria-hidden="true" className={`size-1.5 rounded-none ${config.dotClass}`} />
      </span>
      <span className={`hidden md:inline font-semibold ${config.textClass}`}>
        {config.text}
      </span>
      <span className={`inline md:hidden font-semibold ${config.textClass}`}>
        {config.shortText}
      </span>
    </div>
  );
}
