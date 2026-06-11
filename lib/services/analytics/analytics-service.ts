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
}
