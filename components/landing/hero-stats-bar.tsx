'use client'

import {
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Package,
  TrendingUp,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

export function HeroStatsBar() {
  const { t } = useI18n()

  const stats = [
    { key: 'orders', icon: Package },
    { key: 'smes', icon: Building2 },
    { key: 'suppliers', icon: BadgeCheck },
    { key: 'capital', icon: CircleDollarSign },
    { key: 'fulfillment', icon: TrendingUp },
  ] as const

  return (
    <div className="grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-5 md:items-start md:gap-x-2 md:gap-y-0 lg:gap-x-3">
      {stats.map(({ key, icon: Icon }) => (
        <div key={key} className="flex min-w-0 items-start gap-2 md:gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-mid md:h-9 md:w-9 dark:bg-brand-mid/20 dark:text-brand-light">
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium leading-tight text-muted-foreground md:text-[11px] dark:text-white/50">
              {t(`landing.hero.stats.${key}.label`)}
            </p>
            <p className="font-display text-xl font-normal tracking-tight text-foreground md:text-2xl lg:text-[1.65rem] dark:text-white">
              {t(`landing.hero.stats.${key}.value`)}
            </p>
            <p className="text-[10px] font-medium leading-tight text-brand-mid md:text-[11px] dark:text-brand-light">
              {t(`landing.hero.stats.${key}.delta`)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
