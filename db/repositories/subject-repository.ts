/**
 * Subject repository — Amazon DynamoDB.
 *
 * Repositories own all data access. Synchronous methods serve the in-memory
 * demo data so module-level callers keep working with no AWS account. The
 * async `*FromDb` methods read from DynamoDB (table: `subjects`) when a live
 * database is configured, falling back to the demo data otherwise.
 *
 * DynamoDB access goes exclusively through the parameterized helpers in
 * db/client.ts (scan/get/query) — no hand-built commands here.
 */
import { getMockTables, isDatabaseConnected, scanAll, getItem, buildKey } from '@/db/client'
import type { Subject } from '@/types'

export const subjectRepository = {
  /** Demo/sync read of all subjects. */
  findAll(): Subject[] {
    return getMockTables().subjects
  },

  /** Demo/sync read of a single subject by id. */
  findById(id: string): Subject | undefined {
    return getMockTables().subjects.find((s) => s.id === id)
  },

  count(): number {
    return getMockTables().subjects.length
  },

  /** Live read of all subjects from DynamoDB (Scan), with demo fallback. */
  async findAllFromDb(): Promise<Subject[]> {
    if (!isDatabaseConnected()) return this.findAll()
    return scanAll<Subject>('subjects')
  },

  /** Live read of a single subject from DynamoDB (GetItem), with demo fallback. */
  async findByIdFromDb(id: string): Promise<Subject | undefined> {
    if (!isDatabaseConnected()) return this.findById(id)
    return getItem<Subject>('subjects', buildKey('subjects', id))
  },
}
