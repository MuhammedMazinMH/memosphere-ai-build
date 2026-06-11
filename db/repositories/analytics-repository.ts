/**
 * Analytics repository.
 *
 * Production note:
 * - Aggregations (growth over time, study activity, admin stats, learning
 *   intelligence) will be computed via SQL aggregate queries / materialized
 *   views in Aurora. Today they read from the mock tables.
 */
import { getMockTables } from '@/db/client'
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
}
