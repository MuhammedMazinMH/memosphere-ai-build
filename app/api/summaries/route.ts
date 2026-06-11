/**
 * Summaries API (AI seam — Gemini by default).
 *
 * Production note:
 * - Validates the request with Zod, then delegates to summaryService, which
 *   calls the active AI provider. Returns a mock summary today.
 */
import { summaryService } from '@/lib/services'
import { summaryRequestSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(summaryRequestSchema, body)
  if (!result.success) return badRequest(result.errors)
  const summary = await summaryService.generate(result.data)
  return ok(summary)
}
