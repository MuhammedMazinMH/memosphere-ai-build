'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [current, setCurrent] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const length = testimonials.length
  const prev = () => setCurrent((current - 1 + length) % length)
  const next = () => setCurrent((current + 1) % length)

  useEffect(() => {
    if (!isAutoPlay) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlay])

  const getCardIndex = (offset) => (current + offset + length) % length

  return (
    <section id="testimonials" className="scroll-mt-16 border-y border-border bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Loved by learners
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted by students and lifelong learners
          </h2>
        </div>

        <div
          className="relative mx-auto mt-16 h-[34rem] w-full max-w-6xl overflow-hidden px-6 sm:px-8"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
          style={{ perspective: '1200px' }}
        >
          {/* Cards container with 3D perspective */}
          <div className="relative h-full" style={{ transformStyle: 'preserve-3d' }}>
            {[-2, -1, 0, 1, 2].map((offset) => {
              const idx = getCardIndex(offset)
              const t = testimonials[idx]
              const isCenter = offset === 0
              const absOffset = Math.abs(offset)
              const direction = offset > 0 ? 1 : -1

              return (
                <div
                  key={`${idx}-${current}`}
                  className="absolute inset-0 mx-auto w-full max-w-sm transition-all duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isCenter
                      ? 'translateZ(100px) rotateY(0deg) rotateX(0deg)'
                      : `translateX(${direction * absOffset * 280}px) translateZ(${-absOffset * 60}px) rotateY(${direction * absOffset * 15}deg) rotateX(${absOffset * 8}deg) scale(${1 - absOffset * 0.08})`,
                    opacity: isCenter ? 1 : Math.max(0.25, 1 - absOffset * 0.25),
                    zIndex: 100 - absOffset,
                  }}
                >
                  <figure
                    className={`relative h-full flex flex-col justify-between rounded-lg border p-8 transition-all duration-300 ${
                      isCenter
                        ? 'border-primary/40 bg-card shadow-2xl shadow-primary/30'
                        : 'border-border/20 bg-card/40 shadow-lg backdrop-blur-sm'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      ...(isCenter && {
                        clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 0 100%)',
                        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.3), 0 0 1px rgba(0, 0, 0, 0.1)',
                      }),
                    }}
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
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground italic">{t.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              prev()
              setIsAutoPlay(false)
            }}
            className="rounded border border-muted-foreground/40 bg-background/80 p-3 text-muted-foreground transition-all hover:border-primary/60 hover:text-primary hover:bg-primary/5"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => {
              next()
              setIsAutoPlay(false)
            }}
            className="rounded border border-muted-foreground/40 bg-background/80 p-3 text-muted-foreground transition-all hover:border-primary/60 hover:text-primary hover:bg-primary/5"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i)
                setIsAutoPlay(false)
              }}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'bg-primary h-2 w-6'
                  : 'bg-muted-foreground/30 h-2 w-2 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
