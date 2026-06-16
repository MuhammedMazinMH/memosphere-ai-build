'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Upload,
  BrainCircuit,
  Network,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tabs = [
  {
    value: 'capture',
    icon: Upload,
    label: 'Capture anything',
    content: {
      badge: 'Step 01',
      title: 'Capture anything, instantly.',
      description:
        'Drop in PDFs, presentations, lecture notes, or whiteboard photos. MemoSphere ingests it all and gets it ready to learn from.',
      buttonText: 'Start capturing',
      imageSrc: '/images/how-it-works/capture.png',
      imageAlt:
        'Study materials like PDFs, slides, and notes being pulled into MemoSphere',
    },
  },
  {
    value: 'structure',
    icon: BrainCircuit,
    label: 'AI structures it',
    content: {
      badge: 'Step 02',
      title: 'AI structures it for you.',
      description:
        'Every upload is summarized, tagged, and broken into key concepts, flashcards, and quizzes automatically — no manual organizing required.',
      buttonText: 'See the magic',
      imageSrc: '/images/how-it-works/structure.png',
      imageAlt: 'AI organizing scattered text into summaries, flashcards and quizzes',
    },
  },
  {
    value: 'connect',
    icon: Network,
    label: 'Knowledge connects',
    content: {
      badge: 'Step 03',
      title: 'Your knowledge connects.',
      description:
        'Concepts link across subjects in an interactive knowledge graph that mirrors how you actually understand and recall information.',
      buttonText: 'Explore the graph',
      imageSrc: '/images/how-it-works/connect.png',
      imageAlt: 'An interactive knowledge graph of connected concept nodes',
    },
  },
  {
    value: 'recall',
    icon: GraduationCap,
    label: 'You retain & recall',
    content: {
      badge: 'Step 04',
      title: 'You retain & recall with confidence.',
      description:
        'Search instantly, close learning gaps, and track exam readiness until you are genuinely confident and fully prepared.',
      buttonText: 'Track your progress',
      imageSrc: '/images/how-it-works/recall.png',
      imageAlt: 'A mastery dashboard showing search, progress rings and exam readiness',
    },
  },
]

export function HowItWorks() {
  const [active, setActive] = useState(tabs[0].value)
  const activeTab = tabs.find((t) => t.value === active) ?? tabs[0]

  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From raw material to mastery in four steps
          </h2>
        </div>

        {/* Tab triggers */}
        <div
          role="tablist"
          aria-label="How it works steps"
          className="mt-10 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
        >
          {tabs.map((tab) => {
            const isActive = tab.value === active
            return (
              <button
                key={tab.value}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActive(tab.value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Active panel */}
        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border bg-muted/40 p-6 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-5">
              <Badge variant="outline" className="w-fit bg-background">
                {activeTab.content.badge}
              </Badge>
              <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                {activeTab.content.title}
              </h3>
              <p className="text-pretty leading-relaxed text-muted-foreground lg:text-lg">
                {activeTab.content.description}
              </p>
              <Button
                size="lg"
                className="mt-2 w-fit"
                render={
                  <Link href="/sign-up">
                    {activeTab.content.buttonText}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-card">
              <Image
                key={activeTab.value}
                src={activeTab.content.imageSrc || '/placeholder.svg'}
                alt={activeTab.content.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
