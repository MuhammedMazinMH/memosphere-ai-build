/**
 * Exam readiness API — real, deterministic data.
 *
 * GET: Computes per-subject readiness deterministically from the authenticated
 * user's real concepts, quiz attempts, and study sessions (no AI, no mock).
 * Returns an empty array when the user has no tracked concepts yet.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { examReadinessService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = await authService.getCurrentUser()
  const readiness = await examReadinessService.computeForUser(user.id ?? '')
  return ok(readiness)
}
