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
  const { t, locale } = useI18n()

  const heroImage = locale === 'es' ? '/hero-bg-es.png' : '/hero-bg.png'

  return (
    <section className="hero-ref relative overflow-x-clip bg-landing-hero text-foreground dark:bg-[hsl(0_0%_4%)] dark:text-white transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="hero-ref-photo-right absolute inset-y-0 right-0 w-[90%] sm:w-[86%] lg:w-[80%] xl:w-[73%] 2xl:w-[70%] transition-transform duration-700 ease-out">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="hero-ref-photo-img opacity-90 transition-opacity duration-1000"
            decoding="async"
            fetchPriority="high"
            onError={(e) => {
              // Fallback to default if locale-specific image is missing
              const target = e.target as HTMLImageElement
              if (target.src.includes('-es')) {
                target.src = '/hero-bg.png'
              }
            }}
          />
        </div>
        <div className="hero-ref-photo-fade absolute inset-0 bg-gradient-to-r from-landing-hero via-transparent to-transparent dark:from-[hsl(0_0%_4%)]" />
        <div className="hero-glow absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full opacity-25 blur-[100px] dark:opacity-15 bg-brand-light/30" />
        <div className="hero-glow-b absolute -right-20 bottom-1/4 h-[22rem] w-[22rem] rounded-full opacity-20 blur-[90px] dark:opacity-10 bg-brand-mid/20" />
        <div className="hero-grain absolute inset-0 dark:opacity-[0.14] mix-blend-overlay" />
      </div>

      <div className="container relative z-10 mx-auto overflow-visible px-4 pb-12 pt-20 md:pb-16 md:pt-28 lg:pb-24 xl:pb-28">
        <div className="mx-auto grid max-w-[90rem] min-w-0 items-center gap-10 md:gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] xl:gap-6">
          <div className="relative z-30 min-w-0 lg:max-w-lg xl:max-w-none text-center lg:text-left">
            <div className="hero-stagger-1 mb-6 flex items-center justify-center lg:justify-start gap-2">
              <BadgeCheck className="h-5 w-5 text-brand-mid dark:text-brand-light animate-pulse" aria-hidden />
              <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-brand-mid dark:text-brand-light">
                {t('landing.hero.badge')}
              </span>
            </div>

            <h1 className="hero-stagger-2 font-display text-[clamp(2.75rem,7vw,4.5rem)] font-normal leading-[1.05] tracking-tight text-balance">
              <span className="block text-foreground dark:text-white drop-shadow-sm">
                {t('landing.hero.titleLine1')}
              </span>
              <span className="mt-2 block text-brand-mid dark:text-brand-light drop-shadow-sm">
                {t('landing.hero.titleLine2')}
              </span>
            </h1>

            <p className="hero-ref-description hero-stagger-3 mt-8 mx-auto lg:mx-0 max-w-md text-base leading-relaxed md:text-lg lg:text-xl dark:text-white/80">
              {t('landing.hero.description')}
            </p>

            <div className="hero-stagger-4 mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                asChild
                className="h-14 w-full sm:w-auto rounded-xl bg-brand-mid px-8 text-base font-bold text-white shadow-[0_10px_40px_-8px_hsl(var(--brand-mid)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--brand-mid)/0.6)] transition-all duration-300 hover:-translate-y-0.5 sm:px-10 dark:bg-brand-light dark:text-[hsl(150_20%_6%)] dark:shadow-[0_10px_40px_-8px_hsl(var(--brand-light)/0.4)] dark:hover:shadow-[0_15px_50px_-10px_hsl(var(--brand-light)/0.5)]"
              >
                <Link href="/deals">
                  {t('landing.hero.primaryCta')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden />
                </Link>
              </Button>
              
              <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-0">
                {TRUST_ITEMS.map(({ key, icon: Icon }) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-brand-mid dark:text-brand-light/90"
                      aria-hidden
                    />
                    {t(`landing.hero.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hero-stagger-4 relative z-20 mt-10 flex w-full min-w-0 justify-center px-2 pb-8 sm:mt-12 sm:px-4 sm:pb-10 md:mt-14 md:pb-12 lg:z-30 lg:mt-0 lg:justify-end lg:px-0 lg:pb-10 xl:pb-12">
            <div className="relative group transition-transform duration-500 hover:scale-[1.02]">
              <HeroLiveDeal />
              <div className="absolute -inset-4 bg-brand-light/5 rounded-[2rem] blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
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
