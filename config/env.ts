/**
 * Typed environment configuration + validation helpers.
 *
 * This module centralizes every environment variable the application will use
 * once external services are connected. Nothing here connects to a real
 * service yet — it only declares, validates, and surfaces configuration so
 * that the rest of the codebase can depend on a single typed source of truth.
 *
 * Production note:
 * - DATABASE_URL ............... AWS Aurora PostgreSQL connection string
 * - AWS_* ...................... AWS S3 file storage credentials/bucket
 * - CLERK_* / NEXT_PUBLIC_CLERK_* Clerk authentication keys
 * - GOOGLE_GENERATIVE_AI_API_KEY Gemini (primary AI provider)
 * - OPENAI_API_KEY ............. OpenAI (future option)
 * - ANTHROPIC_API_KEY .......... Anthropic Claude (future option)
 */

export interface AppEnv {
  // Core
  NEXT_PUBLIC_APP_URL: string
  // Database (AWS Aurora PostgreSQL)
  DATABASE_URL?: string
  // File storage (AWS S3)
  AWS_REGION?: string
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_S3_BUCKET_NAME?: string
  // Authentication (Clerk)
  CLERK_SECRET_KEY?: string
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
  // AI providers
  GOOGLE_GENERATIVE_AI_API_KEY?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
}

/**
 * Reads the raw environment into a typed object. Only NEXT_PUBLIC_* values are
 * inlined on the client; server-only values are read lazily on the server.
 */
export const env: AppEnv = {
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
}

/** Returns true if every variable in the group is present and non-empty. */
function hasAll(keys: (keyof AppEnv)[]): boolean {
  return keys.every((k) => {
    const v = env[k]
    return typeof v === 'string' && v.length > 0
  })
}

/** Feature-availability flags derived from configured env vars. */
export const features = {
  /** AWS Aurora PostgreSQL is ready to connect. */
  database: () => hasAll(['DATABASE_URL']),
  /** AWS S3 file storage is ready to connect. */
  storage: () =>
    hasAll([
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET_NAME',
    ]),
  /** Clerk authentication is ready to connect. */
  auth: () =>
    hasAll(['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY']),
  /** Gemini (primary AI provider) is ready to connect. */
  gemini: () => hasAll(['GOOGLE_GENERATIVE_AI_API_KEY']),
  /** OpenAI (future option) is ready to connect. */
  openai: () => hasAll(['OPENAI_API_KEY']),
  /** Anthropic Claude (future option) is ready to connect. */
  claude: () => hasAll(['ANTHROPIC_API_KEY']),
}

/**
 * Validates that the variables required for a given capability are present.
 * Throws a descriptive error listing what is missing. Call this at the entry
 * point of code paths that genuinely require the external service.
 */
export function requireEnv(keys: (keyof AppEnv)[]): void {
  const missing = keys.filter((k) => {
    const v = env[k]
    return typeof v !== 'string' || v.length === 0
  })
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Add them in your Vercel project settings before using this feature.`,
    )
  }
}
