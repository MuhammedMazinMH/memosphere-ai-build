/**
 * /api/notifications — per-user notification feed.
 *
 * GET    -> list notifications + unread count for the current user
 * PATCH  -> mark one ({ id }) or all ({ all: true }) as read
 *
 * Every handler is scoped to the authenticated Clerk user.
 */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { notificationRepository } from '@/db/repositories/notification-repository'
import type { NotificationType } from '@/lib/types/account'

/** Server-owned copy for each app event, so clients can't spoof content. */
const EVENT_COPY: Record<
  Extract<NotificationType, 'account_created' | 'profile_updated'>,
  { title: string; message: string }
> = {
  account_created: {
    title: 'Welcome to MemoSphere',
    message: 'Your account is ready. Upload a document to get started.',
  },
  profile_updated: {
    title: 'Profile updated',
    message: 'Your profile information was saved successfully.',
  },
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    type?: 'account_created' | 'profile_updated'
  }
  const type = body.type
  if (type !== 'account_created' && type !== 'profile_updated') {
    return NextResponse.json({ error: 'Unsupported event type' }, { status: 400 })
  }

  // account_created is emitted at most once per user (idempotent welcome).
  if (type === 'account_created') {
    const existing = await notificationRepository.listForUser(userId)
    if (existing.some((n) => n.type === 'account_created')) {
      const unread = existing.filter((n) => !n.isRead).length
      return NextResponse.json({ notifications: existing, unread })
    }
  }

  await notificationRepository.create({
    userId,
    type,
    ...EVENT_COPY[type],
  })

  const notifications = await notificationRepository.listForUser(userId)
  const unread = notifications.filter((n) => !n.isRead).length
  return NextResponse.json({ notifications, unread })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notifications = await notificationRepository.listForUser(userId)
  const unread = notifications.filter((n) => !n.isRead).length
  return NextResponse.json({ notifications, unread })
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string
    all?: boolean
  }

  if (body.all) {
    await notificationRepository.markAllRead(userId)
  } else if (body.id) {
    await notificationRepository.markRead(userId, body.id)
  } else {
    return NextResponse.json(
      { error: 'Provide an id or all:true' },
      { status: 400 },
    )
  }

  const notifications = await notificationRepository.listForUser(userId)
  const unread = notifications.filter((n) => !n.isRead).length
  return NextResponse.json({ notifications, unread })
}
