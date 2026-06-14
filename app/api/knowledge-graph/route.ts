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
  const [concepts, connections] = await Promise.all([
    knowledgeGraphService.listConcepts(),
    knowledgeGraphService.listConnections(),
  ])
  return ok({
    concepts,
    connections,
    // journey has no DynamoDB equivalent; remains a synchronous mock read.
    journey: knowledgeGraphService.getJourney(),
  })
}
