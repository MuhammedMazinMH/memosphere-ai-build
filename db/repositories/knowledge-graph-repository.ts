/**
 * Knowledge graph repository — last-good graph snapshots (Amazon DynamoDB).
 *
 * Persists the most recent successfully generated knowledge graph per user so
 * the graph view can fall back to it when a later generation produces nothing
 * (AI unavailable, no documents yet, or a transient failure). This is the ONLY
 * fallback — there is no mock/seed graph.
 *
 * Storage: a single item per user in the existing `knowledgeGraphNodes` table,
 * keyed by `id = "lastgood#<userId>"`. This reuses the table's String `id`
 * partition key, so no schema change is required. The whole graph (concepts +
 * connections) is stored as attributes on that one item.
 */
import { isDatabaseConnected, getItem, putItem, buildKey } from '@/db/client'
import type { Concept, ConceptConnection } from '@/types'

/** Stored shape of a per-user last-good graph snapshot. */
interface GraphSnapshot {
  id: string
  userId: string
  concepts: Concept[]
  connections: ConceptConnection[]
  updatedAt: number
  // Index signature so the value satisfies the DynamoDB item constraint
  // (Record<string, unknown>) used by putItem/getItem.
  [key: string]: unknown
}

/** Builds the snapshot partition-key value for a user. */
function snapshotId(userId: string): string {
  return `lastgood#${userId}`
}

export const knowledgeGraphRepository = {
  /**
   * Saves a user's freshly generated graph as their last-good snapshot.
   * Best-effort: never throws, so a persistence hiccup can't fail generation.
   */
  async saveSnapshot(
    userId: string,
    graph: { concepts: Concept[]; connections: ConceptConnection[] },
  ): Promise<void> {
    if (!userId || !isDatabaseConnected()) return
    try {
      await putItem<GraphSnapshot>('knowledgeGraphNodes', {
        id: snapshotId(userId),
        userId,
        concepts: graph.concepts,
        connections: graph.connections,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error('[v0] knowledgeGraphRepository.saveSnapshot error:', error)
    }
  },

  /**
   * Loads a user's last-good graph snapshot, or null when none exists / no DB.
   * Never throws — returns null on any error so callers degrade to empty.
   */
  async loadSnapshot(
    userId: string,
  ): Promise<{ concepts: Concept[]; connections: ConceptConnection[] } | null> {
    if (!userId || !isDatabaseConnected()) return null
    try {
      const item = await getItem<GraphSnapshot>(
        'knowledgeGraphNodes',
        buildKey('knowledgeGraphNodes', snapshotId(userId)),
      )
      if (!item) return null
      return {
        concepts: item.concepts ?? [],
        connections: item.connections ?? [],
      }
    } catch (error) {
      console.error('[v0] knowledgeGraphRepository.loadSnapshot error:', error)
      return null
    }
  },
}
