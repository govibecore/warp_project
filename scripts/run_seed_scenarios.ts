import * as fs from 'fs';
import * as path from 'path';
import { generateSqlBatches } from './generate_300_scenarios';

const batches = generateSqlBatches();
const outputDir = path.join(process.cwd(), 'supabase', 'seed');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Write consolidated seed file
const fullSql = [
  '-- Clear existing scenarios for clean 300-question seed',
  'DELETE FROM public.scenarios;',
  '',
  ...batches
].join('\n\n');

const fullPath = path.join(outputDir, 'seed_300_scenarios.sql');
fs.writeFileSync(fullPath, fullSql, 'utf8');
console.log(`Successfully generated 300 questions across 10 classes to ${fullPath}`);

// 2. Write individual batch files for ease of execution if needed
batches.forEach((batch, index) => {
  const grade = index + 3;
  const batchPath = path.join(outputDir, `class_${grade.toString().padStart(2, '0')}.sql`);
  fs.writeFileSync(batchPath, batch, 'utf8');
});
console.log('Individual grade batch files written (class_03.sql to class_12.sql).');
