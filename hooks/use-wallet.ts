'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWalletContext } from '@/providers/wallet-provider'
import { stellarWalletKit } from '@/lib/trustless/wallet-kit'
import { normalizeUSDC } from '@/lib/format'
import { USDC_TRUSTLINE } from '@/lib/trustless/trustlines'
import {
  Account,
  Address,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk'
import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit'

const isTestnet = process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK !== 'mainnet'
const SOROBAN_RPC_URL = isTestnet
  ? 'https://soroban-testnet.stellar.org'
  : 'https://mainnet.sorobanrpc.com'
const NETWORK_PASSPHRASE = isTestnet ? Networks.TESTNET : Networks.PUBLIC

const getUSDCWalletBalance = async (address: string): Promise<number> => {
  if (!USDC_TRUSTLINE.address) return 0

  const server = new rpc.Server(SOROBAN_RPC_URL)
  const source = new Account(address, '0')
  const contract = new Contract(USDC_TRUSTLINE.address)

  const tx = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('balance', Address.fromString(address).toScVal()))
    .setTimeout(60)
    .build()

  const simulation = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(simulation) || !simulation.result?.retval) return 0

  const rawBalance = scValToNative(simulation.result.retval)
  const normalizedRaw =
    typeof rawBalance === 'bigint'
      ? Number(rawBalance)
      : typeof rawBalance === 'number'
        ? rawBalance
        : 0

  return normalizeUSDC(normalizedRaw / USDC_TRUSTLINE.decimals)
}

export const useWallet = () => {
  const { setWalletInfo, clearWalletInfo, walletInfo, isConnected } =
    useWalletContext()
  const [balance, setBalance] = useState(0)

  const connectWallet = async () => {
    if (!stellarWalletKit) return
    await stellarWalletKit.openModal({
      modalTitle: 'Connect Your Stellar Wallet',
      onWalletSelected: async (option: ISupportedWallet) => {
        stellarWalletKit.setWallet(option.id)
        const { address } = await stellarWalletKit.getAddress()
        setWalletInfo(address, option.name)
      },
    })
  }

  const disconnectWallet = async () => {
    if (stellarWalletKit) await stellarWalletKit.disconnect()
    clearWalletInfo()
  }

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  const truncatedAddress = walletInfo?.address
    ? `${walletInfo.address.slice(0, 4)}…${walletInfo.address.slice(-4)}`
    : null

  const refreshBalance = useCallback(async () => {
    if (!walletInfo?.address) {
      setBalance(0)
      return 0
    }

    try {
      const nextBalance = await getUSDCWalletBalance(walletInfo.address)
      setBalance(nextBalance)
      return nextBalance
    } catch (error) {
      console.error('Error loading wallet USDC balance:', error)
      setBalance(0)
      return 0
    }
  }, [walletInfo?.address])

  useEffect(() => {
    void refreshBalance()
  }, [refreshBalance])

  return {
    walletInfo,
    isConnected,
    balance,
    refreshBalance,
    truncatedAddress,
    handleConnect,
    handleDisconnect,
  }
}
