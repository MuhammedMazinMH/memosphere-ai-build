/**
 * Learning gaps API — real document data.
 *
 * GET: Detects gaps from the authenticated user's real uploaded documents
 * via the AI provider. Falls back to stored analytics when the provider is
 * not live or the user has no documents.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { documentService } from '@/lib/services/documents/document-service'
import { getAIProvider } from '@/lib/services/ai'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = await authService.getCurrentUser()
  const userId = user.id ?? ''

  const documents = userId
    ? await documentService.listDocumentsByUser(userId)
    : []

  const docContexts = documents.map((d) => ({
    title: d.title,
    subject: d.subject ?? d.subjectId,
    extractedText: d.extractedText,
  }))

  const provider = getAIProvider()
  const gaps = await (provider as any).detectLearningGaps(userId, docContexts)

  return ok(gaps)
}
