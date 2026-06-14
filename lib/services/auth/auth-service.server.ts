/**
 * Authentication service — Clerk-backed.
 *
 * This is the single place the rest of the app asks "who is the current user?".
 * Identity (id, name, email, avatar) is resolved from the active Clerk session
 * on the server via `auth()` / `currentUser()`. App-specific profile stats that
 * Clerk does not store (plan, streak, goal) are still sourced from the seeded
 * profile so the dashboard renders identically — DynamoDB is left untouched.
 *
 * NOTE: This module imports `@clerk/nextjs/server` and is therefore
 * server-only. Client components must read the user via Clerk's `useUser()`
 * hook instead of importing this service.
 */
import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'
import { features } from '@/config/env'
import { userRepository } from '@/db/repositories/user-repository'
import type { User } from '@/types'

/** The shape of a user resolved from the active Clerk session. */
export interface ClerkSessionUser {
  id: string
  firstName: string
  lastName: string
  fullName: string
  emailAddress: string
  imageUrl: string
}

/** Derives uppercase initials (max 2) from a display name or email. */
function deriveInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return initials || 'U'
}

/** Resolves the current user from the active Clerk session (server-only). */
async function resolveClerkUser(): Promise<ClerkSessionUser | null> {
  const { userId } = await auth()
  if (!userId) {
    console.log('[v0] CLERK_USER', null)
    return null
  }

  const u = await currentUser()
  const firstName = u?.firstName ?? ''
  const lastName = u?.lastName ?? ''
  const emailAddress =
    u?.primaryEmailAddress?.emailAddress ??
    u?.emailAddresses?.[0]?.emailAddress ??
    ''

  const clerkUser: ClerkSessionUser = {
    id: userId,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' ') || (u?.username ?? ''),
    emailAddress,
    imageUrl: u?.imageUrl ?? '',
  }

  console.log('[v0] CLERK_USER', clerkUser)
  return clerkUser
}

export const authService = {
  /**
   * Clerk-backed current user, exactly as stored in the active session.
   * Returns null when there is no authenticated user.
   */
  async getClerkUser(): Promise<ClerkSessionUser | null> {
    return resolveClerkUser()
  },

  /**
   * Returns the currently authenticated user mapped to the app `User` type.
   * Identity comes from Clerk; app-specific stats (plan/streak/goal) come from
   * the seeded profile. Falls back to the seeded user when unauthenticated.
   */
  async getCurrentUser(): Promise<User> {
    const clerk = await resolveClerkUser()
    // App-specific stats (plan/streak/goal) come from the seed — Clerk does not
    // store these. IDENTITY (name/email/initials/id) must always come from
    // Clerk and must never fall back to the seeded "Aarav Sharma" profile.
    const seed = userRepository.getCurrent()

    if (!clerk) {
      // Unauthenticated (or Clerk unavailable): return neutral identity so the
      // seeded mock user is never displayed.
      return {
        id: '',
        name: '',
        email: '',
        initials: 'U',
        plan: seed.plan,
        streak: seed.streak,
        goal: seed.goal,
      }
    }

    const name = clerk.fullName || clerk.emailAddress
    return {
      id: clerk.id,
      name,
      email: clerk.emailAddress,
      initials: deriveInitials(name),
      plan: seed.plan,
      streak: seed.streak,
      goal: seed.goal,
    }
  },

  /**
   * Live read of the current user. Identity is resolved from Clerk; kept as a
   * distinct method so existing callers (e.g. /api/auth) stay stable.
   */
  async getCurrentUserLive(): Promise<User> {
    return this.getCurrentUser()
  },

  /** Whether Clerk authentication is configured. */
  isConfigured(): boolean {
    return features.auth()
  },
}
