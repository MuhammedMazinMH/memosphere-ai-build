/**
 * Summaries API (AI seam — active provider, e.g. Groq via OpenAI-compatible).
 *
 * Flow:
 * - Validates the request with Zod (documentId + length).
 * - Loads the real document from DynamoDB and reads its extractedText.
 * - Delegates to summaryService, which calls the active AI provider with the
 *   document's extracted text as the source content.
 */
import { summaryService, documentService } from '@/lib/services'
import { summaryRequestSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(summaryRequestSchema, body)
  if (!result.success) return badRequest(result.errors)

  const document = await documentService.getDocumentById(result.data.documentId)
  if (!document) {
    return badRequest({ error: 'Document not found.' })
  }

  const extractedText = document.extractedText?.trim()
  if (!extractedText) {
    return badRequest({
      error:
        'This document has no extracted text yet. Please wait for processing to finish, then try again.',
    })
  }

  const summary = await summaryService.generate({
    documentId: document.id,
    subjectId: document.subjectId,
    length: result.data.length,
    content: extractedText,
  })
  return ok(summary)
}
