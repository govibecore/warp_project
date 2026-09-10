import { QueryCtx, MutationCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

/**
 * Shared authorization helpers.
 *
 * Every Convex entry point must resolve identity explicitly. Nothing in this
 * module is exported as a Convex function, so it stays invisible to clients.
 */

type AnyCtx = QueryCtx | MutationCtx;

/** Resolves the caller to a user row. Throws when unauthenticated or unknown. */
export async function requireUser(ctx: AnyCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .unique();

  if (!user) throw new Error('User not found');
  return user;
}

/**
 * Resolves the caller and asserts the admin role.
 * This is the only gate that should ever protect `/admin` data.
 */
export async function requireAdmin(ctx: AnyCtx) {
  const user = await requireUser(ctx);
  if (user.role !== 'admin') {
    // Deliberately vague to the client: never reveal that the row exists.
    throw new Error('Not authorized');
  }
  return user;
}

/** Asserts the caller owns the assessment, then returns it. */
export async function requireOwnedAssessment(
  ctx: AnyCtx,
  assessmentId: Id<'assessments'>,
) {
  const user = await requireUser(ctx);
  const assessment = await ctx.db.get(assessmentId);
  if (!assessment) throw new Error('Assessment not found');
  if (assessment.userId !== user._id) throw new Error('Not authorized');
  return { user, assessment };
}
