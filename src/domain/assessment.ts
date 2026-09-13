import { getCalibrationItems, getDevelopmentalBand, getMissionItems, MISSION_IDS } from '../data/scenarios';
import { getEnglishCalibrationItems, getEnglishMissionItems, ENGLISH_MISSION_IDS } from '../data/englishScenarios';
import type { AssessmentItem, AssessmentPlan, Difficulty, Subject } from './types';

export function normalizeDifficulty(diff?: string | null): Difficulty {
  if (!diff) return 'Standard';
  const lower = diff.toLowerCase();
  if (lower === 'advanced') return 'Advanced';
  if (lower === 'olympiad') return 'Olympiad';
  return 'Standard';
}

/** Seconds per question per difficulty tier. 30 items → Standard=45 min, Advanced=60 min, Olympiad=75 min. */
const SECONDS_PER_QUESTION: Record<string, number> = {
  Standard: 90,   // 1.5 min/question
  Advanced: 120,  // 2.0 min/question
  Olympiad: 150,  // 2.5 min/question
  standard: 90,
  advanced: 120,
  olympiad: 150,
};

/**
 * Builds a fixed-length plan: every calibration item followed by every mission
 * item. The plan does not branch on earlier answers — same instrument for every
 * learner at a given class and tier, which is what makes the norm comparison
 * meaningful. Adaptive routing is a separate instrument, not a flag here.
 */
export function createAssessment(
  classLevel: number,
  difficulty: Difficulty = 'Standard',
  subject: Subject = 'STEM'
): AssessmentPlan {
  const calibrationItems = subject === 'STEM' 
    ? getCalibrationItems(classLevel, difficulty)
    : getEnglishCalibrationItems(classLevel, difficulty);

  const missionIds = subject === 'STEM' ? [...MISSION_IDS] : [...ENGLISH_MISSION_IDS];
  const missionItems = subject === 'STEM'
    ? MISSION_IDS.flatMap((missionId) => getMissionItems(missionId, classLevel, difficulty))
    : ENGLISH_MISSION_IDS.flatMap((missionId: string) => getEnglishMissionItems(missionId, classLevel, difficulty));

  const totalItems = calibrationItems.length + missionItems.length;
  const timeLimitMs = totalItems * SECONDS_PER_QUESTION[difficulty] * 1000;
  return Object.freeze({ subject, classLevel, developmentalBand: getDevelopmentalBand(classLevel), calibrationItems, missionIds, missionItems, timeLimitMs });
}

export function getNextItem(plan: AssessmentPlan, answeredItemIds: readonly string[]): AssessmentItem | null {
  const answered = new Set(answeredItemIds);
  return [...plan.calibrationItems, ...plan.missionItems].find((item) => !answered.has(item.id)) ?? null;
}
