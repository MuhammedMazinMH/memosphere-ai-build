/**
 * Gemini AI provider (PRIMARY / default).
 *
 * Wraps Google Gemini via the Vercel AI SDK (@ai-sdk/google). All generation
 * logic lives in BaseAIProvider; this class only supplies the configured model.
 * When GOOGLE_GENERATIVE_AI_API_KEY is absent, `features.gemini()` is false and
 * the base falls back to deterministic demo data so the app runs unchanged.
 *
 * The @ai-sdk/google SDK is imported lazily (dynamic import in the model
 * factory) so it never enters client bundles.
 */
import { AI_MODELS } from '@/config/app'
import { env, features } from '@/config/env'
import { BaseAIProvider } from '@/lib/services/ai/base-provider'

export class GeminiProvider extends BaseAIProvider {
  readonly name = 'gemini' as const

  constructor() {
    super(features.gemini(), async () => {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
      const google = createGoogleGenerativeAI({
        apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
      })
      return google(AI_MODELS.gemini)
    })
  }
}
