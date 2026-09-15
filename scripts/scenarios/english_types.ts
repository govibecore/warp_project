export interface ScenarioDef {
  scenario_code: string;
  subject: string;
  competency: 'understanding' | 'locatingInformation' | 'synthesis' | 'evaluatingReflecting';
  developmental_band: '3-4' | '5-6' | '7-8' | '9-10' | '11-12';
  difficulty: 'standard' | 'advanced' | 'olympiad';
  prompt: string;
  options: { text: string; correct: boolean; evidence?: { competency: string; earnedWeight: number }[] }[];
  learning_objective: string;
  hint: string;
  irt_a: number;
  irt_b: number;
  irt_c: number;
  international_benchmark: string;
}

export function makeOptions(
  competency: string,
  correctText: string,
  wrongTexts: [string, string, string]
) {
  const opts = [
    { text: correctText, correct: true, evidence: [{ competency, earnedWeight: 1 }] },
    { text: wrongTexts[0], correct: false, evidence: [{ competency, earnedWeight: 0 }] },
    { text: wrongTexts[1], correct: false, evidence: [{ competency, earnedWeight: 0 }] },
    { text: wrongTexts[2], correct: false, evidence: [{ competency, earnedWeight: 0 }] }
  ];
  // Deterministic swap so correct is distributed across A, B, C, D
  const seed = (correctText.charCodeAt(0) + correctText.length) % 4;
  const temp = opts[0];
  opts[0] = opts[seed];
  opts[seed] = temp;
  return opts;
}
