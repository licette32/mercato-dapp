'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { LivePOShowcase } from '@/components/landing/live-po-showcase'
import { useParallax } from '@/lib/landing/use-scroll-motion'
import { ArrowRight, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const TICKER = [
  'PO #MKT-2847 · In production',
  'Milestone 1 released · Acero del Pacífico',
  'New deal open · Cotton yarn batch',
  'Escrow funded · LED panels order',
  'Delivery confirmed · repayment pending',
  'Verified supplier · 4.8★ rating',
]

function FloatingChip({
  className,
  children,
  delay,
}: {
  className?: string
  children: React.ReactNode
  delay?: string
}) {
  return (
    <div
      className={cn('glass-strong float-a rounded-2xl px-4 py-3 shadow-elevated', className)}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  )
}

export function LandingHero() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const productParallax = useParallax(0.12)
  const isDark = mounted && resolvedTheme === 'dark'

  React.useEffect(() => setMounted(true), [])

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-landing-hero pb-8 md:min-h-[88vh]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className={cn(
            'hero-glow absolute -left-40 -top-32 h-[600px] w-[600px] rounded-full blur-[120px]',
            isDark
              ? 'bg-[radial-gradient(circle,rgba(26,69,48,0.7)_0%,transparent_70%)]'
              : 'bg-[radial-gradient(circle,rgba(63,160,104,0.28)_0%,transparent_70%)]',
          )}
        />
        <div
          className={cn(
            'hero-glow-b absolute -right-24 top-1/4 h-[480px] w-[480px] rounded-full blur-[100px]',
            isDark
              ? 'bg-[radial-gradient(circle,rgba(38,112,70,0.35)_0%,transparent_70%)]'
              : 'bg-[radial-gradient(circle,rgba(38,112,70,0.15)_0%,transparent_70%)]',
          )}
        />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--brand-mid) / 0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 pt-20 md:pt-24 lg:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">

          <div className="relative z-10 text-center lg:text-left">
            <span
              className={cn(
                'hero-stagger-1 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]',
                'glass text-brand-mid dark:text-brand-light',
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-light opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-brand-light" />
              </span>
              Supply chain finance
            </span>

            <h1 className="hero-stagger-2 font-display mb-6 text-[clamp(2.75rem,6vw,4.25rem)] leading-[0.95] tracking-tight text-foreground">
              <span className="block">The purchase</span>
              <span className="block">order</span>
              <span className="mt-1 block text-gradient-brand">is the deal.</span>
            </h1>

            <p className="hero-stagger-3 mx-auto mb-10 max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl lg:mx-0">
              Capital flows with goods. SMEs grow, suppliers get paid, investors earn — all around a live purchase order.
            </p>

            <div className="hero-stagger-4 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                asChild
                className="h-12 min-w-[200px] rounded-full bg-brand-mid px-8 text-base font-semibold text-white shadow-glow-brand hover:bg-brand-dark"
              >
                <Link href="/auth/sign-up">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="glass h-12 min-w-[200px] rounded-full border-brand-mid/25 px-8 text-base font-semibold text-brand-mid hover:bg-brand-pale/80 dark:text-brand-light"
              >
                <Link href="/deals">
                  Explore deals
                  <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <FloatingChip className="absolute -left-2 top-8 z-20 hidden lg:block float-b" delay="-1s">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pale text-brand-mid dark:bg-brand-mid/30">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">+12.5% APR</p>
                  <p className="text-[10px] text-muted-foreground">InverCap SA</p>
                </div>
              </div>
            </FloatingChip>

            <FloatingChip className="absolute -right-2 bottom-16 z-20 hidden lg:block float-c" delay="-3s">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pale text-brand-mid dark:bg-brand-mid/30">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Verified</p>
                  <p className="text-[10px] text-muted-foreground">Acero del Pacífico</p>
                </div>
              </div>
            </FloatingChip>

            <div ref={productParallax.ref} style={productParallax.style} className="hero-stagger-4 relative">
              <div className="border-shine rounded-3xl shadow-glow-brand">
                <div className="rounded-3xl p-1">
                  <LivePOShowcase />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-16 w-full md:mt-20">
        <div className="glass-strong w-full overflow-hidden border-y border-brand-light/20 shadow-sm dark:border-brand-mid/25">
          <div className="overflow-hidden py-3.5 md:py-4">
            <div className="marquee-track flex w-max gap-12 motion-reduce:animate-none" aria-hidden>
              {[...TICKER, ...TICKER].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-light shadow-[0_0_8px_hsl(var(--brand-light))]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />
    </section>
  )
}
