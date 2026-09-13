// supabase/functions/ai-report-generate/index.ts
// Server-side AI report generation — API keys NEVER reach the browser.
// Implements the v2.0 3-tier cascade: NVIDIA Nemotron → OpenRouter → Deterministic fallback.

import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";

interface AssessmentRecord {
  id?: string;
  global_score?: number | string;
  difficulty?: string;
  completed_at?: string;
  [key: string]: unknown;
}

interface ActionPlanItem {
  title: string;
  description: string;
  estimatedDuration?: string;
}

interface StudentReportVariant {
  archetypeTitle: string;
  summary: string;
  keyStrengths: string[];
  nextMission: string;
}

interface ParentReportVariant {
  overallAssessment: string;
  keyStrengths: string[];
  growthAreas: string[];
  actionPlan: ActionPlanItem[];
  parentGuidance: string;
}

interface ReportData {
  student_variant: StudentReportVariant;
  parent_variant: ParentReportVariant;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Privacy-filtered model cascade (v2.0 §5) ──────────────────────────
const AI_MODEL_CASCADE = [
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', provider: 'nvidia', label: 'nvidia-nemotron-70b' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', provider: 'openrouter', label: 'nemotron-ultra-openrouter' },
  { id: 'nvidia/nemotron-3.5-lightning:free', provider: 'openrouter', label: 'nemotron-lightning-openrouter' },
  { id: 'mistralai/mistral-7b-instruct:free', provider: 'openrouter', label: 'mistral-7b-openrouter' },
];

