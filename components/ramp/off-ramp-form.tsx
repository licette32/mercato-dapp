'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, Loader2, Wallet } from 'lucide-react'
import { signTransaction } from '@/lib/trustless/wallet-kit'
import { submitSignedTransaction } from '@/lib/stellar-submit'
import { toast } from 'sonner'
import { useRamp } from './ramp-provider'
import { StepIndicator } from './step-indicator'
import { QuoteCard } from './quote-card'
import { BankAccountSelector } from './bank-account-selector'
import type { FiatAccount, OffRampTx, Quote } from './types'

export function OffRampForm() {
  const { state, actions, meta } = useRamp()
  const {
    selectedProvider,
    selectedProviderConfig,
    customer,
    action,
    fromCurrency,
    toCurrency,
    deferredSigning,
    submitToAnchor,
  } = state

  const [fiatAccounts, setFiatAccounts] = useState<FiatAccount[]>([])
  const [fiatAccountsLoaded, setFiatAccountsLoaded] = useState(false)
  const [offAmount, setOffAmount] = useState('')
  const [offFiatAccountId, setOffFiatAccountId] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [tx, setTx] = useState<OffRampTx | null>(null)
  const [isSigningOffRamp, setIsSigningOffRamp] = useState(false)

  const step = useMemo(() => {
    if (tx) return 4
    if (quote) return 3
    if (offFiatAccountId) return 2
    return 1
  }, [tx, quote, offFiatAccountId])

  const resetQuote = () => {
    setQuote(null)
    setTx(null)
  }

  const loadFiatAccounts = useCallback(async () => {
    if (!selectedProvider) return
    try {
      const c = customer ?? (await actions.ensureCustomer())
      const effectiveId = actions.getFiatCustomerId(c)
      const res = await fetch(
        `/api/ramp/fiat-accounts?provider=${encodeURIComponent(selectedProvider)}&customerId=${encodeURIComponent(effectiveId)}`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load accounts')
      setFiatAccounts(Array.isArray(data) ? data : [])
      setFiatAccountsLoaded(true)
    } catch {
      setFiatAccountsLoaded(true)
    }
  }, [selectedProvider, customer, actions])

  useEffect(() => {
    if (meta.isConnected && selectedProvider && !fiatAccountsLoaded) {
      loadFiatAccounts()
    }
  }, [meta.isConnected, selectedProvider, fiatAccountsLoaded, loadFiatAccounts])

  useEffect(() => {
    setFiatAccountsLoaded(false)
    setFiatAccounts([])
    setOffFiatAccountId('')
    resetQuote()
  }, [selectedProvider])

  // Poll for deferred signable transaction
  useEffect(() => {
    if (!tx?.id || tx.signableTransaction || !selectedProvider || !deferredSigning)
      return
    let cancelled = false
    const interval = setInterval(async () => {
      if (cancelled) return
      try {
        const res = await fetch(
          `/api/ramp/off-ramp/${tx.id}?provider=${encodeURIComponent(selectedProvider)}`,
        )
        const data = await res.json()
        if (res.ok && data.signableTransaction) {
          setTx((prev) =>
            prev ? { ...prev, signableTransaction: data.signableTransaction } : null,
          )
          toast.success('Transaction ready to sign')
        }
      } catch {
        // ignore polling errors
      }
    }, 2500)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [tx?.id, tx?.signableTransaction, selectedProvider, deferredSigning])

  const handleGetQuote = async () => {
    if (!selectedProvider) {
      toast.error('Select a ramp provider first')
      return
    }
    if (!offAmount || Number(offAmount) <= 0 || !offFiatAccountId) {
      toast.error('Enter amount and select a fiat account')
      return
    }
    actions.setAction('quote')
    try {
      const c = await actions.ensureCustomer()
      const quoteCustomerId =
        selectedProvider === 'blindpay' && c.id.includes(':')
          ? `${c.id.split(':')[0]}:${offFiatAccountId}`
          : c.id
      const q = await actions.fetchQuote(toCurrency, fromCurrency, offAmount, quoteCustomerId)
      setQuote(q)
      toast.success('Quote ready — review and confirm below')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to get quote')
    } finally {
      actions.setAction('idle')
    }
  }

  const handleStartOffRamp = async () => {
    if (!quote || !meta.walletInfo?.address || !offFiatAccountId) {
      toast.error('Get a quote, connect wallet, and select a fiat account')
      return
    }
    if (!customer) {
      toast.error('Customer not loaded. Get a quote first.')
      return
    }
    const offRampCustomerId =
      selectedProvider === 'blindpay' && customer.id.includes(':')
        ? `${customer.id.split(':')[0]}:${offFiatAccountId}`
        : customer.id
    actions.setAction('offramp')
    try {
      const res = await fetch('/api/ramp/off-ramp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          customerId: offRampCustomerId,
          quoteId: quote.id,
          stellarAddress: meta.walletInfo.address,
          fromCurrency: quote.fromCurrency,
          toCurrency: quote.toCurrency,
          amount: quote.fromAmount,
          fiatAccountId: offFiatAccountId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start off-ramp')
      setTx(data)
      toast.success('Off-ramp started — sign the transaction to complete')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start off-ramp')
    } finally {
      actions.setAction('idle')
    }
  }

  const handleSignAndSubmit = async () => {
    if (!tx?.signableTransaction || !meta.walletInfo?.address) {
      toast.error('Connect wallet and wait for the transaction to be ready')
      return
    }
    const payoutQuoteId = quote?.id ?? tx.id
    if (submitToAnchor && !payoutQuoteId) {
      toast.error('Quote not found. Please start a new cash out.')
      return
    }
    setIsSigningOffRamp(true)
    try {
      const signedXdr = await signTransaction({
        unsignedTransaction: tx.signableTransaction,
        address: meta.walletInfo.address,
      })
      if (submitToAnchor) {
        const res = await fetch('/api/ramp/blindpay/submit-payout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId: payoutQuoteId,
            signedTransaction: signedXdr,
            senderWalletAddress: meta.walletInfo.address,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to submit payout')
        setTx((prev) => (prev ? { ...prev, status: data.status ?? 'processing' } : null))
        toast.success('Payout submitted — fiat will be sent to your bank account')
      } else {
        await submitSignedTransaction(signedXdr)
        setTx((prev) => (prev ? { ...prev, status: 'processing' } : null))
        toast.success('Transaction submitted — fiat will be sent to your bank account')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to sign or submit')
    } finally {
      setIsSigningOffRamp(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">USDC → Fiat</CardTitle>
        <CardDescription>
          Send USDC from your wallet and receive local currency in your bank account.
        </CardDescription>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t flex-wrap">
          <StepIndicator step={1} current={step} label="Bank account" />
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <StepIndicator step={2} current={step} label="Amount" />
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <StepIndicator step={3} current={step} label="Quote" />
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <StepIndicator step={4} current={step} label="Sign & send" />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <BankAccountSelector
          fiatAccounts={fiatAccounts}
          fiatAccountsLoaded={fiatAccountsLoaded}
          selectedId={offFiatAccountId}
          onSelect={(v) => {
            setOffFiatAccountId(v)
            if (quote) resetQuote()
          }}
          onRefresh={loadFiatAccounts}
        />

        <Separator />

        {/* Amount */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Amount (USDC)</Label>
            <Input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 100"
              value={offAmount}
              onChange={(e) => {
                setOffAmount(e.target.value)
                if (quote) resetQuote()
              }}
            />
          </div>
          <Button
            onClick={handleGetQuote}
            disabled={action !== 'idle' || !meta.isConnected || !offFiatAccountId || !offAmount}
            className="w-full sm:w-auto"
          >
            {action === 'quote' || action === 'customer' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {quote ? 'Refresh quote' : 'Get quote'}
          </Button>
        </div>

        {/* Quote */}
        {quote && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <QuoteCard quote={quote} />
            <Button
              onClick={handleStartOffRamp}
              disabled={action !== 'idle'}
              className="w-full"
              size="lg"
            >
              {action === 'offramp' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm cash out
            </Button>
          </div>
        )}

        {/* Sign & complete */}
        {tx && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Separator />
            <div className="rounded-xl border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Transaction status</p>
                <Badge
                  variant={
                    tx.status === 'processing' || tx.status === 'completed'
                      ? 'default'
                      : tx.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {tx.status}
                </Badge>
              </div>

              {tx.interactiveUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={tx.interactiveUrl} target="_blank" rel="noopener noreferrer">
                    View on {selectedProviderConfig?.displayName ?? selectedProvider}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}

              {tx.signableTransaction ? (
                <Button
                  onClick={handleSignAndSubmit}
                  disabled={isSigningOffRamp}
                  className="w-full"
                  size="lg"
                >
                  {isSigningOffRamp ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="mr-2 h-4 w-4" />
                  )}
                  Sign & complete payout
                </Button>
              ) : deferredSigning && tx.status !== 'processing' && tx.status !== 'completed' ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Waiting for transaction to be prepared by the provider…
                </div>
              ) : null}

              {(tx.status === 'processing' || tx.status === 'completed') && (
                <p className="text-sm text-muted-foreground">
                  {tx.status === 'completed'
                    ? 'Fiat has been sent to your bank account.'
                    : 'Your cash out is being processed. Fiat will arrive in your bank account shortly.'}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={resetQuote} className="mt-2">
              Start new cash out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
