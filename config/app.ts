/**
 * Application-level configuration constants.
 *
 * Centralizes choices like the default AI provider and storage limits so they
 * are not hard-coded across services.
 */

/** Supported AI provider identifiers. */
export type AIProviderName = 'gemini' | 'openai' | 'claude'

/**
 * The default AI provider. Gemini is primary; OpenAI and Claude are future
 * options selectable via this constant (or, later, per-request configuration).
 */
export const DEFAULT_AI_PROVIDER: AIProviderName = 'gemini'

/** Default model identifiers per provider (used once real APIs are wired up). */
export const AI_MODELS: Record<AIProviderName, string> = {
  gemini: 'gemini-1.5-pro',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet',
}

/** File-upload constraints enforced before handing bytes to AWS S3. */
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
