/**
 * Knowledge graph service.
 *
 * Reads concept nodes/edges for the graph view. Generation (synthesizing the
 * graph from documents) is delegated to the active AI provider.
 */
import { conceptRepository } from '@/db/repositories/concept-repository'
import { getAIProvider } from '@/lib/services/ai'
import type { KnowledgeGraph } from '@/lib/services/ai/ai-provider'
import type { Concept, ConceptConnection } from '@/types'

export const knowledgeGraphService = {
  getConcepts(): Concept[] {
    return conceptRepository.findAllConcepts()
  },
  getConnections(): ConceptConnection[] {
    return conceptRepository.findAllConnections()
  },
  getJourney(): string[] {
    return conceptRepository.findJourney()
  },
  async generate(userId: string): Promise<KnowledgeGraph> {
    return getAIProvider().generateKnowledgeGraph(userId)
  },
}
