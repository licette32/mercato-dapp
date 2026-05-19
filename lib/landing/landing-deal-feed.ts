import { heroIllustrativeDeals } from '@/lib/hero-illustrative-deals'
import { mockDeals } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/format'
import type { Deal } from '@/lib/types'

export type FeedEventType = 'open' | 'funded' | 'production' | 'milestone' | 'repaid'

export type LandingFeedItem = {
  id: string
  href: string
  eventType: FeedEventType
  eventLabel: string
  productName: string
  companyLine: string
  amountLabel: string
  aprLabel?: string
  termDays: number
  category?: string
  milestonesCompleted: number
  milestonesTotal: number
  isLive: boolean
}

const EVENT_BY_STATUS: Record<string, { type: FeedEventType; label: string }> = {
  awaiting_funding: { type: 'open', label: 'Open for funding' },
  funded: { type: 'funded', label: 'Escrow funded' },
  in_progress: { type: 'production', label: 'In production' },
  milestone_pending: { type: 'milestone', label: 'Milestone pending' },
  completed: { type: 'repaid', label: 'Repaid · deal closed' },
  released: { type: 'repaid', label: 'Funds released' },
  disputed: { type: 'milestone', label: 'Under review' },
}

function milestoneLabel(deal: Deal): string {
  const completed = deal.milestones.filter((m) => m.status === 'completed').length
  const total = deal.milestones.length
  if (total === 0) return EVENT_BY_STATUS[deal.status]?.label ?? 'Active deal'
  if (completed >= total) return 'All milestones complete'
  const inProgress = deal.milestones.find((m) => m.status === 'in_progress')
  if (inProgress) return `${inProgress.name} in progress`
  if (completed > 0) return `Milestone ${completed} of ${total} released`
  return EVENT_BY_STATUS[deal.status]?.label ?? 'Active deal'
}

export function dealToFeedItem(deal: Deal): LandingFeedItem {
  const base = EVENT_BY_STATUS[deal.status] ?? EVENT_BY_STATUS.awaiting_funding
  const completed = deal.milestones.filter((m) => m.status === 'completed').length
  const eventType =
    deal.status === 'in_progress' || deal.status === 'milestone_pending'
      ? completed > 0
        ? 'milestone'
        : 'production'
      : base.type

  return {
    id: deal.id,
    href: `/deals/${deal.id}`,
    eventType,
    eventLabel:
      eventType === 'milestone' || eventType === 'production'
        ? milestoneLabel(deal)
        : base.label,
    productName: deal.productName,
    companyLine: [deal.pymeName, deal.supplier].filter(Boolean).join(' · '),
    amountLabel: formatCurrency(deal.priceUSDC),
    aprLabel: deal.yieldAPR != null ? `${deal.yieldAPR.toFixed(1)}%` : undefined,
    termDays: deal.term,
    category: deal.category,
    milestonesCompleted: completed,
    milestonesTotal: deal.milestones.length,
    isLive: true,
  }
}

function illustrativeToFeed(): LandingFeedItem[] {
  return heroIllustrativeDeals.map((d) => ({
    id: `illus-${d.key}`,
    href: d.cta.href,
    eventType:
      d.key === 'open' ? 'open' : d.key === 'funded' ? 'production' : 'repaid',
    eventLabel: d.flowStep,
    productName: d.product,
    companyLine: d.company,
    amountLabel: d.amount,
    aprLabel: d.apr,
    termDays: Number(d.termDays),
    category: d.category.split(' · ')[0],
    milestonesCompleted: d.milestone === 'repaid' ? 2 : d.milestone === 'funded_progress' ? 2 : 0,
    milestonesTotal: 2,
    isLive: false,
  }))
}

/** Build a long feed for waterfall columns (dedupe by id, pad if needed). */
export function buildLandingFeed(deals: Deal[]): LandingFeedItem[] {
  const source =
    deals.length > 0
      ? deals.map(dealToFeedItem)
      : [...mockDeals.map(dealToFeedItem), ...illustrativeToFeed()]

  const unique = Array.from(new Map(source.map((item) => [item.id, item])).values())
  if (unique.length >= 12) return unique

  const padded: LandingFeedItem[] = []
  while (padded.length < 12) {
    padded.push(...unique.map((item, i) => ({ ...item, id: `${item.id}-p${padded.length + i}` })))
  }
  return padded.slice(0, 18)
}

export function splitIntoColumns<T>(items: T[], columns: number): T[][] {
  const cols: T[][] = Array.from({ length: columns }, () => [])
  items.forEach((item, i) => cols[i % columns].push(item))
  return cols
}
