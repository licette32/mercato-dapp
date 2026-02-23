export type RampProviderOption = {
  id: string
  displayName: string
  capabilities: Record<string, unknown> | null
}

export type RampConfig = {
  enabled: boolean
  providers: RampProviderOption[]
}

export type Customer = {
  id: string
  email: string
  kycStatus: string
  bankAccountId?: string
}

export type Quote = {
  id: string
  fromAmount: string
  toAmount: string
  fromCurrency: string
  toCurrency: string
  exchangeRate: string
  fee: string
  expiresAt: string
}

export type OnRampTx = {
  id: string
  status: string
  paymentInstructions?: { type: string; clabe?: string; reference?: string }
  interactiveUrl?: string
}

export type OffRampTx = {
  id: string
  status: string
  signableTransaction?: string
  interactiveUrl?: string
}

export type FiatAccount = {
  id: string
  type: string
  accountNumber: string
  bankName: string
  accountHolderName: string
}

export type OnboardingPrompt = {
  code: string
  message: string
  kycUrl?: string
  tosUrl?: string
}

export type RampAction = 'idle' | 'customer' | 'quote' | 'onramp' | 'offramp'
