import Link from 'next/link'
import { MercatoLogo } from '@/components/mercato-logo'
import { ArrowUpRight } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Browse deals', href: '/deals' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Suppliers', href: '/suppliers' },
    { label: 'Investors', href: '/investors' },
  ],
  'Get started': [
    { label: 'Create account', href: '/auth/sign-up' },
    { label: 'Sign in', href: '/auth/login' },
    { label: 'Create a deal', href: '/create-deal' },
  ],
} as const

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-brand-ultra/40 to-background dark:from-brand-mid/5">
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12">
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <MercatoLogo className="h-6 dark:invert" />
              <span className="font-display text-xl tracking-tight text-foreground">MERCATO</span>
            </Link>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Supply chain finance for Latin America — purchase orders, milestone escrow, and
              real-economy returns on Stellar.
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-mid/80">
              Built on Stellar
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand-mid dark:hover:text-brand-light"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            © 2026 MERCATO. Supply Chain Finance for Latin America.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Stellar
            </a>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <a
              href="https://trustlesswork.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Trustless Work
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
