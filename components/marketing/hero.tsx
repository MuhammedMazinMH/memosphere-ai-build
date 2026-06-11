import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,var(--primary),transparent)] opacity-[0.12]"
      />
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="size-3.5 text-primary" />
            Your Academic Second Brain
          </Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Turn scattered study material into{' '}
            <span className="text-primary">searchable intelligence</span>
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            MemoSphere AI captures knowledge from PDFs, slides, notes, images,
            and videos — then connects, summarizes, and quizzes you on it so
            nothing you learn is ever lost again.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
