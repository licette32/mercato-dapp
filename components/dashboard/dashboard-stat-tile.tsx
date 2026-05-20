import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type DashboardStatTileProps = {
  label: string
  value: number | string
  icon: LucideIcon
  iconClassName?: string
  highlight?: boolean
  footer?: string
}

export function DashboardStatTile({
  label,
  value,
  icon: Icon,
  iconClassName,
  highlight,
  footer,
}: DashboardStatTileProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        highlight && 'border-amber-300/50 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/20',
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <Icon className={cn('h-4 w-4 shrink-0 opacity-70', iconClassName)} aria-hidden />
      </div>
      <p className="font-display text-3xl font-normal tabular-nums tracking-tight text-foreground">{value}</p>
      {footer && <p className="mt-1.5 text-xs text-muted-foreground">{footer}</p>}
    </div>
  )
}
