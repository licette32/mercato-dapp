'use client'

import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { mapDealFromDb, type DealRow } from '@/lib/deals'
import {
  buildLandingFeed,
  splitIntoColumns,
  type LandingFeedItem,
} from '@/lib/landing/landing-deal-feed'
import { useReveal, useScrollProgress } from '@/lib/landing/use-scroll-motion'
import { LandingDealCard } from '@/components/landing/landing-deal-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Deal } from '@/lib/types'
import { ArrowRight, Radio } from 'lucide-react'

const COLUMN_SPEEDS = [0.38, 0.52, 0.32] as const
const COLUMN_OFFSETS = [0, 80, 40] as const

function WaterfallColumn({
  items,
  speed,
  baseOffset,
  progress,
  scrollPhase,
  colIndex,
}: {
  items: LandingFeedItem[]
  speed: number
  baseOffset: number
  progress: number
  scrollPhase: number
  colIndex: number
}) {
  const scrollY = progress * speed * 280 - baseOffset
  const doubled = [...items, ...items]

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-1 flex-col overflow-hidden',
        colIndex === 1 && 'hidden sm:flex',
        colIndex === 2 && 'hidden lg:flex',
      )}
    >
      <div style={{ transform: `translate3d(0, ${scrollY}px, 0)` }}>
        <div className="landing-column-drift flex flex-col gap-4 motion-reduce:animate-none md:gap-5">
          {doubled.map((item, i) => {
            const globalIndex = colIndex + i * 3
            const highlighted = (globalIndex + scrollPhase) % 7 === 0
            return (
              <LandingDealCard
                key={`${item.id}-${i}`}
                item={item}
                highlighted={highlighted}
                style={{
                  opacity: highlighted ? 1 : 0.88 + (i % 3) * 0.04,
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function LandingLiveDeals() {
  const { ref: sectionRef, progress } = useScrollProgress<HTMLElement>()
  const { ref: headerRef, visible } = useReveal<HTMLDivElement>(0.15)
  const [deals, setDeals] = React.useState<Deal[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(
          `
          *,
          milestones(*),
          pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name, stake_amount)
        `,
        )
        .order('created_at', { ascending: false })
        .limit(12)

      if (!error && data?.length) {
        setDeals((data as DealRow[]).map(mapDealFromDb))
      }
      setLoaded(true)
    })()
  }, [])

  const feed = React.useMemo(() => buildLandingFeed(deals), [deals])
  const columns = React.useMemo(() => splitIntoColumns(feed, 3), [feed])
  const scrollPhase = Math.min(6, Math.floor(progress * 8))
  const hasLive = deals.length > 0

  return (
    <section
      ref={sectionRef}
      className="relative bg-background pt-4 pb-6 md:pt-8 md:pb-8"
      aria-labelledby="live-deals-heading"
    >
      <div className="relative min-h-[58vh] md:min-h-[68vh]">
        <div className="sticky top-16 z-20 flex h-[min(480px,calc(100vh-5.5rem))] flex-col overflow-hidden md:top-20 md:h-[min(520px,calc(100vh-6rem))]">
          <div
            ref={headerRef}
            className={cn(
              'container relative z-30 mx-auto shrink-0 px-4 pb-4 md:px-6 md:pb-6',
              'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-light/30 bg-brand-ultra/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-mid dark:bg-brand-mid/15 dark:text-brand-light">
                <Radio className="h-3 w-3 motion-safe:animate-pulse" aria-hidden />
                {hasLive ? 'Live on Mercato' : 'Platform activity'}
              </span>
              {loaded && hasLive && (
                <span className="text-xs text-muted-foreground">
                  {deals.length} active deal{deals.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h2
                  id="live-deals-heading"
                  className="font-display mb-2 text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-[1.08] tracking-tight text-foreground text-balance"
                >
                  See capital moving{' '}
                  <span className="text-gradient-brand">right now.</span>
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  Fund open orders, follow milestones, or explore completed deals — all in one feed.
                </p>
              </div>
              <Button
                asChild
                className="shrink-0 rounded-full bg-brand-mid px-6 font-semibold text-white shadow-glow-brand hover:bg-brand-dark"
              >
                <Link href="/deals">
                  Browse marketplace
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <div className="landing-waterfall-mask relative min-h-0 flex-1">
            <div
              className="landing-waterfall-fade-top pointer-events-none absolute inset-x-0 top-0 z-20"
              aria-hidden
            />
            <div
              className="landing-waterfall-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20"
              aria-hidden
            />

            <div
              className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[min(70vw,420px)] w-[min(70vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
              style={{
                background:
                  'radial-gradient(circle, hsl(var(--brand-light) / 0.14) 0%, transparent 70%)',
                transform: `translate(-50%, -50%) scale(${0.9 + progress * 0.15})`,
              }}
              aria-hidden
            />

            <div className="container relative z-10 mx-auto flex h-full gap-3 px-4 md:gap-5 md:px-6">
              {columns.map((colItems, colIndex) => (
                <WaterfallColumn
                  key={colIndex}
                  items={colItems}
                  speed={COLUMN_SPEEDS[colIndex] ?? 0.45}
                  baseOffset={COLUMN_OFFSETS[colIndex] ?? 0}
                  progress={progress}
                  scrollPhase={scrollPhase}
                  colIndex={colIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
