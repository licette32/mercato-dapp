'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { useWallet } from '@/hooks/use-wallet'
import { SUPPORTED_COUNTRIES, DEFAULT_COUNTRY } from '@/lib/constants'
import { toast } from 'sonner'
import type {
  RampConfig,
  RampProviderOption,
  Customer,
  Quote,
  RampAction,
  OnboardingPrompt,
} from './types'

interface RampState {
  config: RampConfig | null
  loading: boolean
  selectedProvider: string | null
  selectedProviderConfig: RampProviderOption | null
  customer: Customer | null
  action: RampAction
  onCountry: string
  fromCurrency: string
  toCurrency: string
  onboardingPrompt: OnboardingPrompt | null
  deferredSigning: boolean
  submitToAnchor: boolean
}

interface RampActions {
  selectProvider: (id: string) => void
  setOnCountry: (code: string) => void
  setAction: (a: RampAction) => void
  setOnboardingPrompt: (p: OnboardingPrompt | null) => void
  ensureCustomer: () => Promise<Customer>
  fetchQuote: (
    from: string,
    to: string,
    amount: string,
    customerId?: string,
  ) => Promise<Quote>
  getFiatCustomerId: (c: Customer) => string
}

interface RampMeta {
  isConnected: boolean
  walletInfo: { address: string } | null
  handleConnect: () => void
  handlePollarConnect: () => void
}

interface RampContextValue {
  state: RampState
  actions: RampActions
  meta: RampMeta
}

const RampContext = createContext<RampContextValue | null>(null)

export function useRamp(): RampContextValue {
  const ctx = useContext(RampContext)
  if (!ctx) throw new Error('useRamp must be used within <RampProvider>')
  return ctx
}

export function RampProvider({ children }: { children: React.ReactNode }) {
  const { walletInfo, isConnected, handleConnect, connectPollarWallet } = useWallet()
  const [config, setConfig] = useState<RampConfig | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [customerByProvider, setCustomerByProvider] = useState<
    Record<string, Customer>
  >({})
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<RampAction>('idle')
  const [onCountry, setOnCountry] = useState(DEFAULT_COUNTRY)
  const [onboardingPrompt, setOnboardingPrompt] =
    useState<OnboardingPrompt | null>(null)

  const searchParams = useSearchParams()

  const fromCurrency =
    SUPPORTED_COUNTRIES.find((c) => c.code === onCountry)?.currency ?? 'MXN'
  const toCurrency = 'USDC'

  const selectedProviderConfig = useMemo(
    () => config?.providers?.find((p) => p.id === selectedProvider) ?? null,
    [config, selectedProvider],
  )

  const providerCapabilities = selectedProviderConfig?.capabilities as
    | Record<string, boolean>
    | undefined
  const deferredSigning =
    providerCapabilities?.deferredOffRampSigning === true
  const submitToAnchor =
    providerCapabilities?.requiresAnchorPayoutSubmission === true

  const customer = selectedProvider
    ? (customerByProvider[selectedProvider] ?? null)
    : null

  // Load config on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/ramp/config')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load config')
        if (!cancelled) {
          setConfig(data)
          if (data.enabled && data.providers?.length > 0)
            setSelectedProvider((prev) => prev || data.providers[0].id)
        }
      } catch {
        if (!cancelled) setConfig({ enabled: false, providers: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Restore BlindPay customer after setup redirect
  useEffect(() => {
    const composite = searchParams.get('blindpay_setup')
    const email = searchParams.get('blindpay_email')
    if (composite && selectedProvider === 'blindpay') {
      setCustomerByProvider((prev) => ({
        ...prev,
        blindpay: {
          id: composite,
          email: email || '',
          kycStatus: 'approved',
        },
      }))
      window.history.replaceState({}, '', '/dashboard/ramp')
    }
  }, [searchParams, selectedProvider])

  const selectProvider = useCallback((id: string) => {
    setSelectedProvider(id)
    setOnboardingPrompt(null)
  }, [])

  const ensureCustomer = useCallback(async () => {
    if (!selectedProvider) {
      toast.error('Select a ramp provider first')
      throw new Error('No provider selected')
    }
    if (customer) return customer
    setAction('customer')
    try {
      const res = await fetch('/api/ramp/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          country: onCountry,
          publicKey: walletInfo?.address,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create customer')
      setCustomerByProvider((prev) => ({
        ...prev,
        [selectedProvider]: data as Customer,
      }))
      return data as Customer
    } finally {
      setAction('idle')
    }
  }, [selectedProvider, customer, onCountry, walletInfo?.address])

  const fetchQuote = useCallback(
    async (from: string, to: string, amount: string, customerId?: string) => {
      if (!selectedProvider) throw new Error('Select a ramp provider first')
      const params = new URLSearchParams({
        provider: selectedProvider,
        fromCurrency: from,
        toCurrency: to,
        fromAmount: amount,
        ...(customerId && { customerId }),
        ...(walletInfo?.address && { stellarAddress: walletInfo.address }),
      })
      const res = await fetch(`/api/ramp/quote?${params}`)
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'BLINDPAY_SETUP_REQUIRED') {
          setOnboardingPrompt({
            code: data.code,
            message: data.error || 'BlindPay requires onboarding first.',
            tosUrl: data.tosUrl,
          })
        }
        throw new Error(data.error || 'Failed to get quote')
      }
      return data as Quote
    },
    [selectedProvider, walletInfo?.address],
  )

  const getFiatCustomerId = useCallback(
    (c: Customer) =>
      selectedProvider === 'blindpay' && c.id.includes(':')
        ? (c.id.split(':')[0] ?? c.id)
        : c.id,
    [selectedProvider],
  )

  const value = useMemo<RampContextValue>(
    () => ({
      state: {
        config,
        loading,
        selectedProvider,
        selectedProviderConfig,
        customer,
        action,
        onCountry,
        fromCurrency,
        toCurrency,
        onboardingPrompt,
        deferredSigning,
        submitToAnchor,
      },
      actions: {
        selectProvider,
        setOnCountry,
        setAction,
        setOnboardingPrompt,
        ensureCustomer,
        fetchQuote,
        getFiatCustomerId,
      },
      meta: {
        isConnected,
        walletInfo: walletInfo ? { address: walletInfo.address } : null,
        handleConnect,
        handlePollarConnect: connectPollarWallet,
      },
    }),
    [
      config,
      loading,
      selectedProvider,
      selectedProviderConfig,
      customer,
      action,
      onCountry,
      fromCurrency,
      toCurrency,
      onboardingPrompt,
      deferredSigning,
      submitToAnchor,
      selectProvider,
      ensureCustomer,
      fetchQuote,
      getFiatCustomerId,
      isConnected,
      walletInfo,
      handleConnect,
      connectPollarWallet,
    ],
  )

  return <RampContext value={value}>{children}</RampContext>
}
