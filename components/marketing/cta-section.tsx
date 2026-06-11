import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center sm:px-12 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_0%,var(--accent),transparent)] opacity-20"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
              Build your academic second brain today
            </h2>
            <p className="mt-4 text-pretty text-lg text-primary-foreground/80">
              Join thousands of learners who never lose a concept again. Start
              free in under a minute.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                render={
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
