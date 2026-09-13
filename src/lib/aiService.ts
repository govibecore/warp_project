import { supabase } from './supabase';
import { computeInternationalBenchmark, InternationalBenchmarkResult } from './irt/globalBenchmark';

export interface GeneratedReport {
  student_variant: {
    archetypeTitle: string;
    archetypeTagline?: string;
    summary: string;
    keyStrengths: string[];
    blindspots?: string[];
    nextMission: string;
    sprint?: {
      week1: { title: string; focus: string; mission: string };
      week2: { title: string; focus: string; mission: string };
      week3: { title: string; focus: string; mission: string };
      week4: { title: string; focus: string; mission: string };
    };
  };
  parent_variant: {
    overallAssessment: string;
    realityCheckSummary?: string;
    internationalGapSummary?: string;
    gradeInflationWarning?: string;
    keyStrengths: string[];
    growthAreas: string[];
    actionPlan: Array<{
      title: string;
      description: string;
      estimatedDuration: string;
    }>;
    recommendedCurricula?: Array<{
      name: string;
      urlDescription: string;
      purpose: string;
    }>;
    immediateHomeRoutines?: string[];
    parentGuidance?: string;
  };
  benchmark: InternationalBenchmarkResult;
}

/**
 * Generates a comprehensive dual-audience report.
 *
 * 1. Computes the client-side psychometric benchmark (IRT, percentiles, archetype)
 * 2. Calls the server-side Edge Function `ai-report-generate` to generate
 *    AI-enhanced narratives with keys that never touch the browser.
 * 3. Falls back to a fully deterministic psychometric report if the Edge Function
 *    is unreachable or fails.
 */
