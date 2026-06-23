/**
 * Analytics repository — Amazon DynamoDB.
 *
 * Aggregations (growth over time, study activity, admin stats, learning
 * intelligence) are computed from underlying tables. Several map directly to
 * DynamoDB tables: `studySessions`, `recommendations`, `examReadiness`.
 *
 * There is NO mock/seed data here. Synchronous methods return neutral
 * zero-value structures (empty arrays / zeroed objects) so any caller that has
 * not yet been wired to a live source renders a clean empty state rather than
 * fabricated demo data. The async `*FromDb` methods read real, per-user data
 * from DynamoDB and fall back to the same zero values on absence/error.
 */
import {
  isDatabaseConnected,
  getItem,
  buildKey,
  queryByPartition,
  scanAll,
} from '@/db/client'
import type {
  Activity,
  AdminStats,
  ExamReadiness,
  GapTopic,
  KnowledgeGrowthPoint,
  LearningIntelligence,
  Recommendation,
  StudyActivityPoint,
} from '@/types'

/* -------------------------------------------------------------------------- */
/* Zero-value structures (no mock/seed)                                       */
/* -------------------------------------------------------------------------- */

const EMPTY_ADMIN_STATS: AdminStats = {
  totalUsers: 0,
  totalDocuments: 0,
  totalConcepts: 0,
  activeToday: 0,
  userGrowth: [],
  engagement: [],
}

const EMPTY_LEARNING_INTELLIGENCE: LearningIntelligence = {
  mostStudied: { concept: '', subject: '', sessions: 0 },
  weakest: { concept: '', subject: '', mastery: 0 },
  fastestImproving: { subject: '', delta: 0 },
  consistency: 0,
  coverage: 0,
  aiConfidence: 0,
  weeklyInsights: [],
}

const EMPTY_RECOMMENDATION: Recommendation = {
  nextTopic: { mastered: '', recommended: '', subject: '', reason: '', confidence: 0 },
  weakAreas: [],
  knowledgeGaps: [],
  studyPath: [],
  examReadiness: { current: 0, potential: 0, hoursNeeded: 0, examName: '' },
}

export const analyticsRepository = {
  knowledgeGrowth(): KnowledgeGrowthPoint[] {
    return []
  },
  studyActivity(): StudyActivityPoint[] {
    return []
  },
  recentActivity(): Activity[] {
    return []
  },
  adminStats(): AdminStats {
    return EMPTY_ADMIN_STATS
  },
  learningIntelligence(): LearningIntelligence {
    return EMPTY_LEARNING_INTELLIGENCE
  },
  learningGaps(): GapTopic[] {
    return []
  },
  examReadiness(): ExamReadiness[] {
    return []
  },
  recommendations(): Recommendation {
    return EMPTY_RECOMMENDATION
  },

  /** Live read of a user's exam readiness (Query by userId); empty otherwise. */
  async examReadinessFromDb(userId: string): Promise<ExamReadiness[]> {
    if (!isDatabaseConnected()) return []
    return queryByPartition<ExamReadiness>('examReadiness', userId)
  },

  /** Live read of a user's recommendations (GetItem); empty otherwise. */
  async recommendationsFromDb(userId: string): Promise<Recommendation> {
    if (!isDatabaseConnected()) return EMPTY_RECOMMENDATION
    const item = await getItem<Recommendation>(
      'recommendations',
      buildKey('recommendations', userId),
    )
    return item ?? EMPTY_RECOMMENDATION
  },

  /** Live read of a user's study sessions (Query by userId); empty otherwise. */
  async studyActivityFromDb(userId: string): Promise<StudyActivityPoint[]> {
    if (!isDatabaseConnected()) return []
    return queryByPartition<StudyActivityPoint>('studySessions', userId)
  },

  /** Live read of all stored exam-readiness items (admin Scan); empty otherwise. */
  async allExamReadinessFromDb(): Promise<ExamReadiness[]> {
    if (!isDatabaseConnected()) return []
    return scanAll<ExamReadiness>('examReadiness')
  },
}
