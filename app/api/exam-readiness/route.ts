/**
 * Exam readiness API (AI seam — Gemini by default).
 *
 * Production note:
 * - Returns per-subject readiness scores. Calculation is delegated to the
 *   active AI provider via examReadinessService; reads are synchronous today.
 */
import { examReadinessService } from '@/lib/services'
import { authService } from '@/lib/services/auth/auth-service.server'
import { ok } from '@/lib/api/response'

export async function GET() {
  const userId = (await authService.getCurrentUser()).id ?? ''
  return ok(await examReadinessService.listReadiness(userId))
}
