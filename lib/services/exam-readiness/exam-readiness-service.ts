/**
 * Exam readiness service.
 *
 * Per-subject readiness is computed deterministically (no AI, no mock) from the
 * user's real concepts, quiz attempts, and study sessions by the metric
 * calculators. Concepts are not yet persisted per user, so readiness honestly
 * resolves to an empty set until that system exists.
 */
import { conceptRepository } from '@/db/repositories/concept-repository'
import { quizRepository } from '@/db/repositories/quiz-repository'
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import { computeExamReadiness } from '@/lib/services/metrics/metric-calculators'
import type { ExamReadiness } from '@/types'

export const examReadinessService = {
  /**
   * Deterministically computes per-subject exam readiness for the authenticated
   * user. Never throws — returns [] on error or when the user has no concepts.
   */
  async computeForUser(userId: string): Promise<ExamReadiness[]> {
    if (!userId) return []
    try {
      const [concepts, quizAttempts, sessions] = await Promise.all([
        conceptRepository.findAllConceptsFromDb(userId),
        quizRepository.findAttempts(userId),
        analyticsRepository.studyActivityFromDb(userId),
      ])
      return computeExamReadiness(concepts, quizAttempts, sessions)
    } catch (error) {
      console.error('[v0] examReadinessService.computeForUser error:', error)
      return []
    }
  },
}
