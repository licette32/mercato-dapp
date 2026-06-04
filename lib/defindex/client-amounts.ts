/**
 * Client-safe helpers (uses `NEXT_PUBLIC_DEFINDEX_ASSET_DECIMALS`, default 7).
 */

export function getPublicDefindexAssetDecimals(): number {
  const raw = process.env.NEXT_PUBLIC_DEFINDEX_ASSET_DECIMALS ?? '7'
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 7
}

/** Convert a human display amount (e.g. USDC) to on-chain raw units. */
export function displayToRawTokenAmount(
  displayAmount: number,
  decimals = getPublicDefindexAssetDecimals()
): number {
  if (!Number.isFinite(displayAmount) || displayAmount <= 0) return 0
  return Math.round(displayAmount * 10 ** decimals)
}

/** Convert on-chain raw units to a human display amount. */
export function rawToDisplayTokenAmount(
  rawAmount: string | number,
  decimals = getPublicDefindexAssetDecimals()
): number {
  const n = typeof rawAmount === 'string' ? Number(rawAmount) : rawAmount
  if (!Number.isFinite(n)) return 0
  return n / 10 ** decimals
}
