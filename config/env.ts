/**
 * Typed environment configuration + validation helpers.
 *
 * This module centralizes every environment variable the application uses to
 * connect to external services: Amazon DynamoDB (persistence), Amazon S3
 * (document storage), and the AI providers (Gemini / OpenAI / Anthropic).
 *
 * The application is designed to run fully on mock/demo data when nothing is
 * configured. Each capability below is gated by a `features.*` flag so code
 * paths can degrade gracefully.
 *
 * Variables:
 * - AI_PROVIDER ................. active AI provider: 'gemini' | 'openai' | 'claude'
 * - GOOGLE_GENERATIVE_AI_API_KEY  Gemini (default AI provider)
 * - OPENAI_API_KEY .............. OpenAI (optional)
 * - ANTHROPIC_API_KEY ........... Anthropic Claude (optional)
 * - AWS_REGION ................. region for DynamoDB
 * - AWS_ACCESS_KEY_ID .......... IAM key for DynamoDB
 * - AWS_SECRET_ACCESS_KEY ...... IAM secret for DynamoDB
 * - AWS_DYNAMODB_TABLE_PREFIX .. prefix for all DynamoDB table names
 * - AWS_S3_BUCKET_NAME ......... bucket for document storage
 * - AWS_S3_REGION .............. region for the S3 bucket
 * - AWS_S3_ACCESS_KEY_ID ....... IAM key for S3 (falls back to AWS_ACCESS_KEY_ID)
 * - AWS_S3_SECRET_ACCESS_KEY ... IAM secret for S3 (falls back to AWS_SECRET_ACCESS_KEY)
 */

export interface AppEnv {
  // Core
  NEXT_PUBLIC_APP_URL: string
  // AI providers
  AI_PROVIDER?: string
  GOOGLE_GENERATIVE_AI_API_KEY?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  // Persistence (Amazon DynamoDB)
  AWS_REGION?: string
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_DYNAMODB_TABLE_PREFIX?: string
  // File storage (Amazon S3)
  AWS_S3_BUCKET_NAME?: string
  AWS_S3_REGION?: string
  AWS_S3_ACCESS_KEY_ID?: string
  AWS_S3_SECRET_ACCESS_KEY?: string
  // Authentication (Clerk)
  CLERK_SECRET_KEY?: string
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
}

/**
 * Reads the raw environment into a typed object. Only NEXT_PUBLIC_* values are
 * inlined on the client; server-only values are read lazily on the server.
 */
export const env: AppEnv = {
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  AI_PROVIDER: process.env.AI_PROVIDER,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_DYNAMODB_TABLE_PREFIX: process.env.AWS_DYNAMODB_TABLE_PREFIX,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_S3_REGION: process.env.AWS_S3_REGION,
  AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
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
  /** Amazon DynamoDB persistence is ready to connect. */
  database: () =>
    hasAll(['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']),
  /** Amazon S3 document storage is ready to connect. */
  storage: () =>
    hasAll([
      'AWS_S3_BUCKET_NAME',
      // region + credentials are resolved with AWS_* fallbacks (see s3-service)
    ]) &&
    (hasAll(['AWS_S3_REGION']) || hasAll(['AWS_REGION'])) &&
    (hasAll(['AWS_S3_ACCESS_KEY_ID', 'AWS_S3_SECRET_ACCESS_KEY']) ||
      hasAll(['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'])),
  /** Gemini (default AI provider) is ready to connect. */
  gemini: () => hasAll(['GOOGLE_GENERATIVE_AI_API_KEY']),
  /** OpenAI (optional) is ready to connect. */
  openai: () => hasAll(['OPENAI_API_KEY']),
  /** Anthropic Claude (optional) is ready to connect. */
  claude: () => hasAll(['ANTHROPIC_API_KEY']),
  /** Clerk authentication is ready to connect. */
  auth: () =>
    hasAll(['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY']),
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
