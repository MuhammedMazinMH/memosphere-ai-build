/**
 * Anthropic Claude AI provider (optional).
 *
 * Wraps Anthropic via the Vercel AI SDK (@ai-sdk/anthropic). Enabled by setting
 * AI_PROVIDER=claude and ANTHROPIC_API_KEY. All generation logic lives in
 * BaseAIProvider; when the key is absent the base falls back to demo data.
 *
 * The @ai-sdk/anthropic SDK is imported lazily (dynamic import in the model
 * factory) so it never enters client bundles.
 */
import { AI_MODELS } from '@/config/app'
import { env, features } from '@/config/env'
import { BaseAIProvider } from '@/lib/services/ai/base-provider'

export class ClaudeProvider extends BaseAIProvider {
  readonly name = 'claude' as const

  constructor() {
    super(features.claude(), async () => {
      const { createAnthropic } = await import('@ai-sdk/anthropic')
      const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })
      return anthropic(AI_MODELS.claude)
    })
  }
}
