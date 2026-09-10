import { v } from 'convex/values';
import { query } from './_generated/server';

/**
 * Public leaderboard.
 *
 * Most learners on this platform are under 18, so this endpoint returns a
 * masked display name (first name + last initial) rather than the stored full
 * name. The signed-in learner still sees their own row marked, so the board is
 * useful without publishing a child's identity to the open internet.
 *
 * This is a public query by design; nothing here may widen to raw PII.
 */

function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export const getTopScores = query({
  args: {
    difficulty: v.optional(
      v.union(v.literal('Standard'), v.literal('Advanced'), v.literal('Olympiad')),
    ),
    classLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const currentUser = identity
      ? await ctx.db
          .query('users')
          .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
          .unique()
      : null;

    // Score lives inside `result`, so there is no index to sort by. Index on
    // status first to avoid reading in-progress rows, then sort the slice.
    const completed = await ctx.db
      .query('assessments')
      .withIndex('by_status', (q) => q.eq('status', 'completed'))
      .collect();

    const scored = completed
      .filter((a) => a.result)
      .filter((a) => args.classLevel === undefined || a.classLevel === args.classLevel)
      .filter((a) => args.difficulty === undefined || a.difficulty === args.difficulty)
      .sort((a, b) => (b.result?.overallScore ?? 0) - (a.result?.overallScore ?? 0))
      .slice(0, 100);

    return Promise.all(
      scored.map(async (assessment) => {
        const user = await ctx.db.get(assessment.userId);
        const score = assessment.result?.overallScore ?? 0;
        return {
          id: assessment._id,
          studentName: user ? maskName(user.fullName) : 'Anonymous learner',
          isCurrentUser: Boolean(currentUser && currentUser._id === assessment.userId),
          classLevel: assessment.classLevel,
          difficulty: assessment.difficulty,
          overallScore: score,
          globalPercentile: assessment.result?.regionalPercentiles?.Global ?? 0,
          completedAt: assessment.completedAt ?? new Date(assessment._creationTime).toISOString(),
        };
      }),
    );
  },
});
