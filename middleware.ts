import { clerkMiddleware } from '@clerk/nextjs/server'

// Latest App Router approach. By default `clerkMiddleware` does NOT protect any
// routes — it only makes the auth/session context available to the app. No
// route protection is configured yet so all existing routes and pages behave
// exactly as before.
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
