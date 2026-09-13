import { createClient } from '@supabase/supabase-js';
import { buildAll300Scenarios } from './generate_300_scenarios';

const supabaseUrl = 'https://uanqjksfodudwkakyglt.supabase.co';
const supabaseKey = 'sb_publishable_T8BWgvUCR4w5cO_l3iO0HA_VM9ygNjX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Building 300 scenarios...');
  const scenarios = buildAll300Scenarios();
  console.log(`Total generated scenarios: ${scenarios.length}`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < scenarios.length; i += batchSize) {
    const chunk = scenarios.slice(i, i + batchSize).map(s => ({
      scenario_code: s.scenario_code,
      class_level: s.class_level,
      developmental_band: s.developmental_band,
      competency: s.competency,
      difficulty: s.difficulty,
      prompt: s.prompt,
      options: s.options,
      learning_objective: s.learning_objective,
      hint: s.hint,
      irt_a: s.irt_a,
      irt_b: s.irt_b,
      irt_c: s.irt_c,
      international_benchmark: s.international_benchmark,
      is_active: true
    }));

    const { error } = await supabase.from('scenarios').insert(chunk);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      process.exit(1);
    }
    console.log(`Successfully inserted batch ${i / batchSize + 1} (${chunk.length} items)`);
  }

  console.log('All 300 scenarios successfully inserted into Supabase!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
