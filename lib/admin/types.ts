/** Milestone awaiting approval + release (in_progress) */
export type PendingApprovalItem = {
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

/** Completed milestone: admin can trigger release only */
export type ReleaseFallbackItem = {
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

export type AdminQueueFilters = {
  company?: string | null
  sort?: 'newest' | 'oldest'
}

export type AdminQueueData = {
  items: PendingApprovalItem[]
  releaseFallbackItems: ReleaseFallbackItem[]
  uniquePymes: { id: string; name: string }[]
  uniqueSuppliers: { id: string; name: string }[]
  emptyState: boolean
  companyFilter: string | null
  sortOrder: 'newest' | 'oldest'
}
