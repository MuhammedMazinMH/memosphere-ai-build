/**
 * Auth API (Clerk seam).
 *
 * Production note:
 * - Clerk will own sessions. This route returns the current mock user today;
 *   later it should read the session via Clerk's server helpers and look the
 *   profile up through authService.
 */
import { authService } from '@/lib/services/auth/auth-service'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = authService.getCurrentUser()
  return ok({ user })
}
