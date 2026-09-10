import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Gets the currently authenticated user.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Look up the user by their Clerk ID
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();
      
    return user;
  },
});

/**
 * Ensures the currently authenticated user exists in the Convex database.
 * This should be called early in the app lifecycle (or from a Clerk Webhook).
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Called storeUser without authentication present');
    }

    // Check if we already have this user
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (existingUser) {
      // Update their profile picture or name if it changed
      if (existingUser.fullName !== identity.name) {
        await ctx.db.patch(existingUser._id, {
          fullName: identity.name ?? 'Anonymous Learner',
        });
      }
      return existingUser._id;
    }

    // Create a new user
    const newUserId = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email: identity.email ?? '',
      fullName: identity.name ?? 'Anonymous Learner',
      currentClass: 8, // Default fallback
      difficultyPreference: 'standard', // Default fallback
      role: 'student',
    });

    return newUserId;
  },
});

/**
 * Updates user preferences (class level, difficulty)
 */
export const updatePreferences = mutation({
  args: {
    currentClass: v.number(),
    difficultyPreference: v.union(v.literal('standard'), v.literal('advanced'), v.literal('olympiad')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found in Convex database');
    }

    await ctx.db.patch(user._id, {
      currentClass: args.currentClass,
      difficultyPreference: args.difficultyPreference,
    });

    return true;
  },
});

/**
 * Permanently deletes the authenticated user and all associated data:
 * assessments, reports, and the user record itself.
 *
 * The leaderboard reads from the `assessments` table, so deleting those rows
 * makes the user disappear from the board automatically.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      // Already deleted or never existed — treat as success (idempotent).
      return true;
    }

    // Delete all reports belonging to this user.
    const reports = await ctx.db
      .query('reports')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    for (const report of reports) {
      await ctx.db.delete(report._id);
    }

    // Delete all assessments belonging to this user.
    const assessments = await ctx.db
      .query('assessments')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    for (const assessment of assessments) {
      await ctx.db.delete(assessment._id);
    }

    // Delete the user record itself.
    await ctx.db.delete(user._id);

    return true;
  },
});
