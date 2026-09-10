import { createSession, sessionReducer } from '../domain/session';
import type { AxiomSession, ItemResponse, LearnerProfile } from '../domain/types';


export const SESSION_KEY = 'axiom.session.v2';
export const PROFILE_KEY = 'axiom.profile.v1';
export const SESSION_ID_KEY = 'axiom.session_id.v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type PersistenceStatus = 
  | { state: 'saved' } 
  | { state: 'saving' }
  | { state: 'offline_sync_pending' }
  | { state: 'unavailable'; message: string };
export interface LoadResult {
  session: AxiomSession;
  recovered: boolean;
}


export async function saveSession(session: AxiomSession, storage: StorageLike): Promise<PersistenceStatus> {
  let localSaved = false;
  try {
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session.profile) storage.setItem(PROFILE_KEY, JSON.stringify(session.profile));
    localSaved = true;
  } catch {
    // Local storage blocked, but we'll still try the API
  }
  
  return localSaved ? { state: 'saved' } : { state: 'unavailable', message: 'Storage blocked.' };
}

export function loadSession(storage: StorageLike): LoadResult {
  const profile = readProfile(storage);
  const raw = safelyRead(storage, SESSION_KEY);
  if (!raw) return { session: createSession(profile), recovered: false };

  try {
    const parsed: unknown = JSON.parse(raw);
    const session = migrateAndHydrate(parsed, profile);
    if (!session) throw new Error('Invalid AXIOM session data.');
    return { session, recovered: false };
  } catch {
    safelyRemove(storage, SESSION_KEY);
    return { session: createSession(profile), recovered: true };
  }
}

export function resetSession(storage: StorageLike): void {
  safelyRemove(storage, SESSION_KEY);
  safelyRemove(storage, PROFILE_KEY);
  safelyRemove(storage, SESSION_ID_KEY);
}

function migrateAndHydrate(value: unknown, fallbackProfile?: LearnerProfile): AxiomSession | null {
  if (!isRecord(value)) return null;
  const profile = isProfile(value.profile) ? value.profile : fallbackProfile;
  if (!profile) return createSession();
  const responses = isRecord(value.responses) ? Object.values(value.responses).filter(isItemResponse) : [];
  let session = createSession(profile);
  
  if (typeof value.assessmentStartedAt === 'string' && !isNaN(Date.parse(value.assessmentStartedAt))) {
    session.assessmentStartedAt = value.assessmentStartedAt;
  }
  
  for (const response of responses) session = sessionReducer(session, { type: 'answerItem', response });
  
  if (value.phase === 'results' && isRecord(value.result)) {
    session.phase = 'results';
    session.result = value.result as any;
  }
  
  return session;
}

function readProfile(storage: StorageLike): LearnerProfile | undefined {
  try {
    const value: unknown = JSON.parse(storage.getItem(PROFILE_KEY) ?? 'null');
    return isProfile(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function safelyRead(storage: StorageLike, key: string): string | null {
  try { return storage.getItem(key); } catch { return null; }
}

function safelyRemove(storage: StorageLike, key: string): void {
  try { storage.removeItem(key); } catch { /* recovery must not throw */ }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProfile(value: unknown): value is LearnerProfile {
  if (!isRecord(value)) return false;
  if (typeof value.name !== 'string') return false;
  if (typeof value.classLevel !== 'number' || !Number.isInteger(value.classLevel) || value.classLevel < 3 || value.classLevel > 12) return false;
  // Back-fill difficulty for sessions saved before the field was introduced.
  if (!('difficulty' in value) || !['Standard', 'Advanced', 'Olympiad'].includes(value.difficulty as string)) {
    (value as Record<string, unknown>).difficulty = 'Standard';
  }
  return true;
}

function isItemResponse(value: unknown): value is ItemResponse {
  return isRecord(value)
    && typeof value.itemId === 'string'
    && typeof value.missionId === 'string'
    && typeof value.prompt === 'string'
    && typeof value.optionId === 'string'
    && typeof value.optionLabel === 'string'
    && Array.isArray(value.evidence);
}
