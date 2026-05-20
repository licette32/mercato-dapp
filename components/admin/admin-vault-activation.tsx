'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Sprout,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VaultAssetTrustlineCard } from '@/components/admin/vault-asset-trustline-card'
import { useAdminVaultTransactions } from '@/hooks/use-admin-vault-transactions'
import { isMissingTrustlineError } from '@/lib/stellar/vault-asset-trustline'
import { useI18n } from '@/lib/i18n/provider'
import { displayToRawTokenAmount, getPublicDefindexAssetDecimals } from '@/lib/defindex/client-amounts'
import {
  minInitDepositDisplay,
  VAULT_MIN_INIT_DEPOSIT_RAW,
} from '@/lib/defindex/vault-activation'
import type { VaultMonitorPayload } from '@/lib/defindex/vault-monitor'
import { formatCurrency, formatDecimal } from '@/lib/format'
type AdminVaultActivationProps = {
  vaultAddress: string
  monitor: VaultMonitorPayload
  onSuccess: () => void
}

type StrategyOption = {
  assetSymbol: string
  address: string
  name: string
  paused: boolean
}

export function AdminVaultActivation({ vaultAddress, monitor, onSuccess }: AdminVaultActivationProps) {
  const { messages } = useI18n()
  const m = messages.adminVaultMonitor
  const { walletAddress, provider, submitAdminXdr } = useAdminVaultTransactions()

  const decimals = getPublicDefindexAssetDecimals()
  const minDisplay = minInitDepositDisplay(decimals)

  const [depositDisplay, setDepositDisplay] = useState(String(minDisplay))
  const [busy, setBusy] = useState<'deposit' | 'rebalance' | null>(null)
  const [trustlineReady, setTrustlineReady] = useState(false)

  const assetCount = Math.max(monitor.assets.length, 1)
  const primaryAsset = monitor.assets[0]

  const strategyOptions = useMemo((): StrategyOption[] => {
    const out: StrategyOption[] = []
    for (const asset of monitor.assets) {
      for (const s of asset.strategies) {
        out.push({
          assetSymbol: asset.symbol,
          address: s.address,
          name: s.name,
          paused: s.paused,
        })
      }
    }
    return out
  }, [monitor.assets])

  const defaultStrategy =
    strategyOptions.find((s) => !s.paused)?.address ?? strategyOptions[0]?.address ?? ''

  const [strategyAddress, setStrategyAddress] = useState(defaultStrategy)

  useEffect(() => {
    if (defaultStrategy) setStrategyAddress(defaultStrategy)
  }, [defaultStrategy])

  const depositDone = monitor.totals.tvlDisplay > 0
  const rebalanceDone =
    monitor.totals.investedDisplay > 0 && monitor.totals.idlePercent < 90

  const idleRaw = useMemo(() => {
    const raw = Number(primaryAsset?.idleRaw ?? 0)
    return Number.isFinite(raw) ? Math.floor(raw) : 0
  }, [primaryAsset?.idleRaw])

  const callerMatchesRebalance =
    walletAddress &&
    (walletAddress === monitor.roles.rebalanceManager ||
      walletAddress === monitor.roles.manager)

  const buildAmountsArray = (rawFirstAsset: number): number[] => {
    const amounts = new Array(assetCount).fill(0) as number[]
    amounts[0] = rawFirstAsset
    return amounts
  }

  const onDeposit = async () => {
    const display = Number(depositDisplay)
    const raw = displayToRawTokenAmount(display, decimals)
    if (raw < VAULT_MIN_INIT_DEPOSIT_RAW) {
      toast.error(m.depositTooSmall.replace('{min}', formatDecimal(minDisplay, { maxFractionDigits: 7 })))
      return
    }

    setBusy('deposit')
    try {
      const result = await submitAdminXdr('/api/defindex/admin/deposit', {
        vault: vaultAddress,
        amounts: buildAmountsArray(raw),
        invest: false,
        slippageBps: 100,
      })
      if (result?.success === false) {
        toast.error(m.txFailed)
        return
      }
      toast.success(m.depositSuccess)
      onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message : m.depositFailed
      toast.error(isMissingTrustlineError(msg) ? m.trustMissingError : msg)
    } finally {
      setBusy(null)
    }
  }

  const onRebalance = async () => {
    if (!strategyAddress) {
      toast.error(m.noStrategy)
      return
    }
    if (idleRaw <= 0) {
      toast.error(m.noIdle)
      return
    }
    if (walletAddress && !callerMatchesRebalance) {
      toast.error(m.callerRoleWarning)
    }

    setBusy('rebalance')
    try {
      const result = await submitAdminXdr('/api/defindex/admin/rebalance', {
        vault: vaultAddress,
        instructions: [
          {
            type: 'Invest',
            strategy_address: strategyAddress,
            amount: idleRaw,
          },
        ],
      })
      if (result?.success === false) {
        toast.error(m.txFailed)
        return
      }
      toast.success(m.rebalanceSuccess)
      onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message : m.rebalanceFailed
      toast.error(isMissingTrustlineError(msg) ? m.trustMissingError : msg)
    } finally {
      setBusy(null)
    }
  }

  if (rebalanceDone && depositDone) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" aria-hidden />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">{m.activationComplete}</p>
            <p className="text-sm text-muted-foreground">{m.activationCompleteHint}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-violet-500/25">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sprout className="h-5 w-5 text-violet-500" aria-hidden />
          {m.activationTitle}
        </CardTitle>
        <CardDescription>{m.activationSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!walletAddress && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
            {m.connectWallet}
          </p>
        )}

        {walletAddress && provider !== 'pollar' && (
          <p className="text-xs text-muted-foreground">
            {m.signingAs.replace('{address}', `${walletAddress.slice(0, 8)}…${walletAddress.slice(-4)}`)}
            {!callerMatchesRebalance && (
              <span className="mt-1 block text-amber-700 dark:text-amber-300">{m.callerRoleHint}</span>
            )}
          </p>
        )}

        <ol className="space-y-4">
          <li className="flex gap-3">
            <StepIcon done={depositDone} />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="font-medium">{m.stepDepositTitle}</p>
                <p className="text-sm text-muted-foreground">{m.stepDepositDesc}</p>
              </div>
              {!depositDone && primaryAsset && (
                <VaultAssetTrustlineCard
                  assetContract={primaryAsset.address}
                  assetSymbol={primaryAsset.symbol}
                  assetName={primaryAsset.name}
                  onTrustlineReady={() => setTrustlineReady(true)}
                />
              )}
              {!depositDone && (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[10rem] flex-1 space-y-1.5">
                    <Label htmlFor="admin-vault-deposit">{m.depositAmountLabel}</Label>
                    <Input
                      id="admin-vault-deposit"
                      type="number"
                      min={minDisplay}
                      step="any"
                      value={depositDisplay}
                      onChange={(e) => setDepositDisplay(e.target.value)}
                      disabled={busy !== null}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {m.depositMinHint.replace('{min}', formatDecimal(minDisplay, { maxFractionDigits: 7 }))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="gap-2"
                    disabled={busy !== null || !walletAddress || !trustlineReady}
                    onClick={() => void onDeposit()}
                  >
                    {busy === 'deposit' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Wallet className="h-4 w-4" aria-hidden />
                    )}
                    {m.depositCta}
                  </Button>
                </div>
              )}
              {depositDone && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {m.depositDone.replace('{tvl}', formatCurrency(monitor.totals.tvlDisplay))}
                </p>
              )}
            </div>
          </li>

          <li className="flex gap-3">
            <StepIcon done={rebalanceDone} />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="font-medium">{m.stepRebalanceTitle}</p>
                <p className="text-sm text-muted-foreground">{m.stepRebalanceDesc}</p>
              </div>
              {!rebalanceDone && (
                <>
                  {!depositDone ? (
                    <p className="text-sm text-muted-foreground">{m.rebalanceAfterDeposit}</p>
                  ) : (
                    <div className="space-y-3">
                      {strategyOptions.length > 1 ? (
                        <div className="space-y-1.5">
                          <Label>{m.strategyLabel}</Label>
                          <Select value={strategyAddress} onValueChange={setStrategyAddress}>
                            <SelectTrigger>
                              <SelectValue placeholder={m.strategyLabel} />
                            </SelectTrigger>
                            <SelectContent>
                              {strategyOptions.map((s) => (
                                <SelectItem key={s.address} value={s.address} disabled={s.paused}>
                                  {s.assetSymbol} · {s.name}
                                  {s.paused ? ` (${m.paused})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : strategyOptions[0] ? (
                        <p className="text-xs text-muted-foreground">
                          {m.strategyTarget.replace('{name}', strategyOptions[0].name)}
                        </p>
                      ) : null}
                      <p className="text-sm">
                        {m.idleToInvest.replace('{amount}', formatCurrency(primaryAsset?.idleDisplay ?? 0))}
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-2"
                        disabled={busy !== null || !walletAddress || idleRaw <= 0}
                        onClick={() => void onRebalance()}
                      >
                        {busy === 'rebalance' ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        )}
                        {m.rebalanceCta}
                      </Button>
                    </div>
                  )}
                </>
              )}
              {rebalanceDone && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{m.rebalanceDone}</p>
              )}
            </div>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}

function StepIcon({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
  ) : (
    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
  )
}
