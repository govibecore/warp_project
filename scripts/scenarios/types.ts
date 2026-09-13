export type Competency = 'scientificInquiry' | 'computationalThinking' | 'engineeringDesign' | 'mathematicalReasoning' | 'systemsThinking';

export type Difficulty = 'standard' | 'advanced' | 'olympiad';

export interface ScenarioRecord {
  scenario_code: string;
  class_level: number;
  developmental_band: string;
  competency: Competency;
  difficulty: Difficulty;
  prompt: string;
  options: { text: string; correct: boolean }[];
  learning_objective: string;
  hint: string;
  irt_a: number;
  irt_b: number;
  irt_c: number;
  international_benchmark: string;
}
