/**
 * Shared base for AI providers built on the Vercel AI SDK.
 *
 * This is the ONLY place in the codebase that imports model SDKs. Concrete
 * providers (Gemini / OpenAI / Claude) supply a `LanguageModel` instance and a
 * readiness flag; all generation logic lives here so behavior is identical
 * across providers.
 *
 * Graceful degradation: when the provider's API key is not configured, every
 * method returns deterministic data from the repositories so the application
 * runs end-to-end on mock/demo data with no external calls. When a key IS
 * configured, real model calls are made through `generateText` /
 * `Output.object()` (AI SDK 6).
 */
import { generateText, Output, type LanguageModel } from 'ai'
import { z } from 'zod'
import { conceptRepository } from '@/db/repositories/concept-repository'
import { quizRepository } from '@/db/repositories/quiz-repository'
import { documentRepository } from '@/db/repositories/document-repository'
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import type {
  AIProvider,
  KnowledgeGraph,
  QuizRequest,
  SummaryRequest,
} from '@/lib/services/ai/ai-provider'
import type {
  Concept,
  ExamReadiness,
  GapTopic,
  QuizQuestion,
  Recommendation,
  Summary,
} from '@/types'

/** Structured-output schema for AI-generated quiz questions. */
const quizQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string().nullable(),
    }),
  ),
})

/** Structured-output schema for AI-extracted concepts. */
const conceptsSchema = z.object({
  concepts: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      mastery: z.number(),
    }),
  ),
})

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: 'gemini' | 'openai' | 'claude'

  /**
   * @param model A configured AI SDK LanguageModel, or null when the provider
   *   is not configured (no API key) — in which case demo data is returned.
   */
  protected constructor(protected readonly model: LanguageModel | null) {}

  /** True when a real model is available for live generation. */
  protected get isLive(): boolean {
    return this.model !== null
  }

  async generateSummary(req: SummaryRequest): Promise<Summary> {
    const base: Summary = {
      id: `sum_${req.documentId}`,
      documentId: req.documentId,
      subjectId: req.subjectId ?? '',
      content: req.content ?? 'Summary will be generated from your document.',
      createdAt: new Date().toISOString(),
    }
    if (!this.isLive) return base

    const source =
      req.content ?? documentRepository.findById(req.documentId)?.title ?? ''
    const { text } = await generateText({
      model: this.model as LanguageModel,
      system:
        'You are a study assistant. Write a clear, well-structured summary ' +
        'of the provided study material. Keep it faithful and concise.',
      prompt: `Summarize the following (${req.length ?? 'medium'} length):\n\n${source}`,
    })
    return { ...base, content: text }
  }

  async generateQuiz(req: QuizRequest): Promise<QuizQuestion[]> {
    if (!this.isLive) return quizRepository.findQuestions()

    const { experimental_output } = await generateText({
      model: this.model as LanguageModel,
      system:
        'You generate multiple-choice quiz questions for studying. Each ' +
        'question has 4 options and exactly one correct answer (0-indexed).',
      prompt: `Generate ${req.count ?? 10} quiz questions for subject "${req.subjectId}".`,
      experimental_output: Output.object({ schema: quizQuestionsSchema }),
    })
    return experimental_output.questions as QuizQuestion[]
  }

  async extractConcepts(documentId: string): Promise<Concept[]> {
    if (!this.isLive) return conceptRepository.findAllConcepts()

    const doc = documentRepository.findById(documentId)
    const { experimental_output } = await generateText({
      model: this.model as LanguageModel,
      system:
        'You extract key concepts from study material. Return concept labels ' +
        'with an estimated mastery score from 0 to 100.',
      prompt: `Extract the key concepts from document "${doc?.title ?? documentId}".`,
      experimental_output: Output.object({ schema: conceptsSchema }),
    })
    return experimental_output.concepts as unknown as Concept[]
  }

  /*
   * The following are derived analytics. They are computed from persisted
   * signals (mastery, coverage, study history) rather than free-form text
   * generation, so they read from the repositories. They remain part of the
   * AI service surface so callers depend only on this abstraction.
   */
  async generateRecommendations(_userId: string): Promise<Recommendation> {
    return analyticsRepository.recommendations()
  }

  async detectLearningGaps(_userId: string): Promise<GapTopic[]> {
    return analyticsRepository.learningGaps()
  }

  async calculateExamReadiness(_userId: string): Promise<ExamReadiness[]> {
    return analyticsRepository.examReadiness()
  }

  async generateKnowledgeGraph(_userId: string): Promise<KnowledgeGraph> {
    return {
      concepts: conceptRepository.findAllConcepts(),
      connections: conceptRepository.findAllConnections(),
    }
  }
}
