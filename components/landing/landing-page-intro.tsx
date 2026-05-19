'use client'

import { useI18n } from '@/lib/i18n/provider'
import { ScrollReveal } from '@/components/landing/scroll-reveal'

export function LandingHowItWorksIntro() {
  const { t } = useI18n()

  return (
    <ScrollReveal className="mb-14 text-center md:mb-16">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-mid">
        {t('landing.page.howItWorksEyebrow')}
      </p>
      <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.05] tracking-tight text-foreground text-balance">
        {t('landing.page.howItWorksTitleLine1')}
        <br />
        <span className="text-muted-foreground">{t('landing.page.howItWorksTitleLine2')}</span>
      </h2>
    </ScrollReveal>
  )
}

export function LandingPartnersStrip() {
  const { t } = useI18n()

  return (
    <ScrollReveal
      as="section"
      id="built-with"
      className="landing-section-anchor border-t border-border/40 bg-brand-ultra/50 py-12 dark:bg-muted/10"
      delay={100}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-mid/60">
            {t('landing.page.partnersEyebrow')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            <a
              href="https://trustlesswork.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-50 transition-all duration-300 hover:opacity-100 hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/trustless-work-logo.png" alt="" width={28} height={28} className="h-7 w-auto object-contain" />
              <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground">Trustless Work</span>
            </a>
            <a
              href="https://etherfuse.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 transition-all duration-300 hover:opacity-100 hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/etherfuse-logo.svg" alt="Etherfuse" height={24} className="h-6 w-auto object-contain dark:invert" />
            </a>
            <a
              href="https://defindex.io"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 transition-all duration-300 hover:opacity-100 hover:scale-105"
            >
              <span className="flex items-center rounded-lg bg-brand-dark px-3 py-1.5 dark:bg-transparent dark:px-0 dark:py-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/defindex-logo.svg" alt="DeFindex" height={28} className="h-7 w-auto object-contain" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}
