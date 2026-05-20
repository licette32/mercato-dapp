import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  ArrowLeft,
  FileCheck,
  Landmark,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { PendingApprovals } from './pending-approvals'
import { ReleaseFundsFallback } from './release-funds-fallback'
import { AdminEscrowsProvider } from './admin-escrows-provider'
import { AdminDefindexVaultPanel } from '@/components/admin/admin-defindex-vault-panel'
import { getServerDictionary, tr } from '@/lib/i18n/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** Milestone awaiting approval + release (in_progress) */
export interface PendingApprovalItem {
  dealId: string
  dealTitle: string
  dealProductName: string | null
  dealAmount: number
  escrowContractAddress: string
  milestoneId: string
  milestoneTitle: string
  milestoneIndex: number
  milestonePercentage: number
  milestoneAmount: number
  proofNotes: string | null
  proofDocumentUrl: string | null
  pymeName: string
  supplierName: string
}

/** Completed milestone: admin can trigger release only (fallback if approve ran but release didn't) */
export interface ReleaseFallbackItem {
  dealId: string
  dealTitle: string
  dealProductName: string | null
  escrowContractAddress: string
  milestoneId: string
  milestoneTitle: string
  milestoneIndex: number
  milestoneAmount: number
  milestonePercentage: number
  completedAt: string | null
}

