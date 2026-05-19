export type DashboardDealRow = {
  id: string
  title?: string
  product_name?: string
  description?: string
  status: string
  amount: number
  term_days?: number
  interest_rate?: number
  created_at?: string
  funded_at?: string | null
  pyme?: { company_name?: string; full_name?: string; contact_name?: string } | null
  supplier?: { company_name?: string; full_name?: string; contact_name?: string } | null
  investor?: { company_name?: string; full_name?: string; contact_name?: string } | null
  milestones?: Array<{ id: string; status: string }> | null
}

export type DashboardQuickAction = {
  label: string
  description: string
  href: string
  icon: string
  variant?: 'primary' | 'default'
}

export type RoleStats = {
  total: number
  active: number
  completed: number
  seekingFunding?: number
  pendingDeliveries?: number
}

export type AdminStats = {
  totalDeals: number
  seekingFunding: number
  activeDeals: number
  completedDeals: number
  pendingApprovals: number
}

export type SupplierProductsCard = {
  categories: string[]
  products: string[]
}

export type DashboardProfile = {
  fullName: string
  companyName?: string | null
  userType: string
}

export type DashboardPayload = {
  profile: DashboardProfile
  deals: DashboardDealRow[]
  companyFilterId: string | null
  supplierCompanies: { id: string; company_name: string | null }[]
  supplierProductsForCard: SupplierProductsCard | null
  roleStats: RoleStats | null
  adminStats: AdminStats | null
}
