import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'What types of files can I upload?',
    a: 'MemoSphere supports PDFs, presentations (PPT/PPTX), text and markdown notes, images of handwritten notes or whiteboards, and lecture videos. Everything is processed into structured, searchable knowledge.',
  },
  {
    q: 'How is this different from a normal note-taking app?',
    a: 'Traditional apps store files. MemoSphere stores understanding — it extracts concepts, generates summaries and quizzes, and links ideas across subjects so you can actually recall what you learn.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The free plan includes core capture, search, and summaries. Pro unlocks unlimited AI generations, the full knowledge graph, advanced analytics, and exam readiness scoring.',
  },
  {
    q: 'Who is MemoSphere built for?',
    a: 'College and university students, competitive exam aspirants, professionals pursuing certifications, and lifelong learners who want a single, intelligent home for everything they study.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Your knowledge is yours. We use encryption in transit and at rest, and never sell your data. You can export or delete everything at any time.',
  },
  {
    q: 'Does the AI work across subjects?',
    a: 'Absolutely. The knowledge graph and universal search span every subject you add, surfacing connections between concepts you might never have noticed.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <Accordion openMultiple={false} className="mt-10 w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
