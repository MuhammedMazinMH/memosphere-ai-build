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
import { isDatabaseConnected, getItem, buildKey } from '@/db/client'
import type { Concept, ConceptConnection } from '@/types'

/**
 * Snapshot item shape stored in knowledgeGraphNodes by knowledge-graph-repository.
 * We read it here so metric services can get the user's real concepts without
 * duplicating the persistence logic.
 */
interface GraphSnapshot {
  id: string
  concepts: Concept[]
  connections: ConceptConnection[]
  [key: string]: unknown
}

function snapshotId(userId: string): string {
  return `lastgood#${userId}`
}

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

  /**
   * Reads the user's concepts from their last-good KG snapshot (stored in
   * knowledgeGraphNodes by key "lastgood#<userId>"). This ensures metric
   * services only see the user's own AI-generated concepts — never seeded or
   * other users' rows. Returns [] when the user has no snapshot yet.
   */
  async findAllConceptsFromDb(userId: string): Promise<Concept[]> {
    if (!userId || !isDatabaseConnected()) return []
    try {
      const item = await getItem<GraphSnapshot>(
        'knowledgeGraphNodes',
        buildKey('knowledgeGraphNodes', snapshotId(userId)),
      )
      return item?.concepts ?? []
    } catch {
      return []
    }
  },

  /**
   * Reads the user's edges from their last-good KG snapshot. Returns [] when
   * no snapshot exists yet.
   */
  async findAllConnectionsFromDb(userId: string): Promise<ConceptConnection[]> {
    if (!userId || !isDatabaseConnected()) return []
    try {
      const item = await getItem<GraphSnapshot>(
        'knowledgeGraphNodes',
        buildKey('knowledgeGraphNodes', snapshotId(userId)),
      )
      return item?.connections ?? []
    } catch {
      return []
    }
  },
}
