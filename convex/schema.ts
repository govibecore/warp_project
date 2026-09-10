import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(), // Maps to Clerk's user ID
    email: v.string(),
    fullName: v.string(),
    // Keep backwards compatibility with our Student model
    currentClass: v.optional(v.number()),
    difficultyPreference: v.optional(v.union(
      v.literal('standard'),
      v.literal('advanced'),
      v.literal('olympiad')
    )),
    // Role for admin portal access
    role: v.optional(v.union(v.literal('student'), v.literal('admin'))),
    // AI Quota (Phase 4: AI Cost Management)
    quotaDate: v.optional(v.string()),
    aiReportsUsedToday: v.optional(v.number()),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email']),

  assessments: defineTable({
    userId: v.id('users'), // Which user took this
    classLevel: v.number(),
    difficulty: v.union(v.literal('Standard'), v.literal('Advanced'), v.literal('Olympiad')),
    status: v.union(
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('abandoned'),
      v.literal('timed_out')
    ),
    responses: v.array(v.any()), // Store the responses as a generic array of objects
    startedAt: v.string(),
    completedAt: v.optional(v.string()),
    totalTimeMs: v.optional(v.number()),
    
    // Once complete, the score results are saved here
    result: v.optional(
      v.object({
        assessmentVersion: v.number(),
        normVersion: v.string(),
        competencies: v.any(),
        overallScore: v.number(),
        regionalPercentiles: v.any(),
      })
    ),
    reportId: v.optional(v.id('reports')),
  })
    .index('by_userId', ['userId'])
    .index('by_status', ['status']),

  reports: defineTable({
    userId: v.id('users'),
    assessmentId: v.id('assessments'),
    
    // AI Content
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
          v.literal('retest')
        ),
        difficulty: v.union(
          v.literal('beginner'),
          v.literal('intermediate'),
          v.literal('advanced')
        ),
        estimatedDuration: v.optional(v.string()),
        externalLink: v.optional(v.string()),
      })
    ),

    pdfUrl: v.optional(v.string()),
    pdfGeneratedAt: v.optional(v.string()),
    shareToken: v.optional(v.string()),
    shareExpiresAt: v.optional(v.string()),
    
    generatedAt: v.string(),
    aiModelUsed: v.string(),
  })
    .index('by_userId', ['userId'])
    .index('by_assessmentId', ['assessmentId']),

  scenarios: defineTable({
    scenarioId: v.string(),
    type: v.string(),
    classLevel: v.number(),
    difficulty: v.string(),
    question: v.string(),
    // Store remaining flexible data
    data: v.optional(v.any()),
  }).index('by_class_diff', ['classLevel', 'difficulty']),

  norms: defineTable({
    classLevel: v.number(),
    difficulty: v.string(),
    mean: v.number(),
    stdDev: v.number(),
    competencyThresholds: v.object({
      developing: v.number(),
      proficient: v.number(),
      advanced: v.number(),
    }),
  }).index('by_class_diff', ['classLevel', 'difficulty']),
});
