import type { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero"

const LOGO_MASK =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODQiIGhlaWdodD0iODQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI1IiBjeT0iNiIgcj0iMS42IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iNiIgcj0iMS42IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjUiIGN5PSIxOCIgcj0iMS42IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iMTgiIHI9IjEuNiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNOS42IDEwLjQgNi4yIDdNMTQuNCAxMC40IDE3LjggN005LjYgMTMuNiA2LjIgMTdNMTQuNCAxMy42IDE3LjggMTciLz48L3N2Zz4="

const logoMaskStyle = {
  WebkitMaskImage: `url('${LOGO_MASK}')`,
  WebkitMaskSize: "min(70%, 420px)",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url('${LOGO_MASK}')`,
  maskSize: "min(70%, 420px)",
  maskPosition: "center",
  maskRepeat: "no-repeat",
} as const

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
        <FlickeringGrid
          className="absolute inset-0 z-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]"
          color="#ffffff"
          maxOpacity={0.12}
          flickerChance={0.12}
          squareSize={4}
          gridGap={4}
        />
        <div className="absolute inset-0 z-0" style={logoMaskStyle}>
          <FlickeringGrid
            color="#ffffff"
            maxOpacity={0.7}
            flickerChance={0.2}
            squareSize={3}
            gridGap={6}
          />
        </div>
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 text-primary-foreground">
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
