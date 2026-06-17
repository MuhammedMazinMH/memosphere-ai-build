/**
 * Application-level configuration constants.
 *
 * Centralizes choices like the default AI provider, model identifiers, and
 * storage limits so they are not hard-coded across services.
 */
import { env } from '@/config/env'

/** Supported AI provider identifiers. */
export type AIProviderName = 'gemini' | 'openai' | 'claude'

/**
 * The configured AI provider. Resolved from the `AI_PROVIDER` env var, falling
 * back to Gemini (the default). OpenAI and Claude are optional providers that
 * plug into the same abstraction layer (lib/services/ai).
 */
export const DEFAULT_AI_PROVIDER: AIProviderName = ((): AIProviderName => {
  const raw = (env.AI_PROVIDER ?? '').toLowerCase()
  if (raw === 'openai' || raw === 'claude' || raw === 'gemini') return raw
  return 'gemini'
})()

/**
 * Default model identifiers per provider, expressed as AI SDK model strings.
 * These are passed to the Vercel AI SDK provider packages
 * (@ai-sdk/google, @ai-sdk/openai, @ai-sdk/anthropic).
 */
export const AI_MODELS: Record<AIProviderName, string> = {
  gemini: 'gemini-1.5-pro',
  openai: 'llama-3.3-70b-versatile',
  claude: 'claude-3-5-sonnet-20241022',
}

/** File-upload constraints enforced before handing bytes to Amazon S3. */
export const UPLOAD_LIMITS = {
  maxBytes: 200 * 1024 * 1024, // 200 MB
  acceptedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'image/png',
    'image/jpeg',
  ],
}

/** Pagination defaults for list endpoints. */
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
}
