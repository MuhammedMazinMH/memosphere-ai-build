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
 *
 * DATA SOURCE RULE: All generation methods that accept a userId or documentId
 * must source their text from Document.extractedText — never from mock arrays,
 * hardcoded labels, or seed data.
 */
// NOTE: `ai` and the model SDKs are loaded lazily (dynamic import) so they
// never enter the browser bundle — this module is reachable from `"use client"`
// components through the AI-backed data services. The generation methods only
// run server-side (API routes), where the dynamic import resolves normally.
import type { LanguageModel } from 'ai'
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

// ---------------------------------------------------------------------------
// Zod schemas for structured AI output
// ---------------------------------------------------------------------------

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

const conceptsSchema = z.object({
  concepts: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      group: z.enum(['subject', 'core', 'concept', 'document']).default('concept'),
      mastery: z.number().min(0).max(100).default(0),
      importance: z.number().min(0).max(100).default(50),
      status: z.enum(['core', 'emerging', 'weak', 'connected']).default('emerging'),
      difficulty: z.enum(['foundational', 'intermediate', 'advanced']).default('intermediate'),
    }),
  ),
  connections: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      strength: z.number().min(0).max(100).default(50),
    }),
  ),
})

const recommendationSchema = z.object({
  nextTopic: z.object({
    mastered: z.string(),
    recommended: z.string(),
    subject: z.string(),
    reason: z.string(),
    confidence: z.number(),
  }),
  weakAreas: z.array(z.object({ name: z.string(), subject: z.string(), confidence: z.number() })),
  knowledgeGaps: z.array(z.object({ subject: z.string(), missing: z.array(z.string()) })),
  studyPath: z.array(
    z.object({
      label: z.string(),
      subject: z.string(),
      status: z.enum(['done', 'current', 'next', 'locked']),
    }),
  ),
  examReadiness: z.object({
    current: z.number(),
    potential: z.number(),
    hoursNeeded: z.number(),
    examName: z.string(),
  }),
})

const gapsSchema = z.object({
  gaps: z.array(
    z.object({
      name: z.string(),
      subject: z.string(),
      status: z.enum(['mastered', 'partial', 'missing']),
      progress: z.number().min(0).max(100),
    }),
  ),
})

