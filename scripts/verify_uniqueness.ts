import { buildAll300Scenarios } from './generate_300_scenarios';

const scenarios = buildAll300Scenarios();

console.log(`\n=== SCENARIO ITEM BANK AUDIT REPORT ===`);
console.log(`Total Scenarios: ${scenarios.length}`);

// 1. Uniqueness check
const prompts = new Set<string>();
const codes = new Set<string>();
let promptDupes = 0;
let codeDupes = 0;

for (const s of scenarios) {
  const normPrompt = s.prompt.trim().toLowerCase();
  if (prompts.has(normPrompt)) {
    console.error(`DUPLICATE PROMPT: [${s.scenario_code}] "${s.prompt.slice(0, 70)}..."`);
    promptDupes++;
  }
  prompts.add(normPrompt);

  if (codes.has(s.scenario_code)) {
    console.error(`DUPLICATE CODE: ${s.scenario_code}`);
    codeDupes++;
  }
  codes.add(s.scenario_code);
}

console.log(`Unique Prompts: ${prompts.size} / ${scenarios.length}`);
console.log(`Unique Scenario Codes: ${codes.size} / ${scenarios.length}`);

// 2. Class & Competency distribution
const classCounts: Record<number, number> = {};
const competencyCounts: Record<string, number> = {};
const difficultyCounts: Record<string, number> = {};

for (const s of scenarios) {
  classCounts[s.class_level] = (classCounts[s.class_level] || 0) + 1;
  competencyCounts[s.competency] = (competencyCounts[s.competency] || 0) + 1;
  difficultyCounts[s.difficulty] = (difficultyCounts[s.difficulty] || 0) + 1;

  // Options validation
  if (!Array.isArray(s.options) || s.options.length !== 4) {
    console.error(`Invalid options length for ${s.scenario_code}: ${s.options?.length}`);
  }
  const correctCount = s.options.filter(o => o.correct).length;
  if (correctCount !== 1) {
    console.error(`Invalid correct option count for ${s.scenario_code}: ${correctCount}`);
  }

  // IRT checks
  if (typeof s.irt_a !== 'number' || s.irt_a < 0.5 || s.irt_a > 3.0) {
    console.error(`Suspicious irt_a for ${s.scenario_code}: ${s.irt_a}`);
  }
  if (typeof s.irt_b !== 'number' || s.irt_b < -3.0 || s.irt_b > 3.5) {
    console.error(`Suspicious irt_b for ${s.scenario_code}: ${s.irt_b}`);
  }
  if (typeof s.irt_c !== 'number' || s.irt_c < 0.15 || s.irt_c > 0.35) {
    console.error(`Suspicious irt_c for ${s.scenario_code}: ${s.irt_c}`);
  }
}

console.log('\nQuestions per Class Level:');
for (let c = 3; c <= 12; c++) {
  console.log(`  Class ${c}: ${classCounts[c]} questions`);
}

console.log('\nQuestions per Competency (total across all grades):');
for (const [comp, count] of Object.entries(competencyCounts)) {
  console.log(`  ${comp}: ${count}`);
}

console.log('\nQuestions per Difficulty tier:');
for (const [diff, count] of Object.entries(difficultyCounts)) {
  console.log(`  ${diff}: ${count}`);
}

if (promptDupes === 0 && codeDupes === 0 && scenarios.length === 300) {
  console.log('\n✅ VERIFICATION PASSED: 300 / 300 completely unique, valid items!');
} else {
  console.error('\n❌ VERIFICATION FAILED: duplicate questions or invalid counts detected!');
  process.exit(1);
}
