import { supabase } from './supabase';
import { computeInternationalBenchmark, InternationalBenchmarkResult, COMPETENCY_LABELS, CompetencyKey } from './irt/globalBenchmark';

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
    benchmark?: InternationalBenchmarkResult;
    classLevel?: number;
    subject?: string;
  };
  parent_variant: {
    overallAssessment: string;
    realityCheckSummary?: string;
    internationalGapSummary?: string;
    gradeInflationWarning?: string;
    keyStrengths: string[];
    growthAreas: string[];
    actionPlan?: Array<{
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
    indianRecommendedCurricula?: Array<{
      name: string;
      category?: string;
      urlDescription: string;
      purpose: string;
    }>;
    indianHomeRoutines?: string[];
    ptmDiscussionGuide?: string[];
    streamOrientation?: { topStream: string; description: string; subjectFocus: string };
    parentGuidance?: string;
    benchmark?: InternationalBenchmarkResult;
    classLevel?: number;
    subject?: string;
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
  _responses: any[],
  subject: string = 'STEM'
): Promise<GeneratedReport> {
  // Step 1: Client-side psychometric benchmark (always runs - zero latency)
  const benchmark = computeInternationalBenchmark(thetaMap, classLevel, subject);
  const deterministicReport = buildDeterministicReport(studentName, classLevel, benchmark, subject);

  // Embed benchmark and metadata inside parent_variant & student_variant
  const studentVariantWithMeta = {
    ...deterministicReport.student_variant,
    benchmark,
    classLevel,
    subject,
  };
  const parentVariantWithMeta = {
    ...deterministicReport.parent_variant,
    benchmark,
    classLevel,
    subject,
  };

  // Guard: If assessment has fewer than 5 responses or no assessed data, do not persist incomplete report
  if ((_responses?.length || 0) < 5 || !benchmark.hasSufficientData) {
    console.warn(`Assessment ${assessmentId} has insufficient responses (${_responses?.length || 0}/5). Skipping report persistence.`);
    return {
      student_variant: studentVariantWithMeta,
      parent_variant: parentVariantWithMeta,
      benchmark,
    };
  }

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
        const finalReport: GeneratedReport = {
          student_variant: {
            ...studentVariantWithMeta,
            ...(aiReport.student_variant || {}),
            sprint: deterministicReport.student_variant.sprint,
            benchmark,
            classLevel,
            subject,
          },
          parent_variant: {
            ...parentVariantWithMeta,
            ...(aiReport.parent_variant || {}),
            recommendedCurricula: deterministicReport.parent_variant.recommendedCurricula,
            immediateHomeRoutines: deterministicReport.parent_variant.immediateHomeRoutines,
            benchmark,
            classLevel,
            subject,
          },
          benchmark,
        };
        return finalReport;
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
      student_variant: studentVariantWithMeta as any,
      parent_variant: parentVariantWithMeta as any,
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

  return {
    student_variant: studentVariantWithMeta,
    parent_variant: parentVariantWithMeta,
    benchmark,
  };
}

function buildDeterministicReport(
  studentName: string,
  classLevel: number,
  benchmark: InternationalBenchmarkResult,
  subject: string = 'STEM'
): GeneratedReport {
  const isEnglish = subject.toLowerCase().includes('english');
  const { realityCheck, cognitiveArchetype, studentChallengeSprint, parentActionBlueprint, competencyBreakdown, hasSufficientData } = benchmark;

  const entries = Object.entries(competencyBreakdown) as [string, { scaledScore: number; globalPercentile?: number; isAssessed?: boolean }][];
  const assessedEntries = entries.filter(([_, d]) => d.isAssessed !== false && d.scaledScore > 0);
  const topCompetency = assessedEntries.length > 0
    ? assessedEntries.sort((a, b) => b[1].scaledScore - a[1].scaledScore)[0]
    : [isEnglish ? 'understanding' : 'scientificInquiry', { scaledScore: 0, globalPercentile: 0 }] as const;
  const lowestCompetency = assessedEntries.length > 0
    ? assessedEntries.sort((a, b) => a[1].scaledScore - b[1].scaledScore)[0]
    : [isEnglish ? 'synthesis' : 'mathematicalReasoning', { scaledScore: 0, globalPercentile: 0 }] as const;

  const topLabel = COMPETENCY_LABELS[topCompetency[0] as CompetencyKey] || topCompetency[0];
  const lowestLabel = COMPETENCY_LABELS[lowestCompetency[0] as CompetencyKey] || lowestCompetency[0];
  const topScore = (topCompetency[1] as any)?.scaledScore || 0;
  const topGlobalPct = (topCompetency[1] as any)?.globalPercentile || 0;

  if (!hasSufficientData) {
    const studentSummary = `Hello ${studentName}! Your assessment is currently incomplete. Please complete at least 5 benchmark scenarios so the psychometric engine can calibrate your latent ability parameters.`;
    const parentAssessment = `Diagnostic Executive Evaluation for Parents of ${studentName} (Class ${classLevel})\nStatus: Assessment Incomplete (Fewer than 5 responses recorded).\n\nPlease have the student complete the full assessment to project verified national and global standings.`;

    return {
      student_variant: {
        archetypeTitle: cognitiveArchetype.title,
        archetypeTagline: cognitiveArchetype.tagline,
        summary: studentSummary,
        keyStrengths: ['Assessment pending completion'],
        blindspots: ['Assessment pending completion'],
        nextMission: 'Resume and complete at least 5 assessment scenarios.',
        sprint: studentChallengeSprint,
      },
      parent_variant: {
        overallAssessment: parentAssessment,
        realityCheckSummary: realityCheck.honestSummary,
        internationalGapSummary: realityCheck.internationalGapSummary,
        gradeInflationWarning: realityCheck.gradeInflationWarning,
        keyStrengths: ['Pending verified assessment data'],
        growthAreas: ['Pending verified assessment data'],
        actionPlan: [],
        recommendedCurricula: parentActionBlueprint.recommendedCurricula,
        immediateHomeRoutines: parentActionBlueprint.immediateHomeRoutines,
        indianRecommendedCurricula: parentActionBlueprint.indianRecommendedCurricula,
        indianHomeRoutines: parentActionBlueprint.indianHomeRoutines,
        ptmDiscussionGuide: parentActionBlueprint.ptmDiscussionGuide,
        streamOrientation: parentActionBlueprint.streamOrientation,
        parentGuidance: 'Please have the candidate complete at least 5 questions to generate an authoritative evaluation.',
      },
      benchmark,
    };
  }

  const studentSummary = isEnglish
    ? `Hello ${studentName}! Your assessment places you as an "${cognitiveArchetype.title}".\n${cognitiveArchetype.description}\n\nIn India, your performance places you in the ${benchmark.indiaNationalPercentile}th percentile nationally (Projected Board Grade: ${benchmark.boardGradeBand.grade} - ${benchmark.boardGradeBand.band}), and in the ${benchmark.globalPercentile}th percentile globally. When benchmarked against Singapore MOE and Cambridge English standards, your relative standing is ${benchmark.regionalPercentiles.Singapore}th percentile. Your strongest execution is in ${topLabel}, while your biggest growth opportunity is in ${lowestLabel}.\n\nTo excel against top students in India and internationally (Singapore, US, and Europe), focus on deep rhetorical evaluation and evidence synthesis rather than passive reading.`
    : `Hello ${studentName}! Your assessment places you as an "${cognitiveArchetype.title}".\n${cognitiveArchetype.description}\n\nIn India, your analytical performance ranks in the ${benchmark.indiaNationalPercentile}th percentile nationally (Projected Board Grade: ${benchmark.boardGradeBand.grade} - ${benchmark.boardGradeBand.band}), and in the ${benchmark.globalPercentile}th percentile globally. Benchmarked against Singapore SASMO standards, your relative percentile is ${benchmark.regionalPercentiles.Singapore}th. Your greatest analytical leverage comes from ${topLabel}, while your biggest vulnerability to trap options is in ${lowestLabel}.\n\nTo compete with top STEM minds across India (Olympiads/JEE Foundation) and globally (Singapore, US, China), you need to transition from "calculating textbook answers" to "modeling first principles."`;

  const parentAssessment = isEnglish
    ? `Diagnostic Executive Evaluation for Parents of ${studentName} (Class ${classLevel})\nNational Standing: ${benchmark.indiaNationalPercentile}th Percentile across Indian Schools (CBSE/ICSE Grade: ${benchmark.boardGradeBand.grade} - ${benchmark.boardGradeBand.band}) | Global Scaled Score: ${benchmark.aggregateScaledScore}/900\n\n${realityCheck.honestSummary}\n\n${realityCheck.internationalGapSummary}\n\n${realityCheck.gradeInflationWarning}\n\nCore Takeaway for Parents:\nYour child demonstrates strong reading potential, but currently leans on superficial keyword matching on complex multi-text tasks. Standard Indian school examinations reward rote recall of prescribed book questions; competitive benchmarks (such as PISA Reading Literacy, Cambridge, and Olympiads) test whether a student can synthesize conflicting perspectives and deconstruct authorial bias. Follow the actionable blueprint below to cultivate globally competitive critical literacy.`
    : `Diagnostic Executive Evaluation for Parents of ${studentName} (Class ${classLevel})\nNational Standing: ${benchmark.indiaNationalPercentile}th Percentile across Indian Schools (CBSE/ICSE Grade: ${benchmark.boardGradeBand.grade} - ${benchmark.boardGradeBand.band}) | Global Scaled Score: ${benchmark.aggregateScaledScore}/900\n\n${realityCheck.honestSummary}\n\n${realityCheck.internationalGapSummary}\n\n${realityCheck.gradeInflationWarning}\n\nCore Takeaway for Parents:\nYour child has demonstrated unmistakable potential, but currently leans on familiar textbook formulas rather than first-principles reasoning. In standard classroom examinations, this approach often yields 90%+ marks. In national Olympiads (SOF IMO/NSO) and international competitions (such as AMC 8/10 or SASMO), it breaks down because questions are explicitly engineered to disarm routine algorithms. Follow the actionable blueprint below to cultivate deep, competitive mathematical and scientific reasoning.`;

  return {
    student_variant: {
      archetypeTitle: cognitiveArchetype.title,
      archetypeTagline: cognitiveArchetype.tagline,
      summary: studentSummary,
      keyStrengths: [
        cognitiveArchetype.primaryStrength,
        `Demonstrates consistent execution in ${topLabel} (Scaled Score: ${topScore}/900).`,
        `Able to filter baseline distractors and isolate key problem parameters.`,
      ],
      blindspots: [
        cognitiveArchetype.criticalBlindspot,
        isEnglish
          ? `Vulnerable to deceptive distractor choices and subtle nuance shifts in ${lowestLabel}.`
          : `Vulnerable to counter-intuitive physics and multi-step constraints in ${lowestLabel}.`,
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
        `Demonstrated baseline resilience across challenging competitive and international problem sets.`,
        `High growth velocity when provided with structured heuristic frameworks.`,
        `Strongest comparative standing in ${topLabel} (${topGlobalPct}th percentile globally, ${benchmark.indiaNationalPercentile}th percentile nationally).`,
      ],
      growthAreas: [
        `Heuristic gap in ${lowestLabel}: tendency to rush to calculation without rigorous first-principles verification.`,
        `Susceptibility to non-standard distractors engineered around common textbook misconceptions.`,
        isEnglish
          ? `Underdeveloped active margin annotation habits compared to Singapore and UK top-decile cohorts.`
          : `Underdeveloped visual bar modeling habits compared to Singapore cohorts.`,
      ],
      actionPlan: isEnglish
        ? [
            {
              title: 'Active Margin Annotation Routine',
              description: 'Require your child to underline the core premise and mark supporting evidence before answering.',
              estimatedDuration: '30 mins/day',
            },
            {
              title: 'Weekly Error Autopsy',
              description: 'Analyze wrong answers together: what made the distractor answer look plausible?',
              estimatedDuration: '30 mins/Sunday',
            },
            {
              title: 'Long-Form Analytical Reading',
              description: 'Read 2 editorial essays weekly from authentic publications (e.g. The Hindu Young World, Smithsonian, The Economist).',
              estimatedDuration: '45 mins/week',
            },
          ]
        : [
            {
              title: 'Implement First-Principles Diagramming Routine',
              description: 'Require your child to draw diagrams and define invariants before writing equations.',
              estimatedDuration: '45 mins/week',
            },
            {
              title: 'Weekly Error Autopsy',
              description: 'Review wrong answers together: why was the trap answer tempting? What fundamental rule was broken?',
              estimatedDuration: '30 mins/Sunday',
            },
            {
              title: 'Register for Authentic Competitions',
              description: 'Enter SOF Olympiads (IMO/NSO), SASMO, AMC 8/10, or Bebras for authentic calibration.',
              estimatedDuration: '1–2 months',
            },
          ],
      recommendedCurricula: parentActionBlueprint.recommendedCurricula,
      immediateHomeRoutines: parentActionBlueprint.immediateHomeRoutines,
      indianRecommendedCurricula: parentActionBlueprint.indianRecommendedCurricula,
      indianHomeRoutines: parentActionBlueprint.indianHomeRoutines,
      ptmDiscussionGuide: parentActionBlueprint.ptmDiscussionGuide,
      streamOrientation: parentActionBlueprint.streamOrientation,
      parentGuidance: isEnglish
        ? 'Enforce active reading habits. Adopt the 2-Minute Explanation Rule: after answering, ask your child to explain why the other three choices are demonstrably false based solely on the text.'
        : 'Enforce a "No Calculator" rule for non-routine homework. Adopt the 2-Minute Explanation Rule: after correct answers, ask your child to explain why the other choices are impossible.',
    },
    benchmark,
  };
}
