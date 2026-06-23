/**
 * User repository — Amazon DynamoDB.
 *
 * Identity is owned by Clerk (see lib/services/auth/*). The item here mirrors
 * profile data persisted in the `users` table, keyed by the Clerk user id.
 * There is NO mock/seed user — reads return live data or `undefined`.
 */
import { isDatabaseConnected, getItem, buildKey } from '@/db/client'
import type { User } from '@/types'

export const userRepository = {
  /** Live read of a user by id from DynamoDB (GetItem); undefined otherwise. */
  async findById(id: string): Promise<User | undefined> {
    if (!isDatabaseConnected()) return undefined
    return getItem<User>('users', buildKey('users', id))
  },
}
