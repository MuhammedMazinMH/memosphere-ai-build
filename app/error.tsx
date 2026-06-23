'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.log('[v0] route error boundary:', error?.message)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-xl font-semibold text-foreground text-balance">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground text-pretty">
          The page hit an unexpected error. You can try again to continue where you left off.
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </main>
  )
}