// ── Deterministic fallback (Tier 3 — never fails) ─────────────────────
function deterministicReport(
  assessment: Record<string, unknown>,
  student: Record<string, unknown>,
  _history: Record<string, unknown>[]
) {
  const name = (student?.full_name as string) || 'Candidate';
  const classLevel = (assessment?.class_level as number) || (student?.current_class as number) || 8;
  const scores = (assessment?.scaled_scores as Record<string, number>) || {};
  const _theta = (assessment?.ability_theta as Record<string, number>) || {};
  const subject = (assessment?.subject as string) || 'STEM';
  const isEnglish = subject.toLowerCase().includes('english');

  const entries = Object.entries(scores);
  const sorted = entries.sort(([, a], [, b]) => b - a);
  const strongest = sorted[0]?.[0] || (isEnglish ? 'understanding' : 'mathematicalReasoning');
  const weakest = sorted[sorted.length - 1]?.[0] || (isEnglish ? 'synthesis' : 'systemsThinking');
  const globalScore = (assessment?.global_score as number) || 500;

  if (isEnglish) {
    return {
      student_variant: {
        archetypeTitle: 'Critical Text Synthesizer',
        summary: `Hello ${name}! You scored ${globalScore}/900 on your English Literacy benchmark. Your strongest area is ${strongest.replace(/([A-Z])/g, ' $1').trim()}, and your biggest growth opportunity is in ${weakest.replace(/([A-Z])/g, ' $1').trim()}. To reach the top tiers of international cohorts (Singapore MOE and Cambridge English), focus on evidence tracing and multi-text synthesis.`,
        keyStrengths: [
          `Strong reading fluency and textual comprehension in ${strongest.replace(/([A-Z])/g, ' $1').trim()}.`,
          'Demonstrated persistence across diverse informational and literary excerpts.',
          'Ability to filter obvious surface distractors and infer authorial intent.',
        ],
        nextMission: `Focus on ${weakest.replace(/([A-Z])/g, ' $1').trim()} this week: analyze two contrasting editorial articles and chart where their arguments intersect and diverge.`,
      },
      parent_variant: {
        overallAssessment: `Diagnostic for ${name} (Class ${classLevel}): Your child scored ${globalScore}/900 on the international English Literacy benchmark. Standard school exams often reward literal memorization and recall; international benchmarks (PISA Reading Literacy and Cambridge O-Levels) assess whether a student can evaluate authorial bias and synthesize conflicting evidence.`,
        keyStrengths: [
          `Solid baseline in ${strongest.replace(/([A-Z])/g, ' $1').trim()}.`,
          'Attentive reading engagement on unfamiliar non-fiction passages.',
          'Receptive to nuanced vocabulary in context.',
        ],
        growthAreas: [
          `Analytical gap in ${weakest.replace(/([A-Z])/g, ' $1').trim()}: tendency to rely on keyword matching rather than evaluating structural logic.`,
          'Vulnerability to distractor options with matching surface phrasing but inverted arguments.',
          'Underdeveloped margin-annotation habits compared to top Singapore and UK cohorts.',
        ],
        actionPlan: [
          { title: 'Comparative Editorial Reading', description: 'Read two op-eds on the same event weekly; highlight where authors disagree.', estimatedDuration: '40 mins/week' },
          { title: 'Socratic Comprehension Audit', description: 'Ask your child why false answer choices were constructed to tempt readers.', estimatedDuration: '25 mins/weekend' },
          { title: 'Target International Literacy Standards', description: 'Calibrate against PISA Reading and Cambridge Lower Secondary frameworks.', estimatedDuration: '1-2 months' },
        ],
        parentGuidance: 'Encourage active reading with physical margin notes: summarize each paragraph in 4 words or fewer. Challenge claims by asking: "What evidence did the author withhold?"',
      },
    };
  }

  return {
    student_variant: {
      archetypeTitle: 'Versatile STEM Investigator',
      summary: `Hello ${name}! You scored ${globalScore}/900 on your STEM benchmark. Your strongest area is ${strongest.replace(/([A-Z])/g, ' $1').trim()}, and your biggest growth opportunity is in ${weakest.replace(/([A-Z])/g, ' $1').trim()}. Keep pushing — every international competitor started exactly where you are now.`,
      keyStrengths: [
        `Strong foundation in ${strongest.replace(/([A-Z])/g, ' $1').trim()}.`,
        'Demonstrated persistence through all benchmark scenarios.',
        'Ability to filter baseline distractors in non-routine problems.',
      ],
      nextMission: `Focus on ${weakest.replace(/([A-Z])/g, ' $1').trim()} this week: solve 5 non-routine problems using first-principles reasoning.`,
    },
    parent_variant: {
      overallAssessment: `Diagnostic for ${name} (Class ${classLevel}): Your child scored ${globalScore}/900 on the international STEM benchmark. Standard school exams (90%+ marks) often create a false sense of security — international benchmarks test whether a student can apply first principles to unfamiliar scenarios. This assessment reveals both strengths and areas requiring focused intervention to compete with Singapore and Chinese peers.`,
      keyStrengths: [
        `Solid conceptual foundation in ${strongest.replace(/([A-Z])/g, ' $1').trim()}.`,
        'Perseverance on non-standard adaptive problem prompts.',
        'High growth ceiling with systematic heuristic training.',
      ],
      growthAreas: [
        `Heuristic gap in ${weakest.replace(/([A-Z])/g, ' $1').trim()}: tendency to jump to calculation before defining invariants.`,
        'Vulnerability to distractors engineered around common textbook misconceptions.',
        'Underdeveloped visual bar modeling habits compared to Singapore cohorts.',
      ],
      actionPlan: [
        { title: 'Implement Singapore CPA Routine', description: 'Require your child to draw diagrams before writing equations.', estimatedDuration: '45 mins/week' },
        { title: 'Weekly Error Autopsy', description: 'Review wrong answers together: why was the trap answer tempting?', estimatedDuration: '30 mins/Sunday' },
        { title: 'Register for International Benchmarks', description: 'SASMO, AMC 8/10, or Bebras for authentic competition calibration.', estimatedDuration: '1-2 months' },
      ],
      parentGuidance: 'Enforce a "No Calculator" rule for non-routine homework. Adopt the 2-Minute Explanation Rule: after correct answers, ask your child to explain why the other choices are impossible.',
    },
  };
}

