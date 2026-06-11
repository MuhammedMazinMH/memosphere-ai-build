import { Upload, BrainCircuit, Network, GraduationCap } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Capture anything',
    text: 'Drop in PDFs, presentations, lecture notes, whiteboard photos, or videos. MemoSphere ingests it all.',
  },
  {
    icon: BrainCircuit,
    step: '02',
    title: 'AI structures it',
    text: 'Every upload is summarized, tagged, and broken into key concepts, flashcards, and quizzes automatically.',
  },
  {
    icon: Network,
    step: '03',
    title: 'Knowledge connects',
    text: 'Concepts link across subjects in an interactive knowledge graph that mirrors how you actually understand.',
  },
  {
    icon: GraduationCap,
    step: '04',
    title: 'You retain & recall',
    text: 'Search instantly, close learning gaps, and track exam readiness until you are confident and prepared.',
  },
]

export function HowItWorks() {
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
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="relative rounded-xl border border-border bg-card p-6"
            >
              <span className="text-sm font-mono font-medium text-muted-foreground/60">
                {s.step}
              </span>
              <div className="mt-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
