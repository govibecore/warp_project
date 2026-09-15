import * as fs from 'fs';
import * as path from 'path';
import { englishBand3_4 } from './scenarios/english_band_3_4';
import { englishBand5_6 } from './scenarios/english_band_5_6';
import { englishBand7_8 } from './scenarios/english_band_7_8';
import { englishBand9_10 } from './scenarios/english_band_9_10';
import { englishBand11_12 } from './scenarios/english_band_11_12';
import { ScenarioDef } from './scenarios/english_types';

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function scenarioToSql(s: ScenarioDef): string {
  const optionsJson = JSON.stringify(s.options).replace(/'/g, "''");
  const benchmarkVal = s.international_benchmark ? `'${escapeSql(s.international_benchmark)}'` : 'NULL';
  return `('${escapeSql(s.scenario_code)}', 'English Literacy', '${escapeSql(s.competency)}', '${escapeSql(s.developmental_band)}', '${escapeSql(s.difficulty)}', '${escapeSql(s.prompt)}', '${optionsJson}'::jsonb, '${escapeSql(s.learning_objective)}', '${escapeSql(s.hint)}', ${s.irt_a}, ${s.irt_b}, ${s.irt_c}, true, 0, ${benchmarkVal})`;
}

function bandToSql(scenarios: ScenarioDef[]): string {
  const values = scenarios.map(scenarioToSql).join(',\n');
  return `INSERT INTO public.scenarios (
  scenario_code, subject, competency, developmental_band, difficulty,
  prompt, options, learning_objective, hint,
  irt_a, irt_b, irt_c, is_active, usage_count, international_benchmark
) VALUES
${values}
ON CONFLICT (scenario_code) DO UPDATE SET
  subject = EXCLUDED.subject,
  competency = EXCLUDED.competency,
  developmental_band = EXCLUDED.developmental_band,
  difficulty = EXCLUDED.difficulty,
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  learning_objective = EXCLUDED.learning_objective,
  hint = EXCLUDED.hint,
  irt_a = EXCLUDED.irt_a,
  irt_b = EXCLUDED.irt_b,
  irt_c = EXCLUDED.irt_c,
  is_active = EXCLUDED.is_active,
  international_benchmark = EXCLUDED.international_benchmark;`;
}

const bands = [
  { name: 'english_band_3_4.sql', scenarios: englishBand3_4 },
  { name: 'english_band_5_6.sql', scenarios: englishBand5_6 },
  { name: 'english_band_7_8.sql', scenarios: englishBand7_8 },
  { name: 'english_band_9_10.sql', scenarios: englishBand9_10 },
  { name: 'english_band_11_12.sql', scenarios: englishBand11_12 },
];

for (const b of bands) {
  const targetPath = path.resolve('supabase', 'seed', b.name);
  fs.writeFileSync(targetPath, bandToSql(b.scenarios), 'utf-8');
  console.log(`Wrote ${b.scenarios.length} scenarios to ${targetPath}`);
}
