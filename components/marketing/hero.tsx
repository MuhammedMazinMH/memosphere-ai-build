"use client"

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'
import { LampContainer } from '@/components/ui/lamp'
import { HeroBackground } from '@/components/marketing/hero-background'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <HeroBackground />
      <LampContainer className="bg-transparent pb-12 lg:pb-20">
        <motion.div
          initial={{ opacity: 0.5, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="mx-auto flex max-w-3xl flex-col items-center pt-[5.5rem] text-center sm:pt-24"
        >
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="size-3.5 text-primary" />
            Your Academic Second Brain
          </Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Turn scattered study material into{' '}
            <span className="text-primary">searchable intelligence</span>
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            MemoSphere AI captures knowledge from your PDF study materials
            — then connects, summarizes, and quizzes you on it so
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
        </motion.div>
      </LampContainer>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-5xl lg:-mt-12">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
