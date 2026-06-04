import { Address, scValToNative, xdr } from '@stellar/stellar-sdk'
import { getDefindexAssetDecimals } from '@/lib/defindex/config'
import { rawToDisplayAmount } from '@/lib/defindex/amounts'
import { getAppStellarNetwork, getStellarNetworkConfig } from '@/lib/stellar/network-config'

export type VaultActivityKind = 'deposit' | 'withdraw'

export type VaultActivityEntry = {
  id: string
  kind: VaultActivityKind
  amountRaw: number
  amountDisplay: number
  createdAt: string
  transactionHash: string
  explorerUrl: string
}

type HorizonOperation = {
  id?: string
  type?: string
  transaction_successful?: boolean
  transaction_hash?: string
  created_at?: string
  function?: string
  parameters?: Array<{ value?: string; type?: string }>
}

type HorizonPage<T> = {
  _embedded?: { records?: T[] }
  _links?: { next?: { href?: string } }
}

const VAULT_FN_ALIASES: Record<string, VaultActivityKind> = {
  deposit: 'deposit',
  withdraw: 'withdraw',
  withdraw_shares: 'withdraw',
  redeem: 'withdraw',
}

function explorerTxUrl(hash: string, network = getAppStellarNetwork()): string {
  const net = network === 'mainnet' ? 'public' : 'testnet'
  return `https://stellar.expert/explorer/${net}/tx/${hash}`
}

function decodeHorizonScVal(base64: string): unknown {
  try {
    const scVal = xdr.ScVal.fromXDR(base64, 'base64')
    return scValToNative(scVal)
  } catch {
    return null
  }
}

function contractIdFromParam(base64: string): string | null {
  const native = decodeHorizonScVal(base64)
  if (typeof native === 'string' && native.startsWith('C')) return native
  if (native && typeof native === 'object' && 'address' in native) {
    const addr = (native as { address?: string }).address
    if (typeof addr === 'string' && addr.startsWith('C')) return addr
  }
  try {
    const scVal = xdr.ScVal.fromXDR(base64, 'base64')
    if (scVal.switch().name === 'scvAddress') {
      return Address.fromScAddress(scVal.address()).toString()
    }
  } catch {
    /* ignore */
  }
  return null
}

function symbolFromParam(base64: string): string | null {
  const native = decodeHorizonScVal(base64)
  if (typeof native === 'string') return native
  return null
}

function collectRawAmounts(value: unknown, out: number[]): void {
  if (typeof value === 'bigint') {
    const n = Number(value)
    if (Number.isFinite(n) && n > 0) out.push(n)
    return
  }
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    out.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectRawAmounts(item, out)
    return
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectRawAmounts(v, out)
    }
  }
}

function primaryRawAmount(params: HorizonOperation['parameters'], startIndex: number): number {
  const amounts: number[] = []
  for (let i = startIndex; i < (params?.length ?? 0); i++) {
    const param = params?.[i]
    if (!param?.value) continue
    collectRawAmounts(decodeHorizonScVal(param.value), amounts)
  }
  return amounts[0] ?? 0
}

function parseVaultOperation(
  op: HorizonOperation,
  vaultContractId: string,
  network = getAppStellarNetwork(),
): VaultActivityEntry | null {
  if (op.type !== 'invoke_host_function' || !op.transaction_successful) return null
  if (!op.transaction_hash || !op.created_at) return null

  const params = op.parameters ?? []
  if (params.length < 2) return null

  const contractId = params[0]?.value ? contractIdFromParam(params[0].value) : null
  if (!contractId || contractId !== vaultContractId) return null

  const fnName = params[1]?.value ? symbolFromParam(params[1].value)?.toLowerCase() : null
  if (!fnName) return null

  const kind = VAULT_FN_ALIASES[fnName]
  if (!kind) return null

  const amountRaw = primaryRawAmount(params, 2)
  if (amountRaw <= 0) return null

  const decimals = getDefindexAssetDecimals()

  return {
    id: op.id ?? op.transaction_hash,
    kind,
    amountRaw,
    amountDisplay: rawToDisplayAmount(amountRaw, decimals),
    createdAt: op.created_at,
    transactionHash: op.transaction_hash,
    explorerUrl: explorerTxUrl(op.transaction_hash, network),
  }
}

async function fetchHorizonPage<T>(url: string): Promise<HorizonPage<T>> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  // Account not yet on this network's ledger — no operations to list.
  if (response.status === 404) {
    return { _embedded: { records: [] } }
  }
  if (!response.ok) {
    throw new Error(`Horizon request failed (${response.status})`)
  }
  return (await response.json()) as HorizonPage<T>
}

/** Load recent deposit/withdraw activity for an account against a specific vault contract. */
export async function fetchVaultActivityForAccount(input: {
  accountId: string
  vaultContractId: string
  limit?: number
  network?: ReturnType<typeof getAppStellarNetwork>
}): Promise<VaultActivityEntry[]> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200)
  const network = input.network ?? getAppStellarNetwork()
  const { horizonUrl } = getStellarNetworkConfig(network)

  const entries: VaultActivityEntry[] = []
  let nextUrl: string | null =
    `${horizonUrl}/accounts/${encodeURIComponent(input.accountId)}/operations?order=desc&limit=200`

  while (nextUrl && entries.length < limit) {
    const page: HorizonPage<HorizonOperation> = await fetchHorizonPage<HorizonOperation>(nextUrl)
    const records = page._embedded?.records ?? []

    for (const op of records) {
      const parsed = parseVaultOperation(op, input.vaultContractId, network)
      if (parsed) entries.push(parsed)
      if (entries.length >= limit) break
    }

    nextUrl = entries.length >= limit ? null : (page._links?.next?.href ?? null)
    if (records.length === 0) break
  }

  return entries.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function summarizeVaultActivity(entries: VaultActivityEntry[]): {
  depositCount: number
  withdrawCount: number
  totalDepositedDisplay: number
  totalWithdrawnDisplay: number
} {
  let depositCount = 0
  let withdrawCount = 0
  let totalDepositedDisplay = 0
  let totalWithdrawnDisplay = 0

  for (const entry of entries) {
    if (entry.kind === 'deposit') {
      depositCount += 1
      totalDepositedDisplay += entry.amountDisplay
    } else {
      withdrawCount += 1
      totalWithdrawnDisplay += entry.amountDisplay
    }
  }

  return {
    depositCount,
    withdrawCount,
    totalDepositedDisplay,
    totalWithdrawnDisplay,
  }
}
