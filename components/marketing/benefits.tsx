import { Clock, TrendingUp, ShieldCheck, Zap } from 'lucide-react'

const benefits = [
  { icon: Clock, stat: '5x', label: 'faster revision', text: 'Find any concept in seconds instead of scrolling through folders.' },
  { icon: TrendingUp, stat: '92%', label: 'better retention', text: 'Active recall through AI quizzes locks knowledge into long-term memory.' },
  { icon: Zap, stat: '10k+', label: 'concepts mapped', text: 'Connect ideas across every subject into one living knowledge graph.' },
  { icon: ShieldCheck, stat: '100%', label: 'yours, organized', text: 'Your study material, structured into intelligence you actually own.' },
]

export function Benefits() {
  return (
    <section className="scroll-mt-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Built to make learning stick
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            MemoSphere is designed around how memory and mastery actually work.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.label} className="flex flex-col items-start">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                <b.icon className="size-5 text-primary" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  {b.stat}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {b.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
