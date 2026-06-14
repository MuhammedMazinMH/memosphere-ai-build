/**
 * Recommendations API (AI seam — Gemini by default).
 *
 * Production note:
 * - Returns AI coach recommendations. Generation is delegated to the active
 *   AI provider via recommendationService; reads are synchronous today.
 */
import { recommendationService } from '@/lib/services'
import { authService } from '@/lib/services/auth/auth-service'
import { ok } from '@/lib/api/response'

export async function GET() {
  const userId = authService.getCurrentUser().id ?? ''
  return ok(await recommendationService.listRecommendations(userId))
}
