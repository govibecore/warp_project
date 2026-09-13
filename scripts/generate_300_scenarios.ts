import type { ScenarioRecord } from './scenarios/types';
import { getBand3_4Scenarios } from './scenarios/band_3_4';
import { getBand5_6Scenarios } from './scenarios/band_5_6';
import { getBand7_8Scenarios } from './scenarios/band_7_8';
import { getBand9_10Scenarios } from './scenarios/band_9_10';
import { getBand11_12Scenarios } from './scenarios/band_11_12';

export type { ScenarioRecord };

export function buildAll300Scenarios(): ScenarioRecord[] {
  const all: ScenarioRecord[] = [
    ...getBand3_4Scenarios(),
    ...getBand5_6Scenarios(),
    ...getBand7_8Scenarios(),
    ...getBand9_10Scenarios(),
    ...getBand11_12Scenarios(),
  ];

  if (all.length !== 300) {
    throw new Error(`Expected exactly 300 scenarios, but got ${all.length}`);
  }

  // Validate that every scenario_code is unique
  const codes = new Set<string>();
  const prompts = new Set<string>();
  const duplicates: string[] = [];

  for (const s of all) {
    if (codes.has(s.scenario_code)) {
      duplicates.push(`Duplicate scenario_code: ${s.scenario_code}`);
    }
    codes.add(s.scenario_code);

    const normPrompt = s.prompt.trim().toLowerCase();
    if (prompts.has(normPrompt)) {
      duplicates.push(`Duplicate prompt in ${s.scenario_code}: "${s.prompt.slice(0, 60)}..."`);
    }
    prompts.add(normPrompt);
  }

  if (duplicates.length > 0) {
    throw new Error(`Item bank validation failed with duplicate questions:\n${duplicates.join('\n')}`);
  }

  return all;
}

// Generate the SQL queries in batches
export function generateSqlBatches(): string[] {
  const scenarios = buildAll300Scenarios();
  const batches: string[] = [];
  const batchSize = 30; // 1 class per batch

  for (let i = 0; i < scenarios.length; i += batchSize) {
    const chunk = scenarios.slice(i, i + batchSize);
    const grade = chunk[0].class_level;

    let sql = `-- Batch for Class ${grade} (30 questions)\n`;
    sql += `INSERT INTO public.scenarios (\n`;
    sql += `  scenario_code, class_level, developmental_band, competency, difficulty,\n`;
    sql += `  prompt, options, learning_objective, hint, irt_a, irt_b, irt_c,\n`;
    sql += `  international_benchmark, is_active\n`;
    sql += `) VALUES\n`;

    const valueRows = chunk.map(s => {
      const escapedPrompt = s.prompt.replace(/'/g, "''");
      const escapedHint = s.hint.replace(/'/g, "''");
      const escapedObjective = s.learning_objective.replace(/'/g, "''");
      const escapedBenchmark = s.international_benchmark.replace(/'/g, "''");
      const jsonOptions = JSON.stringify(s.options).replace(/'/g, "''");

      return `  ('${s.scenario_code}', ${s.class_level}, '${s.developmental_band}', '${s.competency}', '${s.difficulty}', '${escapedPrompt}', '${jsonOptions}'::jsonb, '${escapedObjective}', '${escapedHint}', ${s.irt_a}, ${s.irt_b}, ${s.irt_c}, '${escapedBenchmark}', true)`;
    });

    sql += valueRows.join(',\n') + ';\n';
    batches.push(sql);
  }

  return batches;
}
