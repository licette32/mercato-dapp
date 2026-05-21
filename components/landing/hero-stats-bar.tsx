'use client'

import {
  BadgeCheck,
  BadgePercent,
  Building2,
  CircleDollarSign,
  Package,
  Link2,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

const STATS = [
  { key: 'orders', icon: Package, label: 'landing.hero.stats.orders.label', value: 'landing.hero.stats.orders.value', delta: 'landing.hero.stats.orders.delta' },
  { key: 'smes', icon: Building2, label: 'landing.hero.stats.smes.label', value: 'landing.hero.stats.smes.value', delta: 'landing.hero.stats.smes.delta' },
  { key: 'suppliers', icon: BadgeCheck, label: 'landing.hero.stats.suppliers.label', value: 'landing.hero.stats.suppliers.value', delta: 'landing.hero.stats.suppliers.delta' },
  { key: 'capital', icon: CircleDollarSign, label: 'landing.hero.stats.capital.label', value: 'landing.hero.stats.capital.value', delta: 'landing.hero.stats.capital.delta' },
  { key: 'blockchain', icon: Link2, label: 'landing.hero.stats.blockchain.label', value: 'landing.hero.stats.blockchain.value', delta: 'landing.hero.stats.blockchain.delta' },
  {
    key: 'mercato',
    icon: BadgePercent,
    label: 'landing.hero.stats.mercato.label',
    value: 'landing.hero.stats.mercato.value',
    delta: 'landing.hero.stats.mercato.delta',
  },
] as const

export function HeroStatsBar() {
  const { t } = useI18n()

  return (
    <div className="hero-stats-grid grid w-full grid-cols-2 gap-x-3 gap-y-5 min-[480px]:grid-cols-3 sm:gap-x-4 md:gap-y-6 lg:grid-cols-6 lg:items-start lg:gap-x-4 lg:gap-y-0 xl:gap-x-6">
      {STATS.map(({ key, icon: Icon, label, value, delta }) => (
        <div
          key={key}
          className={`flex min-w-0 items-start gap-2 md:gap-2.5 ${key === 'mercato' ? 'col-span-2 min-[480px]:col-span-1' : ''}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-mid md:h-9 md:w-9 dark:bg-brand-mid/20 dark:text-brand-light">
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium leading-tight text-muted-foreground md:text-[11px] dark:text-white/50">
              {t(label)}
            </p>
            <p className="font-display text-lg font-normal tracking-tight text-foreground min-[480px]:text-xl md:text-2xl lg:text-[1.65rem] dark:text-white">
              {t(value)}
            </p>
            <p className="line-clamp-2 text-[10px] font-medium leading-tight text-brand-mid md:text-[11px] dark:text-brand-light">
              {t(delta)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
