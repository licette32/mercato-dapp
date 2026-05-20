'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReveal } from '@/lib/landing/use-scroll-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  Landmark,
  Percent,
  Scale,
  Users,
  Wallet,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

type AccessLevel = 'high' | 'medium' | 'low'

type FinancingOption = {
  id: string
  label: string
  subtitle?: string
  rateLabel: string
  rateMin: number
  rateMax: number
  requirements: string
  access: AccessLevel
  icon: React.ElementType
  source?: string
  caveat?: string
  mercato?: boolean
}

const RATE_SCALE_MAX = 120

function useFinancingOptions(t: (key: string) => string): FinancingOption[] {
  return [
    {
      id: 'mercato',
      label: t('landing.rates.options.mercato.label'),
      subtitle: t('landing.rates.options.mercato.subtitle'),
      rateLabel: t('landing.rates.options.mercato.rate'),
      rateMin: 18,
      rateMax: 24,
      requirements: t('landing.rates.options.mercato.requirements'),
      access: 'high',
      icon: BadgeCheck,
      mercato: true,
      caveat: t('landing.rates.options.mercato.caveat'),
    },
    {
      id: 'bank-mx',
      label: t('landing.rates.options.bank.label'),
      subtitle: t('landing.rates.options.bank.subtitle'),
      rateLabel: t('landing.rates.options.bank.rate'),
      rateMin: 19,
      rateMax: 21,
      requirements: t('landing.rates.options.bank.requirements'),
      access: 'low',
      icon: Landmark,
      source: t('landing.rates.options.bank.source'),
      caveat: t('landing.rates.options.bank.caveat'),
    },
    {
      id: 'fintech-factoring',
      label: t('landing.rates.options.fintech.label'),
      subtitle: t('landing.rates.options.fintech.subtitle'),
      rateLabel: t('landing.rates.options.fintech.rate'),
      rateMin: 18,
      rateMax: 36,
      requirements: t('landing.rates.options.fintech.requirements'),
      access: 'medium',
      icon: Building2,
      source: t('landing.rates.options.fintech.source'),
      caveat: t('landing.rates.options.fintech.caveat'),
    },
    {
      id: 'business-card',
      label: t('landing.rates.options.card.label'),
      subtitle: t('landing.rates.options.card.subtitle'),
      rateLabel: t('landing.rates.options.card.rate'),
      rateMin: 18,
      rateMax: 22,
      requirements: t('landing.rates.options.card.requirements'),
      access: 'low',
      icon: CreditCard,
      source: t('landing.rates.options.card.source'),
    },
    {
      id: 'informal',
      label: t('landing.rates.options.informal.label'),
      subtitle: t('landing.rates.options.informal.subtitle'),
      rateLabel: t('landing.rates.options.informal.rate'),
      rateMin: 60,
      rateMax: 120,
      requirements: t('landing.rates.options.informal.requirements'),
      access: 'high',
      icon: Wallet,
      caveat: t('landing.rates.options.informal.caveat'),
    },
  ]
}

function RateBar({
  min,
  max,
  highlighted,
}: {
  min: number
  max: number
  highlighted?: boolean
}) {
  const left = (min / RATE_SCALE_MAX) * 100
  const width = Math.max(((max - min) / RATE_SCALE_MAX) * 100, 2.5)

  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/80 dark:bg-white/[0.06]"
      role="img"
      aria-label={`${min}% to ${max}% annual cost`}
    >
      <div
        className={cn(
          'absolute top-0 h-full rounded-full transition-all duration-700',
          highlighted
            ? 'bg-gradient-to-r from-brand-mid to-brand-light shadow-[0_0_12px_hsl(var(--brand-light)/0.45)]'
            : 'bg-muted-foreground/35 dark:bg-white/20',
        )}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  )
}

function AccessPill({ level, t }: { level: AccessLevel; t: (key: string) => string }) {
  const config = {
    high: {
      label: t('landing.rates.accessHigh'),
      className: 'bg-brand-pale text-brand-dark dark:bg-brand-light/15 dark:text-brand-light',
    },
    medium: {
      label: t('landing.rates.accessMedium'),
      className: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    },
    low: {
      label: t('landing.rates.accessLow'),
      className: 'bg-muted text-muted-foreground',
    },
  }[level]

  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', config.className)}>
      {config.label}
    </span>
  )
}

