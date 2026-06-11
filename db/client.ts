/**
 * Database client (AWS Aurora PostgreSQL seam).
 *
 * Production note:
 * - This module is the single place where the Aurora PostgreSQL connection
 *   will be created. Today it exposes the mock seed data so repositories have
 *   a working data source without a live database.
 * - When connecting Aurora:
 *     1. Add DATABASE_URL to the environment (see config/env.ts).
 *     2. Install a Postgres driver (e.g. `pg` / `@aws-sdk/rds-signer` for IAM
 *        auth) — follow the Amazon Aurora PostgreSQL integration guide.
 *     3. Replace `getMockTables()` usage in the repositories with real SQL
 *        queries executed through the pool created here.
 *
 * Example (future):
 *   import { Pool } from 'pg'
 *   export const pool = new Pool({ connectionString: env.DATABASE_URL })
 */
import { env, features } from '@/config/env'
import * as seed from '@/db/seed'

/** Whether the app is currently backed by a live database. */
export function isDatabaseConnected(): boolean {
  return features.database()
}

/**
 * Returns the in-memory mock tables. Repositories use this while the database
 * is not connected. The shapes match types/index.ts exactly so that swapping
 * to real SQL rows requires no changes upstream.
 */
export function getMockTables() {
  return {
    users: [seed.user],
    subjects: seed.subjects,
    documents: seed.knowledgeItems,
    activity: seed.recentActivity,
    concepts: seed.graphConcepts,
    conceptConnections: seed.graphEdges,
    quizQuestions: seed.quizQuestions,
    learningGaps: seed.learningGaps,
    examReadiness: seed.examReadiness,
    recommendations: seed.aiCoach,
    learningIntelligence: seed.learningIntelligence,
    adminStats: seed.adminStats,
    knowledgeGrowth: seed.knowledgeGrowth,
    studyActivity: seed.studyActivity,
    conceptJourney: seed.conceptJourney,
  }
}

/**
 * Placeholder query helper.
 *
 * Production note: replace with a real parameterized query runner once Aurora
 * is connected. Always use parameterized queries to prevent SQL injection.
 */
export async function query<T = unknown>(
  _sql: string,
  _params: unknown[] = [],
): Promise<T[]> {
  if (!isDatabaseConnected()) {
    throw new Error(
      'Database is not connected. Set DATABASE_URL to enable live queries. ' +
        `(target region: ${env.AWS_REGION ?? 'unset'})`,
    )
  }
  // TODO(aurora): execute against the Aurora PostgreSQL pool created above.
  return []
}
