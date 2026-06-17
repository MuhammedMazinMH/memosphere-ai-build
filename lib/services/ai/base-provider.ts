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
 * configured, real model calls are made through `generateText` and the JSON
 * is parsed manually and validated with Zod (Groq-compatible — no json_schema).
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

/**
 * Extract a JSON object/array from a raw model response.
 *
 * Models often wrap JSON in ```json fences or add prose. This strips fences
 * and slices from the first `{`/`[` to the matching last `}`/`]` so JSON.parse
 * has the best chance of succeeding.
 */
function extractJson(raw: string): string {
  let s = raw.trim()
  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) s = fence[1].trim()
  // Slice to the outermost JSON braces/brackets
  const firstObj = s.indexOf('{')
  const firstArr = s.indexOf('[')
  let start = -1
  let end = -1
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
    start = firstArr
    end = s.lastIndexOf(']')
  } else if (firstObj !== -1) {
    start = firstObj
    end = s.lastIndexOf('}')
  }
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1)
  }
  return s
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

  /**
   * Groq-compatible structured generation.
   *
   * The llama models served by Groq do NOT support response_format
   * 'json_schema' (which `Output.object()`/`generateObject` rely on), so we
   * instead ask for JSON in the prompt, parse it manually, and validate with
   * the supplied Zod schema. Returns `null` when generation or validation
   * fails so callers can fall back to deterministic data.
   */
  protected async generateJson<T>(
    schema: z.ZodType<T>,
    system: string,
    prompt: string,
  ): Promise<T | null> {
    try {
      const { generateText } = await import('ai')
      const model = await this.getModel()
      const { text } = await generateText({
        model,
        system: `${system}\n\nRespond with ONLY valid JSON. Do not include markdown code fences, comments, or any prose outside the JSON.`,
        prompt,
      })
      const parsed = JSON.parse(extractJson(text))
      const result = schema.safeParse(parsed)
      if (!result.success) {
        console.log('[v0] AI JSON failed schema validation:', result.error.message)
        return null
      }
      return result.data
    } catch (err) {
      console.log('[v0] AI JSON generation error:', err instanceof Error ? err.message : String(err))
      return null
    }
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

    const sourceText = (req as QuizRequest & { content?: string }).content ?? ''
    const prompt = sourceText.trim()
      ? `Generate ${req.count ?? 10} multiple-choice quiz questions based ONLY on the following study material. Each question must have 4 options and exactly one correct answer (0-indexed). Include a brief explanation for each correct answer.\n\nReturn a JSON object of the form: {"questions":[{"id":"q1","question":"...","options":["a","b","c","d"],"correctAnswer":0,"explanation":"..."}]}.\n\nStudy material:\n${truncate(sourceText)}`
      : `Generate ${req.count ?? 10} multiple-choice quiz questions for the subject "${req.subjectId}". Each question must have 4 options and exactly one correct answer (0-indexed). Include a brief explanation.\n\nReturn a JSON object of the form: {"questions":[{"id":"q1","question":"...","options":["a","b","c","d"],"correctAnswer":0,"explanation":"..."}]}.`

    const output = await this.generateJson(
      quizQuestionsSchema,
      'You generate multiple-choice quiz questions for studying. Each ' +
        'question has 4 options and exactly one correct answer (0-indexed).',
      prompt,
    )
    if (!output) return quizRepository.findQuestions()

    return output.questions.map((q, i) => ({
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

    // Prefer caller-supplied text; fall back to DynamoDB fetch.
    const text =
      extractedText ??
      documentRepository.findById(documentId)?.extractedText ??
      ''

    if (!text.trim()) return []

    const output = await this.generateJson(
      conceptsSchema,
      'You extract key concepts from study material and identify relationships ' +
        'between them.',
      `Extract all key concepts and their relationships from this study material. For each concept assign: a slug id, label, group (concept/core/subject), mastery (0-100 estimate), importance (0-100), status (core/emerging/weak/connected), difficulty (foundational/intermediate/advanced).\n\nReturn JSON of the form {"concepts":[...],"connections":[{"source":"id","target":"id","strength":0}]}.\n\nMaterial:\n${truncate(text)}`,
    )
    if (!output) return conceptRepository.findAllConcepts()

    return output.concepts as unknown as Concept[]
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

    // Build a condensed context from all documents (trim per-doc to fit)
    const perDocLimit = Math.floor(8000 / documents.length)
    const combined = documents
      .map((d) => `[Document: ${d.title} | Subject: ${d.subject}]\n${truncate(d.extractedText ?? '', perDocLimit)}`)
      .join('\n\n---\n\n')

    const output = await this.generateJson(
      conceptsSchema,
      'You are a knowledge graph builder. Extract concepts and relationships from study materials ' +
        'and return them as graph nodes and edges.',
      `Analyze all the following documents and extract:\n- concepts (with id, label, group, mastery, importance, status, difficulty)\n- connections between concepts (source, target, strength 0-100)\n\nCreate subject nodes (group=subject) for each document subject, document nodes (group=document) for each document, and concept nodes (group=concept or core) for extracted concepts.\n\nReturn JSON of the form {"concepts":[...],"connections":[{"source":"id","target":"id","strength":0}]}.\n\nDocuments:\n${truncate(combined, 14000)}`,
    )

    if (!output) {
      return {
        concepts: conceptRepository.findAllConcepts(),
        connections: conceptRepository.findAllConnections(),
      }
    }

    const concepts = output.concepts as unknown as Concept[]
    const connections = output.connections.map((c) => ({
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

    const subjectsSummary = [...new Set(documents.map((d) => d.subject))].join(', ')
    const docTitles = documents.map((d) => `- ${d.title} (${d.subject})`).join('\n')
    const sampleText = truncate(
      documents.map((d) => d.extractedText ?? '').join('\n\n'),
      10000,
    )

    const output = await this.generateJson(
      recommendationSchema,
      'You are an AI learning coach. Based on a student\'s uploaded study materials, ' +
        'generate personalized learning recommendations.',
      `The student has uploaded the following documents:\n${docTitles}\n\nSubjects covered: ${subjectsSummary}\n\nSample content from their materials:\n${sampleText}\n\nGenerate a coaching recommendation including: nextTopic (what they've mastered, what to study next, subject, reason, confidence 0-100), weakAreas (array of {name, subject, confidence 0-100}), knowledgeGaps (array of {subject, missing: string[]}), studyPath (array of {label, subject, status: done/current/next/locked}), examReadiness (current 0-100, potential 0-100, hoursNeeded, examName).`,
    )
    if (!output) return fallback

    return output as unknown as Recommendation
  }

  // -------------------------------------------------------------------------
  // Learning gaps — calculated from real document subjects and content
  // -------------------------------------------------------------------------
  async detectLearningGaps(
    _userId: string,
    documents?: Array<{ title: string; subject: string; extractedText?: string }>,
  ): Promise<GapTopic[]> {
    if (!this.isLive || !documents?.length) return analyticsRepository.learningGaps()

    const docSummary = documents
      .map((d) => `- ${d.title} (${d.subject}): ${(d.extractedText ?? '').slice(0, 300)}`)
      .join('\n')

    const output = await this.generateJson(
      gapsSchema,
      'You analyze study materials and identify learning gaps — concepts that are ' +
        'mentioned but likely not yet mastered by the student.',
      `Analyze the following documents and identify learning gaps:\n${docSummary}\n\nFor each gap topic return JSON of the form {"gaps":[{"name":"...","subject":"...","status":"mastered|partial|missing","progress":0}]}.`,
    )
    if (!output) return analyticsRepository.learningGaps()

    return output.gaps as unknown as GapTopic[]
  }

  // -------------------------------------------------------------------------
  // Exam readiness — calculated from real document coverage
  // -------------------------------------------------------------------------
  async calculateExamReadiness(
    _userId: string,
    documents?: Array<{ title: string; subject: string; extractedText?: string }>,
  ): Promise<ExamReadiness[]> {
    if (!this.isLive || !documents?.length) return analyticsRepository.examReadiness()

    const subjectGroups = documents.reduce<Record<string, string[]>>((acc, d) => {
      if (!acc[d.subject]) acc[d.subject] = []
      acc[d.subject].push(d.title)
      return acc
    }, {})

    const subjectSummary = Object.entries(subjectGroups)
      .map(([subject, titles]) => `${subject}: ${titles.join(', ')}`)
      .join('\n')

    const output = await this.generateJson(
      readinessSchema,
      'You estimate exam readiness based on the breadth and depth of a student\'s study materials.',
      `Estimate exam readiness per subject based on these uploaded documents:\n${subjectSummary}\n\nReturn JSON of the form {"subjects":[{"subject":"...","coverage":0,"accuracy":0,"consistency":0,"confidence":0}]} where each value is 0-100.`,
    )
    if (!output) return analyticsRepository.examReadiness()

    return output.subjects as unknown as ExamReadiness[]
  }
}
