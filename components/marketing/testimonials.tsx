import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const testimonials = [
  {
    quote:
      'MemoSphere turned three semesters of chaotic PDFs into something I can actually search. My exam prep went from frantic to calm.',
    name: 'Priya Nair',
    role: 'Final-year CS student',
    initials: 'PN',
  },
  {
    quote:
      'The knowledge graph is unreal. Seeing how regression links statistics, ML, and data science finally made everything click.',
    name: 'Daniel Osei',
    role: 'Data Science MSc',
    initials: 'DO',
  },
  {
    quote:
      'I prep for competitive exams and the gap analysis tells me exactly what to revise. It feels like a personal tutor.',
    name: 'Meera Iyer',
    role: 'GATE aspirant',
    initials: 'MI',
  },
  {
    quote:
      'Auto-generated quizzes after every upload keep me honest. My retention has genuinely doubled this term.',
    name: 'Lucas Almeida',
    role: 'Pre-med student',
    initials: 'LA',
  },
  {
    quote:
      'As a working professional doing certifications, having one searchable brain for everything is a game changer.',
    name: 'Sara Köhler',
    role: 'Cloud cert candidate',
    initials: 'SK',
  },
  {
    quote:
      'Beautiful, fast, and genuinely useful. MemoSphere is the first study tool that respects how I actually learn.',
    name: 'Arjun Verma',
    role: 'University tutor',
    initials: 'AV',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-16 border-y border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Loved by learners
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted by students and lifelong learners
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-6"
            >
              <div>
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-pretty text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
