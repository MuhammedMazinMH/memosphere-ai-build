/**
 * Notification repository — Amazon DynamoDB (`notifications` table).
 *
 * Partition key `userId`, sort key `id`, so a user's notifications are queried
 * together and individual items can be updated/deleted by id. Mirrors the
 * settings repository's in-memory fallback for preview without AWS.
 */
import 'server-only'
import {
  buildKey,
  deleteItem,
  isDatabaseConnected,
  putItem,
  queryByPartition,
  scanAll,
} from '@/db/client'
import type { Notification, NotificationType } from '@/lib/types/account'

/** Process-local fallback keyed by `${userId}#${id}`. */
const memory = new Map<string, Notification>()

function memKey(userId: string, id: string) {
  return `${userId}#${id}`
}

function genId(): string {
  return `ntf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const notificationRepository = {
  /** Lists a user's notifications, newest first. */
  async listForUser(userId: string): Promise<Notification[]> {
    let items: Notification[]
    if (!isDatabaseConnected()) {
      items = [...memory.values()].filter((n) => n.userId === userId)
    } else {
      items = await queryByPartition<Notification>('notifications', userId)
    }
    return items.sort((a, b) => b.createdAt - a.createdAt)
  },

  /** Creates a notification for a user. */
  async create(input: {
    userId: string
    title: string
    message: string
    type: NotificationType
  }): Promise<Notification> {
    const notification: Notification = {
      userId: input.userId,
      id: genId(),
      title: input.title,
      message: input.message,
      type: input.type,
      isRead: false,
      createdAt: Date.now(),
    }
    if (!isDatabaseConnected()) {
      memory.set(memKey(notification.userId, notification.id), notification)
      return notification
    }
    await putItem(
      'notifications',
      notification as unknown as Record<string, unknown>,
    )
    return notification
  },

  /** Marks a single notification as read (scoped to its owner). */
  async markRead(userId: string, id: string): Promise<void> {
    const items = await this.listForUser(userId)
    const target = items.find((n) => n.id === id)
    if (!target || target.isRead) return
    const updated = { ...target, isRead: true }
    if (!isDatabaseConnected()) {
      memory.set(memKey(userId, id), updated)
      return
    }
    await putItem('notifications', updated as unknown as Record<string, unknown>)
  },

  /** Marks every notification for a user as read. */
  async markAllRead(userId: string): Promise<void> {
    const items = await this.listForUser(userId)
    await Promise.all(
      items
        .filter((n) => !n.isRead)
        .map((n) => {
          const updated = { ...n, isRead: true }
          if (!isDatabaseConnected()) {
            memory.set(memKey(userId, n.id), updated)
            return Promise.resolve()
          }
          return putItem(
            'notifications',
            updated as unknown as Record<string, unknown>,
          )
        }),
    )
  },

  /** Deletes every notification owned by a user (account deletion). */
  async removeAllForUser(userId: string): Promise<void> {
    const items = await this.listForUser(userId)
    await Promise.all(
      items.map((n) => {
        if (!isDatabaseConnected()) {
          memory.delete(memKey(userId, n.id))
          return Promise.resolve()
        }
        return deleteItem('notifications', buildKey('notifications', userId, n.id))
      }),
    )
  },

  /** Total notification count across all users (admin metric). */
  async count(): Promise<number> {
    if (!isDatabaseConnected()) return memory.size
    const all = await scanAll<Notification>('notifications')
    return all.length
  },
}
