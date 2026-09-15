import * as fs from 'fs';
import * as path from 'path';
import { generateEnglishScenariosSql } from './seed_english_scenarios';

const { batches } = generateEnglishScenariosSql();

batches.forEach((b, idx) => {
  const num = (idx + 1).toString().padStart(2, '0');
  const filename = path.resolve('supabase', 'seed', `english_batch_${num}.sql`);
  fs.writeFileSync(filename, b, 'utf-8');
  console.log(`Saved ${filename} (${b.length} chars)`);
});
