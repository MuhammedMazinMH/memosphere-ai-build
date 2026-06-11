/**
 * User repository.
 *
 * Production note:
 * - Identity is owned by Clerk; the row here mirrors profile data persisted in
 *   Aurora PostgreSQL and keyed by the Clerk user id.
 */
import { getMockTables } from '@/db/client'
import type { User } from '@/types'

export const userRepository = {
  /** Returns the currently-signed-in user (mock: the single seeded user). */
  getCurrent(): User {
    // TODO(clerk+aurora): resolve the Clerk user id, then
    // SELECT * FROM users WHERE id = $1
    return getMockTables().users[0]
  },

  count(): number {
    return getMockTables().adminStats.totalUsers
  },
}
