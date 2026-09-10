// deno-lint-ignore-file
import { withSupabase } from "https://esm.sh/@supabase/server@1.6.0";
import { OpenAI } from "https://esm.sh/openai@4.40.0";
import { z } from "https://esm.sh/zod@3.23.0";

const COMPETENCY_LABELS: Record<string, string> = {
  scientificInquiry: 'Scientific Inquiry',
  computationalThinking: 'Computational Thinking',
  engineeringDesign: 'Engineering Design',
  mathematicalReasoning: 'Mathematical Reasoning',
  systemsThinking: 'Systems Thinking',
};

const ReportSchema = z.object({
  overallAssessment: z.string(),
  keyStrengths: z.array(z.string()).min(1).max(3),
  growthAreas: z.array(z.string()).min(1).max(3),
  learningPath: z.string(),
  parentGuidance: z.string(),
  actionPlan: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().default(''),
        category: z.enum(['course', 'project', 'practice', 'resource', 'retest']),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).catch('beginner'),
        estimatedDuration: z.string().default(''),
      }),
    )
    .min(1),
});

const SYSTEM_PROMPT = `You are an expert STEM education analyst writing a benchmark report for a school student.

Rules:
- Write in clear, encouraging English a parent and student can both understand.
- Be honest about growth areas without discouraging the student.
- Ground every recommendation in the competency scores you are given.
- Never invent scores, percentiles, or personal details.
- The student is described only by class level and competency scores. Do not
  address them by name, and do not speculate about gender, background, health,
  or socioeconomic status.
- Respond with valid JSON matching the requested schema exactly.`;


export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req: Request, ctx: any) => {
    try {
      const { assessmentId } = await req.json();
      if (!assessmentId) throw new Error('Missing assessmentId');

      // 1. Fetch assessment and verify ownership
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('Missing Auth token');

      // ctx.supabase automatically uses the caller's auth context thanks to withSupabase 
      // but wait, Deno Edge Runtime might need the auth header forwarded. 
      // Actually withSupabase handles it if it's the new standard, but let's be safe.
      const { data: { user }, error: authError } = await ctx.supabase.auth.getUser();
      if (authError || !user) throw new Error('Unauthorized');

      // Get internal user id
      const { data: userData } = await ctx.supabase.from('users').select('id, ai_reports_used_today').eq('auth_id', user.id).single();
      if (!userData) throw new Error('User not found');

      // Quota check (simplistic)
      if ((userData.ai_reports_used_today || 0) >= 5) {
        throw new Error('Daily AI report generation quota exceeded.');
      }

      const { data: assessment, error: assessmentError } = await ctx.supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('user_id', userData.id)
        .single();
      
      if (assessmentError || !assessment) throw new Error('Assessment not found or not owned');

      type CompetencyResult = { score?: number; zScore?: number };
      const c = (assessment.result?.competencies ?? {}) as Record<string, CompetencyResult>;
      const percentiles = (assessment.result?.regionalPercentiles ?? {}) as Record<string, number>;
      const overall = assessment.result?.overallScore ?? 0;

      const competencyLines = Object.entries(COMPETENCY_LABELS)
        .map(([key, label]) => {
          const p = c[key];
          if (!p) return `- ${label}: N/A`;
          return `- ${label}: scaled ${p.score ?? '?'}/900 (Z ${p.zScore?.toFixed(2) ?? '?'})`;
        })
        .join('\n');

      const ranked = Object.entries(c).sort(
        (a, b) => (b[1]?.score ?? 0) - (a[1]?.score ?? 0),
      );
      const strongest = COMPETENCY_LABELS[ranked[0]?.[0]] ?? 'N/A';
      const weakest = COMPETENCY_LABELS[ranked[ranked.length - 1]?.[0]] ?? 'N/A';

      const userPrompt = `Write a STEM benchmark report.

Class level: ${assessment.class_level}
Difficulty: ${assessment.difficulty}
Responses recorded: ${assessment.responses?.length || 0}
Overall score: ${overall}/900
Percentile (India): ${percentiles['India'] ?? 'N/A'}
Percentile (Global): ${percentiles['Global'] ?? 'N/A'}

Competency scores:
${competencyLines}

Strongest competency: ${strongest}
Weakest competency: ${weakest}

Return the JSON report now.`;

      const routerKey = Deno.env.get('OPENROUTER_API_KEY');
      const apiKey = routerKey || Deno.env.get('OPENAI_API_KEY');
      if (!apiKey) throw new Error('Missing AI API key');

      const openai = new OpenAI({
        apiKey,
        baseURL: routerKey ? 'https://openrouter.ai/api/v1' : undefined,
      });

      // Decrement quota before AI call
      await ctx.supabaseAdmin.from('users').update({ ai_reports_used_today: (userData.ai_reports_used_today || 0) + 1 }).eq('id', userData.id);

      const completion = await openai.chat.completions.create({
        model: routerKey ? 'mistralai/mistral-7b-instruct:free' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('Empty AI response');

      const parsed = ReportSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) throw new Error('AI response failed validation');

      // Save report
      const { data: reportData, error: reportError } = await ctx.supabaseAdmin
        .from('reports')
        .insert({
          user_id: userData.id,
          assessment_id: assessmentId,
          ai_insights: {
            overallAssessment: parsed.data.overallAssessment,
            keyStrengths: parsed.data.keyStrengths,
            growthAreas: parsed.data.growthAreas,
            learningPath: parsed.data.learningPath,
            parentGuidance: parsed.data.parentGuidance,
          },
          action_plan: parsed.data.actionPlan,
          ai_model_used: completion.model,
        })
        .select('id')
        .single();
        
      if (reportError) throw reportError;

      await ctx.supabaseAdmin.from('assessments').update({ report_id: reportData.id }).eq('id', assessmentId);

      return Response.json({ success: true, reportId: reportData.id });

    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500 });
    }
  }),
};
