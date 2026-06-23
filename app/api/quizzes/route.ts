/**
 * Quizzes API — real document data.
 *
 * GET:   Back-compat endpoint; returns an empty question list (questions are
 *        generated on demand via POST from the user's real documents).
 * POST:  Loads all documents in the requested subject for the authenticated
 *        user, merges their extractedText, and sends it to the AI provider so
 *        quiz questions are grounded in the user's actual uploaded content.
 * PATCH: Records a completed quiz attempt (score/total) in DynamoDB so it
 *        feeds deterministic exam-readiness metrics, and emits a notification.
 */
import { auth } from '@clerk/nextjs/server'
import { authService } from '@/lib/services/auth/auth-service.server'
import { documentService } from '@/lib/services/documents/document-service'
import { quizService } from '@/lib/services'
import { quizRepository } from '@/db/repositories/quiz-repository'
import { notificationRepository } from '@/db/repositories/notification-repository'
import { quizRequestSchema, validate } from '@/lib/validations'
import { ok, badRequest, unauthorized } from '@/lib/api/response'

export async function GET() {
  // Back-compat: questions are generated on demand via POST, so there are no
  // pre-stored questions to return.
  return ok(quizService.getQuestions())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(quizRequestSchema, body)
  if (!result.success) return badRequest(result.errors)

  const user = await authService.getCurrentUser()
  const userId = user.id ?? ''

  // Load the user's documents for the requested subject.
  const documents = userId
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

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorized('Authentication required')

  const body = (await request.json().catch(() => ({}))) as {
    subjectId?: string
    score?: number
    total?: number
  }

  const score = Number(body.score)
  const total = Number(body.total)
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return badRequest({ error: 'Provide a numeric score and total > 0' })
  }

  const subjectId = body.subjectId?.trim() || 'Uncategorized'

  // Persist the attempt so it feeds deterministic exam-readiness metrics.
  await quizRepository.recordAttempt({
    id: `qa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    subjectId,
    score: Math.max(0, Math.round(score)),
    total: Math.round(total),
    createdAt: new Date().toISOString(),
  })

  // Emit a persisted notification for the completed quiz. Best-effort.
  try {
    const pct = Math.round((score / total) * 100)
    await notificationRepository.create({
      userId,
      title: 'Quiz completed',
      message: `You scored ${score}/${total} (${pct}%) on your ${subjectId} quiz.`,
      type: 'quiz_completed',
    })
  } catch {
    // Non-critical.
  }

  return ok({ recorded: true })
}
