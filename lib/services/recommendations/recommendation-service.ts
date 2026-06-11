/**
 * Recommendation service.
 *
 * Surfaces AI coach recommendations and learning intelligence. Reads are
 * synchronous today; generation is delegated to the active AI provider.
 */
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import { getAIProvider } from '@/lib/services/ai'
import type { LearningIntelligence, Recommendation } from '@/types'

export const recommendationService = {
  getRecommendations(): Recommendation {
    return analyticsRepository.recommendations()
  },
  getLearningIntelligence(): LearningIntelligence {
    return analyticsRepository.learningIntelligence()
  },
  async generate(userId: string): Promise<Recommendation> {
    return getAIProvider().generateRecommendations(userId)
  },
}