export async function createAndSaveReport(
  assessmentId: string,
  studentId: string,
  studentName: string,
  classLevel: number,
  thetaMap: Record<string, number>,
  _responses: any[]
): Promise<GeneratedReport> {
  // Step 1: Client-side psychometric benchmark (always runs — zero latency)
  const benchmark = computeInternationalBenchmark(thetaMap, classLevel);
  const deterministicReport = buildDeterministicReport(studentName, classLevel, benchmark);

  // Step 2: Try the server-side Edge Function (keys stay in Supabase Vault)
  try {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://uanqjksfodudwkakyglt.supabase.co';
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-report-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || import.meta.env?.VITE_SUPABASE_ANON_KEY || ''}`,
        'apikey': import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ assessmentId }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.report) {
        const aiReport = result.report;
        return {
          student_variant: {
            ...deterministicReport.student_variant,
            ...(aiReport.student_variant || {}),
            // Preserve psychometric sprint from deterministic engine
            sprint: deterministicReport.student_variant.sprint,
          },
          parent_variant: {
            ...deterministicReport.parent_variant,
            ...(aiReport.parent_variant || {}),
            // Preserve psychometric action plan items if AI doesn't provide
            recommendedCurricula: deterministicReport.parent_variant.recommendedCurricula,
            immediateHomeRoutines: deterministicReport.parent_variant.immediateHomeRoutines,
          },
          benchmark,
        };
      }
    } else {
      console.warn('Edge Function returned non-OK:', response.status);
    }
  } catch (err) {
    console.warn('Edge Function unreachable, using deterministic report:', err);
  }

  // Step 3: If Edge Function fails, persist the deterministic report directly
  try {
    const { error } = await supabase.from('reports').upsert({
      assessment_id: assessmentId,
      student_id: studentId,
      student_variant: deterministicReport.student_variant,
      parent_variant: deterministicReport.parent_variant,
      ai_provenance: {
        engine: 'psychometric-deterministic-engine',
        generatedAt: new Date().toISOString(),
        benchmarkVersion: '2026.09-global-calibrated',
      },
      generated_at: new Date().toISOString(),
    }, { onConflict: 'assessment_id' });

    if (error) console.error('Failed to persist deterministic report:', error);
  } catch (dbErr) {
    console.error('Report upsert error:', dbErr);
  }

  return deterministicReport;
}

function buildDeterministicReport(
  studentName: string,
  classLevel: number,
  benchmark: InternationalBenchmarkResult
): GeneratedReport {
  const { realityCheck, cognitiveArchetype, studentChallengeSprint, parentActionBlueprint, competencyBreakdown } = benchmark;

  const topCompetency = Object.entries(competencyBreakdown)
    .sort((a, b) => b[1].scaledScore - a[1].scaledScore)[0];
  const lowestCompetency = Object.entries(competencyBreakdown)
    .sort((a, b) => a[1].scaledScore - b[1].scaledScore)[0];

  const studentSummary = `Hello ${studentName}! Your assessment places you as an "${cognitiveArchetype.title}". 
${cognitiveArchetype.description}

Globally, your analytical performance ranks in the ${benchmark.globalPercentile}th percentile. However, when benchmarked against the Singapore SASMO and Chinese Olympiad standards, your relative percentile is ${benchmark.regionalPercentiles.Singapore}th. Your greatest analytical leverage comes from ${topCompetency[0]}, while your biggest vulnerability to trap options is in ${lowestCompetency[0]}.

To compete with the top STEM minds across Singapore, the US, China, and Europe, you need to transition from "calculating answers" to "modeling first principles."`;

  const parentAssessment = `Diagnostic Executive Evaluation for Parents of ${studentName} (Class ${classLevel})

${realityCheck.honestSummary}

${realityCheck.internationalGapSummary}

${realityCheck.gradeInflationWarning}

Core Takeaway:
Your child has demonstrated unmistakable potential, but currently leans on familiar patterns rather than first-principles reasoning. In standard classroom examinations, this approach yields A-grades. In international competitions (such as AMC 8/10, SASMO, or Bebras), it breaks down because questions are explicitly engineered to disarm routine algorithms. Follow the actionable blueprint below to cultivate deep, globally competitive mathematical and scientific reasoning.`;

  return {
    student_variant: {
      archetypeTitle: cognitiveArchetype.title,
      archetypeTagline: cognitiveArchetype.tagline,
      summary: studentSummary,
      keyStrengths: [
        cognitiveArchetype.primaryStrength,
        `Demonstrates consistent execution in ${topCompetency[0]} (Scaled Score: ${topCompetency[1].scaledScore}/800).`,
        `Able to filter baseline distractors and isolate key problem parameters.`,
      ],
      blindspots: [
        cognitiveArchetype.criticalBlindspot,
        `Vulnerable to counter-intuitive physics and multi-step constraints in ${lowestCompetency[0]}.`,
      ],
      nextMission: `Your 30-day target: Complete the Week 1 challenge on "${studentChallengeSprint.week1.title}". Focus on: ${studentChallengeSprint.week1.focus}.`,
      sprint: studentChallengeSprint,
    },
    parent_variant: {
      overallAssessment: parentAssessment,
      realityCheckSummary: realityCheck.honestSummary,
      internationalGapSummary: realityCheck.internationalGapSummary,
      gradeInflationWarning: realityCheck.gradeInflationWarning,
      keyStrengths: [
        `Strong conceptual foundation in ${topCompetency[0]} (${topCompetency[1].globalPercentile}th percentile global).`,
        `Demonstrates perseverance on non-standard adaptive problem prompts.`,
        `High growth ceiling with systematic heuristic training.`,
      ],
      growthAreas: [
        `Heuristic gap in ${lowestCompetency[0]}: tendency to jump to calculation before defining system invariants.`,
        `Vulnerability to distractors engineered around common textbook misconceptions.`,
        `Underdeveloped visual bar modeling habits compared to Singapore primary/middle school cohorts.`,
      ],
      actionPlan: [
        {
          title: 'Implement Singapore Concrete-Pictorial-Abstract (CPA) Routine',
          description: 'Require your child to draw the physical situation or diagram before writing algebraic equations.',
          estimatedDuration: '45 mins / week (Ongoing)',
        },
        {
          title: 'Weekly Error Autopsy (Metacognitive Journal)',
          description: 'Review wrong answers together. Have the child explain why the wrong option was tempting and which physical law it violated.',
          estimatedDuration: '30 mins every Sunday',
        },
        {
          title: 'Register for Authentic International Benchmarks',
          description: 'Enter upcoming competitions (SASMO, AMC 8/10, or Bebras) to build immunity to competition pressure and unfamiliar problem structures.',
          estimatedDuration: 'Next registration cycle (1-2 months)',
        },
      ],
      recommendedCurricula: parentActionBlueprint.recommendedCurricula,
      immediateHomeRoutines: parentActionBlueprint.immediateHomeRoutines,
    },
    benchmark,
  };
}
