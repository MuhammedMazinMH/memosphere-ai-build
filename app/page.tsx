import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Hero } from '@/components/marketing/hero'
import { ProblemStatement } from '@/components/marketing/problem-statement'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Features } from '@/components/marketing/features'
import { Benefits } from '@/components/marketing/benefits'
import { Testimonials } from '@/components/marketing/testimonials'
import { Faq } from '@/components/marketing/faq'
import { CtaSection } from '@/components/marketing/cta-section'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <Features />
        <Benefits />
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
