/**
 * Recommendations (AI Coach) API — real, deterministic data.
 *
 * GET: Computes personalized coaching recommendations deterministically from
 * the authenticated user's real concepts, quiz attempts, and study sessions
 * (no AI scores, no mock). Returns an empty recommendation when the user has no
 * tracked concepts yet.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { recommendationService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = await authService.getCurrentUser()
  const recommendation = await recommendationService.computeForUser(user.id ?? '')
  return ok(recommendation)
}
