/**
 * Knowledge graph API — real document data.
 *
 * GET: Loads the authenticated user's documents, passes them (with
 * extractedText) to the AI provider for concept and relationship extraction,
 * and returns the resulting graph.
 *
 * Fallback policy (NO seed data):
 * - A successful, non-empty generation is persisted as the user's "last-good"
 *   snapshot and returned.
 * - When generation yields nothing (AI unavailable, no documents, or a
 *   transient failure), the user's last-good snapshot is returned if one
 *   exists; otherwise an empty graph.
 */
import { authService } from '@/lib/services/auth/auth-service.server'
import { documentService } from '@/lib/services/documents/document-service'
import { getAIProvider } from '@/lib/services/ai'
import { knowledgeGraphRepository } from '@/db/repositories/knowledge-graph-repository'
import { notificationRepository } from '@/db/repositories/notification-repository'
import { ok } from '@/lib/api/response'
import type { Concept, ConceptConnection } from '@/types'

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
  const graph = await provider.generateKnowledgeGraph(userId, docContexts)

  let concepts: Concept[] = graph.concepts ?? []
  let connections: ConceptConnection[] = graph.connections ?? []

  if (concepts.length > 0) {
    // Compare against the previous snapshot so we only notify when the graph
    // meaningfully changes — otherwise every visit to the page would spam a
    // notification (the graph is regenerated on each GET).
    const previous = await knowledgeGraphRepository.loadSnapshot(userId)
    const changed = !previous || previous.concepts.length !== concepts.length

    // Fresh, real graph: persist it as the last-good snapshot.
    await knowledgeGraphRepository.saveSnapshot(userId, { concepts, connections })

    if (changed) {
      try {
        await notificationRepository.create({
          userId,
          title: 'Knowledge graph updated',
          message: `Your knowledge graph now maps ${concepts.length} concepts from your documents.`,
          type: 'graph_generated',
        })
      } catch {
        // Non-critical — never fail the graph response over a notification.
      }
    }
  } else {
    // Nothing generated this run → fall back to the last-good snapshot.
    const snapshot = await knowledgeGraphRepository.loadSnapshot(userId)
    if (snapshot) {
      concepts = snapshot.concepts
      connections = snapshot.connections
    }
  }

  // Derive journey from subject nodes in the resolved graph.
  const journey: string[] = concepts
    .filter((c) => c.group === 'subject')
    .map((c) => c.label)

  return ok({ concepts, connections, journey })
}
