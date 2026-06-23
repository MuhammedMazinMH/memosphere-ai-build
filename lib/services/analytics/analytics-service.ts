/**
 * Analytics service.
 *
 * Surfaces dashboard analytics: activity feed, growth/study time-series, and
 * admin aggregate stats. All user-facing numbers are computed deterministically
 * from real DynamoDB records by the metric calculators — no mock data, no AI.
 */
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import { documentRepository } from '@/db/repositories/document-repository'
import { quizRepository } from '@/db/repositories/quiz-repository'
import {
  computeDashboardMetrics,
  type DashboardMetrics,
} from '@/lib/services/metrics/metric-calculators'
import type {
  Activity,
  AdminStats,
  Document,
  ExamReadiness,
  KnowledgeGrowthPoint,
  StudyActivityPoint,
} from '@/types'

/** Human-friendly relative time for an epoch-ms timestamp (deterministic vs now). */
function relativeTime(epochMs: number): string {
  const diff = Date.now() - epochMs
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(epochMs).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** Derives the recent-activity feed from a user's real uploaded documents. */
function deriveRecentActivity(documents: Document[]): Activity[] {
  return [...documents]
    .sort((a, b) => (b.uploadedAt ?? 0) - (a.uploadedAt ?? 0))
    .slice(0, 8)
    .map((doc) => ({
      id: `act_${doc.id}`,
      action: 'Uploaded',
      target: doc.title,
      time: relativeTime(doc.uploadedAt),
      type: 'upload' as const,
    }))
}

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

  /**
   * Computes the authenticated user's full dashboard metric set from real
   * DynamoDB records. Documents drive counts/growth; study sessions drive
   * activity/streak; quiz attempts feed readiness. Concepts are not yet
   * persisted per user, so concept-derived figures honestly resolve to 0 until
   * that system exists. Never throws — degrades to zero-value metrics on error.
   */
  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    try {
      const [documents, sessions, quizAttempts] = await Promise.all([
        documentRepository.findByUserFromDb(userId),
        analyticsRepository.studyActivityFromDb(userId),
        quizRepository.findAttempts(userId),
      ])
      return computeDashboardMetrics({
        concepts: [],
        documents,
        sessions,
        quizAttempts,
        recentActivity: deriveRecentActivity(documents),
      })
    } catch (error) {
      console.error('[v0] analyticsService.getDashboardMetrics error:', error)
      return computeDashboardMetrics({
        concepts: [],
        documents: [],
        sessions: [],
        quizAttempts: [],
      })
    }
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
