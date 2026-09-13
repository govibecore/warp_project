import { supabase } from './supabase';
import type { InternationalBenchmarkResult } from './irt/globalBenchmark';

// ── No hardcoded API keys — all AI calls proxied through Edge Functions ──

export interface NemotronReportNarrative {
  studentSummary: string;
  studentNextMission: string;
  parentAssessment: string;
}

/**
 * High-fidelity psychometric report synthesis.
 * Now proxied through the ai-report-generate Edge Function.
 * This function is kept for backward compatibility but delegates to the Edge Function.
 */
export async function generateNemotronReportNarrative(
  _studentName: string,
  _classLevel: number,
  _benchmark: InternationalBenchmarkResult,
  _responses: any[]
): Promise<NemotronReportNarrative | null> {
  // Report generation is now handled entirely by the Edge Function
  // called from aiService.ts → createAndSaveReport().
  // This function returns null to signal the caller to use the Edge Function path.
  return null;
}

/**
 * Interactive Socratic STEM Tutor powered by NVIDIA Nemotron.
 * Calls a lightweight Edge Function endpoint for Socratic guidance.
 * Falls back to a static hint if the function is unavailable.
 */
export async function askNemotronSocraticTutor(
  scenarioContext: {
    prompt: string;
    learningObjective?: string;
    competency: string;
    benchmarkStandard?: string;
    userSelectedOption?: string;
    correctOption?: string;
  },
  studentQuestion: string,
  classLevel: number
): Promise<string> {
  try {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://uanqjksfodudwkakyglt.supabase.co';
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return generateStaticSocraticResponse(scenarioContext, classLevel);
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-socratic-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        scenarioContext,
        studentQuestion,
        classLevel,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.reply) return result.reply;
    }
  } catch (err) {
    console.warn('Socratic Tutor Edge Function unavailable:', err);
  }

  // Deterministic fallback — always returns a useful Socratic prompt
  return generateStaticSocraticResponse(scenarioContext, classLevel);
}

/**
 * Generates an on-demand Socratic hint during active assessment.
 * Proxied through Edge Function with static fallback.
 */
export async function getNemotronSocraticHint(
  prompt: string,
  competency: string,
  classLevel: number
): Promise<string> {
  try {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://uanqjksfodudwkakyglt.supabase.co';
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return getStaticHint(competency);
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-socratic-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        mode: 'hint',
        scenarioContext: { prompt, competency },
        classLevel,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.reply) return result.reply;
    }
  } catch (err) {
    console.warn('Hint Edge Function unavailable, using static hint:', err);
  }

  // Static Socratic hints by competency
  return getStaticHint(competency);
}

// ── Static fallbacks (deterministic, zero-latency) ─────────────────────

function generateStaticSocraticResponse(
  ctx: { prompt: string; competency: string; userSelectedOption?: string; correctOption?: string },
  _classLevel: number
): string {
  const comp = ctx.competency;

  if (comp.includes('mathematical') || comp.includes('Mathematical')) {
    return `Great question! Before plugging in numbers, try this: What stays constant (the invariant) in this problem? Can you identify the constraint that limits possible answers? In Singapore's CPA approach, you'd draw a bar model first. Try sketching the relationships before calculating.`;
  }
  if (comp.includes('computational') || comp.includes('Computational')) {
    return `Think about it this way: If you were a computer, what's the very first step you'd execute? What information do you need before you can proceed? Try tracing through the logic step by step — what does step 1 produce that step 2 needs?`;
  }
  if (comp.includes('scientific') || comp.includes('Scientific')) {
    return `Here's a key scientific thinking question: What variable are we trying to isolate, and what must stay controlled? If you changed one thing at a time, which change would give you the most information about cause and effect?`;
  }
  if (comp.includes('engineering') || comp.includes('Engineering')) {
    return `Engineering design thinking: What are the constraints (things you can't change)? What are the trade-offs between the options? Which solution satisfies the most constraints simultaneously?`;
  }
  return `Think about what fundamental principle or law governs this scenario. What would happen at the extreme cases (very large, very small, zero)? Often, checking the boundary conditions reveals which answer must be correct.`;
}

function getStaticHint(competency: string): string {
  const hints: Record<string, string> = {
    scientificInquiry: 'What is the independent variable here? What must you keep constant to run a fair test?',
    computationalThinking: 'Can you break this into smaller sub-problems? What pattern connects the steps?',
    engineeringDesign: 'What are the constraints? Which option satisfies the most requirements at once?',
    mathematicalReasoning: 'Before calculating, can you estimate the answer? What mathematical relationship (ratio, proportion, inverse) governs this?',
    systemsThinking: 'If you change one part of this system, what else must change as a consequence? Look for feedback loops.',
  };
  return hints[competency] || 'Focus on isolating the independent variable and identifying what stays constant.';
}
