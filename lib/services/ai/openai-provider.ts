/**
 * OpenAI AI provider (optional).
 *
 * Wraps OpenAI via the Vercel AI SDK (@ai-sdk/openai). Enabled by setting
 * AI_PROVIDER=openai and OPENAI_API_KEY. All generation logic lives in
 * BaseAIProvider; when the key is absent the base falls back to demo data.
 */
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'
import { AI_MODELS } from '@/config/app'
import { env, features } from '@/config/env'
import { BaseAIProvider } from '@/lib/services/ai/base-provider'

function createModel(): LanguageModel | null {
  if (!features.openai()) return null
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY })
  return openai(AI_MODELS.openai)
}

export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'openai' as const

  constructor() {
    super(createModel())
  }
}
