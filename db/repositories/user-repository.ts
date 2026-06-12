/**
 * User repository — Amazon DynamoDB.
 *
 * Identity is owned by the auth provider; the item here mirrors profile data
 * persisted in the `users` table, keyed by the auth user id. Synchronous
 * `getCurrent` serves the seeded demo user; async methods read live data.
 */
import { getMockTables, isDatabaseConnected, getItem, buildKey } from '@/db/client'
import type { User } from '@/types'

export const userRepository = {
  /** Returns the currently-signed-in user (demo: the single seeded user). */
  getCurrent(): User {
    return getMockTables().users[0]
  },

  count(): number {
    return getMockTables().adminStats.totalUsers
  },

  /** Live read of a user by id from DynamoDB (GetItem), with demo fallback. */
  async findById(id: string): Promise<User | undefined> {
    if (!isDatabaseConnected()) {
      const u = getMockTables().users[0]
      return u
    }
    return getItem<User>('users', buildKey('users', id))
  },
}
