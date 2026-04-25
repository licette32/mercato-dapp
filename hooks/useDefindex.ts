'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Horizon } from '@stellar/stellar-sdk'
import { useWalletContext } from '@/providers/wallet-provider'
import { USDC_TRUSTLINE } from '@/lib/trustless/trustlines'

const HORIZON_URL =
  process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org'

const USDC_ISSUER = USDC_TRUSTLINE.address

interface UseDefindexResult {
  walletBalance: number
  vaultBalance: number
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDefindex(): UseDefindexResult {
  const { walletInfo } = useWalletContext()
  const address = walletInfo?.address ?? null

  const [walletBalance, setWalletBalance] = useState(0)
  const [vaultBalance, setVaultBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef(0)

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setWalletBalance(0)
      setVaultBalance(0)
      setError(null)
      return
    }

    const requestId = ++cancelRef.current
    setIsLoading(true)
    setError(null)

    try {
      const wallet = await fetchWalletUsdc(address)
      const vault = await fetchVaultBalance(address)
      if (cancelRef.current !== requestId) return
      setWalletBalance(wallet)
      setVaultBalance(vault)
    } catch (err) {
      if (cancelRef.current !== requestId) return
      const message = err instanceof Error ? err.message : 'Failed to load balances'
      setError(message)
    } finally {
      if (cancelRef.current === requestId) setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    void fetchBalances()
  }, [fetchBalances])

  return {
    walletBalance,
    vaultBalance,
    isLoading,
    error,
    refresh: fetchBalances,
  }
}

async function fetchWalletUsdc(address: string): Promise<number> {
  if (!USDC_ISSUER) return 0
  try {
    const server = new Horizon.Server(HORIZON_URL)
    const account = await server.loadAccount(address)
    const usdc = account.balances.find(
      (b) =>
        b.asset_type !== 'native' &&
        'asset_code' in b &&
        b.asset_code === USDC_TRUSTLINE.symbol &&
        'asset_issuer' in b &&
        b.asset_issuer === USDC_ISSUER,
    )
    if (!usdc) return 0
    return Number.parseFloat(usdc.balance) || 0
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { status?: number } }).response?.status === 404
    ) {
      return 0
    }
    throw err
  }
}

async function fetchVaultBalance(_address: string): Promise<number> {
  // DeFindex vault balance is wired in issue #3. Until the SDK integration ships
  // the dashboard treats vault holdings as zero so the UI stays consistent.
  return 0
}
