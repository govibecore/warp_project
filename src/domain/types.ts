export type Subject = 'STEM' | 'English';

export const COMPETENCIES = [
  'scientificInquiry',
  'computationalThinking',
  'engineeringDesign',
  'mathematicalReasoning',
  'systemsThinking',
  'locatingInformation',
  'understanding',
  'synthesis',
  'evaluatingReflecting',
  'criticalThinking',
] as const;

export type Competency = (typeof COMPETENCIES)[number];

export type Difficulty = 'Standard' | 'Advanced' | 'Olympiad';

export interface Norm {
  mean: number;
  standardDeviation: number;
}

export interface EvidenceContribution {
  competency: Competency;
  earnedWeight: number;
  availableWeight: number;
}

export interface ItemResponse {
  itemId: string;
  missionId: string;
  prompt: string;
  optionId: string;
  optionLabel: string;
  evidence: EvidenceContribution[];
  /**
   * Canonical misconception diagnosed by the chosen distractor, when the answer
   * is a designed wrong answer. Reports use this to name the misunderstanding;
   * absent for full-credit answers.
   */
  misconception?: string;
}

export interface CompetencyProjection {
  rawPercent: number;
  zScore: number;
  score: number;
  sem: number;
  norm: Norm;
}

export type Region = 'India' | 'China' | 'USA' | 'Singapore' | 'Europe' | 'Global';

export interface ResultSnapshot {
  assessmentVersion: 1;
  completedAt: string;
  classLevel: number;
  normVersion: 'provisional-2026.08';
  responses: readonly ItemResponse[];
  competencies: Readonly<Record<Competency, CompetencyProjection>>;
  overallScore: number;
  regionalPercentiles: Readonly<Record<Region, number>>;
}

export type DevelopmentalBand = '3-4' | '5-6' | '7-8' | '9-10' | '11-12';

export type ScenarioValue = string | number | boolean;
export type ScenarioState = Readonly<Record<string, ScenarioValue>>;
export type ScenarioMutation = Readonly<Record<string, ScenarioValue>>;

export interface AssessmentOption {
  id: string;
  label: string;
  evidence: readonly EvidenceContribution[];
  /**
   * Canonical misconception this distractor is designed to surface
   * (e.g. "plants absorb food from soil"). Only present on designed wrong
   * answers; full-credit options carry no tag.
   */
  misconception?: string;
}

export interface AssessmentItem {
  id: string;
  missionId: string;
  missionTitle: string;
  developmentalBand: DevelopmentalBand;
  prompt: string;
  context: string;
  hint?: string;
  /** IRT b-parameter: -3.0 (Very Easy) to +3.0 (Very Hard). Default is 0.0 */
  itemDifficulty?: number;
  /** ID of the linked evidence item for multi-part questions */
  linkedEvidenceItemId?: string;
  /**
   * Curriculum alignment tags for audit and reporting, e.g. an NGSS Science &
   * Engineering Practice, a PISA 2025 competency, and the NCF 2023 stage the
   * item's developmental band belongs to.
   */
  standards?: readonly string[];
  options: readonly AssessmentOption[];
  scenarioState: ScenarioState;
  mutableStateKeys: readonly string[];
  mutation?: ScenarioMutation;
}

export interface CalibrationAnswer {
  itemId: string;
  optionId: string;
}

export interface AssessmentPlan {
  subject: Subject;
  classLevel: number;
  developmentalBand: DevelopmentalBand;
  calibrationItems: readonly AssessmentItem[];
  missionIds: readonly string[];
  missionItems: readonly AssessmentItem[];
  /** Total milliseconds allowed for the assessment. Computed from item count × per-difficulty rate. */
  timeLimitMs: number;
}

export interface LearnerProfile {
  name: string;
  classLevel: number;
  difficulty: Difficulty;
  schoolName?: string;
}

export interface WarpSession {
  _id?: string;
  version: 1;
  phase: 'landing' | 'onboarding' | 'hub' | 'assessment' | 'results';
  profile?: LearnerProfile;
  plan?: AssessmentPlan;
  responses: Readonly<Record<string, ItemResponse>>;
  result?: ResultSnapshot;
  /** ISO timestamp of when the assessment phase began. Persisted for timer continuity across page reloads. */
  assessmentStartedAt?: string;
}
