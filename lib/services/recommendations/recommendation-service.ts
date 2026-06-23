/**
 * Recommendation service (AI Learning Coach).
 *
 * All ranking and scoring is deterministic (no AI, no mock): next-best topic,
 * weak areas, knowledge gaps, study path, and predicted readiness are computed
 * from the user's real concepts, quiz attempts, and study sessions. AI may only
 * be used to rewrite qualitative prose (e.g. nextTopic.reason) — never numbers.
 * Concepts are not yet persisted per user, so this resolves to an empty
 * recommendation until that system exists.
 */
import { conceptRepository } from '@/db/repositories/concept-repository'
import { quizRepository } from '@/db/repositories/quiz-repository'
import { documentRepository } from '@/db/repositories/document-repository'
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import {
  computeRecommendations,
  computeLearningIntelligence,
} from '@/lib/services/metrics/metric-calculators'
import type { LearningIntelligence, Recommendation } from '@/types'

const EMPTY_RECOMMENDATION: Recommendation = {
  nextTopic: { mastered: '', recommended: '', subject: '', reason: '', confidence: 0 },
  weakAreas: [],
  knowledgeGaps: [],
  studyPath: [],
  examReadiness: { current: 0, potential: 0, hoursNeeded: 0, examName: '' },
}

export const recommendationService = {
  /**
   * Deterministically computes the authenticated user's coaching
   * recommendations. Never throws — returns an empty recommendation on error or
   * when the user has no tracked concepts yet.
   */
  async computeForUser(userId: string): Promise<Recommendation> {
    if (!userId) return EMPTY_RECOMMENDATION
    try {
      const [concepts, quizAttempts, sessions] = await Promise.all([
        conceptRepository.findAllConceptsFromDb(userId),
        quizRepository.findAttempts(userId),
        analyticsRepository.studyActivityFromDb(userId),
      ])
      return computeRecommendations(concepts, quizAttempts, sessions)
    } catch (error) {
      console.error('[v0] recommendationService.computeForUser error:', error)
      return EMPTY_RECOMMENDATION
    }
  },

  /**
   * Deterministically computes the user's learning-intelligence summary from
   * real concepts, study sessions, and documents. Never throws.
   */
  async computeLearningIntelligenceForUser(userId: string): Promise<LearningIntelligence> {
    try {
      const [concepts, sessions, documents] = await Promise.all([
        conceptRepository.findAllConceptsFromDb(userId),
        analyticsRepository.studyActivityFromDb(userId),
        documentRepository.findByUserFromDb(userId),
      ])
      return computeLearningIntelligence(concepts, sessions, documents)
    } catch (error) {
      console.error('[v0] recommendationService.computeLearningIntelligenceForUser error:', error)
      return computeLearningIntelligence([], [], [])
    }
  },
}
