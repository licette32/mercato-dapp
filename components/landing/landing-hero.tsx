'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    <section className="hero-ref relative overflow-x-clip bg-landing-hero text-foreground dark:bg-[hsl(0_0%_4%)] dark:text-white">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="hero-ref-photo-right absolute inset-y-0 right-0 w-[90%] sm:w-[86%] lg:w-[80%] xl:w-[73%] 2xl:w-[70%]">
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
        <div className="hero-grain absolute inset-0 dark:opacity-[0.14]" />
      </div>

      <div className="container relative z-10 mx-auto overflow-visible px-4 pb-10 pt-24 md:pb-14 md:pt-28 lg:pb-20 xl:pb-24">
        <div className="mx-auto grid max-w-[90rem] min-w-0 items-start gap-8 md:gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] xl:gap-4">
          <div className="relative z-30 min-w-0 lg:max-w-lg xl:max-w-none">
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

            <p className="hero-ref-description hero-stagger-3 mt-6 max-w-md text-base leading-relaxed md:text-lg dark:text-white/75">
              {t('landing.hero.description')}
            </p>

            <div className="hero-stagger-4 mt-8">
              <Button
                size="lg"
                asChild
                className="h-12 w-full rounded-lg bg-brand-mid px-7 text-sm font-bold text-white shadow-[0_8px_32px_-6px_hsl(var(--brand-mid)/0.45)] hover:bg-brand-dark sm:w-auto dark:bg-brand-light dark:text-[hsl(150_20%_6%)] dark:shadow-[0_8px_32px_-6px_hsl(var(--brand-light)/0.55)] dark:hover:bg-brand-mid dark:hover:text-white"
              >
                <Link href="/deals">
                  {t('landing.hero.primaryCta')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
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

          <div className="hero-stagger-4 relative z-20 mt-6 flex w-full min-w-0 justify-center px-1 pb-6 sm:mt-8 sm:px-2 sm:pb-8 md:mt-10 md:pb-10 lg:z-30 lg:mt-[-3.25rem] lg:justify-start lg:px-0 lg:-translate-x-6 lg:pb-8 xl:mt-[-4.5rem] xl:-translate-x-10 xl:pb-9 2xl:-translate-x-14">
            <HeroLiveDeal />
          </div>
        </div>
      </div>

      <div className="hero-ref-bases-band hero-stats-band relative z-20 w-full">
        <div className="hero-ref-bases-bar hero-stats-bar relative border-y border-border/60 bg-white dark:border-white/[0.08] dark:bg-[hsl(0_0%_4%/0.94)] dark:backdrop-blur-md">
          <div className="hero-ref-bases-inner relative z-[1] mx-auto py-4 md:py-5 lg:py-5">
            <HeroStatsBar />
          </div>
        </div>
      </div>

      <div
        id="how-it-works"
        className="hero-ref-bases-steps landing-section-anchor relative z-10 w-full bg-background pb-8 pt-0 md:pb-10 dark:bg-[hsl(0_0%_4%)]"
      >
        <HeroHowItWorksSteps />
      </div>

      <div className="relative z-10 border-t border-border/50 bg-background dark:border-white/[0.06] dark:bg-[hsl(0_0%_3%)]">
        <LandingPartnersStrip variant="hero" />
      </div>
    </section>
  )
}