// ── Build the psychometric prompt ──────────────────────────────────────
function buildPrompt(
  assessment: Record<string, unknown>,
  student: Record<string, unknown>,
  history: Record<string, unknown>[]
) {
  const name = (student?.full_name as string) || 'Candidate';
  const classLevel = (assessment?.class_level as number) || 8;
  const scores = (assessment?.scaled_scores as Record<string, number>) || {};
  const theta = (assessment?.ability_theta as Record<string, number>) || {};
  const globalScore = (assessment?.global_score as number) || 0;
  const subject = (assessment?.subject as string) || 'STEM';
  const isEnglish = subject.toLowerCase().includes('english');

  const historyLines = history.length > 1
    ? `\nPrevious assessments (longitudinal trajectory):\n${history.map((h: AssessmentRecord, i: number) =>
        `  ${i + 1}. Score: ${h.global_score || 'N/A'}, Difficulty: ${h.difficulty}, Date: ${h.completed_at}`
      ).join('\n')}`
    : '';

  return `Generate a dual-audience ${subject} diagnostic report for:
Student: ${name}, Class ${classLevel}
Subject: ${subject}
Global Score: ${globalScore}/900
Competency Scaled Scores: ${JSON.stringify(scores)}
Ability Theta (IRT): ${JSON.stringify(theta)}
Total Scenarios: ${(assessment?.responses as unknown[])?.length || 30}
${historyLines}

Benchmark Standards: ${isEnglish ? 'PISA Reading Literacy, Singapore MOE English, Cambridge O-Levels' : 'Singapore SASMO/PSLE, China National Olympiad, USA AMC 8/10, European Bebras'}

Output strict JSON:
{
  "student_variant": {
    "archetypeTitle": "string (cognitive archetype name)",
    "summary": "string (2-3 paragraphs, encouraging yet intellectually candid, compare to international peers)",
    "keyStrengths": ["3 strings"],
    "nextMission": "string (1 actionable challenge for Week 1)"
  },
  "parent_variant": {
    "overallAssessment": "string (3 paragraphs, honest executive reality check comparing to international cohorts)",
    "keyStrengths": ["3 strings"],
    "growthAreas": ["3 strings"],
    "actionPlan": [{"title":"string","description":"string","estimatedDuration":"string"}],
    "parentGuidance": "string (specific home routines)"
  }
}`;
}

