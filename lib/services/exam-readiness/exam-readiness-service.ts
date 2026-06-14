/**
 * Exam readiness service.
 *
 * Reads per-subject exam readiness scores. Calculation is delegated to the
 * active AI provider; reads are synchronous today (mock data).
 */
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import { getAIProvider } from '@/lib/services/ai'
import type { ExamReadiness } from '@/types'

export const examReadinessService = {
  getReadiness(): ExamReadiness[] {
    return analyticsRepository.examReadiness()
  },

  /** Live read of a user's exam readiness from DynamoDB with mock fallback. */
  async listReadiness(userId: string): Promise<ExamReadiness[]> {
    try {
      return await analyticsRepository.examReadinessFromDb(userId)
    } catch (error) {
      console.error('[v0] examReadinessService.listReadiness DynamoDB error:', error)
      return analyticsRepository.examReadiness()
    }
  },

  async calculate(userId: string): Promise<ExamReadiness[]> {
    return getAIProvider().calculateExamReadiness(userId)
  },
}
