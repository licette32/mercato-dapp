'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
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
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUPPORTED_COUNTRIES } from '@/lib/constants'
import { Check, ExternalLink, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useRamp } from './ramp-provider'
import { StepIndicator } from './step-indicator'
import { QuoteCard } from './quote-card'
import { CopyButton } from './copy-button'
import type { OnRampTx, Quote } from './types'

export function OnRampForm() {
  const { state, actions, meta } = useRamp()
  const {
    selectedProvider,
    selectedProviderConfig,
    customer,
    action,
    onCountry,
    fromCurrency,
    toCurrency,
    onboardingPrompt,
  } = state

  const [onAmount, setOnAmount] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [tx, setTx] = useState<OnRampTx | null>(null)

  const step = useMemo(() => {
    if (tx) return 3
    if (quote) return 2
    return 1
  }, [tx, quote])

  const reset = () => {
    setQuote(null)
    setTx(null)
    actions.setOnboardingPrompt(null)
  }

  const handleGetQuote = async () => {
    if (!onAmount || Number(onAmount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    actions.setOnboardingPrompt(null)
    actions.setAction('quote')
    try {
      const c = await actions.ensureCustomer()
      const q = await actions.fetchQuote(fromCurrency, toCurrency, onAmount, c.id)
      setQuote(q)
      toast.success('Quote ready — review and confirm below')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      actions.setAction('idle')
    }
  }

  const handleStartOnRamp = async () => {
    if (!quote || !meta.walletInfo?.address) {
      toast.error('Get a quote first and connect your wallet')
      return
    }
    if (!customer) {
      toast.error('Customer not loaded. Get a quote first.')
      return
    }
    actions.setAction('onramp')
    try {
      const res = await fetch('/api/ramp/on-ramp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          customerId: customer.id,
          quoteId: quote.id,
          stellarAddress: meta.walletInfo.address,
          fromCurrency: quote.fromCurrency,
          toCurrency: quote.toCurrency,
          amount: quote.fromAmount,
          bankAccountId: customer.bankAccountId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (
          (data.code === 'TERMS_NOT_COMPLETED' ||
            data.code === 'MISSING_BANK_ACCOUNT') &&
          data.kycUrl
        ) {
          actions.setOnboardingPrompt({
            code: data.code,
            message:
              data.error || 'Complete onboarding before creating an order.',
            kycUrl: data.kycUrl,
          })
          return
        }
        throw new Error(data.error || 'Failed to start on-ramp')
      }
      setTx(data)
      toast.success('On-ramp started — follow the payment instructions')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start on-ramp')
    } finally {
      actions.setAction('idle')
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Fiat → USDC</CardTitle>
        <CardDescription>
          Send local currency and receive USDC in your Stellar wallet.
        </CardDescription>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <StepIndicator step={1} current={step} label="Enter amount" />
          <Separator orientation="vertical" className="h-5" />
          <StepIndicator step={2} current={step} label="Review quote" />
          <Separator orientation="vertical" className="h-5" />
          <StepIndicator step={3} current={step} label="Pay" />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Onboarding prompt */}
        {onboardingPrompt && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {onboardingPrompt.message}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {onboardingPrompt.kycUrl && (
                <Button asChild size="sm">
                  <a
                    href={onboardingPrompt.kycUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Complete onboarding{' '}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              {onboardingPrompt.tosUrl && !onboardingPrompt.kycUrl && (
                <>
                  <Button asChild size="sm">
                    <a
                      href={onboardingPrompt.tosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Accept Terms of Service{' '}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/ramp/blindpay-setup">
                      Full setup wizard
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Amount entry */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select
                value={onCountry}
                onValueChange={(v) => {
                  actions.setOnCountry(v)
                  reset()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount ({fromCurrency})</Label>
              <Input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 1,000"
                value={onAmount}
                onChange={(e) => {
                  setOnAmount(e.target.value)
                  if (quote) reset()
                }}
              />
            </div>
          </div>
          <Button
            onClick={handleGetQuote}
            disabled={
              action !== 'idle' ||
              !meta.isConnected ||
              !selectedProvider ||
              !onAmount
            }
            className="w-full sm:w-auto"
          >
            {action === 'quote' || action === 'customer' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {quote ? 'Refresh quote' : 'Get quote'}
          </Button>
        </div>

        {/* Step 2: Quote review */}
        {quote && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <QuoteCard quote={quote} />
            <Button
              onClick={handleStartOnRamp}
              disabled={action !== 'idle'}
              className="w-full"
              size="lg"
            >
              {action === 'onramp' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm & get payment instructions
            </Button>
          </div>
        )}

        {/* Step 3: Payment instructions */}
        {tx && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Separator />
            <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Payment instructions ready
                  </p>
                  <p className="text-xs text-green-700/80 dark:text-green-300/60">
                    Complete the payment to receive USDC in your wallet.
                  </p>
                </div>
              </div>

              {tx.interactiveUrl ? (
                <Button asChild className="w-full" variant="outline">
                  <a
                    href={tx.interactiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Complete in{' '}
                    {selectedProviderConfig?.displayName ?? selectedProvider}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : tx.paymentInstructions?.type === 'spei' &&
                tx.paymentInstructions?.clabe ? (
                <div className="space-y-3 rounded-lg bg-white/60 dark:bg-black/20 p-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      CLABE
                    </p>
                    <CopyButton
                      text={tx.paymentInstructions.clabe}
                      label="CLABE"
                    />
                  </div>
                  {tx.paymentInstructions.reference && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Reference
                      </p>
                      <CopyButton
                        text={tx.paymentInstructions.reference}
                        label="Reference"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Send the exact amount via SPEI using the CLABE and reference
                    above. Funds arrive automatically once the transfer is
                    confirmed.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Check your email or complete the flow in the provider&apos;s
                  window.
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="mt-2">
              Start new deposit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
