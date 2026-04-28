'use client'

import { useMercatoWallet } from '@/hooks/use-mercato-wallet'

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
  const mercatoWallet = useMercatoWallet()

  const handleConnect = async () => {
    try {
      await mercatoWallet.connectExternalWallet()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await mercatoWallet.disconnect()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  return {
    walletInfo: mercatoWallet.walletInfo,
    isConnected: mercatoWallet.isConnected,
    truncatedAddress: mercatoWallet.truncatedAddress,
    provider: mercatoWallet.provider,
    publicKey: mercatoWallet.publicKey,
    walletId: mercatoWallet.walletId,
    status: mercatoWallet.status,
    isEmbedded: mercatoWallet.isEmbedded,
    balances: mercatoWallet.balances,
    txHistory: mercatoWallet.txHistory,
    canSignTransactions: mercatoWallet.canSignTransactions,
    connectExternalWallet: mercatoWallet.connectExternalWallet,
    connectPollarWallet: mercatoWallet.connectPollarWallet,
    handleConnect,
    handleDisconnect,
    disconnectWallet: mercatoWallet.disconnect,
    refreshBalance: mercatoWallet.refreshBalance,
  }
}
