/**
 * Shared types for user-owned account data persisted in DynamoDB:
 * settings (study goal, bio, notification preferences) and notifications.
 */

/** The four notification preference toggles surfaced in the Settings UI. */
export interface NotificationPreferences {
  weekly: boolean
  gaps: boolean
  quiz: boolean
  product: boolean
}

/** Per-user settings item (one per Clerk user id). */
export interface UserSettings {
  userId: string
  studyGoal: string
  bio: string
  notifications: NotificationPreferences
  createdAt: number
  updatedAt: number
}

/** Notification categories the foundation supports. */
export type NotificationType =
  | 'account_created'
  | 'profile_updated'
  | 'study_goal_updated'
  | 'feature_announcement'
  | 'document_uploaded'
  | 'graph_generated'
  | 'quiz_completed'

/** A single notification belonging to a user. */
export interface Notification {
  userId: string
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: number
}

/** Default notification preferences for a brand-new user. */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  weekly: true,
  gaps: true,
  quiz: false,
  product: false,
}
