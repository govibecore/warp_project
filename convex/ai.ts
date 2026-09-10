import { v } from 'convex/values';
import { z } from 'zod';
import { action, mutation, query } from './_generated/server';
import { api } from './_generated/api';
import OpenAI from 'openai';
import { requireOwnedAssessment, requireUser } from './lib/auth';

const COMPETENCY_LABELS: Record<string, string> = {
  scientificInquiry: 'Scientific Inquiry',
  computationalThinking: 'Computational Thinking',
  engineeringDesign: 'Engineering Design',
  mathematicalReasoning: 'Mathematical Reasoning',
  systemsThinking: 'Systems Thinking',
};

/**
 * The shape we accept from the model. The model is untrusted input: anything
 * that fails this parse is rejected rather than written to the reports table.
 */
const ReportSchema = z.object({
  overallAssessment: z.string().min(1),
  keyStrengths: z.array(z.string()).min(1),
  growthAreas: z.array(z.string()).min(1),
  learningPath: z.string().min(1),
  parentGuidance: z.string().min(1),
  actionPlan: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().default(''),
        category: z
          .enum(['course', 'project', 'practice', 'resource', 'retest'])
          .catch('practice'),
        difficulty: z
          .enum(['beginner', 'intermediate', 'advanced'])
          .catch('beginner'),
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

/** Daily AI report cap. Overridable per deployment. */
function dailyQuota(): number {
  const raw = process.env.AI_DAILY_REPORT_QUOTA;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

export const generateReport = action({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, args) => {
    // Ownership is asserted before any data leaves the server.
    const { user, assessment } = await ctx.runQuery(api.ai.getOwnAssessment, {
      assessmentId: args.assessmentId,
    });

    const quotaOk = await ctx.runMutation(api.ai.checkAndDecrementQuota, {
      userId: user._id,
    });
    if (!quotaOk) throw new Error('Daily AI report generation quota exceeded.');

    try {
      const c = (assessment.result?.competencies ?? {}) as Record<string, any>;
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
      const weakest =
        COMPETENCY_LABELS[ranked[ranked.length - 1]?.[0]] ?? 'N/A';

      // No name, email, or other identifier is included in the prompt.
      const userPrompt = `Write a STEM benchmark report.

Class level: ${assessment.classLevel}
Difficulty: ${assessment.difficulty}
Responses recorded: ${assessment.responses.length}
Overall score: ${overall}/900
Percentile (India): ${percentiles['India'] ?? 'N/A'}
Percentile (Global): ${percentiles['Global'] ?? 'N/A'}

Competency scores:
${competencyLines}

Strongest competency: ${strongest}
Weakest competency: ${weakest}

Return the JSON report now.`;

      const routerKey = process.env.OPENROUTER_API_KEY;
      const apiKey = routerKey || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('Missing AI API key');

      const openai = new OpenAI({
        apiKey,
        baseURL: routerKey ? 'https://openrouter.ai/api/v1' : undefined,
      });

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

      await ctx.runMutation(api.ai.saveReport, {
        assessmentId: args.assessmentId,
        userId: user._id,
        aiInsights: {
          overallAssessment: parsed.data.overallAssessment,
          keyStrengths: parsed.data.keyStrengths,
          growthAreas: parsed.data.growthAreas,
          learningPath: parsed.data.learningPath,
          parentGuidance: parsed.data.parentGuidance,
        },
        actionPlan: parsed.data.actionPlan,
        modelUsed: completion.model,
      });

      return true;
    } catch (e) {
      // Give the quota back when generation failed rather than succeeded.
      await ctx.runMutation(api.ai.incrementQuota, { userId: user._id });
      throw e instanceof Error ? e : new Error('Failed to generate AI report');
    }
  },
});

/** Internal: returns the caller's own assessment. Never exposes another user's. */
export const getOwnAssessment = query({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, args) => {
    const { user, assessment } = await requireOwnedAssessment(ctx, args.assessmentId);
    return { user, assessment };
  },
});

/** Public report read, ownership-checked. Replaces the old unguarded variant. */
export const getAssessmentData = query({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, args) => {
    const { user, assessment } = await requireOwnedAssessment(ctx, args.assessmentId);
    return { assessment, user };
  },
});

export const checkAndDecrementQuota = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Only ever adjusts the caller's own quota.
    const caller = await requireUser(ctx);
    if (caller._id !== args.userId) throw new Error('Not authorized');

    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    const today = new Date().toISOString().slice(0, 10);
    let used = user.aiReportsUsedToday ?? 0;
    if (user.quotaDate !== today) {
      used = 0;
      await ctx.db.patch(args.userId, { quotaDate: today, aiReportsUsedToday: 0 });
    }

    if (used >= dailyQuota()) return false;

    await ctx.db.patch(args.userId, { aiReportsUsedToday: used + 1 });
    return true;
  },
});

export const incrementQuota = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const caller = await requireUser(ctx);
    if (caller._id !== args.userId) throw new Error('Not authorized');

    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const used = user.aiReportsUsedToday ?? 0;
    if (used > 0) {
      await ctx.db.patch(args.userId, { aiReportsUsedToday: used - 1 });
    }
  },
});

export const saveReport = mutation({
  args: {
    assessmentId: v.id('assessments'),
    userId: v.id('users'),
    aiInsights: v.object({
      overallAssessment: v.string(),
      keyStrengths: v.array(v.string()),
      growthAreas: v.array(v.string()),
      learningPath: v.string(),
      parentGuidance: v.string(),
    }),
    actionPlan: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        category: v.union(
          v.literal('course'),
          v.literal('project'),
          v.literal('practice'),
          v.literal('resource'),
          v.literal('retest'),
        ),
        difficulty: v.union(
          v.literal('beginner'),
          v.literal('intermediate'),
          v.literal('advanced'),
        ),
        estimatedDuration: v.optional(v.string()),
      }),
    ),
    modelUsed: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedAssessment(ctx, args.assessmentId);

    const reportId = await ctx.db.insert('reports', {
      userId: args.userId,
      assessmentId: args.assessmentId,
      aiInsights: args.aiInsights,
      actionPlan: args.actionPlan,
      generatedAt: new Date().toISOString(),
      aiModelUsed: args.modelUsed,
    });

    await ctx.db.patch(args.assessmentId, { reportId });
    return reportId;
  },
});

export const getReport = query({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, args) => {
    const { assessment } = await requireOwnedAssessment(ctx, args.assessmentId);
    if (!assessment.reportId) return null;
    return await ctx.db.get(assessment.reportId);
  },
});
