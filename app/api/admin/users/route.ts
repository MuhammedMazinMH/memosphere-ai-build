/**
 * /api/admin/users — real Clerk user list for the Admin user-management view.
 *
 * Admin-only. Supports an optional `?q=` search term (Clerk query). Returns a
 * trimmed, serializable shape — never raw Clerk objects. View-only: no
 * suspend/ban actions are exposed.
 */
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin, normalizeRole } from '@/lib/auth/roles'

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  const client = await clerkClient()
  const result = await client.users.getUserList({
    limit: 50,
    orderBy: '-created_at',
    ...(query ? { query } : {}),
  })

  const users = result.data.map((u) => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ')
    return {
      id: u.id,
      name: name || u.username || '—',
      email:
        u.primaryEmailAddress?.emailAddress ??
        u.emailAddresses[0]?.emailAddress ??
        '',
      imageUrl: u.imageUrl,
      role: normalizeRole(u.publicMetadata?.role),
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    }
  })

  return NextResponse.json({ users, total: result.totalCount })
}
