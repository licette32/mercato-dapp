import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  InvestmentsDashboard,
  parseInvestmentsTab,
} from '@/components/investments/investments-dashboard'
import { getInvestorPortfolio } from '@/lib/investments/get-investor-portfolio'
import { getServerDictionary } from '@/lib/i18n/server'

type SearchParams = Promise<{ tab?: string }> | { tab?: string }

export default async function DashboardInvestmentsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const t = await getServerDictionary()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, full_name, company_name, contact_name')
    .eq('id', user.id)
    .single()

  const portfolio = await getInvestorPortfolio(supabase, user.id, profile, {
    smbFallback: t.investments.smbFallbackName,
    dealFallbackTitle: t.investments.dealFallbackTitle,
  })

  if (!portfolio) redirect('/dashboard')

  const params = searchParams
    ? typeof (searchParams as Promise<{ tab?: string }>).then === 'function'
      ? await (searchParams as Promise<{ tab?: string }>)
      : (searchParams as { tab?: string })
    : {}

  const tab = parseInvestmentsTab(params.tab)

  return <InvestmentsDashboard portfolio={portfolio} tab={tab} t={t} />
}