// ── Call AI provider ───────────────────────────────────────────────────
async function callAI(
  model: typeof AI_MODEL_CASCADE[number],
  systemPrompt: string,
  userPrompt: string,
  nvidiaKey: string | undefined,
  openrouterKey: string | undefined
): Promise<{ content: string; modelUsed: string }> {
  let baseURL: string;
  let apiKey: string;

  if (model.provider === 'nvidia') {
    if (!nvidiaKey) throw new Error('No NVIDIA key');
    baseURL = 'https://integrate.api.nvidia.com/v1';
    apiKey = nvidiaKey;
  } else {
    if (!openrouterKey) throw new Error('No OpenRouter key');
    baseURL = 'https://openrouter.ai/api/v1';
    apiKey = openrouterKey;
  }

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(model.provider === 'openrouter' ? {
        'HTTP-Referer': 'https://warp.education',
        'X-Title': 'WARP STEM Benchmark',
      } : {}),
    },
    body: JSON.stringify({
      model: model.id,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.15,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      ...(model.provider === 'openrouter' ? { provider: { data_collection: 'deny' } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${model.id} returned ${response.status}: ${body.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${model.id} returned empty content`);
  return { content, modelUsed: model.label };
}

// ── System prompt ──────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the lead psychometrician for WARP Global STEM Assessment.
You evaluate student problem solving against authentic international benchmarks (Singapore SASMO/PSLE, China National Olympiad/Gaokao, USA AMC 8/10, European Bebras).

Guidelines:
- Avoid generic praise. Cut through school grade inflation directly.
- Contrast local classroom test scores with international non-routine transfer tasks.
- For student_variant: Explain why surface intuition fails on deep problems. Be encouraging yet intellectually candid.
- For parent_variant: Provide honest executive summary comparing directly to Singapore/China cohorts. Include specific actionable steps.
- Output MUST be valid JSON matching the requested schema exactly.`;

// ── Main handler ───────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const nvidiaKey = Deno.env.get('NVIDIA_API_KEY');
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');

    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace(/^[Bb]earer\s+/, '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { assessmentId } = await req.json();
    if (!assessmentId) throw new Error('Missing assessmentId');

    // 1. Load assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments').select('*').eq('id', assessmentId).single();
    if (assessmentError || !assessment) throw assessmentError || new Error('Assessment not found');

    // Verify ownership or admin privileges
    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.claims_admin === true;
    if (assessment.student_id !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not own this assessment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 2. Load student profile
    const { data: student } = await supabase
      .from('students').select('*').eq('id', assessment.student_id).single();

    // 3. Load entire history for trajectory (Nemotron's 1M ctx makes this feasible)
    const { data: history } = await supabase
      .from('assessments')
      .select('id, completed_at, scaled_scores, global_score, percentiles, difficulty')
      .eq('student_id', assessment.student_id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: true });

    // 4. Broadcast "analyzing" via Realtime
    try {
      await supabase.channel(`report:${assessmentId}`).send({
        type: 'broadcast', event: 'section',
        payload: { section: 'status', text: 'Analyzing competency trajectory with NVIDIA Nemotron...' }
      });
    } catch { /* non-fatal */ }

    // 5. AI Cascade: try each model in order
    const userPrompt = buildPrompt(assessment, student || {}, history || []);
    let reportData: ReportData | null = null;
    let cascadeStep = 'deterministic-fallback';
    let fallbackUsed = true;

    for (const model of AI_MODEL_CASCADE) {
      try {
        const { content, modelUsed } = await callAI(model, SYSTEM_PROMPT, userPrompt, nvidiaKey, openrouterKey);

        // Parse and validate
        const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.student_variant && parsed.parent_variant) {
          reportData = parsed;
          cascadeStep = modelUsed;
          fallbackUsed = false;
          break;
        }
      } catch (err) {
        console.warn(`Cascade: ${model.label} failed:`, err instanceof Error ? err.message : err);
      }
    }

    // 6. Deterministic fallback — never fails
    if (!reportData) {
      reportData = deterministicReport(assessment, student || {}, history || []);
    }

    const classLevel = (assessment?.class_level as number) || (student?.current_class as number) || 8;
    const subject = (assessment?.subject as string) || 'STEM';

    // Augment variants with classLevel and subject so shared reports have persistent context
    const studentVariantWithMeta = {
      ...reportData.student_variant,
      classLevel,
      subject,
    };
    const parentVariantWithMeta = {
      ...reportData.parent_variant,
      classLevel,
      subject,
    };

    // 7. Persist report
    const { error: insertError } = await supabase.from('reports').upsert({
      student_id: assessment.student_id,
      assessment_id: assessmentId,
      student_variant: studentVariantWithMeta,
      parent_variant: parentVariantWithMeta,
      trajectory_context_assessment_ids: (history || []).map((h: AssessmentRecord) => h.id),
      ai_provenance: {
        engine: cascadeStep,
        fallbackUsed,
        generatedAt: new Date().toISOString(),
        benchmarkVersion: '2026.09-global-calibrated',
      },
      generated_at: new Date().toISOString(),
    }, { onConflict: 'assessment_id' });

    if (insertError) console.error('Report insert error:', insertError);

    // 8. Broadcast "complete" via Realtime
    try {
      await supabase.channel(`report:${assessmentId}`).send({
        type: 'broadcast', event: 'section',
        payload: { section: 'complete', report: { student_variant: studentVariantWithMeta, parent_variant: parentVariantWithMeta } }
      });
    } catch { /* non-fatal */ }

    return new Response(JSON.stringify({
      success: true,
      report: { student_variant: studentVariantWithMeta, parent_variant: parentVariantWithMeta },
      engine: cascadeStep,
      fallback: fallbackUsed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('ai-report-generate error:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
