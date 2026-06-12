/**
 * Concept / knowledge-graph repository — Amazon DynamoDB.
 *
 * Concepts and their connections form the knowledge graph. In DynamoDB they map
 * to the `concepts` and `knowledgeGraphEdges` tables (graph nodes are stored in
 * `concepts`; edges in `knowledgeGraphEdges` keyed by source/target).
 * Synchronous methods serve demo data; async `*FromDb` methods read live data.
 */
import { getMockTables, isDatabaseConnected, scanAll } from '@/db/client'
import type { Concept, ConceptConnection } from '@/types'

export const conceptRepository = {
  findAllConcepts(): Concept[] {
    return getMockTables().concepts
  },

  findAllConnections(): ConceptConnection[] {
    return getMockTables().conceptConnections
  },

  /** Ordered list of concept ids representing the learner's journey. */
  findJourney(): string[] {
    return getMockTables().conceptJourney
  },

  /** Live read of all concepts from DynamoDB (Scan), with demo fallback. */
  async findAllConceptsFromDb(): Promise<Concept[]> {
    if (!isDatabaseConnected()) return this.findAllConcepts()
    return scanAll<Concept>('concepts')
  },

  /** Live read of all graph edges from DynamoDB (Scan), with demo fallback. */
  async findAllConnectionsFromDb(): Promise<ConceptConnection[]> {
    if (!isDatabaseConnected()) return this.findAllConnections()
    return scanAll<ConceptConnection>('knowledgeGraphEdges')
  },
}
