import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
// For admin access, you'd want the service role key, but this is a read-only audit.

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('Starting WARP v2.0 Extensive Scenario Audit...');
  
  const { data: scenarios, error } = await supabase
    .from('scenarios')
    .select('id, scenario_code, subject, competency, difficulty, irt_a, irt_b, irt_c, options, question_type');

  if (error) {
    console.error('Failed to fetch scenarios:', error);
    return;
  }

  let issues = 0;

  for (const s of scenarios) {
    // Check IRT constraints
    if (s.irt_a <= 0 || s.irt_a > 3) {
      console.warn(`[${s.scenario_code}] Invalid discrimination (a): ${s.irt_a}`);
      issues++;
    }
    if (s.irt_b < -4 || s.irt_b > 4) {
      console.warn(`[${s.scenario_code}] Extreme difficulty (b): ${s.irt_b}`);
      issues++;
    }
    if (s.irt_c < 0 || s.irt_c > 0.5) {
      console.warn(`[${s.scenario_code}] Invalid guessing (c): ${s.irt_c}`);
      issues++;
    }

    // Check multiple choice constraints
    if (s.question_type === 'multiple_choice' || !s.question_type) {
      const opts = s.options as any[];
      if (!opts || opts.length < 2) {
        console.warn(`[${s.scenario_code}] Missing or insufficient options for multiple choice.`);
        issues++;
      } else {
        const correctCount = opts.filter((o) => o.correct).length;
        if (correctCount !== 1) {
          console.warn(`[${s.scenario_code}] Must have exactly 1 correct option, found ${correctCount}.`);
          issues++;
        }
      }
    }
  }

  console.log(`\nAudit Complete: Scanned ${scenarios.length} scenarios. Found ${issues} issues.`);
}

runAudit();
