import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) return [];

    const assessments = await ctx.db
      .query('assessments')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(10);

    return assessments;
  },
});

export const getById = query({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    
    if (assessment.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    return assessment;
  },
});

export const saveResult = mutation({
  args: {
    classLevel: v.number(),
    difficulty: v.union(v.literal('Standard'), v.literal('Advanced'), v.literal('Olympiad')),
    responses: v.array(v.any()),
    result: v.object({
      assessmentVersion: v.number(),
      normVersion: v.string(),
      competencies: v.any(),
      overallScore: v.number(),
      regionalPercentiles: v.any(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    const assessmentId = await ctx.db.insert('assessments', {
      userId: user._id,
      classLevel: args.classLevel,
      difficulty: args.difficulty,
      status: 'completed',
      responses: args.responses,
      startedAt: new Date().toISOString(), // In a real app we'd track start time earlier
      completedAt: new Date().toISOString(),
      result: args.result,
    });

    return assessmentId;
  },
});

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) return null;

    const assessments = await ctx.db
      .query('assessments')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    const completed = assessments.filter((a) => a.status === 'completed' && a.result);
    
    let bestGlobalPct = 0;
    for (const a of completed) {
      const gPct = a.result?.regionalPercentiles?.Global || 0;
      if (gPct > bestGlobalPct) bestGlobalPct = gPct;
    }

    const latestScore = completed.length > 0 ? completed[0].result!.overallScore : null;
    const previousScore = completed.length > 1 ? completed[1].result!.overallScore : null;
    const scoreDelta = (latestScore !== null && previousScore !== null) ? (latestScore - previousScore) : null;

    const recentAssessments = completed.slice(0, 5).map(a => ({
      id: a._id,
      classLevel: a.classLevel,
      difficulty: a.difficulty,
      score: a.result!.overallScore,
      globalPct: a.result!.regionalPercentiles.Global,
      completedAt: a.completedAt!,
      hasReport: !!a.reportId,
    }));

    return {
      totalAssessments: completed.length,
      latestScore,
      scoreDelta,
      bestGlobalPct,
      recentAssessments,
    };
  },
});
