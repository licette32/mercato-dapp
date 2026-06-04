'use client'

import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VaultToDealAllocator } from '@/components/vault-to-deal-allocator'
import { computeInvestorReturns } from '@/lib/deals/investor-metrics'
import { formatCurrency } from '@/lib/format'
import type { Deal } from '@/lib/types'
import { useI18n } from '@/lib/i18n/provider'

type DealFundDialogProps = {
  deal: Deal
  open: boolean
  onOpenChange: (open: boolean) => void
  isFunding: boolean
  isConnected: boolean
  walletAddress?: string
  onConnect: () => void
  onConfirmFund: () => void
  trigger?: React.ReactNode
  triggerSize?: 'default' | 'lg'
}

export function DealFundDialog({
  deal,
  open,
  onOpenChange,
  isFunding,
  isConnected,
  walletAddress,
  onConnect,
  onConfirmFund,
  trigger,
  triggerSize = 'lg',
}: DealFundDialogProps) {
  const { t } = useI18n()
  const apr = deal.yieldAPR ?? 0
  const { profit } = computeInvestorReturns(deal.priceUSDC, apr, deal.term)

  const defaultTrigger = (
    <Button size={triggerSize} className="gap-2 shadow-sm">
      <Wallet className="h-5 w-5" aria-hidden />
      {t('deals.fundThisDeal')} · {formatCurrency(deal.priceUSDC)}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dealDetail.fundDialogTitle')}</DialogTitle>
          <DialogDescription>{t('dealDetail.fundDialogDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('dealDetail.dealAmount')}</Label>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-2xl font-bold tabular-nums">{formatCurrency(deal.priceUSDC)}</p>
              <p className="text-sm text-muted-foreground">{t('dealDetail.usdcOnStellar')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('dealDetail.expectedReturn')}</Label>
            <div className="rounded-lg border border-success/40 bg-success/5 p-3">
              <p className="text-2xl font-bold text-success tabular-nums">{apr.toFixed(1)}% APR</p>
              <p className="text-sm text-muted-foreground">
                {t('dealDetail.profitInDays', {
                  profit: formatCurrency(Math.round(profit)),
                  days: deal.term,
                })}
              </p>
            </div>
          </div>

          {isConnected && (
            <VaultToDealAllocator
              dealAmount={deal.priceUSDC}
              isFundingOpen
              disabled={isFunding}
              className="border-emerald-200/60 dark:border-emerald-800/40"
            />
          )}

          {!isConnected ? (
            <Button type="button" onClick={onConnect} className="w-full">
              <Wallet className="mr-2 h-4 w-4" aria-hidden />
              {t('dealDetail.connectStellarWallet')}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t('dealDetail.fundingFrom')}</Label>
                <Input value={walletAddress ?? ''} disabled className="font-mono text-xs" />
              </div>
              <Button type="button" onClick={onConfirmFund} className="w-full" disabled={isFunding}>
                {isFunding ? t('dealDetail.funding') : t('dealDetail.confirmFundDeal')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
