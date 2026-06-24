import { FileWarning, SearchX, Layers } from 'lucide-react'

const problems = [
  {
    icon: FileWarning,
    title: 'Knowledge gets buried',
    text: 'PDFs pile up across folders, apps, and devices until you can never find them again.',
  },
  {
    icon: SearchX,
    title: 'Search returns nothing useful',
    text: 'Traditional note apps store files, not understanding. You remember learning it — but not where.',
  },
  {
    icon: Layers,
    title: 'Connections are lost',
    text: 'The same concept appears across subjects, yet nothing links them together into real comprehension.',
  },
]

export function ProblemStatement() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Learners collect knowledge. Then it disappears.
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            You invest hours studying, but the information becomes fragmented
            and impossible to retrieve when it matters most.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <p.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
