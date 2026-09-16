import type { AssessmentItem, Difficulty } from '../../domain/types';
import { getDevelopmentalBand, materialize } from './builder';
import { calibrationBlueprints } from './calibration';
import { dataBlueprints } from './data';
import { ecologyBlueprints } from './ecology';
import { energyBlueprints } from './energy';
import { infraBlueprints } from './infra';
import { spaceBlueprints } from './space';
import type { ItemBlueprint } from './builder';

export { getDevelopmentalBand } from './builder';
export * from './english';

export const MISSION_IDS = ['stem-energy', 'stem-ecology', 'stem-space', 'stem-data', 'stem-infra'] as const;
export type MissionId = (typeof MISSION_IDS)[number];

const missionBlueprints: Record<MissionId, readonly ItemBlueprint[]> = {
  'stem-energy': energyBlueprints,
  'stem-ecology': ecologyBlueprints,
  'stem-space': spaceBlueprints,
  'stem-data': dataBlueprints,
  'stem-infra': infraBlueprints,
};

/**
 * The WARP item bank.
 *
 * Every blueprint carries a full variant per developmental band: prompt,
 * context, hint, and four options are all rewritten for the band's reading
 * level and curriculum stage - a Class 3 learner and a Class 12 learner never
 * see the same text. Distractors are tagged with the canonical misconception
 * they diagnose, and each option contributes evidence to a primary and a
 * secondary competency (10 points available each).
 */
export function getCalibrationItems(classLevel: number, difficulty: Difficulty = 'Standard'): readonly AssessmentItem[] {
  return materialize(calibrationBlueprints, getDevelopmentalBand(classLevel), difficulty);
}

export function getMissionItems(missionId: MissionId, classLevel: number, difficulty: Difficulty = 'Standard'): readonly AssessmentItem[] {
  return materialize(missionBlueprints[missionId], getDevelopmentalBand(classLevel), difficulty);
}
