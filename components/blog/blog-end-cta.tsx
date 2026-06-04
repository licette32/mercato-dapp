'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'

export function BlogEndCta() {
  const { t } = useI18n()

  return (
    <section
      aria-labelledby="blog-end-cta-heading"
      className="mt-16 rounded-2xl border border-border/70 bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            {t('landing.blogEndCta.eyebrow')}
          </p>
          <h2
            id="blog-end-cta-heading"
            className="font-display text-2xl font-normal tracking-tight text-balance sm:text-3xl"
          >
            {t('landing.blogEndCta.title')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('landing.blogEndCta.description')}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:items-end">
          <Button asChild className="h-11 rounded-full bg-emerald-600 px-6 hover:bg-emerald-700">
            <Link href="/dashboard/vault">
              {t('landing.blogEndCta.primaryCta')}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/auth/sign-up">{t('landing.blogEndCta.secondaryCta')}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground">
              <Link href="/deals">{t('landing.blogEndCta.tertiaryCta')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
