import { Badge } from '@/components/ui/badge'

export function ProviderBadges({
  capabilities,
}: {
  capabilities: Record<string, unknown> | null
}) {
  if (!capabilities) return null

  const badges: { label: string; variant: 'secondary' | 'outline' }[] = []

  if (capabilities.sandbox)
    badges.push({ label: 'Sandbox', variant: 'outline' })

  if (capabilities.kycFlow === 'iframe')
    badges.push({ label: 'Inline KYC', variant: 'secondary' })
  else if (capabilities.kycFlow === 'redirect')
    badges.push({ label: 'Redirect KYC', variant: 'secondary' })
  else if (capabilities.kycFlow === 'form')
    badges.push({ label: 'Form KYC', variant: 'secondary' })

  if (capabilities.requiresOffRampSigning)
    badges.push({ label: 'Wallet signing', variant: 'outline' })
  if (capabilities.requiresAnchorPayoutSubmission)
    badges.push({ label: 'Anchor payout', variant: 'outline' })

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((b) => (
        <Badge
          key={b.label}
          variant={b.variant}
          className="text-[10px] px-1.5 py-0"
        >
          {b.label}
        </Badge>
      ))}
    </div>
  )
}
