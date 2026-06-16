/**
 * Shared API helpers for Route Handlers.
 *
 * Production note:
 * - These wrap responses in a consistent envelope. Once Clerk is connected,
 *   add an `auth()` guard here (or in middleware) so every protected route is
 *   scoped to the authenticated user.
 */
import { NextResponse } from 'next/server'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init)
}

export function badRequest(errors: Record<string, string[]> | { error: string }) {
  return NextResponse.json({ success: false, ...errors }, { status: 400 })
}

export function unauthorized(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 },
  )
}

export function serverError(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 },
  )
}

export function notImplemented(message: string) {
  // 200 with a mock payload today; real handlers will replace this.
  return NextResponse.json({ success: true, mock: true, message })
}
