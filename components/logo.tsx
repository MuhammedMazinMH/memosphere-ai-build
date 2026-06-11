import { cn } from '@/lib/utils'

export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <circle cx="5" cy="6" r="1.6" />
          <circle cx="19" cy="6" r="1.6" />
          <circle cx="5" cy="18" r="1.6" />
          <circle cx="19" cy="18" r="1.6" />
          <path d="M9.6 10.4 6.2 7M14.4 10.4 17.8 7M9.6 13.6 6.2 17M14.4 13.6 17.8 17" />
        </svg>
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          MemoSphere<span className="text-primary"> AI</span>
        </span>
      )}
    </div>
  )
}