type AdminSearchParams = Promise<{ company?: string; sort?: string }> | { company?: string; sort?: string }

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: AdminSearchParams
}) {
  const supabase = await createClient()
  const m = await getServerDictionary()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    redirect('/dashboard')
  }

  const configuredVaultAddress =
    process.env.NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS?.trim() ||
    process.env.NEXT_PUBLIC_MERCATO_DEFINDEX_VAULT_ADDRESS?.trim() ||
    process.env.MERCATO_DEFINDEX_VAULT_ADDRESS?.trim() ||
    ''

  const params = searchParams
    ? typeof (searchParams as Promise<{ company?: string; sort?: string }>).then === 'function'
      ? await (searchParams as Promise<{ company?: string; sort?: string }>)
      : (searchParams as { company?: string; sort?: string })
    : {}
  const companyFilter = params.company ?? null
  const sortOrder = (params.sort ?? 'newest') as 'newest' | 'oldest'

  let query = supabase
    .from('deals')
    .select(
      `id, title, product_name, amount, escrow_contract_address, created_at, pyme_id, supplier_id,
      pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name),
      supplier:supplier_companies(company_name, full_name, contact_name)`
    )
    .not('escrow_contract_address', 'is', null)

  if (companyFilter) {
    if (companyFilter.startsWith('pyme:')) {
      query = query.eq('pyme_id', companyFilter.slice(5))
    } else if (companyFilter.startsWith('supplier:')) {
      query = query.eq('supplier_id', companyFilter.slice(9))
    }
  }

  const { data: dealsRows } = await query

  type DealRow = {
    id: string
    title?: string
    product_name?: string
    amount: number
    escrow_contract_address: string | null
    created_at?: string | null
    pyme_id?: string
    supplier_id?: string
    pyme?: { company_name?: string; full_name?: string; contact_name?: string } | null
    supplier?: { company_name?: string; full_name?: string; contact_name?: string } | null
  }

  const dealsList = (dealsRows ?? []) as DealRow[]

  const emptyState = dealsList.length === 0

  // ── Milestones ──────────────────────────────────────────────────────────────
  let items: PendingApprovalItem[] = []
  let releaseFallbackItems: ReleaseFallbackItem[] = []
  let uniquePymes: { id: string; name: string }[] = []
  let uniqueSuppliers: { id: string; name: string }[] = []

  if (!emptyState) {
    const dealIds = dealsList.map((d) => d.id)

    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, deal_id, title, status, percentage, amount, proof_notes, proof_document_url, created_at, completed_at')
      .in('deal_id', dealIds)
      .order('created_at', { ascending: true })

    const dealsById = new Map(dealsList.map((d) => [d.id, d]))

    const sortByDealDate = (a: { dealId: string }, b: { dealId: string }) => {
      const dateA = (dealsById.get(a.dealId) as DealRow | undefined)?.created_at ?? ''
      const dateB = (dealsById.get(b.dealId) as DealRow | undefined)?.created_at ?? ''
      const cmp = dateA < dateB ? -1 : dateA > dateB ? 1 : 0
      return sortOrder === 'newest' ? -cmp : cmp
    }

    const milestonesByDeal = new Map<string, { id: string; title: string }[]>()
    for (const ms of allMilestones ?? []) {
      const list = milestonesByDeal.get(ms.deal_id) ?? []
      list.push({ id: ms.id, title: ms.title ?? '' })
      milestonesByDeal.set(ms.deal_id, list)
    }
    for (const list of milestonesByDeal.values()) {
      list.sort((a, b) => (a.title > b.title ? -1 : a.title < b.title ? 1 : 0))
    }

    items = (allMilestones ?? [])
      .filter((ms) => ms.status === 'in_progress')
      .map((row) => {
        const deal = dealsById.get(row.deal_id) as DealRow | undefined
        const ordered = milestonesByDeal.get(row.deal_id) ?? []
        const milestoneIndex = ordered.findIndex((x) => x.id === row.id)
        return {
          dealId: row.deal_id,
          dealTitle: deal?.title ?? tr(m, 'adminPage.fallbackDeal'),
          dealProductName: deal?.product_name ?? null,
          dealAmount: Number(deal?.amount ?? 0),
          escrowContractAddress: deal?.escrow_contract_address ?? '',
          milestoneId: row.id,
          milestoneTitle: row.title,
          milestoneIndex: milestoneIndex >= 0 ? milestoneIndex : 0,
          milestonePercentage: Number(row.percentage ?? 0),
          milestoneAmount: Number(row.amount ?? 0),
          proofNotes: row.proof_notes ?? null,
          proofDocumentUrl: row.proof_document_url ?? null,
          pymeName: deal?.pyme?.company_name || deal?.pyme?.full_name || deal?.pyme?.contact_name || '—',
          supplierName: deal?.supplier?.company_name || deal?.supplier?.full_name || deal?.supplier?.contact_name || '—',
        }
      })
    items.sort(sortByDealDate)

    releaseFallbackItems = (allMilestones ?? [])
      .filter((ms) => ms.status === 'completed')
      .map((row) => {
        const deal = dealsById.get(row.deal_id) as DealRow | undefined
        const ordered = milestonesByDeal.get(row.deal_id) ?? []
        const milestoneIndex = ordered.findIndex((x) => x.id === row.id)
        return {
          dealId: row.deal_id,
          dealTitle: deal?.title ?? tr(m, 'adminPage.fallbackDeal'),
          dealProductName: deal?.product_name ?? null,
          escrowContractAddress: deal?.escrow_contract_address ?? '',
          milestoneId: row.id,
          milestoneTitle: row.title,
          milestoneIndex: milestoneIndex >= 0 ? milestoneIndex : 0,
          milestoneAmount: Number(row.amount ?? 0),
          milestonePercentage: Number(row.percentage ?? 0),
          completedAt: row.completed_at ?? null,
        }
      })
    releaseFallbackItems.sort(sortByDealDate)

    uniquePymes = Array.from(
      new Map(
        dealsList
          .filter((d): d is DealRow & { pyme_id: string } => Boolean(d.pyme_id))
          .map((d) => [
            d.pyme_id,
            {
              id: d.pyme_id,
              name: d.pyme?.company_name || d.pyme?.full_name || d.pyme?.contact_name || tr(m, 'adminPage.fallbackPyme'),
            },
          ])
      ).values()
    )

    uniqueSuppliers = Array.from(
      new Map(
        dealsList
          .filter((d): d is DealRow & { supplier_id: string } => Boolean(d.supplier_id))
          .map((d) => [
            d.supplier_id,
            {
              id: d.supplier_id,
              name: d.supplier?.company_name || d.supplier?.full_name || d.supplier?.contact_name || tr(m, 'adminPage.fallbackSupplier'),
            },
          ])
      ).values()
    )
  }

  const hasFilters = uniquePymes.length > 0 || uniqueSuppliers.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">

      <div className="container mx-auto max-w-6xl px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              {tr(m, 'adminPage.backDashboard')}
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                <h1 className="text-2xl font-bold tracking-tight">{tr(m, 'adminPage.title')}</h1>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{tr(m, 'adminPage.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4 text-amber-500" aria-hidden />
                Pending approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">{items.length}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">milestone{items.length !== 1 ? 's' : ''} awaiting sign-off</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                Release queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">{releaseFallbackItems.length}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">approved milestone{releaseFallbackItems.length !== 1 ? 's' : ''} to release</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Landmark className="h-4 w-4 text-violet-500" aria-hidden />
                Mercato vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              {configuredVaultAddress ? (
                <>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Configured</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{configuredVaultAddress}</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Not configured</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Create one in the Vault tab</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList className="h-10 w-full justify-start rounded-xl border border-border bg-card px-1 sm:w-auto">
            <TabsTrigger value="milestones" className="gap-2 rounded-lg text-sm">
              <FileCheck className="h-4 w-4" aria-hidden />
              Approvals
              {items.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs tabular-nums">
                  {items.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="release" className="gap-2 rounded-lg text-sm">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Release funds
              {releaseFallbackItems.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs tabular-nums">
                  {releaseFallbackItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="vault" className="gap-2 rounded-lg text-sm">
              <Landmark className="h-4 w-4" aria-hidden />
              DeFindex vault
              {!configuredVaultAddress && (
                <span className="h-2 w-2 rounded-full bg-amber-400" aria-label="Needs setup" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Approvals tab ── */}
          <TabsContent value="milestones" className="space-y-4">
            {/* Filters */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">Filter</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant={!companyFilter ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Link href={`/dashboard/admin?sort=${sortOrder}`}>All</Link>
                  </Button>
                  {uniquePymes.map((p) => (
                    <Button
                      key={`pyme-${p.id}`}
                      asChild
                      variant={companyFilter === `pyme:${p.id}` ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Link href={`/dashboard/admin?company=pyme:${p.id}&sort=${sortOrder}`}>
                        PyME · {p.name}
                      </Link>
                    </Button>
                  ))}
                  {uniqueSuppliers.map((s) => (
                    <Button
                      key={`supplier-${s.id}`}
                      asChild
                      variant={companyFilter === `supplier:${s.id}` ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Link href={`/dashboard/admin?company=supplier:${s.id}&sort=${sortOrder}`}>
                        Supplier · {s.name}
                      </Link>
                    </Button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Sort</span>
                  <Button
                    asChild
                    variant={sortOrder === 'newest' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Link href={`/dashboard/admin${companyFilter ? `?company=${companyFilter}&sort=newest` : '?sort=newest'}`}>
                      Newest
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={sortOrder === 'oldest' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Link href={`/dashboard/admin${companyFilter ? `?company=${companyFilter}&sort=oldest` : '?sort=oldest'}`}>
                      Oldest
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {emptyState ? (
              <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
                <FileCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden />
                <p className="font-medium">{tr(m, 'adminPage.pendingTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tr(m, 'adminPage.noPending')}</p>
              </div>
            ) : (
              <AdminEscrowsProvider items={items} releaseFallbackItems={releaseFallbackItems} />
            )}
          </TabsContent>

          {/* ── Release funds tab ── */}
          <TabsContent value="release" className="space-y-4">
            {releaseFallbackItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden />
                <p className="font-medium">No pending releases</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Milestones that have been approved but not yet released on-chain will appear here.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  These milestones were approved but may still need an on-chain release transaction.
                </p>
                <ReleaseFundsFallback items={releaseFallbackItems} />
              </div>
            )}
          </TabsContent>

          {/* ── Vault tab ── */}
          <TabsContent value="vault">
            <AdminDefindexVaultPanel configuredVaultAddress={configuredVaultAddress} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}
