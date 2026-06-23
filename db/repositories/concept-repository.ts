/**
 * Concept / knowledge-graph repository — Amazon DynamoDB.
 *
 * Concepts and their connections form the knowledge graph. In DynamoDB they map
 * to the `concepts` and `knowledgeGraphEdges` tables (graph nodes are stored in
 * `concepts`; edges in `knowledgeGraphEdges` keyed by source/target).
 *
 * There is NO mock/seed data here. Synchronous methods return empty arrays so
 * an unwired or empty-database state renders a clean empty graph rather than
 * fabricated demo concepts. The async `*FromDb` methods read live data and
 * fall back to empty on absence/error.
 */
import { isDatabaseConnected, scanAll } from '@/db/client'
import type { Concept, ConceptConnection } from '@/types'

export const conceptRepository = {
  findAllConcepts(): Concept[] {
    return []
  },

  findAllConnections(): ConceptConnection[] {
    return []
  },

  /** Ordered list of concept ids representing the learner's journey. */
  findJourney(): string[] {
    return []
  },

  /** Live read of all concepts from DynamoDB (Scan); empty otherwise. */
  async findAllConceptsFromDb(): Promise<Concept[]> {
    if (!isDatabaseConnected()) return []
    return scanAll<Concept>('concepts')
  },

  /** Live read of all graph edges from DynamoDB (Scan); empty otherwise. */
  async findAllConnectionsFromDb(): Promise<ConceptConnection[]> {
    if (!isDatabaseConnected()) return []
    return scanAll<ConceptConnection>('knowledgeGraphEdges')
  },
}
