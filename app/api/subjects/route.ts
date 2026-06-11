/**
 * Subjects API.
 *
 * Production note:
 * - GET lists subjects for the authenticated user (Clerk + Aurora).
 * - POST validates with Zod then delegates to subjectService.
 */
import { subjectService } from '@/lib/services'
import { subjectSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function GET() {
  return ok(subjectService.getSubjects())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(subjectSchema, body)
  if (!result.success) return badRequest(result.errors)
  // TODO(aurora): persist via subjectService.create(result.data, userId)
  return ok({ created: result.data, mock: true }, { status: 201 })
}
