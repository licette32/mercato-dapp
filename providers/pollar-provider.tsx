'use client'

import {
  createContext,
  useEffect,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import {
  PollarProvider as SDKPollarProvider,
  usePollar,
} from '@pollar/react'
import type {
  PollarApplicationConfigContent,
  PollarLoginOptions,
  PollarClient,
  TxHistoryState,
  WalletBalanceState,
  WalletType,
  AuthState,
} from '@pollar/core'

type PollarSessionValue = {
  session: PollarApplicationConfigContent | null
  isLoading: boolean
  isAuthenticated: boolean
  walletAddress: string
  walletType: WalletType | null
  txHistory: TxHistoryState
  walletBalance: WalletBalanceState
  login: (options: PollarLoginOptions) => void
  logout: () => void
  openLoginModal: () => void
  refreshWalletBalance: () => Promise<void>
  getClient: () => PollarClient
}

const emptyContext: PollarSessionValue = {
  session: null,
  isLoading: false,
  isAuthenticated: false,
  walletAddress: '',
  walletType: null,
  txHistory: { step: 'idle' },
  walletBalance: { step: 'idle' },
  login: () => undefined,
  logout: () => undefined,
  openLoginModal: () => undefined,
  refreshWalletBalance: async () => undefined,
  getClient: () => {
    throw new Error('Pollar provider is not configured')
  },
}

const PollarSessionContext = createContext<PollarSessionValue>(emptyContext)

function PollarSessionBridge({ children }: { children: ReactNode }) {
  const {
    login,
    logout,
    openLoginModal,
    walletAddress,
    walletType,
    txHistory,
    walletBalance,
    refreshWalletBalance,
    getClient,
  } = usePollar()
  const [authState, setAuthState] = useState<AuthState>(() => getClient().getAuthState())

  useEffect(() => {
    const client = getClient()
    setAuthState(client.getAuthState())
    return client.onAuthStateChange((state) => setAuthState(state))
  }, [getClient])

  const session = authState.step === 'authenticated' ? authState.session : null
  const isAuthenticated = authState.step === 'authenticated'
  const isLoading =
    authState.step !== 'idle' &&
    authState.step !== 'authenticated' &&
    authState.step !== 'error'

  const value = useMemo<PollarSessionValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated,
      walletAddress,
      walletType,
      txHistory,
      walletBalance,
      login,
      logout,
      openLoginModal,
      refreshWalletBalance,
      getClient,
    }),
    [
      session,
      isLoading,
      isAuthenticated,
      walletAddress,
      walletType,
      txHistory,
      walletBalance,
      login,
      logout,
      openLoginModal,
      refreshWalletBalance,
      getClient,
    ],
  )

  return <PollarSessionContext.Provider value={value}>{children}</PollarSessionContext.Provider>
}

export function PollarProvider({
  children,
}: {
  children: ReactNode
}) {
  const apiKey = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY
  const network =
    process.env.NEXT_PUBLIC_POLLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'

  if (!apiKey) {
    return <PollarSessionContext.Provider value={emptyContext}>{children}</PollarSessionContext.Provider>
  }

  return (
    <SDKPollarProvider
      config={{
        apiKey,
        stellarNetwork: network,
      }}
    >
      <PollarSessionBridge>{children}</PollarSessionBridge>
    </SDKPollarProvider>
  )
}

export function usePollarSession(): PollarSessionValue {
  return useContext(PollarSessionContext)
}
