import {
  FileText,
  Sparkles,
  Network,
  ListChecks,
  Search,
  Target,
  Gauge,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowCard } from '@/components/ui/spotlight-card'

const features = [
  {
    icon: Sparkles,
    title: 'AI Summary Center',
    text: 'Executive summaries, key concepts, exam topics, and quick revision notes generated for every document.',
    className: 'lg:col-span-2',
  },
  {
    icon: Network,
    title: 'Knowledge Graph',
    text: 'See how concepts connect across subjects in an interactive, explorable graph.',
  },
  {
    icon: ListChecks,
    title: 'AI Quiz Generator',
    text: 'Auto-generated MCQs with difficulty levels, timed mode, and performance analytics.',
  },
  {
    icon: Search,
    title: 'Universal Search',
    text: 'Search across every subject, note, document, and concept with relevance ranking.',
  },
  {
    icon: Target,
    title: 'Learning Gap Analysis',
    text: 'Instantly see what you have mastered, what is shaky, and what is missing.',
  },
  {
    icon: Gauge,
    title: 'Exam Readiness Score',
    text: 'Coverage, accuracy, consistency, and confidence rolled into one clear number.',
    className: 'lg:col-span-2',
  },
  {
    icon: FileText,
    title: 'Smart Library',
    text: 'All your knowledge in grid or list view with powerful filters and sorting.',
  },
  {
    icon: Flame,
    title: 'Learning Streaks',
    text: 'Build a daily habit with streaks and consistency tracking that keep you going.',
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-y border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            An operating system for everything you learn
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Every tool you need to capture, connect, and recall knowledge — powered by AI.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <GlowCard
              key={f.title}
              glowColor="indigo"
              customSize
              className={cn(
                'group !block h-full rounded-xl border-border bg-card p-6 !backdrop-blur-none',
                f.className,
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
