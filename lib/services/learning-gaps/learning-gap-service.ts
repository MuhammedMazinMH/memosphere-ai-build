/**
 * Learning gap service.
 *
 * Gaps are computed deterministically (no AI, no mock) from the user's real
 * concepts, read from their last-good KG snapshot (knowledgeGraphNodes table,
 * key "lastgood#<userId>"). Returns an empty set until the user has generated
 * a knowledge graph — never seed/placeholder topics.
 */
import { conceptRepository } from '@/db/repositories/concept-repository'
import { computeLearningGaps } from '@/lib/services/metrics/metric-calculators'
import type { GapTopic } from '@/types'

export const learningGapService = {
  /**
   * Deterministically computes the authenticated user's learning gaps from
   * their real concepts (per-concept mastery → status). Never throws — returns
   * [] on error or when the user has no tracked concepts yet.
   */
  async computeForUser(userId: string): Promise<GapTopic[]> {
    if (!userId) return []
    try {
      const concepts = await conceptRepository.findAllConceptsFromDb(userId)
      return computeLearningGaps(concepts)
    } catch (error) {
      console.error('[v0] learningGapService.computeForUser error:', error)
      return []
    }
  },
}
