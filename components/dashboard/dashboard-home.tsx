import { Navigation } from '@/components/navigation'
import { WalletStatusCard } from '@/components/wallet/wallet-status-card'
import { InvestorCapitalOverview } from '@/components/dashboard/investor-capital-overview'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { DashboardStatTile } from '@/components/dashboard/dashboard-stat-tile'
import { DashboardActionGrid } from '@/components/dashboard/dashboard-action-grid'
import { DashboardDealsPanel } from '@/components/dashboard/dashboard-deals-panel'
import { DashboardSupplierFilter } from '@/components/dashboard/dashboard-supplier-filter'
import { DashboardSupplierCatalog } from '@/components/dashboard/dashboard-supplier-catalog'
import { DashboardAdminAlert } from '@/components/dashboard/dashboard-admin-alert'
import { buildDashboardViewModel, getDashboardStatTiles } from '@/lib/dashboard/build-view-model'
import { getRoleTheme } from '@/lib/dashboard/role-theme'
import type { DashboardPayload } from '@/lib/dashboard/types'
import type { Messages } from '@/lib/i18n/dictionaries'
import { cn } from '@/lib/utils'

type DashboardHomeProps = {
  data: DashboardPayload
  t: Messages
}

export function DashboardHome({ data, t }: DashboardHomeProps) {
  const vm = buildDashboardViewModel(t, data)
  const statTiles = getDashboardStatTiles(t, data)
  const { profile, deals, supplierCompanies, supplierProductsForCard, adminStats, companyFilterId } =
    data
  const userType = profile.userType
  const theme = getRoleTheme(userType)

  const showCapitalOverview = userType === 'investor' || userType === 'pyme'
  const showSupplierCatalog = userType === 'supplier'
  const showSupplierFilter = userType === 'supplier' && supplierCompanies.length > 1

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
        <DashboardHero
          userType={userType}
          hubLabel={vm.hubLabel}
          welcome={vm.welcome}
          roleLabel={vm.roleLabel}
          tagline={vm.tagline}
          companyLine={vm.companyLine}
          primaryAction={
            vm.primaryAction
              ? {
                  label: vm.primaryAction.label,
                  href: vm.primaryAction.href,
                  icon: <vm.primaryAction.icon className="mr-2 h-4 w-4" />,
                }
              : undefined
          }
        />

        <WalletStatusCard />

        {showSupplierFilter && (
          <DashboardSupplierFilter
            companies={supplierCompanies}
            activeCompanyId={companyFilterId}
            labels={{
              company: t.dashboard.company,
              allCompanies: t.dashboard.allCompanies,
              unnamedCompany: t.dashboard.unnamedCompany,
            }}
          />
        )}

        {userType === 'admin' && adminStats && (
          <DashboardAdminAlert
            stats={adminStats}
            labels={{
              pendingTitle: t.dashboard.adminPendingTitle,
              pendingSingle: t.dashboard.adminPendingSingle,
              pendingPlural: t.dashboard.adminPendingPlural,
              goApprovals: t.dashboard.goApprovals,
              reviewNow: t.dashboard.reviewNow,
              view: t.dashboard.view,
            }}
          />
        )}

        {showCapitalOverview && (
          <InvestorCapitalOverview viewerRole={userType === 'pyme' ? 'pyme' : 'investor'} />
        )}

        {statTiles.length > 0 && (
          <div
            className={cn(
              'grid gap-3',
              userType === 'admin' ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4',
            )}
          >
            {statTiles.map((tile) => (
              <DashboardStatTile
                key={tile.label}
                label={tile.label}
                value={tile.value}
                icon={tile.icon}
                iconClassName={cn(theme.statIcon, tile.iconClassName)}
                highlight={tile.highlight}
                footer={tile.footer}
              />
            ))}
          </div>
        )}


        <div className="grid gap-8 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-5">
            <DashboardActionGrid
              userType={userType}
              title={t.dashboard.handyActions}
              actions={vm.actions}
              openLabel={vm.dealsLabels.openLabel}
            />
            {showSupplierCatalog && (
              <DashboardSupplierCatalog
                products={supplierProductsForCard}
                hasCompanies={supplierCompanies.length > 0}
                showCatalog={Boolean(companyFilterId || supplierCompanies.length === 1)}
                labels={{
                  title: t.dashboard.supplierCardTitle,
                  descAll: t.dashboard.supplierCardDescAll,
                  descPickCompany: t.dashboard.supplierCardDescPickCompany,
                  categories: t.dashboard.categories,
                  products: t.dashboard.products,
                  moreProducts: t.dashboard.moreProducts,
                  noProductsCompany: t.dashboard.supplierNoProductsCompany,
                  hintNoCompanies: t.dashboard.supplierHintNoCompanies,
                  hintPickCompany: t.dashboard.supplierHintPickCompany,
                  manageCatalog: t.dashboard.manageCatalog,
                }}
              />
            )}
          </div>

          <div className="xl:col-span-7">
            <DashboardDealsPanel
              userType={userType}
              deals={deals}
              totalCount={vm.totalDealsCount}
              viewAllHref={vm.dealsViewAllHref}
              statusLabels={vm.statusLabels}
              labels={vm.dealsLabels}
              columns={vm.dealsColumns}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
