/**
 * User settings repository — Amazon DynamoDB (`user_settings` table).
 *
 * Stores the per-user data Clerk does not own: study goal, bio, and
 * notification preferences. Keyed by the Clerk user id.
 *
 * When DynamoDB is not configured (local/preview without AWS credentials), an
 * in-memory Map keeps the feature working end-to-end for the current process
 * so the UI behaves identically; production uses real DynamoDB persistence.
 */
import 'server-only'
import {
  buildKey,
  getItem,
  isDatabaseConnected,
  putItem,
  scanAll,
  deleteItem,
} from '@/db/client'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  type UserSettings,
} from '@/lib/types/account'

/** Process-local fallback store used only when DynamoDB is not connected. */
const memory = new Map<string, UserSettings>()

function defaults(userId: string): UserSettings {
  const now = Date.now()
  return {
    userId,
    studyGoal: '',
    bio: '',
    notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    createdAt: now,
    updatedAt: now,
  }
}

export const settingsRepository = {
  /** Returns a user's settings, creating sensible defaults if none exist. */
  async get(userId: string): Promise<UserSettings> {
    if (!isDatabaseConnected()) {
      return memory.get(userId) ?? defaults(userId)
    }
    try {
      const existing = await getItem<UserSettings>(
        'userSettings',
        buildKey('userSettings', userId),
      )
      return existing ?? defaults(userId)
    } catch (error) {
      // The table may not exist yet, or AWS may be misconfigured. Never crash a
      // render over optional settings — fall back to defaults instead.
      console.log('[v0] settingsRepository.get failed; using defaults', error)
      return defaults(userId)
    }
  },

  /** Creates or replaces a user's full settings item. */
  async put(settings: UserSettings): Promise<UserSettings> {
    const next = { ...settings, updatedAt: Date.now() }
    if (!isDatabaseConnected()) {
      memory.set(next.userId, next)
      return next
    }
    await putItem('userSettings', next as unknown as Record<string, unknown>)
    return next
  },

  /** Patches profile fields (study goal / bio), preserving everything else. */
  async updateProfile(
    userId: string,
    patch: { studyGoal?: string; bio?: string },
  ): Promise<UserSettings> {
    const current = await this.get(userId)
    return this.put({
      ...current,
      studyGoal: patch.studyGoal ?? current.studyGoal,
      bio: patch.bio ?? current.bio,
    })
  },

  /** Replaces the notification preferences for a user. */
  async updateNotifications(
    userId: string,
    prefs: NotificationPreferences,
  ): Promise<UserSettings> {
    const current = await this.get(userId)
    return this.put({ ...current, notifications: prefs })
  },

  /** Permanently removes a user's settings item (account deletion). */
  async remove(userId: string): Promise<void> {
    if (!isDatabaseConnected()) {
      memory.delete(userId)
      return
    }
    await deleteItem('userSettings', buildKey('userSettings', userId))
  },

  /** Total number of stored settings items (admin metric). */
  async count(): Promise<number> {
    if (!isDatabaseConnected()) return memory.size
    try {
      const all = await scanAll<UserSettings>('userSettings')
      return all.length
    } catch (error) {
      console.log('[v0] settingsRepository.count failed', error)
      return 0
    }
  },
}
