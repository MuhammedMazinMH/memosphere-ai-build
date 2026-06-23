'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.log('[v0] global error boundary:', error?.message)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          background: '#0a0a0a',
          color: '#fafafa',
          padding: '1.5rem',
        }}
      >
        <main
          style={{
            width: '100%',
            maxWidth: '28rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: '#a3a3a3',
              margin: '0 0 1.5rem',
            }}
          >
            The page hit an unexpected error. You can try reloading to continue.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              appearance: 'none',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#fafafa',
              color: '#0a0a0a',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
