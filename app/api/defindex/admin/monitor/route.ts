import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ramp-api'
import { defindexErrorMessage } from '@/lib/defindex/api-error'
import {
  getDefindexSupportedNetwork,
  getMercatoVaultContractId,
  isDefindexApiConfigured,
} from '@/lib/defindex/config'
import { getServerDefindexSdk } from '@/lib/defindex/server-sdk'
import {
  buildVaultMonitorPayload,
  resolveMonitorVaultAddress,
} from '@/lib/defindex/vault-monitor'

export const dynamic = 'force-dynamic'

/** GET /api/defindex/admin/monitor — full vault health snapshot for admins. */
export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  if (!isDefindexApiConfigured()) {
    return NextResponse.json(
      { error: 'DeFindex API is not configured (set DEFINDEX_API_KEY).' },
      { status: 503 },
    )
  }

  const { searchParams } = new URL(request.url)
  const configuredVault = getMercatoVaultContractId()
  const resolved = resolveMonitorVaultAddress(configuredVault, searchParams.get('vault'))

  if (!resolved.vaultAddress) {
    return NextResponse.json({ error: resolved.error ?? 'Vault address required.' }, { status: 400 })
  }

  const network = getDefindexSupportedNetwork()

  try {
    const sdk = getServerDefindexSdk()

    let apiHealthy = false
    try {
      await sdk.healthCheck()
      apiHealthy = true
    } catch {
      apiHealthy = false
    }

    const [info, apyRes] = await Promise.all([
      sdk.getVaultInfo(resolved.vaultAddress, network),
      sdk.getVaultAPY(resolved.vaultAddress, network),
    ])

    const payload = buildVaultMonitorPayload(
      resolved.vaultAddress,
      configuredVault,
      apiHealthy,
      info,
      apyRes.apy,
    )

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json({ error: defindexErrorMessage(error) }, { status: 502 })
  }
}
