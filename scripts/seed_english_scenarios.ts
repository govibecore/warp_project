import * as fs from 'fs';
import * as path from 'path';
import { englishBand3_4 } from './scenarios/english_band_3_4';
import { englishBand5_6 } from './scenarios/english_band_5_6';
import { englishBand7_8 } from './scenarios/english_band_7_8';
import { englishBand9_10 } from './scenarios/english_band_9_10';
import { englishBand11_12 } from './scenarios/english_band_11_12';
import { ScenarioDef } from './scenarios/english_types';

import { fileURLToPath } from 'url';

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function scenarioToSql(s: ScenarioDef): string {
  const optionsJson = JSON.stringify(s.options).replace(/'/g, "''");
  const benchmarkVal = s.international_benchmark ? `'${escapeSql(s.international_benchmark)}'` : 'NULL';
  return `('${escapeSql(s.scenario_code)}', 'English Literacy', '${escapeSql(s.competency)}', '${escapeSql(s.developmental_band)}', '${escapeSql(s.difficulty)}', '${escapeSql(s.prompt)}', '${optionsJson}'::jsonb, '${escapeSql(s.learning_objective)}', '${escapeSql(s.hint)}', ${s.irt_a}, ${s.irt_b}, ${s.irt_c}, true, 0, ${benchmarkVal})`;
}

export function generateEnglishScenariosSql(): { fullSql: string; batches: string[] } {
  const allScenarios: ScenarioDef[] = [
    ...englishBand3_4,
    ...englishBand5_6,
    ...englishBand7_8,
    ...englishBand9_10,
    ...englishBand11_12
  ];

  console.log(`Loaded ${allScenarios.length} total English Literacy scenarios across 5 bands.`);

  const batchSize = 20;
  const batches: string[] = [];

  for (let i = 0; i < allScenarios.length; i += batchSize) {
    const chunk = allScenarios.slice(i, i + batchSize);
    const values = chunk.map(scenarioToSql).join(',\n');
    const sql = `INSERT INTO public.scenarios (
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
    batches.push(sql);
  }

  const fullSql = batches.join('\n\n');
  return { fullSql, batches };
}

// Generate the output SQL file only when executed directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const { fullSql, batches } = generateEnglishScenariosSql();
  const outputPath = path.resolve('supabase', 'seed', 'seed_english_literacy_scenarios.sql');
  fs.writeFileSync(outputPath, fullSql, 'utf-8');
  console.log(`Generated ${batches.length} batches written to ${outputPath}`);
}