export function LandingRateComparison() {
  const { t } = useI18n()
  const { ref, visible } = useReveal<HTMLElement>(0.08)
  const financingOptions = React.useMemo(() => useFinancingOptions(t), [t])
  const stats = React.useMemo(
    () => [
      { value: t('landing.rates.stat1Value'), label: t('landing.rates.stat1Label'), icon: Users },
      { value: t('landing.rates.stat2Value'), label: t('landing.rates.stat2Label'), icon: Scale },
      { value: t('landing.rates.stat3Value'), label: t('landing.rates.stat3Label'), icon: Percent },
    ],
    [t],
  )

  return (
    <section
      id="why-mercato"
      ref={ref}
      className="landing-section-anchor relative overflow-hidden border-t border-border/50 bg-brand-ultra/40 py-20 dark:bg-muted/20 md:py-28"
      aria-labelledby="rate-comparison-heading"
    >
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-light/10 blur-[100px] dark:bg-brand-mid/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-mid/8 blur-[90px]"
        aria-hidden
      />

      <div className="container relative mx-auto px-4">
        <div
          className={cn(
            'mx-auto max-w-6xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          )}
        >
          <div className="mb-12 max-w-3xl md:mb-16">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-mid dark:text-brand-light">
              {t('landing.rates.eyebrow')}
            </p>
            <h2
              id="rate-comparison-heading"
              className="font-display mb-5 text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.06] tracking-tight text-foreground text-balance"
            >
              {t('landing.rates.titleLine1')}
              <br />
              <span className="text-brand-mid dark:text-brand-light">{t('landing.rates.titleAccent')}</span>
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t('landing.rates.description', { apr: t('landing.rates.aprHighlight') })}
            </p>
          </div>

          <div className="mb-12 grid gap-4 sm:grid-cols-3 md:mb-16">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="glass rounded-2xl border border-brand-light/20 px-5 py-5 dark:border-white/10"
              >
                <Icon className="mb-3 h-5 w-5 text-brand-mid dark:text-brand-light" aria-hidden />
                <p className="font-display text-3xl font-normal tracking-tight text-foreground">{value}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-end justify-between gap-4 px-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('landing.rates.chartLabel')}
            </p>
            <div className="hidden items-center gap-4 text-[10px] text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-6 rounded-full bg-gradient-to-r from-brand-mid to-brand-light" />
                {t('landing.rates.chartLegendMercato')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-6 rounded-full bg-muted-foreground/35" />
                {t('landing.rates.chartLegendAlt')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {financingOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-shadow md:p-5',
                    option.mercato
                      ? 'border-brand-light/50 bg-gradient-to-br from-brand-pale/90 via-background to-brand-ultra shadow-glow-brand dark:border-brand-light/25 dark:from-brand-mid/10 dark:via-card dark:to-background'
                      : 'border-border/60 bg-card/80 dark:bg-card/50',
                  )}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
                    <div className="flex min-w-0 flex-1 items-start gap-3 lg:max-w-[280px]">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          option.mercato
                            ? 'bg-brand-mid text-white'
                            : 'bg-muted text-muted-foreground dark:bg-white/[0.06]',
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{option.label}</h3>
                          {option.mercato && (
                            <span className="rounded-full bg-brand-mid px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              {t('landing.rates.bestFit')}
                            </span>
                          )}
                        </div>
                        {option.subtitle && (
                          <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end lg:w-28">
                      <p
                        className={cn(
                          'text-xl font-bold tabular-nums tracking-tight',
                          option.mercato ? 'text-brand-mid dark:text-brand-light' : 'text-foreground',
                        )}
                      >
                        {option.rateLabel}
                      </p>
                      <AccessPill level={option.access} t={t} />
                    </div>

                    <div className="min-w-0 flex-[1.4]">
                      <RateBar min={option.rateMin} max={option.rateMax} highlighted={option.mercato} />
                    </div>

                    <div className="min-w-0 flex-1 lg:max-w-xs">
                      <p className="text-sm leading-relaxed text-muted-foreground">{option.requirements}</p>
                      {option.caveat && (
                        <p
                          className={cn(
                            'mt-1 text-xs font-medium',
                            option.mercato ? 'text-brand-mid dark:text-brand-light' : 'text-foreground/70',
                          )}
                        >
                          {option.caveat}
                        </p>
                      )}
                      {option.source && (
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          {t('landing.rates.sourcePrefix')} {option.source}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-brand-light/30 bg-brand-dark px-6 py-6 text-white dark:border-brand-light/20 md:px-8 md:py-8">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-light">
              {t('landing.rates.closingEyebrow')}
            </p>
            <p className="font-display max-w-3xl text-xl leading-snug tracking-tight text-white md:text-2xl">
              {t('landing.rates.closingTitle', {
                accessible: t('landing.rates.closingAccessible'),
                bank: t('landing.rates.closingBank'),
              })}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              {t('landing.rates.closingDisclaimer')}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 h-11 rounded-full bg-white px-7 font-semibold text-brand-dark hover:bg-brand-ultra"
            >
              <Link href="/auth/sign-up">
                {t('landing.rates.closingCta')}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
