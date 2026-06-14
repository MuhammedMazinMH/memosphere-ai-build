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

  /** Live read of all concepts from DynamoDB with mock fallback. */
  async listConcepts(): Promise<Concept[]> {
    try {
      return await conceptRepository.findAllConceptsFromDb()
    } catch (error) {
      console.error('[v0] knowledgeGraphService.listConcepts DynamoDB error:', error)
      return conceptRepository.findAllConcepts()
    }
  },

  /** Live read of all graph connections from DynamoDB with mock fallback. */
  async listConnections(): Promise<ConceptConnection[]> {
    try {
      return await conceptRepository.findAllConnectionsFromDb()
    } catch (error) {
      console.error('[v0] knowledgeGraphService.listConnections DynamoDB error:', error)
      return conceptRepository.findAllConnections()
    }
  },

  async generate(userId: string): Promise<KnowledgeGraph> {
    return getAIProvider().generateKnowledgeGraph(userId)
  },
}
