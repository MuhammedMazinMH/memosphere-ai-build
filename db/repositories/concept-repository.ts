/**
 * Concept / knowledge-graph repository.
 *
 * Production note:
 * - Concepts and their connections form the knowledge graph. In Aurora these
 *   map to `concepts` and `concept_connections` tables, user-scoped.
 */
import { getMockTables } from '@/db/client'
import type { Concept, ConceptConnection } from '@/types'

export const conceptRepository = {
  findAllConcepts(): Concept[] {
    // TODO(aurora): SELECT * FROM concepts WHERE user_id = $1
    return getMockTables().concepts
  },

  findAllConnections(): ConceptConnection[] {
    // TODO(aurora): SELECT * FROM concept_connections WHERE user_id = $1
    return getMockTables().conceptConnections
  },

  /** Ordered list of concept ids representing the learner's journey. */
  findJourney(): string[] {
    return getMockTables().conceptJourney
  },
}