const readinessSchema = z.object({
  subjects: z.array(
    z.object({
      subject: z.string(),
      coverage: z.number().min(0).max(100),
      accuracy: z.number().min(0).max(100),
      consistency: z.number().min(0).max(100),
      confidence: z.number().min(0).max(100),
    }),
  ),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate text to avoid exceeding model context windows. */
function truncate(text: string, maxChars = 12000): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n\n[...text truncated for context window...]'
}

// ---------------------------------------------------------------------------
// Abstract base
// ---------------------------------------------------------------------------

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: 'gemini' | 'openai' | 'claude'

  private _model: LanguageModel | null = null

  protected constructor(
    protected readonly configured: boolean,
    private readonly modelFactory: () => Promise<LanguageModel>,
  ) {}

  protected get isLive(): boolean {
    return this.configured
  }

  protected async getModel(): Promise<LanguageModel> {
    if (!this._model) this._model = await this.modelFactory()
    return this._model
  }

  // -------------------------------------------------------------------------
  // Summary — already wired to extractedText via the API route; kept as-is.
  // -------------------------------------------------------------------------
  async generateSummary(req: SummaryRequest): Promise<Summary> {
    const base: Summary = {
      id: `sum_${req.documentId}`,
      documentId: req.documentId,
      subjectId: req.subjectId ?? '',
      content: req.content ?? 'Summary will be generated from your document.',
      createdAt: new Date().toISOString(),
    }
    if (!this.isLive) return base

    const { generateText } = await import('ai')
    const model = await this.getModel()
    const source =
      req.content ?? documentRepository.findById(req.documentId)?.title ?? ''
    const { text } = await generateText({
      model,
      system:
        'You are a study assistant. Write a clear, well-structured summary ' +
        'of the provided study material. Keep it faithful and concise.',
      prompt: `Summarize the following (${req.length ?? 'medium'} length):\n\n${source}`,
    })
    return { ...base, content: text }
  }

  // -------------------------------------------------------------------------
  // Quiz — uses merged extractedText passed via req.content
  // -------------------------------------------------------------------------
  async generateQuiz(req: QuizRequest): Promise<QuizQuestion[]> {
    if (!this.isLive) return quizRepository.findQuestions()

    const { generateText, Output } = await import('ai')
    const model = await this.getModel()

    const sourceText = (req as QuizRequest & { content?: string }).content ?? ''
    const prompt = sourceText.trim()
      ? `Generate ${req.count ?? 10} multiple-choice quiz questions based ONLY on the following study material. Each question must have 4 options and exactly one correct answer (0-indexed). Include a brief explanation for each correct answer.\n\nStudy material:\n${truncate(sourceText)}`
      : `Generate ${req.count ?? 10} multiple-choice quiz questions for the subject "${req.subjectId}". Each question must have 4 options and exactly one correct answer (0-indexed). Include a brief explanation.`

    const { experimental_output } = await generateText({
      model,
      system:
        'You generate multiple-choice quiz questions for studying. Each ' +
        'question has 4 options and exactly one correct answer (0-indexed). ' +
        'Return only valid JSON matching the requested schema.',
      prompt,
      experimental_output: Output.object({ schema: quizQuestionsSchema }),
    })
    return experimental_output.questions.map((q, i) => ({
      id: `q-${i + 1}`,
      question: q.question,
      options: q.options,
      answer: q.correctAnswer,
      explanation: q.explanation ?? '',
    }))
  }

  // -------------------------------------------------------------------------
  // Concept extraction — uses real extractedText from Document
  // -------------------------------------------------------------------------
  async extractConcepts(documentId: string, extractedText?: string): Promise<Concept[]> {
    if (!this.isLive) return conceptRepository.findAllConcepts()

    const { generateText, Output } = await import('ai')
    const model = await this.getModel()

    // Prefer caller-supplied text; fall back to DynamoDB fetch.
    const text =
      extractedText ??
      documentRepository.findById(documentId)?.extractedText ??
      ''

    if (!text.trim()) return []

    const { experimental_output } = await generateText({
      model,
      system:
        'You extract key concepts from study material and identify relationships ' +
        'between them. Return structured JSON only.',
      prompt: `Extract all key concepts and their relationships from this study material. For each concept assign: a slug id, label, group (concept/core/subject), mastery (0-100 estimate), importance (0-100), status (core/emerging/weak/connected), difficulty (foundational/intermediate/advanced).\n\nMaterial:\n${truncate(text)}`,
      experimental_output: Output.object({ schema: conceptsSchema }),
    })

    return experimental_output.concepts as unknown as Concept[]
  }

  // -------------------------------------------------------------------------
  // Knowledge graph — generate from all user documents
  // -------------------------------------------------------------------------
  async generateKnowledgeGraph(
    _userId: string,
    documents?: Array<{ id: string; title: string; subject: string; extractedText?: string }>,
  ): Promise<KnowledgeGraph> {
    if (!this.isLive || !documents?.length) {
      return {
        concepts: conceptRepository.findAllConcepts(),
        connections: conceptRepository.findAllConnections(),
      }
    }

    const { generateText, Output } = await import('ai')
    const model = await this.getModel()

    // Build a condensed context from all documents (trim per-doc to fit)
    const perDocLimit = Math.floor(8000 / documents.length)
    const combined = documents
      .map((d) => `[Document: ${d.title} | Subject: ${d.subject}]\n${truncate(d.extractedText ?? '', perDocLimit)}`)
      .join('\n\n---\n\n')

    const { experimental_output } = await generateText({
      model,
      system:
        'You are a knowledge graph builder. Extract concepts and relationships from study materials ' +
        'and return them as graph nodes and edges. Return structured JSON only.',
      prompt: `Analyze all the following documents and extract:\n- concepts (with id, label, group, mastery, importance, status, difficulty)\n- connections between concepts (source, target, strength 0-100)\n\nCreate subject nodes (group=subject) for each document subject, document nodes (group=document) for each document, and concept nodes (group=concept or core) for extracted concepts.\n\nDocuments:\n${truncate(combined, 14000)}`,
      experimental_output: Output.object({ schema: conceptsSchema }),
    })

    const concepts = experimental_output.concepts as unknown as Concept[]
    const connections = experimental_output.connections.map((c) => ({
      source: c.source,
      target: c.target,
      strength: c.strength,
    }))

    return { concepts, connections }
  }

  // -------------------------------------------------------------------------
  // Recommendations (AI Coach) — generated from real document context
  // -------------------------------------------------------------------------
  async generateRecommendations(
    _userId: string,
    documents?: Array<{ title: string; subject: string; extractedText?: string }>,
  ): Promise<Recommendation> {
    const fallback = analyticsRepository.recommendations()

    if (!this.isLive || !documents?.length) return fallback

    const { generateText, Output } = await import('ai')
    const model = await this.getModel()

    const subjectsSummary = [...new Set(documents.map((d) => d.subject))].join(', ')
    const docTitles = documents.map((d) => `- ${d.title} (${d.subject})`).join('\n')
    const sampleText = truncate(
      documents.map((d) => d.extractedText ?? '').join('\n\n'),
      10000,
    )

    const { experimental_output } = await generateText({
      model,
      system:
        'You are an AI learning coach. Based on a student\'s uploaded study materials, ' +
        'generate personalized learning recommendations. Return structured JSON only.',
      prompt: `The student has uploaded the following documents:\n${docTitles}\n\nSubjects covered: ${subjectsSummary}\n\nSample content from their materials:\n${sampleText}\n\nGenerate a coaching recommendation including: nextTopic (what they've mastered, what to study next, subject, reason, confidence 0-100), weakAreas (array of {name, subject, confidence 0-100}), knowledgeGaps (array of {subject, missing: string[]}), studyPath (array of {label, subject, status: done/current/next/locked}), examReadiness (current 0-100, potential 0-100, hoursNeeded, examName).`,
      experimental_output: Output.object({ schema: recommendationSchema }),
    })

    return experimental_output as unknown as Recommendation
  }

  // -------------------------------------------------------------------------
  // Learning gaps — calculated from real document subjects and content
  // -------------------------------------------------------------------------
  async detectLearningGaps(
    _userId: string,
    documents?: Array<{ title: string; subject: string; extractedText?: string }>,
  ): Promise<GapTopic[]> {
    if (!this.isLive || !documents?.length) return analyticsRepository.learningGaps()

    const { generateText, Output } = await import('ai')
    const model = await this.getModel()

    const docSummary = documents
      .map((d) => `- ${d.title} (${d.subject}): ${(d.extractedText ?? '').slice(0, 300)}`)
      .join('\n')

    const { experimental_output } = await generateText({
      model,
      system:
        'You analyze study materials and identify learning gaps — concepts that are ' +
        'mentioned but likely not yet mastered by the student. Return structured JSON only.',
      prompt: `Analyze the following documents and identify learning gaps:\n${docSummary}\n\nFor each gap topic return: name, subject, status (mastered/partial/missing), progress (0-100).`,
      experimental_output: Output.object({ schema: gapsSchema }),
    })

    return experimental_output.gaps as unknown as GapTopic[]
  }

  // -------------------------------------------------------------------------
  // Exam readiness — calculated from real document coverage
  // -------------------------------------------------------------------------
  async calculateExamReadiness(
    _userId: string,
    documents?: Array<{ title: string; subject: string; extractedText?: string }>,
  ): Promise<ExamReadiness[]> {
    if (!this.isLive || !documents?.length) return analyticsRepository.examReadiness()

    const { generateText, Output } = await import('ai')
    const model = await this.getModel()

    const subjectGroups = documents.reduce<Record<string, string[]>>((acc, d) => {
      if (!acc[d.subject]) acc[d.subject] = []
      acc[d.subject].push(d.title)
      return acc
    }, {})

    const subjectSummary = Object.entries(subjectGroups)
      .map(([subject, titles]) => `${subject}: ${titles.join(', ')}`)
      .join('\n')

    const { experimental_output } = await generateText({
      model,
      system:
        'You estimate exam readiness based on the breadth and depth of a student\'s study materials. ' +
        'Return structured JSON only.',
      prompt: `Estimate exam readiness per subject based on these uploaded documents:\n${subjectSummary}\n\nFor each subject return: subject name, coverage (0-100, how much of the subject is covered), accuracy (0-100, estimated answer accuracy based on depth), consistency (0-100, how consistent the coverage is), confidence (0-100, overall confidence score).`,
      experimental_output: Output.object({ schema: readinessSchema }),
    })

    return experimental_output.subjects as unknown as ExamReadiness[]
  }
}
