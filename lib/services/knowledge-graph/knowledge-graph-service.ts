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

  /** Live read of the user's concepts from their last-good KG snapshot. */
  async listConcepts(userId: string): Promise<Concept[]> {
    try {
      return await conceptRepository.findAllConceptsFromDb(userId)
    } catch (error) {
      console.error('[v0] knowledgeGraphService.listConcepts error:', error)
      return []
    }
  },

  /** Live read of the user's graph connections from their last-good KG snapshot. */
  async listConnections(userId: string): Promise<ConceptConnection[]> {
    try {
      return await conceptRepository.findAllConnectionsFromDb(userId)
    } catch (error) {
      console.error('[v0] knowledgeGraphService.listConnections error:', error)
      return []
    }
  },

  async generate(userId: string): Promise<KnowledgeGraph> {
    return getAIProvider().generateKnowledgeGraph(userId)
  },
}
