'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getDashboardNavSections, isNavItemActive } from '@/lib/dashboard/dashboard-nav'
import { getRoleTheme } from '@/lib/dashboard/role-theme'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

type DashboardSidebarProps = {
  userType: string
  className?: string
  onNavigate?: () => void
}

export function DashboardSidebar({ userType, className, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { t } = useI18n()
  const sections = getDashboardNavSections(userType)
  const theme = getRoleTheme(userType)

  return (
    <nav
      className={cn('flex flex-col gap-6', className)}
      aria-label={t('dashboardNav.sidebarLabel')}
    >
      {sections.map((section) => (
        <div key={section.titleKey}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {t(section.titleKey)}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isNavItemActive(pathname, item)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? cn('bg-emerald-500/10 text-emerald-800 dark:text-emerald-300', theme.badge)
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', active && theme.statIcon)} aria-hidden />
                    {t(item.labelKey)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
