/**
 * /api/account — account lifecycle.
 *
 * DELETE removes all server-owned data for the authenticated user from
 * DynamoDB (settings, notifications, and user-owned records) AND deletes the
 * Clerk user via the backend API. The client then signs out and redirects.
 * Deletion is permanent and strictly scoped to the caller's own account.
 */
import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { settingsRepository } from '@/db/repositories/settings-repository'
import { notificationRepository } from '@/db/repositories/notification-repository'
import { isDatabaseConnected, deleteItem, buildKey, scanAll } from '@/db/client'
import type { TableName } from '@/db/tables'

/** Deletes every item a user owns from a table keyed by a user-id attribute. */
async function purgeOwned(
  table: TableName,
  ownerAttr: string,
  partitionAttr: string,
  userId: string,
): Promise<void> {
  if (!isDatabaseConnected()) return
  try {
    const items = await scanAll<Record<string, unknown>>(table)
    await Promise.all(
      items
        .filter((item) => item[ownerAttr] === userId)
        .map((item) =>
          deleteItem(table, buildKey(table, item[partitionAttr])),
        ),
    )
  } catch {
    // Table may not exist in every environment — ignore and continue.
  }
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1) Remove DynamoDB-owned data.
  await settingsRepository.remove(userId)
  await notificationRepository.removeAllForUser(userId)
  // User-owned content keyed by id with an owner attribute.
  await purgeOwned('subjects', 'userId', 'id', userId)
  await purgeOwned('documents', 'userId', 'id', userId)

  // 2) Delete the Clerk user (permanent).
  const client = await clerkClient()
  await client.users.deleteUser(userId)

  return NextResponse.json({ success: true })
}
