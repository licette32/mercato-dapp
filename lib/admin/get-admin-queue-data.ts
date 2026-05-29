import type { SupabaseClient } from '@supabase/supabase-js'
import { getServerDictionary, tr } from '@/lib/i18n/server'
import type { AdminQueueData, AdminQueueFilters, PendingApprovalItem, ReleaseFallbackItem } from './types'

type DealRow = {
  id: string
  title?: string
  product_name?: string | null
  amount: number
  escrow_contract_address: string | null
  created_at?: string | null
  pyme_id?: string
  supplier_id?: string
  pyme?: { company_name?: string; full_name?: string; contact_name?: string } | null
  supplier?: { company_name?: string; full_name?: string; contact_name?: string; logo_url?: string | null } | null
}

export async function getAdminQueueData(
  supabase: SupabaseClient,
  filters: AdminQueueFilters = {},
): Promise<AdminQueueData> {
  const m = await getServerDictionary()
  const companyFilter = filters.company ?? null
  const sortOrder = filters.sort ?? 'newest'

  let query = supabase
    .from('deals')
    .select(
      `id, title, product_name, amount, escrow_contract_address, created_at, pyme_id, supplier_id,
      pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name),
      supplier:supplier_companies(company_name, full_name, contact_name, logo_url)`,
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
  const dealsList = (dealsRows ?? []) as DealRow[]
  const emptyState = dealsList.length === 0

  let items: PendingApprovalItem[] = []
  let releaseFallbackItems: ReleaseFallbackItem[] = []
  let uniquePymes: { id: string; name: string }[] = []
  let uniqueSuppliers: { id: string; name: string }[] = []

  if (!emptyState) {
    const dealIds = dealsList.map((d) => d.id)

    const { data: allMilestones } = await supabase
      .from('milestones')
      .select(
        'id, deal_id, title, status, percentage, amount, proof_notes, proof_document_url, created_at, completed_at',
      )
      .in('deal_id', dealIds)
      .order('created_at', { ascending: true })

    const dealsById = new Map(dealsList.map((d) => [d.id, d]))

    const sortByDealDate = (a: { dealId: string }, b: { dealId: string }) => {
      const dateA = dealsById.get(a.dealId)?.created_at ?? ''
      const dateB = dealsById.get(b.dealId)?.created_at ?? ''
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
        const deal = dealsById.get(row.deal_id)
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
          pymeName:
            deal?.pyme?.company_name || deal?.pyme?.full_name || deal?.pyme?.contact_name || '—',
          supplierName:
            deal?.supplier?.company_name ||
            deal?.supplier?.full_name ||
            deal?.supplier?.contact_name ||
            '—',
          supplierLogoUrl: deal?.supplier?.logo_url ?? null,
        }
      })
    items.sort(sortByDealDate)

    releaseFallbackItems = (allMilestones ?? [])
      .filter((ms) => ms.status === 'completed')
      .map((row) => {
        const deal = dealsById.get(row.deal_id)
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
          supplierLogoUrl: deal?.supplier?.logo_url ?? null,
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
              name:
                d.pyme?.company_name ||
                d.pyme?.full_name ||
                d.pyme?.contact_name ||
                tr(m, 'adminPage.fallbackPyme'),
            },
          ]),
      ).values(),
    )

    uniqueSuppliers = Array.from(
      new Map(
        dealsList
          .filter((d): d is DealRow & { supplier_id: string } => Boolean(d.supplier_id))
          .map((d) => [
            d.supplier_id,
            {
              id: d.supplier_id,
              name:
                d.supplier?.company_name ||
                d.supplier?.full_name ||
                d.supplier?.contact_name ||
                tr(m, 'adminPage.fallbackSupplier'),
            },
          ]),
      ).values(),
    )
  }

  return {
    items,
    releaseFallbackItems,
    uniquePymes,
    uniqueSuppliers,
    emptyState,
    companyFilter,
    sortOrder,
  }
}
