/**
 * Anthropic Claude AI provider (optional).
 *
 * Wraps Anthropic via the Vercel AI SDK (@ai-sdk/anthropic). Enabled by setting
 * AI_PROVIDER=claude and ANTHROPIC_API_KEY. All generation logic lives in
 * BaseAIProvider; when the key is absent the base falls back to demo data.
 */
import { createAnthropic } from '@ai-sdk/anthropic'
import type { LanguageModel } from 'ai'
import { AI_MODELS } from '@/config/app'
import { env, features } from '@/config/env'
import { BaseAIProvider } from '@/lib/services/ai/base-provider'

function createModel(): LanguageModel | null {
  if (!features.claude()) return null
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })
  return anthropic(AI_MODELS.claude)
}

export class ClaudeProvider extends BaseAIProvider {
  readonly name = 'claude' as const

  constructor() {
    super(createModel())
  }
}
