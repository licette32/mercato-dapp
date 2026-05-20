import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { InvestorCapitalOverview } from '@/components/dashboard/investor-capital-overview'
import { getServerDictionary } from '@/lib/i18n/server'

export default async function DashboardVaultPage() {
  const t = await getServerDictionary()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  const userType = profile?.user_type
  if (userType !== 'investor' && userType !== 'pyme') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <DashboardPageHeader
        title={t.dashboardNav.vault}
        description={t.dashboardNav.vaultDescription}
      />
      <InvestorCapitalOverview viewerRole={userType === 'pyme' ? 'pyme' : 'investor'} />
    </div>
  )
}
