/**
 * OpenAI AI provider (optional).
 *
 * Wraps OpenAI via the Vercel AI SDK (@ai-sdk/openai). Enabled by setting
 * AI_PROVIDER=openai and OPENAI_API_KEY. All generation logic lives in
 * BaseAIProvider; when the key is absent the base falls back to demo data.
 *
 * The @ai-sdk/openai SDK is imported lazily (dynamic import in the model
 * factory) so it never enters client bundles.
 */
import { AI_MODELS } from '@/config/app'
import { env, features } from '@/config/env'
import { BaseAIProvider } from '@/lib/services/ai/base-provider'

export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'openai' as const

  constructor() {
    super(features.openai(), async () => {
      const { createOpenAI } = await import('@ai-sdk/openai')
      const openai = createOpenAI({
        apiKey: env.OPENAI_API_KEY,
        baseURL: env.OPENAI_BASE_URL || undefined,
      })
      return openai(AI_MODELS.openai)
    })
  }
}
