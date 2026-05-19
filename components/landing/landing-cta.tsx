'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReveal } from '@/lib/landing/use-scroll-motion'

const HIGHLIGHTS = [
  { icon: Zap, label: 'SMEs ship faster', sub: 'PO-funded in hours' },
  { icon: TrendingUp, label: 'Investors earn yield', sub: '8–15% on real trade' },
  { icon: Package, label: 'Suppliers get paid', sub: 'Milestone by milestone' },
] as const

export function LandingCta() {
  const { ref, visible } = useReveal(0.18)

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,hsl(var(--brand-pale)/0.9),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,hsl(var(--brand-light)/0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,hsl(var(--brand-mid)/0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,hsl(var(--brand-mid)/0.08),transparent_50%)]"
        aria-hidden
      />

      <div className="container relative mx-auto px-4">
        <div
          ref={ref}
          className={cn(
            'relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-light/25 shadow-elevated transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--brand-mid) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-mid) / 0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden
          />

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative border-b border-brand-light/15 bg-gradient-to-br from-brand-dark via-brand-mid to-brand-dark px-8 py-12 md:px-12 md:py-16 lg:border-b-0 lg:border-r">
              <div
                className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-brand-light/25 blur-3xl"
                aria-hidden
              />

              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-pale backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-light" aria-hidden />
                Join Mercato
              </p>

              <h2 className="font-display mb-5 max-w-lg text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.02] tracking-tight text-white text-balance">
                Turn your next PO into{' '}
                <span className="text-brand-light">working capital.</span>
              </h2>

              <p className="mb-8 max-w-md text-lg leading-relaxed text-white/65">
                Whether you&apos;re buying inventory, funding trade, or supplying goods — start in
                minutes on Stellar-backed milestone escrow.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full bg-white px-8 text-base font-semibold text-brand-dark shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-brand-ultra"
                >
                  <Link href="/auth/sign-up">
                    Create free account
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="h-12 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15"
                >
                  <Link href="/deals">
                    Explore live deals
                    <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative bg-brand-ultra/80 px-8 py-10 dark:bg-card/60 md:px-10 md:py-12">
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-mid">
                Built for every side of the deal
              </p>
              <ul className="space-y-4">
                {HIGHLIGHTS.map(({ icon: Icon, label, sub }, i) => (
                  <li
                    key={label}
                    className={cn(
                      'flex items-start gap-4 rounded-2xl border border-brand-pale/80 bg-background/90 p-4 shadow-sm transition-all duration-500 dark:border-brand-mid/20 dark:bg-background/40',
                      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4',
                    )}
                    style={{ transitionDelay: visible ? `${120 + i * 80}ms` : '0ms' }}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-mid text-white shadow-md">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-foreground">{label}</span>
                      <span className="text-sm text-muted-foreground">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-dashed border-brand-mid/30 bg-brand-pale/50 px-4 py-3 text-center dark:border-brand-light/20 dark:bg-brand-mid/10">
                <p className="text-sm font-medium text-brand-dark dark:text-brand-light">
                  No bank paperwork · Milestone escrow · LATAM supply chains
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
