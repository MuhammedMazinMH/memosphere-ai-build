/**
 * Subject repository — Amazon DynamoDB.
 *
 * Repositories own all data access. There is NO mock/seed data: synchronous
 * methods return empty/zero values so unwired callers render clean empty
 * states. The async `*FromDb` methods read from DynamoDB (table: `subjects`)
 * and fall back to the same empty values on absence/error.
 *
 * DynamoDB access goes exclusively through the parameterized helpers in
 * db/client.ts (scan/get/query) — no hand-built commands here.
 */
import { isDatabaseConnected, scanAll, getItem, buildKey } from '@/db/client'
import type { Subject } from '@/types'

export const subjectRepository = {
  /** Sync read of all subjects (empty until wired to a live source). */
  findAll(): Subject[] {
    return []
  },

  /** Sync read of a single subject by id (none until wired). */
  findById(_id: string): Subject | undefined {
    return undefined
  },

  count(): number {
    return 0
  },

  /** Live read of all subjects from DynamoDB (Scan); empty otherwise. */
  async findAllFromDb(): Promise<Subject[]> {
    if (!isDatabaseConnected()) return []
    return scanAll<Subject>('subjects')
  },

  /** Live read of a single subject from DynamoDB (GetItem); undefined otherwise. */
  async findByIdFromDb(id: string): Promise<Subject | undefined> {
    if (!isDatabaseConnected()) return undefined
    return getItem<Subject>('subjects', buildKey('subjects', id))
  },
}
