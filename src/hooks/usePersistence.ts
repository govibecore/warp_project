import { useCallback, useState } from 'react';
import type { AxiomSession } from '../domain/types';
import { resetSession, saveSession, type PersistenceStatus, type StorageLike } from '../persistence/storage';

export function usePersistence(storage: StorageLike) {
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>({ state: 'saved' });

  const persist = useCallback(async (session: AxiomSession) => {
    const status = await saveSession(session, storage);
    setPersistenceStatus((prev) => (prev.state === status.state ? prev : status));
    return status;
  }, [storage]);

  const erase = useCallback(() => {
    resetSession(storage);
    setPersistenceStatus((prev) => (prev.state === 'saved' ? prev : { state: 'saved' }));
  }, [storage]);

  return { persistenceStatus, persist, erase };
}
