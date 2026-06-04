'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  ExternalLink,
  PiggyBank,
  Sprout,
  Users,
  Wallet,
} from 'lucide-react'
import { DashboardStatTile } from '@/components/dashboard/dashboard-stat-tile'
import { DefindexPill, TokenAvatar, VaultSectionHeader } from '@/components/dashboard/vault-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createDedupedFetcher } from '@/lib/client/deduped-fetch'
import { buildVaultPositionSummary } from '@/lib/defindex/vault-position'
import { formatCompactCurrency, getPrimarySupplyAsset } from '@/lib/defindex/vault-display'
import { formatDateLong } from '@/lib/date-utils'
import { formatDecimal, formatPercent } from '@/lib/format'
import type { MercatoVaultMeta } from '@/hooks/useDefindex'
import type { VaultActivityEntry } from '@/lib/stellar/vault-activity'
import { summarizeVaultActivity } from '@/lib/stellar/vault-activity'
import { cn } from '@/lib/utils'

type VaultActivityApiResponse = {
  activity: VaultActivityEntry[]
  activitySummary: {
    depositCount: number
    withdrawCount: number
    totalDepositedDisplay: number
    totalWithdrawnDisplay: number
  }
}

export const vaultActivityRequest = createDedupedFetcher(
  async (address: string): Promise<VaultActivityApiResponse> => {
    const url = new URL('/api/stellar/vault-activity', window.location.origin)
    url.searchParams.set('account', address)
    const response = await fetch(url.toString(), { credentials: 'include' })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error ?? `Request failed (${response.status})`)
    }
    return (await response.json()) as VaultActivityApiResponse
  },
  (address) => `vault-activity:${address}`,
  15_000,
)

type VaultMyPositionsProps = {
  walletAddress: string
  walletBalance: number
  vaultBalance: number
  dfTokens: number
  vaultMeta: MercatoVaultMeta | null
  isLoadingBalances: boolean
  refreshNonce?: number
  onDeposit: () => void
  onWithdraw: () => void
}

