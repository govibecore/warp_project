import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { requireAdmin } from './lib/auth';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Admin analytics.
 *
 * Every entry point here is gated by requireAdmin. Nothing in this module is
 * reachable by an anonymous or student caller.
 */

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const oneWeekAgo = now - 7 * DAY_MS;
    const oneDayAgo = now - DAY_MS;

    // Index-backed counts instead of a full table scan where possible.
    const allStudents = await ctx.db.query('users').collect();
    const completed = await ctx.db
      .query('assessments')
      .withIndex('by_status', (q) => q.eq('status', 'completed'))
      .collect();

    const studentsThisWeek = allStudents.filter(
      (s) => s._creationTime >= oneWeekAgo,
    ).length;

    let totalScore = 0;
    let scored = 0;
    let assessmentsToday = 0;

    for (const a of completed) {
      if (a.result) {
        scored += 1;
        totalScore += a.result.overallScore;
      }
      if (a._creationTime >= oneDayAgo) assessmentsToday += 1;
    }

    const avgScore = scored > 0 ? Math.round(totalScore / scored) : 0;
    const totalAssessments = (await ctx.db.query('assessments').collect()).length;
    const completionRate =
      totalAssessments > 0 ? Math.round((scored / totalAssessments) * 100) : 0;

    return {
      totalStudents: allStudents.length,
      studentsThisWeek,
      assessmentsToday,
      avgScore,
      completionRate,
      completedAssessments: scored,
    };
  },
});

export const getChartData = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const thirtyDaysAgo = Date.now() - 30 * DAY_MS;
    const recent = await ctx.db
      .query('assessments')
      .withIndex('by_status', (q) => q.eq('status', 'completed'))
      .collect();

    const byDate = new Map<string, number>();
    for (const a of recent) {
      if (a._creationTime < thirtyDaysAgo) continue;
      const key = new Date(a._creationTime).toISOString().slice(0, 10);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }

    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, count]) => ({ _id: date.slice(5), assessments: count }));
  },
});

async function summariseStudent(ctx: QueryCtx, user: Doc<'users'>) {
  const assessments = await ctx.db
    .query('assessments')
    .withIndex('by_userId', (q) => q.eq('userId', user._id))
    .collect();

  const completed = assessments
    .filter((a) => a.status === 'completed' && a.result)
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    currentClass: user.currentClass ?? 0,
    joinedAt: new Date(user._creationTime).toISOString(),
    assessmentsCount: assessments.length,
    lastScore: completed.length > 0 ? (completed[completed.length - 1].result?.overallScore ?? null) : null,
  };
}

export const getStudents = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Unfiltered reads use the native paginator so cursors stay opaque. Convex
    // has no case-insensitive text index, so a search narrows the set in memory
    // first and paginates the result by row position.
    if (!args.search) {
      const result = await ctx.db.query('users').order('desc').paginate(args.paginationOpts);
      return {
        ...result,
        page: await Promise.all(result.page.map((u) => summariseStudent(ctx, u))),
      };
    }

    const needle = args.search.trim().toLowerCase();
    const matches = (await ctx.db.query('users').order('desc').collect()).filter(
      (u) =>
        u.fullName.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
    );

    const cursor = args.paginationOpts.cursor;
    const start = cursor ? matches.findIndex((u) => u._id === cursor) + 1 : 0;
    const slice = matches.slice(start, start + args.paginationOpts.numItems);
    const last = slice[slice.length - 1];
    const end = start + slice.length;

    return {
      page: await Promise.all(slice.map((u) => summariseStudent(ctx, u))),
      isDone: end >= matches.length,
      continueCursor: last?._id ?? '',
    };
  },
});

export const getScenarios = query({
  args: {
    paginationOpts: paginationOptsValidator,
    classLevel: v.optional(v.number()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // by_class_diff is (classLevel, difficulty), so it only helps when a class
    // level is supplied. Fall back to the full list otherwise.
    const classLevel = args.classLevel;
    let scenarios =
      classLevel !== undefined
        ? await ctx.db
            .query('scenarios')
            .withIndex('by_class_diff', (q) => q.eq('classLevel', classLevel))
            .collect()
        : await ctx.db.query('scenarios').collect();

    if (args.difficulty) {
      scenarios = scenarios.filter((s) => s.difficulty === args.difficulty);
    }

    scenarios.sort((a, b) => a.scenarioId.localeCompare(b.scenarioId));

    const offset = args.paginationOpts.cursor
      ? scenarios.findIndex((s) => s._id === args.paginationOpts.cursor) + 1
      : 0;
    const slice = scenarios.slice(offset, offset + args.paginationOpts.numItems);
    const end = offset + slice.length;

    return {
      page: slice.map((s) => ({
        _id: s._id,
        scenarioId: s.scenarioId,
        type: s.type,
        classLevel: s.classLevel,
        difficulty: s.difficulty,
        question: s.question,
      })),
      isDone: end >= scenarios.length,
      continueCursor: slice[slice.length - 1]?._id ?? '',
    };
  },
});

export const getNorms = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Norms are a small reference table (classes x difficulties). Sorting in
    // memory keeps the UI order stable without needing a read of every shard.
    const norms = (await ctx.db.query('norms').collect()).sort(
      (a, b) => a.classLevel - b.classLevel || a.difficulty.localeCompare(b.difficulty),
    );

    return {
      norms: norms.map((n) => ({
        _id: n._id,
        classLevel: n.classLevel,
        difficulty: n.difficulty,
        mean: n.mean,
        stdDev: n.stdDev,
        competencyThresholds: n.competencyThresholds,
      })),
    };
  },
});
