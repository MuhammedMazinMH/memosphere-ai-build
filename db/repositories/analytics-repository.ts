/**
 * Analytics repository — Amazon DynamoDB.
 *
 * Aggregations (growth over time, study activity, admin stats, learning
 * intelligence) are computed from underlying tables. Several map directly to
 * DynamoDB tables: `studySessions`, `recommendations`, `examReadiness`.
 * Synchronous methods serve demo data; async `*FromDb` methods read live data
 * where a dedicated table exists.
 */
import {
  getMockTables,
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

export const analyticsRepository = {
  knowledgeGrowth(): KnowledgeGrowthPoint[] {
    return getMockTables().knowledgeGrowth
  },
  studyActivity(): StudyActivityPoint[] {
    return getMockTables().studyActivity
  },
  recentActivity(): Activity[] {
    return getMockTables().activity
  },
  adminStats(): AdminStats {
    return getMockTables().adminStats
  },
  learningIntelligence(): LearningIntelligence {
    return getMockTables().learningIntelligence
  },
  learningGaps(): GapTopic[] {
    return getMockTables().learningGaps
  },
  examReadiness(): ExamReadiness[] {
    return getMockTables().examReadiness
  },
  recommendations(): Recommendation {
    return getMockTables().recommendations
  },

  /** Live read of a user's exam readiness (Query by userId), demo fallback. */
  async examReadinessFromDb(userId: string): Promise<ExamReadiness[]> {
    if (!isDatabaseConnected()) return this.examReadiness()
    return queryByPartition<ExamReadiness>('examReadiness', userId)
  },

  /** Live read of a user's recommendations (GetItem), demo fallback. */
  async recommendationsFromDb(userId: string): Promise<Recommendation> {
    if (!isDatabaseConnected()) return this.recommendations()
    const item = await getItem<Recommendation>(
      'recommendations',
      buildKey('recommendations', userId),
    )
    return item ?? this.recommendations()
  },

  /** Live read of a user's study sessions (Query by userId), demo fallback. */
  async studyActivityFromDb(userId: string): Promise<StudyActivityPoint[]> {
    if (!isDatabaseConnected()) return this.studyActivity()
    return queryByPartition<StudyActivityPoint>('studySessions', userId)
  },

  /** Live read of all stored exam-readiness items (admin Scan), demo fallback. */
  async allExamReadinessFromDb(): Promise<ExamReadiness[]> {
    if (!isDatabaseConnected()) return this.examReadiness()
    return scanAll<ExamReadiness>('examReadiness')
  },
}
