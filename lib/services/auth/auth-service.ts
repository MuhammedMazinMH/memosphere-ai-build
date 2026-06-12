/**
 * Authentication service (Clerk-ready seam).
 *
 * Production note:
 * - Authentication is provided by Clerk. This service is the single place the
 *   rest of the app asks "who is the current user?".
 * - When connecting Clerk:
 *     1. Add CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 *        (see config/env.ts).
 *     2. Install @clerk/nextjs, wrap the app in <ClerkProvider>, and add the
 *        Clerk middleware.
 *     3. Replace `getCurrentUser()` below with `auth()` / `currentUser()` from
 *        @clerk/nextjs/server and map the Clerk user to the User type.
 * - Today it returns the seeded mock user via the repository so the UI renders
 *   identically without a real auth session.
 */
import { features } from '@/config/env'
import { userRepository } from '@/db/repositories/user-repository'
import type { User } from '@/types'

export const authService = {
  /** Returns the currently authenticated user. */
  getCurrentUser(): User {
    // TODO(clerk): const { userId } = await auth(); load profile from DynamoDB.
    return userRepository.getCurrent()
  },

  /** Whether Clerk authentication is configured. */
  isConfigured(): boolean {
    return features.auth()
  },
}
