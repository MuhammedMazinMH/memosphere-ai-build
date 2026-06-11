import Link from 'next/link'
import { Logo } from '@/components/logo'
import { TextHoverEffect } from '@/components/ui/hover-footer'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/30">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              The AI-powered Academic Knowledge Operating System. Your second
              brain for everything you learn.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MemoSphere AI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Your Academic Second Brain
          </p>
        </div>
      </div>

      {/* Giant brand text with hover reveal */}
      <div className="pointer-events-none relative z-0 -mb-6 flex h-32 w-full items-end sm:h-44 lg:-mb-12 lg:h-56">
        <div className="pointer-events-auto h-full w-full">
          <TextHoverEffect text="MemoSphere" />
        </div>
      </div>
    </footer>
  )
}
