/**
 * Concepts API.
 *
 * Production note:
 * - Returns concept nodes. Extraction from documents is delegated to the AI
 *   provider via knowledgeGraphService; reads are synchronous today.
 */
import { knowledgeGraphService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  return ok(knowledgeGraphService.getConcepts())
}
