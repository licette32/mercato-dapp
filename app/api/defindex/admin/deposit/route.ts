import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ramp-api'
import { defindexErrorMessage } from '@/lib/defindex/api-error'
import {
  getDefindexSupportedNetwork,
  getMercatoVaultContractId,
  isDefindexApiConfigured,
} from '@/lib/defindex/config'
import { getServerDefindexSdk } from '@/lib/defindex/server-sdk'
import { resolveMonitorVaultAddress } from '@/lib/defindex/vault-monitor'
import { isLikelyStellarAccountId } from '@/lib/defindex/stellar-address'
import { VAULT_MIN_INIT_DEPOSIT_RAW } from '@/lib/defindex/vault-activation'

export const dynamic = 'force-dynamic'

type DepositBody = {
  vault?: unknown
  caller?: unknown
  amounts?: unknown
  invest?: unknown
  slippageBps?: unknown
}

function parseAmounts(value: unknown): number[] | Response {
  if (!Array.isArray(value) || value.length === 0) {
    return NextResponse.json({ error: '`amounts` must be a non-empty number array.' }, { status: 400 })
  }
  const amounts: number[] = []
  for (const item of value) {
    if (typeof item !== 'number' || !Number.isFinite(item) || item <= 0) {
      return NextResponse.json({ error: 'Each `amounts` entry must be a positive finite number.' }, { status: 400 })
    }
    amounts.push(Math.floor(item))
  }
  return amounts
}

/** POST /api/defindex/admin/deposit — admin builds unsigned deposit XDR (optional vault override). */
export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  if (!isDefindexApiConfigured()) {
    return NextResponse.json(
      { error: 'DeFindex API is not configured (set DEFINDEX_API_KEY).' },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => null)) as DepositBody | null
  const vaultOverride = typeof body?.vault === 'string' ? body.vault : null
  const configuredVault = getMercatoVaultContractId()
  const resolved = resolveMonitorVaultAddress(configuredVault, vaultOverride)

  if (!resolved.vaultAddress) {
    return NextResponse.json({ error: resolved.error ?? 'Vault address required.' }, { status: 400 })
  }

  const caller = typeof body?.caller === 'string' ? body.caller.trim() : ''
  if (!caller || !isLikelyStellarAccountId(caller)) {
    return NextResponse.json({ error: 'Valid `caller` (Stellar account) is required.' }, { status: 400 })
  }

  const amountsResult = parseAmounts(body?.amounts)
  if (amountsResult instanceof Response) return amountsResult
  const amounts = amountsResult

  const totalRaw = amounts.reduce((s, a) => s + a, 0)
  if (totalRaw < VAULT_MIN_INIT_DEPOSIT_RAW) {
    return NextResponse.json(
      {
        error: `Total deposit must be at least ${VAULT_MIN_INIT_DEPOSIT_RAW} stroops (DeFindex vault initialization minimum).`,
      },
      { status: 400 },
    )
  }

  const invest = typeof body?.invest === 'boolean' ? body.invest : false
  const slippageBps =
    typeof body?.slippageBps === 'number' && Number.isFinite(body.slippageBps) ? body.slippageBps : 100

  const network = getDefindexSupportedNetwork()

  try {
    const sdk = getServerDefindexSdk()
    const tx = await sdk.depositToVault(
      resolved.vaultAddress,
      { caller, amounts, invest, slippageBps },
      network,
    )

    if (!tx.xdr) {
      return NextResponse.json(
        { error: 'DeFindex did not return transaction XDR for this deposit.' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      xdr: tx.xdr,
      functionName: tx.functionName,
      simulationResponse: tx.simulationResponse,
      vaultAddress: resolved.vaultAddress,
      network,
    })
  } catch (error) {
    return NextResponse.json({ error: defindexErrorMessage(error) }, { status: 502 })
  }
}
