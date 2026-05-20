'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroComparisonCard } from '@/components/landing/hero-comparison-card'
import { HeroLiveDeal } from '@/components/landing/hero-live-deal'
import { HeroHowItWorksSteps } from '@/components/landing/hero-how-it-works-steps'
import { HeroStatsBar } from '@/components/landing/hero-stats-bar'
import { LandingPartnersStrip } from '@/components/landing/landing-page-intro'
import { useI18n } from '@/lib/i18n/provider'
import { ArrowRight, BadgeCheck, Eye, ShieldCheck } from 'lucide-react'

const TRUST_ITEMS = [
  { key: 'trust1', icon: ShieldCheck },
  { key: 'trust2', icon: Eye },
] as const

export function LandingHero() {
  const { t } = useI18n()

  return (
    <section className="hero-ref relative overflow-hidden bg-landing-hero text-foreground dark:bg-[hsl(210_20%_4%)] dark:text-white">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="hero-ref-photo-right absolute inset-y-0 right-0 w-[92%] sm:w-[88%] lg:w-[82%] xl:w-[75%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-bg.png"
            alt=""
            className="hero-ref-photo-img"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="hero-ref-photo-fade absolute inset-0" />
        <div className="hero-glow absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full opacity-25 blur-[100px] dark:opacity-15" />
        <div className="hero-glow-b absolute -right-20 bottom-1/4 h-[22rem] w-[22rem] rounded-full opacity-20 blur-[90px] dark:opacity-10" />
        <div className="hero-grain absolute inset-0 opacity-[0.08] dark:opacity-[0.14]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pb-0 pt-24 md:pt-28">
        <div className="mx-auto grid max-w-[90rem] items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] xl:gap-6">
          <div className="relative z-10 lg:max-w-lg xl:max-w-none">
            <div className="hero-stagger-1 mb-5 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-brand-mid dark:text-brand-light" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid dark:text-brand-light">
                {t('landing.hero.badge')}
              </span>
            </div>

            <h1 className="hero-stagger-2 font-display text-[clamp(2.5rem,5.8vw,4rem)] font-normal leading-[0.95] tracking-tight">
              <span className="block text-foreground dark:text-white">
                {t('landing.hero.titleLine1')}
              </span>
              <span className="mt-1 block text-brand-mid dark:text-brand-light">
                {t('landing.hero.titleLine2')}
              </span>
            </h1>

            <p className="hero-stagger-3 mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg dark:text-white/70">
              {t('landing.hero.description')}
            </p>

            <div className="hero-stagger-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-lg bg-brand-mid px-7 text-sm font-bold text-white shadow-[0_8px_32px_-6px_hsl(var(--brand-mid)/0.45)] hover:bg-brand-dark dark:bg-brand-light dark:text-[hsl(150_20%_6%)] dark:shadow-[0_8px_32px_-6px_hsl(var(--brand-light)/0.55)] dark:hover:bg-brand-mid dark:hover:text-white"
              >
                <Link href="/deals">
                  {t('landing.hero.primaryCta')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-lg border-brand-mid/30 bg-white/60 px-7 text-sm font-semibold text-brand-dark hover:bg-brand-pale/80 dark:border-white/25 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Link href="/auth/sign-up">{t('landing.hero.secondaryCta')}</Link>
              </Button>
            </div>

            <ul className="hero-stagger-4 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {TRUST_ITEMS.map(({ key, icon: Icon }) => (
                <li
                  key={key}
                  className="flex items-center gap-2 text-[12px] text-muted-foreground dark:text-white/55"
                >
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-brand-mid dark:text-brand-light/80"
                    aria-hidden
                  />
                  {t(`landing.hero.${key}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-stagger-4 relative z-10 flex justify-center lg:justify-end">
            <HeroLiveDeal />
          </div>
        </div>
      </div>

      <div className="hero-stats-band relative z-20 -mt-4 md:-mt-8">
        <div className="hero-stats-bar border-y border-border/60 bg-white/70 backdrop-blur-md dark:border-white/[0.08] dark:bg-[hsl(0_0%_4%/0.92)]">
          <div className="container relative mx-auto px-4 py-3 md:py-3">
            <div className="relative mx-auto max-w-[90rem] md:pr-[11.5rem] lg:pr-[12.5rem]">
              <HeroStatsBar />

              <div className="hero-stagger-4 pointer-events-none absolute -right-7 -top-[6rem] z-30 hidden md:block lg:-right-9 lg:-top-[7.25rem]">
                <div className="pointer-events-auto">
                  <HeroComparisonCard className="shadow-[0_16px_48px_-12px_hsl(var(--brand-dark)/0.2)] dark:shadow-[0_20px_56px_-16px_hsl(0_0%_0%/0.65)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stagger-4 container relative z-30 mx-auto -mt-3 flex justify-center px-4 pb-2 md:hidden">
          <HeroComparisonCard />
        </div>
      </div>

      <div
        id="how-it-works"
        className="landing-section-anchor relative z-10 w-full bg-background pb-8 pt-2 md:pb-10 md:pt-3 dark:bg-[hsl(0_0%_4%)]"
      >
        <HeroHowItWorksSteps />
      </div>

      <div className="relative z-10 border-t border-border/50 bg-background dark:border-white/[0.06] dark:bg-[hsl(0_0%_3%)]">
        <LandingPartnersStrip variant="hero" />
      </div>
    </section>
  )
}
