/**
 * Quizzes API (AI seam — Gemini by default).
 *
 * Production note:
 * - GET returns existing questions; POST validates a quiz request and asks the
 *   active AI provider (via quizService) to generate questions.
 */
import { quizService } from '@/lib/services'
import { quizRequestSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function GET() {
  return ok(quizService.getQuestions())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(quizRequestSchema, body)
  if (!result.success) return badRequest(result.errors)
  const questions = await quizService.generate(result.data)
  return ok(questions)
}
