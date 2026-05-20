import {
  Address,
  BASE_FEE,
  Contract,
  Horizon,
  Networks,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import { isLikelyStellarAccountId, isLikelyStellarContractId } from '@/lib/defindex/stellar-address'

export async function buildSacTrustTransactionXdr(
  sourceAccount: string,
  assetContract: string,
  network: 'testnet' | 'mainnet',
): Promise<string> {
  if (!isLikelyStellarAccountId(sourceAccount)) {
    throw new Error('Invalid Stellar account.')
  }
  if (!isLikelyStellarContractId(assetContract)) {
    throw new Error('Invalid asset contract address.')
  }

  const horizonUrl =
    network === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org'
  const networkPassphrase = network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET

  const server = new Horizon.Server(horizonUrl)
  const account = await server.loadAccount(sourceAccount)

  const contract = new Contract(assetContract)
  const op = contract.call('trust', new Address(sourceAccount).toScVal())

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(op)
    .setTimeout(180)
    .build()

  return tx.toXDR()
}
