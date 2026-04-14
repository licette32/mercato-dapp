'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { heroIllustrativeDeals, type HeroIllustrativeDeal } from '@/lib/hero-illustrative-deals'
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react'

/** Interval between automatic slide advances (loops forever). */
const AUTOPLAY_MS = 6000

function HeroDealSlide({ deal }: { deal: HeroIllustrativeDeal }) {
  return (
    <article
      className={cn(
        'mx-auto w-full max-w-sm rounded-2xl border-2 border-border bg-card p-5 shadow-sm',
        'transition-[box-shadow,border-color,transform] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-shadow motion-reduce:hover:translate-y-0',
        deal.borderHover,
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {deal.flowStep}
      </p>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {deal.category}
          </p>
          <p className="mt-0.5 text-base font-bold leading-snug">{deal.product}</p>
          <p className="text-sm text-muted-foreground">{deal.company}</p>
        </div>
        <Badge variant="secondary" className={cn('shrink-0 text-[11px]', deal.badgeClassName)}>
          {deal.badgeLabel}
        </Badge>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">Amount</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums">{deal.amount}</p>
          <p className="text-[10px] text-muted-foreground">USDC</p>
        </div>
        <div className="rounded-lg bg-success/10 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">APR</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-success">{deal.apr}</p>
          <p className="text-[10px] text-muted-foreground">yield</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">Term</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums">{deal.termDays}</p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>
      </div>

      {deal.milestone === 'open_split' && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Payment milestones</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-background p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium">Shipment</span>
                <span className="text-[11px] font-bold tabular-nums">50%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 origin-left rounded-full bg-accent motion-safe:animate-mercato-bar-fill motion-reduce:animate-none" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium">Delivery</span>
                <span className="text-[11px] font-bold tabular-nums">50%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 origin-left rounded-full bg-primary motion-safe:animate-mercato-bar-fill motion-safe:delay-150 motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {deal.milestone === 'funded_progress' && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Milestone releases</p>
          <p className="mb-2 text-[11px] text-muted-foreground">
            2 of 3 tranches paid to supplier · final on delivery proof
          </p>
          <div className="flex gap-1">
            <div className="h-1.5 flex-1 rounded-full bg-success" />
            <div className="h-1.5 flex-1 rounded-full bg-success" />
            <div className="h-1.5 flex-1 rounded-full bg-muted" />
          </div>
        </div>
      )}

      {deal.milestone === 'repaid' && (
        <div className="mb-4 rounded-lg border border-success/25 bg-success/5 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <p className="text-[11px] leading-snug text-muted-foreground">
              <span className="font-medium text-foreground">Deal closed.</span>{' '}
              PyME repaid principal and yield; investors received USDC on Stellar.
            </p>
          </div>
        </div>
      )}

      <Button className="w-full" size="sm" asChild>
        <Link href={deal.cta.href}>
          {deal.cta.label}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <Lock className="h-3 w-3 shrink-0" aria-hidden />
        {deal.escrowHint}
      </div>
    </article>
  )
}

const carouselOpts = { loop: true, align: 'start' as const }

export function HeroDealsCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on('reInit', onSelect)
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  React.useEffect(() => {
    if (!api) return
    const id = window.setInterval(() => {
      api.scrollNext()
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [api])

  const slideLabel = heroIllustrativeDeals[current]?.flowStep ?? ''

  return (
    <div className="w-full max-w-md shrink-0 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:delay-200 motion-safe:fill-mode-both">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        From listing to repayment
      </p>

      <Carousel
        opts={carouselOpts}
        setApi={setApi}
        className="w-full"
        aria-label="Example deals across funding, progress, and repayment"
      >
        <span key={current} className="sr-only" aria-live="polite">
          {slideLabel}
        </span>
        <CarouselContent className="-ml-0">
          {heroIllustrativeDeals.map((deal) => (
            <CarouselItem key={deal.key} className="basis-full pl-0">
              <HeroDealSlide deal={deal} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="mt-4 flex justify-center">
          <div className="flex items-center justify-center gap-1.5 px-1">
            {heroIllustrativeDeals.map((deal, i) => (
              <button
                key={deal.key}
                type="button"
                aria-label={`Show example: ${deal.badgeLabel}`}
                aria-current={current === i ? 'true' : undefined}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  'h-2 rounded-full transition-[width,background-color] duration-200 ease-out',
                  current === i
                    ? 'w-7 bg-accent'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                )}
              />
            ))}
          </div>
        </div>
      </Carousel>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Illustrative only · not live escrows
      </p>
    </div>
  )
}
