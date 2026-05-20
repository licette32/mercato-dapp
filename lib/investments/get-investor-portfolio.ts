import type { SupabaseClient } from '@supabase/supabase-js'
import type { InvestorDeal } from './types'
import { buildInvestorPortfolio } from './portfolio-metrics'

export async function getInvestorPortfolio(
  supabase: SupabaseClient,
  userId: string,
  profile: {
    user_type?: string | null
    full_name?: string | null
    company_name?: string | null
    contact_name?: string | null
  } | null,
  labels: { smbFallback: string; dealFallbackTitle: string },
) {
  if (profile?.user_type !== 'investor') {
    return null
  }

  const { data: deals } = await supabase
    .from('deals')
    .select(
      `id, title, product_name, status, amount, interest_rate, term_days,
       created_at, funded_at, pyme_id, escrow_contract_address,
       pyme:profiles!deals_pyme_id_fkey(company_name, full_name, contact_name)`,
    )
    .eq('investor_id', userId)
    .order('funded_at', { ascending: false })

  const list = (deals ?? []) as InvestorDeal[]
  const pymeIds = [...new Set(list.map((d) => d.pyme_id).filter(Boolean))] as string[]

  const { data: activeCounts } =
    pymeIds.length > 0
      ? await supabase
          .from('deals')
          .select('pyme_id')
          .in('pyme_id', pymeIds)
          .in('status', ['funded', 'in_progress'])
      : { data: [] as { pyme_id: string }[] | null }

  const openEscrowsBySmb: Record<string, number> = {}
  for (const row of activeCounts ?? []) {
    if (row.pyme_id) openEscrowsBySmb[row.pyme_id] = (openEscrowsBySmb[row.pyme_id] ?? 0) + 1
  }

  const displayName = profile?.company_name || profile?.full_name || profile?.contact_name || null

  return buildInvestorPortfolio(
    list,
    openEscrowsBySmb,
    displayName,
    labels.smbFallback,
    labels.dealFallbackTitle,
  )
}
