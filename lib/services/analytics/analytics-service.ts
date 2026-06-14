/**
 * Analytics service.
 *
 * Surfaces dashboard analytics: activity feed, growth/study time-series, and
 * admin aggregate stats. Reads are synchronous today (mock data) and become
 * SQL aggregates once Aurora is connected — without changing the UI.
 */
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import type {
  Activity,
  AdminStats,
  ExamReadiness,
  KnowledgeGrowthPoint,
  StudyActivityPoint,
} from '@/types'

export const analyticsService = {
  getRecentActivity(): Activity[] {
    return analyticsRepository.recentActivity()
  },
  getKnowledgeGrowth(): KnowledgeGrowthPoint[] {
    return analyticsRepository.knowledgeGrowth()
  },
  getStudyActivity(): StudyActivityPoint[] {
    return analyticsRepository.studyActivity()
  },
  getAdminStats(): AdminStats {
    return analyticsRepository.adminStats()
  },

  /** Live read of a user's study activity from DynamoDB with mock fallback. */
  async listStudyActivity(userId: string): Promise<StudyActivityPoint[]> {
    try {
      return await analyticsRepository.studyActivityFromDb(userId)
    } catch (error) {
      console.error('[v0] analyticsService.listStudyActivity DynamoDB error:', error)
      return analyticsRepository.studyActivity()
    }
  },

  /**
   * Live read of all stored exam-readiness items from DynamoDB (admin scope),
   * with mock fallback. Note: `getAdminStats()` (AdminStats aggregate) has no
   * direct DynamoDB equivalent and remains mock-only; this exposes the raw
   * exam-readiness scan that `allExamReadinessFromDb` provides.
   */
  async listAllExamReadiness(): Promise<ExamReadiness[]> {
    try {
      return await analyticsRepository.allExamReadinessFromDb()
    } catch (error) {
      console.error('[v0] analyticsService.listAllExamReadiness DynamoDB error:', error)
      return analyticsRepository.examReadiness()
    }
  },
}
