/**
 * Knowledge graph API — real document data.
 *
 * GET: Loads the authenticated user's documents, passes them (with
 * extractedText) to the AI provider for concept and relationship extraction,
 * and returns the resulting graph. Falls back to stored concepts when the
 * provider is not live.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { documentService } from '@/lib/services/documents/document-service'
import { knowledgeGraphService } from '@/lib/services'
import { getAIProvider } from '@/lib/services/ai'
import { ok } from '@/lib/api/response'

export async function GET() {
  const user = await authService.getCurrentUser()
  const userId = user.id ?? ''

  const documents = userId
    ? await documentService.listDocumentsByUser(userId)
    : []

  // Pass lightweight doc context to the provider — extractedText included.
  const docContexts = documents.map((d) => ({
    id: d.id,
    title: d.title,
    subject: d.subject ?? d.subjectId,
    extractedText: d.extractedText,
  }))

  const provider = getAIProvider()

  // Use the real generation path which accepts document contexts.
  const graph = await (provider as any).generateKnowledgeGraph(userId, docContexts)

  // Derive journey from subject nodes in the generated graph.
  const journey: string[] = graph.concepts
    .filter((c: any) => c.group === 'subject')
    .map((c: any) => c.label as string)

  return ok({
    concepts: graph.concepts,
    connections: graph.connections,
    journey,
  })
}
