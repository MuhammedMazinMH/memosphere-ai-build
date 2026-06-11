/**
 * Learning gap service.
 *
 * Reads detected learning gaps. Detection is delegated to the active AI
 * provider; reads are synchronous today (mock data).
 */
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import { getAIProvider } from '@/lib/services/ai'
import type { GapTopic } from '@/types'

export const learningGapService = {
  getGaps(): GapTopic[] {
    return analyticsRepository.learningGaps()
  },
  async detect(userId: string): Promise<GapTopic[]> {
    return getAIProvider().detectLearningGaps(userId)
  },
}
