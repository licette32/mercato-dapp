import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardDealRow, DashboardPayload } from './types'

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
  profile: {
    full_name?: string | null
    contact_name?: string | null
    company_name?: string | null
    user_type?: string | null
  } | null,
  userEmail: string | undefined,
  companyFilterId: string | null,
): Promise<DashboardPayload> {
  const userType = profile?.user_type || 'pyme'
  const fullName = profile?.full_name || profile?.contact_name || userEmail || ''
  const companyName = profile?.company_name

  let deals: DashboardDealRow[] = []
  let supplierCompanies: { id: string; company_name: string | null }[] = []
  let supplierProductsForCard: DashboardPayload['supplierProductsForCard'] = null
  let adminStats: DashboardPayload['adminStats'] = null
  let roleStats: DashboardPayload['roleStats'] = null

  if (userType === 'pyme') {
    const [{ data }, { count: total }, { count: active }, { count: completed }, { count: seeking }] =
      await Promise.all([
        supabase
          .from('deals')
          .select(
            'id, title, product_name, description, status, amount, term_days, interest_rate, created_at, funded_at, milestones(id, status)',
          )
          .eq('pyme_id', userId)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('pyme_id', userId),
        supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('pyme_id', userId)
          .in('status', ['funded', 'in_progress']),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('pyme_id', userId).eq('status', 'completed'),
        supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('pyme_id', userId)
          .eq('status', 'seeking_funding'),
      ])
    deals = (data || []) as DashboardDealRow[]
    roleStats = {
      total: total ?? 0,
      active: active ?? 0,
      completed: completed ?? 0,
      seekingFunding: seeking ?? 0,
    }
  } else if (userType === 'investor') {
    const [{ data }, { count: total }, { count: active }, { count: completed }] = await Promise.all([
      supabase
        .from('deals')
        .select(
          'id, title, product_name, description, status, amount, term_days, interest_rate, created_at, funded_at, pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name), milestones(id, status)',
        )
        .eq('investor_id', userId)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('investor_id', userId),
      supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('investor_id', userId)
        .in('status', ['funded', 'in_progress']),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('investor_id', userId).eq('status', 'completed'),
    ])
    deals = (data || []) as DashboardDealRow[]
    roleStats = { total: total ?? 0, active: active ?? 0, completed: completed ?? 0 }
  } else if (userType === 'supplier') {
    const { data: myCompanies } = await supabase
      .from('supplier_companies')
      .select('id, company_name')
      .eq('owner_id', userId)
    supplierCompanies = myCompanies ?? []
    const companyIds = supplierCompanies.map((c) => c.id)

    if (companyIds.length > 0) {
      const filterByCompany =
        companyFilterId && companyIds.includes(companyFilterId) ? companyFilterId : null
      const dealsBase = filterByCompany
        ? supabase.from('deals').select('*', { count: 'exact', head: true }).eq('supplier_id', filterByCompany)
        : supabase.from('deals').select('*', { count: 'exact', head: true }).in('supplier_id', companyIds)

      const [{ data }, { count: total }, { count: active }, { count: completed }] = await Promise.all([
        (filterByCompany
          ? supabase
              .from('deals')
              .select(
                'id, title, product_name, description, status, amount, term_days, interest_rate, created_at, funded_at, pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name), supplier:supplier_companies(company_name, full_name, contact_name), milestones(id, status)',
              )
              .eq('supplier_id', filterByCompany)
          : supabase
              .from('deals')
              .select(
                'id, title, product_name, description, status, amount, term_days, interest_rate, created_at, funded_at, pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name), supplier:supplier_companies(company_name, full_name, contact_name), milestones(id, status)',
              )
              .in('supplier_id', companyIds)
        )
          .order('created_at', { ascending: false })
          .limit(10),
        dealsBase,
        (filterByCompany
          ? supabase.from('deals').select('*', { count: 'exact', head: true }).eq('supplier_id', filterByCompany)
          : supabase.from('deals').select('*', { count: 'exact', head: true }).in('supplier_id', companyIds)
        ).in('status', ['funded', 'in_progress']),
        (filterByCompany
          ? supabase.from('deals').select('*', { count: 'exact', head: true }).eq('supplier_id', filterByCompany)
          : supabase.from('deals').select('*', { count: 'exact', head: true }).in('supplier_id', companyIds)
        ).eq('status', 'completed'),
      ])
      deals = (data || []) as DashboardDealRow[]

      const { data: supplierDealRows } = filterByCompany
        ? await supabase.from('deals').select('id').eq('supplier_id', filterByCompany)
        : await supabase.from('deals').select('id').in('supplier_id', companyIds)
      const supplierDealIds = (supplierDealRows ?? []).map((d) => d.id)
      let pendingDeliveries = 0
      if (supplierDealIds.length > 0) {
        const { count } = await supabase
          .from('milestones')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress')
          .in('deal_id', supplierDealIds)
        pendingDeliveries = count ?? 0
      }

      roleStats = {
        total: total ?? 0,
        active: active ?? 0,
        completed: completed ?? 0,
        pendingDeliveries,
      }

      const companyForCard =
        filterByCompany ?? (supplierCompanies.length === 1 ? supplierCompanies[0].id : null)
      if (companyForCard) {
        const { data: products } = await supabase
          .from('supplier_products')
          .select('name, category')
          .eq('supplier_id', companyForCard)
        const productList = products ?? []
        const categories = [
          ...new Set(productList.map((p) => (p as { category: string }).category).filter(Boolean)),
        ]
        const productNames = productList.map((p) => (p as { name: string }).name).filter(Boolean)
        supplierProductsForCard = { categories, products: productNames }
      }
    }
  } else if (userType === 'admin') {
    const [
      { count: totalDeals },
      { count: seekingFunding },
      { count: fundedCount },
      { count: inProgressCount },
      { count: completedCount },
      { data: recentDeals },
      { count: pendingApprovals },
    ] = await Promise.all([
      supabase.from('deals').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'seeking_funding'),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'funded'),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase
        .from('deals')
        .select(
          'id, title, product_name, description, status, amount, term_days, interest_rate, created_at, funded_at, pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name), supplier:supplier_companies(company_name, full_name, contact_name), investor:profiles!deals_investor_id_fkey(company_name, full_name, contact_name), milestones(id, status)',
        )
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('milestones').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    ])
    deals = (recentDeals || []) as DashboardDealRow[]
    adminStats = {
      totalDeals: totalDeals ?? 0,
      seekingFunding: seekingFunding ?? 0,
      activeDeals: (fundedCount ?? 0) + (inProgressCount ?? 0),
      completedDeals: completedCount ?? 0,
      pendingApprovals: pendingApprovals ?? 0,
    }
  }

  return {
    profile: { fullName, companyName, userType },
    deals,
    companyFilterId,
    supplierCompanies,
    supplierProductsForCard,
    roleStats,
    adminStats,
  }
}
