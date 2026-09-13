import { createAssessment } from './assessment';
import type { ItemResponse, LearnerProfile, ResultSnapshot, Subject, WarpSession } from './types';

export const CURRENT_SESSION_VERSION = 1 as const;

export type SessionAction =
  | { type: 'setProfile'; profile: LearnerProfile }
  | { type: 'selectSubject'; subject: Subject }
  | { type: 'answerItem'; response: ItemResponse }
  | { type: 'undoLastResponse' }
  | { type: 'complete'; result: ResultSnapshot }
  | { type: 'enterApp' }
  | { type: 'goHome' }
  | { type: 'openHub' }
  | { type: 'reset' };

export function createSession(profile?: LearnerProfile): WarpSession {
  if (!profile) {
    return { version: CURRENT_SESSION_VERSION, phase: 'landing', responses: {} };
  }
  return {
    version: CURRENT_SESSION_VERSION,
    phase: 'hub',
    profile,
    responses: {},
  };
}

export function sessionReducer(session: WarpSession, action: SessionAction): WarpSession {
  if (action.type === 'reset') return createSession();
  if (action.type === 'enterApp') return { ...session, phase: 'onboarding' };
  if (action.type === 'goHome') return { ...session, phase: 'landing' };
  if (action.type === 'openHub') return { ...session, phase: 'hub' };
  if (action.type === 'setProfile') return createSession(action.profile);
  if (action.type === 'complete') return { ...session, phase: 'results', result: action.result };
  if (action.type === 'selectSubject') {
    if (!session.profile) throw new Error('A learner profile is required to start an assessment.');
    return {
      ...session,
      phase: 'assessment',
      plan: createAssessment(session.profile.classLevel, session.profile.difficulty, action.subject),
      assessmentStartedAt: new Date().toISOString(),
    };
  }
  if (!session.profile) throw new Error('A learner profile is required before recording an assessment response.');

  let responses = { ...session.responses };
  
  if (action.type === 'undoLastResponse') {
    const keys = Object.keys(responses);
    if (keys.length === 0) return session;
    const lastKey = keys[keys.length - 1];
    delete responses[lastKey];
  } else if (action.type === 'answerItem') {
    responses = { ...responses, [action.response.itemId]: action.response };
  }

  // The plan is fixed-length, so answering does not rebuild it. Only the
  // response map changes.
  return { ...session, responses };
}
