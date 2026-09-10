import { getCalibrationItems, getDevelopmentalBand, getMissionItems, MISSION_IDS } from '../data/scenarios';
import type { AssessmentItem, AssessmentPlan, Difficulty } from './types';

/** Seconds per question per difficulty tier. 30 items → Standard=45 min, Advanced=60 min, Olympiad=75 min. */
const SECONDS_PER_QUESTION: Record<Difficulty, number> = {
  Standard: 90,   // 1.5 min/question
  Advanced: 120,  // 2.0 min/question
  Olympiad: 150,  // 2.5 min/question
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
): AssessmentPlan {
  const calibrationItems = getCalibrationItems(classLevel, difficulty);
  // Include all missions — guarantees 30-question coverage (5 calibration + 25 mission items).
  const missionIds = [...MISSION_IDS];
  const missionItems = missionIds.flatMap((missionId) => getMissionItems(missionId, classLevel, difficulty));
  const totalItems = calibrationItems.length + missionItems.length;
  const timeLimitMs = totalItems * SECONDS_PER_QUESTION[difficulty] * 1000;
  return Object.freeze({ classLevel, developmentalBand: getDevelopmentalBand(classLevel), calibrationItems, missionIds, missionItems, timeLimitMs });
}

export function getNextItem(plan: AssessmentPlan, answeredItemIds: readonly string[]): AssessmentItem | null {
  const answered = new Set(answeredItemIds);
  return [...plan.calibrationItems, ...plan.missionItems].find((item) => !answered.has(item.id)) ?? null;
}
