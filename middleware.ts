import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Authenticated areas: the dashboard UI and the app's data APIs.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/settings(.*)',
  '/api/notifications(.*)',
  '/api/account(.*)',
])

// Admin-only areas. Role is enforced authoritatively in the admin server
// component and the /api/admin handlers (via isAdmin); the middleware adds a
// first layer so unauthenticated users never reach them.
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)', '/api/admin(.*)'])

// Auth pages. Already-authenticated users should never see these — they are
// redirected to the dashboard here (a real HTTP redirect) rather than via
// `redirect()` inside the page server component, which would throw a
// NEXT_REDIRECT control-flow error that surfaces in the client.
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      // API callers get a 401; page visitors are sent to sign-in.
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const signIn = new URL('/sign-in', req.url)
      return NextResponse.redirect(signIn)
    }
  }

  if (isAuthRoute(req)) {
    const { userId } = await auth()
    if (userId) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
