import { buildDashboardViewModel } from '@/lib/dashboard/build-view-model'
import type { DashboardPayload } from '@/lib/dashboard/types'
import type { Messages } from '@/lib/i18n/dictionaries'
import { DashboardDealsPanel } from '@/components/dashboard/dashboard-deals-panel'
import { AdminApprovalQueue } from './admin-approval-queue'
import { AdminCommandHero } from './admin-command-hero'
import { AdminKpiGrid } from './admin-kpi-grid'
import { AdminOperationsGrid } from './admin-operations-grid'
import { AdminPipeline } from './admin-pipeline'
import { AdminPlatformSnapshot } from './admin-platform-snapshot'
import { AdminPriorityStrip } from './admin-priority-strip'

type AdminDashboardProps = {
  data: DashboardPayload
  t: Messages
}

export function AdminDashboard({ data, t }: AdminDashboardProps) {
  const { adminStats, adminApprovalPreview, deals, profile } = data
  if (!adminStats) return null

  const vm = buildDashboardViewModel(t, data)

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-8 px-4 py-8">
      <AdminCommandHero welcome={vm.welcome} roleLabel={vm.roleLabel} t={t} />

      <AdminPriorityStrip stats={adminStats} t={t} />

      <AdminKpiGrid stats={adminStats} t={t} />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="min-w-0 space-y-6">
          <AdminPipeline stats={adminStats} t={t} />
          <AdminOperationsGrid t={t} />
          <div className="min-w-0">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {t.adminDashboard.sectionDeals}
            </h2>
            <DashboardDealsPanel
              userType={profile.userType}
              deals={deals}
              totalCount={adminStats.totalDeals}
              viewAllHref={vm.dealsViewAllHref}
              statusLabels={vm.statusLabels}
              labels={vm.dealsLabels}
              columns={vm.dealsColumns}
            />
          </div>
        </div>
        <div className="min-w-0 space-y-6">
          <AdminApprovalQueue items={adminApprovalPreview} t={t} />
          <AdminPlatformSnapshot stats={adminStats} t={t} />
        </div>
      </div>
    </div>
  )
}
