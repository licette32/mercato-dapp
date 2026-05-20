/** Minimum raw units (stroops) to initialize a new DeFindex vault. */
export const VAULT_MIN_INIT_DEPOSIT_RAW = 1001

export function rawToDisplayAmount(raw: string | number, decimals = 7): number {
  const n = typeof raw === 'string' ? Number(raw) : raw
  if (!Number.isFinite(n)) return 0
  return n / 10 ** decimals
}

export function displayToRawAmount(display: number, decimals = 7): number {
  if (!Number.isFinite(display) || display <= 0) return 0
  return Math.round(display * 10 ** decimals)
}

export function minInitDepositDisplay(decimals = 7): number {
  return rawToDisplayAmount(VAULT_MIN_INIT_DEPOSIT_RAW, decimals)
}
