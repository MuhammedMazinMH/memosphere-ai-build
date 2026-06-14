export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    publishableKeyPresent: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKeyPresent: !!process.env.CLERK_SECRET_KEY,
  })
}
