import { useCallback, useState } from 'react';
import type { AxiomSession } from '../domain/types';
import { resetSession, saveSession, type PersistenceStatus, type StorageLike } from '../persistence/storage';

export function usePersistence(storage: StorageLike) {
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>({ state: 'saved' });

  const persist = useCallback(async (session: AxiomSession) => {
    setPersistenceStatus({ state: 'saving' });
    const status = await saveSession(session, storage);
    setPersistenceStatus(status);
    return status;
  }, [storage]);

  const erase = useCallback(() => {
    resetSession(storage);
    setPersistenceStatus({ state: 'saved' });
  }, [storage]);

  return { persistenceStatus, persist, erase };
}
