/**
 * Role-Based Access Control (RBAC) — Clerk is the source of truth.
 *
 * A user's role lives in Clerk `publicMetadata.role`. Anyone without an
 * explicit `"admin"` role is treated as a normal `"user"`. These helpers are
 * server-only and are used to gate admin routes, API handlers, and server
 * components. Frontend hiding (sidebar) is a convenience only — every
 * privileged surface is enforced here on the server.
 */
import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'

export type Role = 'admin' | 'user'

/** Normalizes any metadata value into a known Role. */
export function normalizeRole(value: unknown): Role {
  return value === 'admin' ? 'admin' : 'user'
}

/** Returns the role for the currently authenticated user (default: "user"). */
export async function getCurrentRole(): Promise<Role> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return 'user'

  // Prefer the role embedded in the session claims (fast, no API call) when
  // present, falling back to a full user fetch.
  const claimRole = (sessionClaims?.metadata as { role?: unknown } | undefined)
    ?.role
  if (claimRole !== undefined) return normalizeRole(claimRole)

  const user = await currentUser()
  return normalizeRole(user?.publicMetadata?.role)
}

/** Whether the current authenticated user is an admin. */
export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === 'admin'
}
