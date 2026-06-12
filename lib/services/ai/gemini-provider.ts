/**
 * Gemini AI provider (PRIMARY / default).
 *
 * Wraps Google Gemini via the Vercel AI SDK (@ai-sdk/google). All generation
 * logic lives in BaseAIProvider; this class only supplies the configured
 * model. When GOOGLE_GENERATIVE_AI_API_KEY is absent, the model is null and the
 * base falls back to deterministic demo data so the app runs unchanged.
 */
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'
import { AI_MODELS } from '@/config/app'
import { env, features } from '@/config/env'
import { BaseAIProvider } from '@/lib/services/ai/base-provider'

function createModel(): LanguageModel | null {
  if (!features.gemini()) return null
  const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
  })
  return google(AI_MODELS.gemini)
}

export class GeminiProvider extends BaseAIProvider {
  readonly name = 'gemini' as const

  constructor() {
    super(createModel())
  }
}
