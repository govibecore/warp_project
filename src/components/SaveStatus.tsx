import { useAxiomSession } from '../context/AxiomSessionContext';

export function SaveStatus() {
  const { persistenceStatus } = useAxiomSession();

  const status = persistenceStatus.state;

  const text =
    status === 'saved'
      ? 'Saved on this device'
      : status === 'saving'
        ? 'Saving…'
        : status === 'offline_sync_pending'
          ? 'Offline (saved locally)'
          : 'Save unavailable';

  const dotClass =
    status === 'saved'
      ? 'bg-primary'
      : status === 'saving'
        ? 'bg-warning animate-pulse'
        : status === 'offline_sync_pending'
          ? 'bg-warning'
          : 'bg-destructive';

  return (
    <p
      className={`flex items-center gap-2 text-xs font-medium ${status === 'unavailable' ? 'text-destructive' : 'text-foreground-muted'}`}
      role="status"
    >
      <span aria-hidden="true" className={`size-2 ${dotClass}`} />
      <span className="hidden sm:inline">{text}</span>
    </p>
  );
}
