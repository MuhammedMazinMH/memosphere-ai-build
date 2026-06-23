/**
 * Concepts API.
 *
 * Production note:
 * - Returns concept nodes. Extraction from documents is delegated to the AI
 *   provider via knowledgeGraphService; reads are synchronous today.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { knowledgeGraphService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = await authService.getCurrentUser()
  const userId = user.id ?? ''
  return ok(await knowledgeGraphService.listConcepts(userId))
}
