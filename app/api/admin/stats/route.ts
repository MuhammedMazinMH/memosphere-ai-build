/**
 * /api/admin/stats — real platform metrics for the Admin dashboard.
 *
 * Admin-only (enforced via isAdmin). User metrics come from Clerk; content
 * metrics come from DynamoDB. No fabricated numbers — when a data source is
 * unavailable the corresponding count is a real 0, never a mock value.
 */
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/roles'
import { isDatabaseConnected, scanAll } from '@/db/client'
import { settingsRepository } from '@/db/repositories/settings-repository'
import { notificationRepository } from '@/db/repositories/notification-repository'
import type { TableName } from '@/db/tables'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** Counts rows in a table, returning 0 when DynamoDB is not connected. */
async function safeCount(table: TableName): Promise<number> {
  if (!isDatabaseConnected()) return 0
  try {
    const items = await scanAll<unknown>(table)
    return items.length
  } catch {
    return 0
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // --- Clerk user metrics ---
  const client = await clerkClient()
  const totalUsers = await client.users.getCount()

  // Pull a recent window of users to derive "new this week" / "active".
  const sample = await client.users.getUserList({
    limit: 100,
    orderBy: '-created_at',
  })
  const now = Date.now()
  const newThisWeek = sample.data.filter(
    (u) => now - u.createdAt < WEEK_MS,
  ).length
  const activeUsers = sample.data.filter(
    (u) => u.lastActiveAt != null && now - u.lastActiveAt < WEEK_MS,
  ).length

  // --- DynamoDB content metrics ---
  const [subjects, documents, concepts, settingsCount, notificationsCount] =
    await Promise.all([
      safeCount('subjects'),
      safeCount('documents'),
      safeCount('concepts'),
      settingsRepository.count(),
      notificationRepository.count(),
    ])

  return NextResponse.json({
    users: {
      total: totalUsers,
      newThisWeek,
      active: activeUsers,
    },
    content: {
      subjects,
      documents,
      concepts,
      settings: settingsCount,
      notifications: notificationsCount,
    },
  })
}
