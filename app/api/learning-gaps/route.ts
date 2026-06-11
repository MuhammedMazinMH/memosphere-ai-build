/**
 * Learning gaps API (AI seam — Gemini by default).
 *
 * Production note:
 * - Returns detected learning gaps. Detection is delegated to the active AI
 *   provider via learningGapService; reads are synchronous today.
 */
import { learningGapService } from '@/lib/services'
import { ok } from '@/lib/api/response'

export async function GET() {
  return ok(learningGapService.getGaps())
}
