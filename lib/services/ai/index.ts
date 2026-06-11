/**
 * AI provider factory.
 *
 * Selects the active AI provider. Gemini is the default (config/app.ts);
 * OpenAI and Claude are available as future options. Application code should
 * call `getAIProvider()` and depend only on the AIProvider interface.
 */
import { DEFAULT_AI_PROVIDER, type AIProviderName } from '@/config/app'
import type { AIProvider } from '@/lib/services/ai/ai-provider'
import { GeminiProvider } from '@/lib/services/ai/gemini-provider'
import { OpenAIProvider } from '@/lib/services/ai/openai-provider'
import { ClaudeProvider } from '@/lib/services/ai/claude-provider'

/** Returns a provider instance for the requested (or default) provider. */
export function getAIProvider(
  name: AIProviderName = DEFAULT_AI_PROVIDER,
): AIProvider {
  switch (name) {
    case 'openai':
      return new OpenAIProvider()
    case 'claude':
      return new ClaudeProvider()
    case 'gemini':
    default:
      return new GeminiProvider()
  }
}

export type { AIProvider } from '@/lib/services/ai/ai-provider'
