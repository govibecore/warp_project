import type {
  AssessmentItem,
  AssessmentOption,
  Competency,
  DevelopmentalBand,
  Difficulty,
  EvidenceContribution,
  ScenarioState,
} from '../../domain/types';

export const BANDS: readonly DevelopmentalBand[] = ['3-4', '5-6', '7-8', '9-10', '11-12'];

export function getDevelopmentalBand(classLevel: number): DevelopmentalBand {
  if (classLevel >= 3 && classLevel <= 4) return '3-4';
  if (classLevel >= 5 && classLevel <= 6) return '5-6';
  if (classLevel >= 7 && classLevel <= 8) return '7-8';
  if (classLevel >= 9 && classLevel <= 10) return '9-10';
  if (classLevel >= 11 && classLevel <= 12) return '11-12';
  throw new Error(`Class ${classLevel} is outside WARP's Class 3-12 assessment range.`);
}

/** NCF 2023 stage each developmental band belongs to (India's 5+3+3+4 structure). */
const NCF_STAGE: Record<DevelopmentalBand, string> = {
  '3-4': 'NCF 2023 Preparatory',
  '5-6': 'NCF 2023 Preparatory-Middle',
  '7-8': 'NCF 2023 Middle',
  '9-10': 'NCF 2023 Secondary',
  '11-12': 'NCF 2023 Higher Secondary',
};

export interface OptionSpec {
  readonly id: string;
  readonly label: string;
  readonly primary: Competency;
  readonly secondary: Competency;
  /** Points earned on the primary competency, out of 10. 10 = best answer. */
  readonly earned: number;
  /** Canonical misconception this distractor diagnoses. Only on designed wrong answers. */
  readonly misconception?: string;
}

export interface ItemVariant {
  readonly prompt: string;
  readonly context: string;
  readonly hint: string;
  readonly options: readonly [OptionSpec, OptionSpec, OptionSpec, OptionSpec];
}

export interface ItemBlueprint {
  readonly id: string;
  readonly missionId: string;
  readonly missionTitle: string;
  readonly standards: readonly string[];
  readonly state: ScenarioState;
  readonly bands: Record<DevelopmentalBand, ItemVariant>;
}

/** Compact option constructor. Secondary evidence earns max(1, earned - 2), mirroring the v1 weighting. */
export function o(
  id: string,
  label: string,
  primary: Competency,
  secondary: Competency,
  earned: number,
  misconception?: string,
): OptionSpec {
  return { id, label, primary, secondary, earned, misconception };
}

export function variant(
  prompt: string,
  context: string,
  hint: string,
  options: readonly [OptionSpec, OptionSpec, OptionSpec, OptionSpec],
): ItemVariant {
  return { prompt, context, hint, options };
}

export function blueprint(
  id: string,
  missionId: string,
  missionTitle: string,
  standards: readonly string[],
  state: ScenarioState,
  bands: Record<DevelopmentalBand, ItemVariant>,
): ItemBlueprint {
  return { id, missionId, missionTitle, standards, state, bands };
}

/**
 * Compresses distractor earned-weights upward based on difficulty, making wrong
 * answers less penalising (and therefore harder to distinguish from the optimal choice).
 *
 * Standard:  weights unchanged      - e.g. [0, 2, 4, 10]
 * Advanced:  floor raised to 3      - e.g. [3, 4, 5, 10]
 * Olympiad:  floor raised to 6      - e.g. [6, 7, 8, 10]
 */
export function scaleDifficulty(earned: number, available: number, difficulty: Difficulty): number {
  if (difficulty === 'Standard') return earned;
  if (earned >= available) return available; // correct answer is always maximum
  const floor = difficulty === 'Advanced' ? 3 : 6;
  return Math.round(floor + (earned / available) * (available - floor - 1));
}

function toEvidence(spec: OptionSpec, difficulty: Difficulty): readonly EvidenceContribution[] {
  return [
    { competency: spec.primary, earnedWeight: scaleDifficulty(spec.earned, 10, difficulty), availableWeight: 10 },
    { competency: spec.secondary, earnedWeight: scaleDifficulty(Math.max(1, spec.earned - 2), 10, difficulty), availableWeight: 10 },
  ];
}

function toOption(spec: OptionSpec, difficulty: Difficulty): AssessmentOption {
  return { id: spec.id, label: spec.label, evidence: toEvidence(spec, difficulty), misconception: spec.misconception };
}

/**
 * Option order is shuffled deterministically from the item id and band, so the
 * full-credit answer is not always first (position bias) while the plan stays
 * reproducible for a given learner, class, and tier.
 */
function seededShuffle<T>(items: readonly T[], seed: string): readonly T[] {
  return items
    .map((value, index) => ({ value, key: fnv1a(`${seed}:${index}`) }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.value);
}

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function bandInstruction(band: DevelopmentalBand): string {
  const instructions: Record<DevelopmentalBand, string> = {
    '3-4': 'Use what you can see and choose the safest next step.',
    '5-6': 'Use the evidence to compare what could happen next.',
    '7-8': 'Trace how a local decision affects linked parts of the system.',
    '9-10': 'Evaluate the trade-offs, constraints, and feedback effects before deciding.',
    '11-12': 'Model the uncertainty, dependencies, and second-order effects before deciding.',
  };
  return instructions[band];
}

export function materialize(
  blueprints: readonly ItemBlueprint[],
  developmentalBand: DevelopmentalBand,
  difficulty: Difficulty = 'Standard',
): readonly AssessmentItem[] {
  return blueprints.map((source) => {
    const v = source.bands[developmentalBand];
    return {
      id: source.id,
      missionId: source.missionId,
      missionTitle: source.missionTitle,
      developmentalBand,
      prompt: `${bandInstruction(developmentalBand)} ${v.prompt}`,
      context: v.context,
      hint: v.hint,
      standards: [...source.standards, NCF_STAGE[developmentalBand]],
      options: seededShuffle(v.options, `${source.id}:${developmentalBand}`).map((spec) => toOption(spec, difficulty)),
      scenarioState: source.state,
      mutableStateKeys: Object.keys(source.state),
      mutation: undefined,
    };
  });
}
