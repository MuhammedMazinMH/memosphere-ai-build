import type { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-start">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-primary-foreground">
          <Logo className="text-primary-foreground" />
          <div className="flex flex-col gap-6">
            <p className="text-2xl font-medium leading-relaxed text-balance">
              {"\u201C"}MemoSphere turned three years of scattered lecture notes
              into a single brain I can actually search. It&apos;s the study tool
              I wish I had freshman year.{"\u201D"}
            </p>
            <div className="flex flex-col">
              <span className="font-semibold">Priya Sharma</span>
              <span className="text-sm text-primary-foreground/70">
                Medical student, AIIMS
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-primary-foreground/20 pt-8">
            <Stat value="50k+" label="Learners" />
            <Stat value="2.4M" label="Documents" />
            <Stat value="4.9/5" label="Rating" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-sm text-primary-foreground/70">{label}</span>
    </div>
  )
}
