'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { stellarWalletKit } from '@/lib/trustless/wallet-kit'

const WALLET_STORAGE_KEY = 'mercato_wallet'

interface WalletInfo {
  address: string
  walletName: string
}

interface WalletContextValue {
  walletInfo: WalletInfo | null
  isConnected: boolean
  setWalletInfo: (address: string, walletName: string) => void
  clearWalletInfo: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

export const useWalletContext = (): WalletContextValue => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}

function loadStoredWallet(): WalletInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { address?: string; walletName?: string }
    if (parsed?.address && typeof parsed.address === 'string') {
      return {
        address: parsed.address,
        walletName: parsed.walletName ?? 'Freighter',
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

interface WalletProviderProps {
  children: ReactNode
}

function saveStoredWallet(info: WalletInfo | null) {
  if (typeof window === 'undefined') return
  try {
    if (info) {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(WALLET_STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [walletInfo, setWalletInfoState] = useState<WalletInfo | null>(null)
  const [hasRestored, setHasRestored] = useState(false)

  const setWalletInfo = useCallback((address: string, walletName: string) => {
    const info = { address, walletName }
    setWalletInfoState(info)
    saveStoredWallet(info)
  }, [])

  const clearWalletInfo = useCallback(() => {
    setWalletInfoState(null)
    saveStoredWallet(null)
  }, [])

  useEffect(() => {
    if (hasRestored || !stellarWalletKit) return
    setHasRestored(true)
    const stored = loadStoredWallet()
    const tryRestore = async () => {
      try {
        const { address } = await stellarWalletKit.getAddress({
          skipRequestAccess: true,
        })
        if (address) {
          const walletName = stored?.walletName ?? 'Freighter'
          setWalletInfoState({ address, walletName })
          if (!stored) saveStoredWallet({ address, walletName })
        }
      } catch {
        if (stored) {
          setWalletInfoState(null)
          saveStoredWallet(null)
        }
      }
    }
    void tryRestore()
  }, [hasRestored])

  const isConnected = walletInfo !== null

  return (
    <WalletContext.Provider
      value={{ walletInfo, isConnected, setWalletInfo, clearWalletInfo }}
    >
      {children}
    </WalletContext.Provider>
  )
}

