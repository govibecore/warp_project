import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { calculateResult } from '../domain/scoring';
import { createSession, sessionReducer } from '../domain/session';
import type { AxiomSession, ItemResponse, LearnerProfile, Subject } from '../domain/types';
import { usePersistence } from '../hooks/usePersistence';
import { useAssessment } from '../hooks/useAssessment';
import { loadSession, type PersistenceStatus, type StorageLike } from '../persistence/storage';

interface AxiomSessionContextValue {
  session: AxiomSession;
  persistenceStatus: PersistenceStatus;
  setProfile(profile: LearnerProfile): void;
  selectSubject(subject: Subject): void;
  answer(response: ItemResponse): void;
  undo(): void;
  complete(): void;
  enterApp(): void;
  openHub(): void;
  goHome(): void;
  startNew(): void;
  eraseLocalData(): void;
}

const AxiomSessionContext = createContext<AxiomSessionContextValue | null>(null);

export function AxiomSessionProvider({ children, storage = window.localStorage }: PropsWithChildren<{ storage?: StorageLike }>) {
  const [session, dispatch] = useReducer(sessionReducer, undefined, () => loadSession(storage).session);
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const { persistenceStatus, persist, erase } = usePersistence(storage);

  useEffect(() => { persist(session); }, [persist, session]);

  const setProfile = useCallback((profile: LearnerProfile) => dispatch({ type: 'setProfile', profile }), []);
  const selectSubject = useCallback((subject: Subject) => {
    useAssessment.getState().resetAssessment();
    dispatch({ type: 'selectSubject', subject });
  }, []);
  const answer = useCallback((response: ItemResponse) => dispatch({ type: 'answerItem', response }), []);
  const undo = useCallback(() => dispatch({ type: 'undoLastResponse' }), []);
  const complete = useCallback(() => {
    const currentSession = sessionRef.current;
    if (!currentSession.profile) throw new Error('A learner profile is required before completion.');
    const result = calculateResult(Object.values(currentSession.responses), currentSession.profile.classLevel, new Date().toISOString());
    dispatch({ type: 'complete', result });
  }, []);
  const enterApp = useCallback(() => dispatch({ type: 'enterApp' }), []);
  const openHub = useCallback(() => {
    useAssessment.getState().resetAssessment();
    dispatch({ type: 'openHub' });
  }, []);
  const goHome = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
    dispatch({ type: 'goHome' });
  }, []);
  const startNew = useCallback(() => dispatch({ type: 'reset' }), []);
  const eraseLocalData = useCallback(() => {
    erase();
    dispatch({ type: 'reset' });
  }, [erase]);

  const value = useMemo<AxiomSessionContextValue>(() => ({
    session,
    persistenceStatus,
    setProfile,
    selectSubject,
    answer,
    undo,
    complete,
    enterApp,
    openHub,
    goHome,
    startNew,
    eraseLocalData,
  }), [session, persistenceStatus, setProfile, selectSubject, answer, undo, complete, enterApp, openHub, goHome, startNew, eraseLocalData]);

  return <AxiomSessionContext.Provider value={value}>{children}</AxiomSessionContext.Provider>;
}

export function useAxiomSession(): AxiomSessionContextValue {
  const value = useContext(AxiomSessionContext);
  if (!value) throw new Error('useAxiomSession must be used inside AxiomSessionProvider.');
  return value;
}

export { createSession };
