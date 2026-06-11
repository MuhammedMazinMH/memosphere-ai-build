/**
 * Recommendations API (AI seam — Gemini by default).
 *
 * Production note:
 * - Returns AI coach recommendations. Generation is delegated to the active
 *   AI provider via recommendationService; reads are synchronous today.
 */
import { recommendationService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  return ok(recommendationService.getRecommendations())
}