export function VaultMyPositions({
  walletAddress,
  walletBalance,
  vaultBalance,
  dfTokens,
  vaultMeta,
  isLoadingBalances,
  refreshNonce = 0,
  onDeposit,
  onWithdraw,
}: VaultMyPositionsProps) {
  const [activity, setActivity] = useState<VaultActivityEntry[]>([])
  const [activitySummary, setActivitySummary] = useState<VaultActivityApiResponse['activitySummary'] | null>(
    null,
  )
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  const supply = getPrimarySupplyAsset(vaultMeta)

  const ownership = useMemo(
    () =>
      buildVaultPositionSummary({
        userPositionDisplay: vaultBalance,
        vaultTvlDisplay: vaultMeta?.totals?.tvlDisplay ?? 0,
        dfTokensRaw: dfTokens,
        apy: vaultMeta?.apy,
        supplySymbol: supply.symbol,
      }),
    [vaultBalance, vaultMeta, dfTokens, supply.symbol],
  )

  const loadActivity = useCallback(async () => {
    if (!walletAddress) return
    setIsLoadingActivity(true)
    setActivityError(null)
    try {
      const data = await vaultActivityRequest.fetch(walletAddress)
      setActivity(data.activity)
      setActivitySummary(data.activitySummary)
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : 'Failed to load investment history.')
      setActivity([])
      setActivitySummary(null)
    } finally {
      setIsLoadingActivity(false)
    }
  }, [walletAddress])

  useEffect(() => {
    vaultActivityRequest.invalidate(walletAddress)
    void loadActivity()
  }, [loadActivity, refreshNonce, walletAddress])

  const vaultName = vaultMeta?.name ?? 'Mercato Vault'
  const isLoading = isLoadingBalances
  const isLoadingHistory = isLoadingActivity
  const resolvedActivitySummary =
    activitySummary ??
    (activity.length > 0 ? summarizeVaultActivity(activity) : null)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-500/15 bg-gradient-to-br from-emerald-50/60 via-card to-card dark:from-emerald-950/25">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <TokenAvatar symbol={supply.symbol} size="lg" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Your vault position
                </p>
                <h2 className="line-clamp-2 font-display text-2xl font-normal tracking-tight sm:text-3xl">
                  {vaultName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DefindexPill />
                  {ownership.apy != null && ownership.apy > 0 && (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {formatPercent(ownership.apy, { maxFractionDigits: 2 })} APY
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              {isLoading ? (
                <Skeleton className="ml-auto h-9 w-36" />
              ) : (
                <>
                  <p className="font-display text-3xl font-normal tabular-nums tracking-tight">
                    ${formatDecimal(ownership.userPositionDisplay, { maxFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Current value in vault</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700"
              onClick={onDeposit}
            >
              Deposit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!ownership.hasPosition}
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatTile
          label="Wallet"
          value={
            isLoading ? '—' : `$${formatDecimal(walletBalance, { maxFractionDigits: 2 })}`
          }
          icon={Wallet}
          footer={`Liquid ${supply.symbol} ready to deposit`}
        />
        <DashboardStatTile
          label="Vault shares"
          value={
            isLoading ? '—' : formatDecimal(ownership.dfTokensDisplay, { maxFractionDigits: 4 })
          }
          icon={Sprout}
          iconClassName="text-emerald-600 dark:text-emerald-400"
          footer="dfTokens representing your share"
        />
        <DashboardStatTile
          label="Est. yearly yield"
          value={
            isLoading
              ? '—'
              : ownership.estimatedYearlyYieldDisplay != null
                ? `$${formatDecimal(ownership.estimatedYearlyYieldDisplay, { maxFractionDigits: 2 })}`
                : '—'
          }
          icon={PiggyBank}
          footer="Based on current APY and balance"
        />
        <DashboardStatTile
          label="Deposits"
          value={
            isLoadingHistory
              ? '—'
              : String(resolvedActivitySummary?.depositCount ?? 0)
          }
          icon={ArrowDownToLine}
          footer={
            resolvedActivitySummary
              ? `$${formatDecimal(resolvedActivitySummary.totalDepositedDisplay, { maxFractionDigits: 2 })} total deposited`
              : 'On-chain deposit count'
          }
        />
      </div>

      <VaultOwnershipCard ownership={ownership} supplySymbol={supply.symbol} isLoading={isLoading} />

      <VaultActivitySection
        activity={activity}
        isLoading={isLoadingHistory}
        activityError={activityError}
        supplySymbol={supply.symbol}
        onRetry={() => void loadActivity()}
      />
    </div>
  )
}

function VaultOwnershipCard({
  ownership,
  supplySymbol,
  isLoading,
}: {
  ownership: ReturnType<typeof buildVaultPositionSummary>
  supplySymbol: string
  isLoading: boolean
}) {
  const tvl = ownership.vaultTvlDisplay
  const userPct = Math.min(100, Math.max(0, ownership.userSharePercent))
  const othersPct = Math.min(100, Math.max(0, ownership.othersSharePercent))

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <VaultSectionHeader
          title="Who owns the vault"
          description="Total vault value (TVL) includes your deposits and funds from other investors. Your share is what you can withdraw proportionally."
          icon={Users}
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        ) : tvl <= 0 && !ownership.hasPosition ? (
          <p className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
            No vault TVL data yet. Deposit to become the first liquidity provider.
          </p>
        ) : (
          <>
            <div
              className="mb-4 flex h-3 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`You own ${userPct.toFixed(1)} percent of the vault; other depositors own ${othersPct.toFixed(1)} percent.`}
            >
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${userPct}%` }}
              />
              <div
                className="h-full bg-slate-300 transition-all dark:bg-slate-600"
                style={{ width: `${othersPct}%` }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <OwnershipStat
                label="Your contribution"
                value={`$${formatDecimal(ownership.userPositionDisplay, { maxFractionDigits: 2 })}`}
                sublabel={`${userPct.toFixed(1)}% of vault · ${supplySymbol}`}
                accent="emerald"
              />
              <OwnershipStat
                label="Other depositors"
                value={`$${formatDecimal(ownership.othersDisplay, { maxFractionDigits: 2 })}`}
                sublabel={
                  ownership.isSoleDepositor
                    ? 'You are the only depositor so far'
                    : `${othersPct.toFixed(1)}% of vault · pooled from others`
                }
              />
              <OwnershipStat
                label="Total vault TVL"
                value={formatCompactCurrency(tvl)}
                sublabel="All assets managed by this vault"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function OwnershipStat({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string
  value: string
  sublabel: string
  accent?: 'emerald'
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-muted/20 px-4 py-3',
        accent === 'emerald' && 'border-emerald-500/20 bg-emerald-500/5',
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
    </div>
  )
}

function VaultActivitySection({
  activity,
  isLoading,
  activityError,
  supplySymbol,
  onRetry,
}: {
  activity: VaultActivityEntry[]
  isLoading: boolean
  activityError: string | null
  supplySymbol: string
  onRetry: () => void
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <VaultSectionHeader
          title="Investment history"
          description="Each deposit and withdrawal to this vault, pulled from the Stellar ledger."
        />

        {activityError && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <span>{activityError}</span>
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : activity.length === 0 && !activityError ? (
          <p className="rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
            No vault deposits or withdrawals found for your wallet yet.
          </p>
        ) : activity.length === 0 ? null : (
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <ul className="divide-y divide-border">
              {activity.map((entry) => (
                <li key={entry.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          entry.kind === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
                        )}
                      >
                        {entry.kind === 'deposit' ? (
                          <ArrowDownToLine className="h-4 w-4" aria-hidden />
                        ) : (
                          <ArrowUpFromLine className="h-4 w-4" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium capitalize">{entry.kind}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateLong(entry.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">
                          {entry.kind === 'deposit' ? '+' : '−'}$
                          {formatDecimal(entry.amountDisplay, { maxFractionDigits: 2 })}{' '}
                          <span className="text-xs font-normal text-muted-foreground">{supplySymbol}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.transactionHash.slice(0, 8)}…
                        </p>
                      </div>
                      <Link
                        href={entry.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="View transaction on Stellar Expert"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isLoading && activity.length > 0 && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            Amounts reflect on-chain {supplySymbol} units at transaction time.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
