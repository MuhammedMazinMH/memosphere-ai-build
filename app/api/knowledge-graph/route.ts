/**
 * Knowledge graph API.
 *
 * Production note:
 * - Returns graph nodes + edges + the learner journey. Graph synthesis is
 *   delegated to the active AI provider via knowledgeGraphService.
 */
import { knowledgeGraphService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  return ok({
    concepts: knowledgeGraphService.getConcepts(),
    connections: knowledgeGraphService.getConnections(),
    journey: knowledgeGraphService.getJourney(),
  })
}
