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

  try {
    // 1) Remove DynamoDB-owned data (each step is independently fault-tolerant).
    await settingsRepository.remove(userId)
    await notificationRepository.removeAllForUser(userId)
    await purgeOwned('subjects', 'userId', 'id', userId)
    await purgeOwned('documents', 'userId', 'id', userId)
  } catch (error) {
    console.error('[api/account] DynamoDB cleanup failed for userId', userId, error)
    // Do not block deletion over a cleanup failure — continue to Clerk deletion.
  }

  try {
    // 2) Delete the Clerk user (permanent, requires CLERK_SECRET_KEY).
    const client = await clerkClient()
    await client.users.deleteUser(userId)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[api/account] Clerk deleteUser failed for userId', userId, error)
    return NextResponse.json(
      { error: 'Could not delete account', detail: message },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
