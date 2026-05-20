'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getRoleTheme } from '@/lib/dashboard/role-theme'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

type DashboardShellProps = {
  userType: string
  children: React.ReactNode
}

export function DashboardShell({ userType, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useI18n()
  const theme = getRoleTheme(userType)

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <div className="flex flex-1">
        <aside
          className={cn(
            'hidden w-64 shrink-0 border-r border-border/60 bg-muted/20 lg:block',
            'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto',
          )}
        >
          <div className="p-4">
            <p
              className={cn(
                'mb-4 rounded-xl px-3 py-2 text-xs font-semibold',
                theme.badge,
              )}
            >
              {t(`dashboard.roles.${userType}` as 'dashboard.roles.pyme')}
            </p>
            <DashboardSidebar userType={userType} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0" aria-label={t('dashboardNav.openMenu')}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw-2rem,18rem)] p-0">
                <SheetTitle className="sr-only">{t('dashboardNav.sidebarLabel')}</SheetTitle>
                <div className="border-b border-border px-4 py-4">
                  <p className="text-sm font-semibold">{t('nav.dashboard')}</p>
                  <p className={cn('mt-1 text-xs', theme.accent)}>
                    {t(`dashboard.roles.${userType}` as 'dashboard.roles.pyme')}
                  </p>
                </div>
                <div className="overflow-y-auto p-4">
                  <DashboardSidebar userType={userType} onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground">{t('dashboardNav.menuHint')}</span>
          </div>

          <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </div>
  )
}
