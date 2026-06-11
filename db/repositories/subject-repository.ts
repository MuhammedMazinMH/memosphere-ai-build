/**
 * Subject repository.
 *
 * Production note:
 * - Repositories own all data access. Today they read from the mock tables in
 *   db/client.ts; once Aurora PostgreSQL is connected, only the function
 *   bodies here change to issue parameterized SQL — callers (services) are
 *   unaffected.
 * - All reads should be scoped by the authenticated user id once Clerk + the
 *   database are connected (e.g. `WHERE user_id = $1`).
 */
import { getMockTables } from '@/db/client'
import type { Subject } from '@/types'

export const subjectRepository = {
  findAll(): Subject[] {
    // TODO(aurora): SELECT * FROM subjects WHERE user_id = $1 ORDER BY name
    return getMockTables().subjects
  },

  findById(id: string): Subject | undefined {
    // TODO(aurora): SELECT * FROM subjects WHERE id = $1 AND user_id = $2
    return getMockTables().subjects.find((s) => s.id === id)
  },

  count(): number {
    return getMockTables().subjects.length
  },
}
