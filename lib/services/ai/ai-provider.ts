/**
 * AI provider abstraction.
 *
 * Defines the common contract every AI provider (Gemini, OpenAI, Claude) must
 * implement. The rest of the application depends only on this interface, never
 * on a concrete provider, so providers can be swapped via configuration.
 *
 * Production note:
 * - No real AI APIs are called yet. Concrete providers currently return
 *   deterministic placeholder data drawn from the repositories so the UI is
 *   unchanged. Each method documents where the real model call will go.
 */
import type {
  Concept,
  ConceptConnection,
  ExamReadiness,
  GapTopic,
  QuizQuestion,
  Recommendation,
  Summary,
} from '@/types'

export interface SummaryRequest {
  documentId: string
  subjectId: string
  content?: string
}

export interface QuizRequest {
  subjectId: string
  count?: number
}

export interface KnowledgeGraph {
  concepts: Concept[]
  connections: ConceptConnection[]
}

/**
 * The common AI capability surface. Implemented by gemini/openai/claude.
 */
export interface AIProvider {
  readonly name: 'gemini' | 'openai' | 'claude'

  generateSummary(req: SummaryRequest): Promise<Summary>
  generateQuiz(req: QuizRequest): Promise<QuizQuestion[]>
  extractConcepts(documentId: string): Promise<Concept[]>
  generateRecommendations(userId: string): Promise<Recommendation>
  detectLearningGaps(userId: string): Promise<GapTopic[]>
  calculateExamReadiness(userId: string): Promise<ExamReadiness[]>
  generateKnowledgeGraph(userId: string): Promise<KnowledgeGraph>
}
