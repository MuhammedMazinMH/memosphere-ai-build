/**
 * Quizzes API — real document data.
 *
 * POST: Loads all documents in the requested subject for the authenticated
 * user, merges their extractedText, and sends it to the AI provider so quiz
 * questions are grounded in the user's actual uploaded content.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { documentService } from '@/lib/services/documents/document-service'
import { quizService } from '@/lib/services'
import { quizRequestSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function GET() {
  // Kept for backwards compat — returns seed questions when no POST is used.
  return ok(quizService.getQuestions())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(quizRequestSchema, body)
  if (!result.success) return badRequest(result.errors)

  const user = await authService.getCurrentUser()
  const userId = user.id ?? ''

  // Load the user's documents for the requested subject.
  let documents = userId
    ? await documentService.listDocumentsByUser(userId)
    : []

  // Filter to the requested subject (by id or by name).
  const { subjectId } = result.data
  const subjectDocs = documents.filter(
    (d) => d.subjectId === subjectId || d.subject?.toLowerCase() === subjectId.toLowerCase(),
  )

  // Merge all extractedText from the subject's documents.
  const mergedText = subjectDocs
    .map((d) => (d.extractedText ?? '').trim())
    .filter(Boolean)
    .join('\n\n---\n\n')

  const questions = await quizService.generate({
    subjectId: result.data.subjectId,
    count: result.data.questionCount,
    content: mergedText || undefined,
  })

  return ok(questions)
}
