/**
 * Learning gaps API — real, deterministic data.
 *
 * GET: Computes the authenticated user's learning gaps deterministically from
 * their real concepts (no AI, no mock). Returns an empty array when the user
 * has no tracked concepts yet.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { learningGapService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = await authService.getCurrentUser()
  const gaps = await learningGapService.computeForUser(user.id ?? '')
  return ok(gaps)
}
