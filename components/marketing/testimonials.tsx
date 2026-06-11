'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
    <section id="testimonials" className="scroll-mt-16 border-y border-border bg-muted/30 py-16 sm:py-24">
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
          className="relative mx-auto mt-12 h-[28rem] w-full max-w-4xl px-4"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* Carousel container */}
          <div className="relative h-full perspective">
            <div className="flex items-center justify-center h-full">
              {/* Cards renderer */}
              <AnimatePresence mode="wait">
                {[-1, 0, 1].map((offset) => {
                  const idx = getCardIndex(offset)
                  const t = testimonials[idx]
                  const isCenter = offset === 0
                  const distance = Math.abs(offset)

                  return (
                    <motion.figure
                      key={`${idx}-${current}`}
                      initial={{ opacity: 0, x: offset > 0 ? 100 : -100 }}
                      animate={{
                        opacity: isCenter ? 1 : 0.4,
                        x: 0,
                        scale: isCenter ? 1 : 0.85,
                        z: isCenter ? 1 : -distance,
                      }}
                      exit={{ opacity: 0, x: offset > 0 ? 100 : -100 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className={`absolute inset-0 mx-auto h-full w-full max-w-sm flex-col justify-between rounded-xl border p-8 transition-all duration-300 ${
                        isCenter
                          ? 'border-primary/50 bg-card shadow-2xl shadow-primary/20'
                          : 'border-border/40 bg-card/50 shadow-lg'
                      }`}
                      style={{
                        perspective: '1000px',
                        transformStyle: 'preserve-3d',
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
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {t.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground italic">{t.role}</div>
                        </div>
                      </figcaption>
                    </motion.figure>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => {
              prev()
              setIsAutoPlay(false)
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 rounded-full border border-border/50 bg-card/80 p-2 text-foreground/60 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary sm:left-4 sm:translate-x-0"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => {
              next()
              setIsAutoPlay(false)
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 rounded-full border border-border/50 bg-card/80 p-2 text-foreground/60 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary sm:right-4 sm:translate-x-0"
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
              className={`transition-all ${
                i === current ? 'bg-primary h-2 w-6' : 'bg-border h-2 w-2'
              } rounded-full`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
