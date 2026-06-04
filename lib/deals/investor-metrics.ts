/** Investor-facing return math for deal detail and funding UI. */
export function computeInvestorReturns(
  principal: number,
  aprPercent: number,
  termDays: number,
): { profit: number; total: number } {
  if (principal <= 0 || termDays <= 0 || aprPercent <= 0) {
    return { profit: 0, total: principal }
  }
  const profit = principal * (aprPercent / 100) * (termDays / 365)
  return { profit, total: principal + profit }
}

export function fundingUrgencyPercent(
  fundingExpiresAt: string | undefined,
  fundingWindowDays: number | undefined,
  nowMs = Date.now(),
): number | null {
  if (!fundingExpiresAt || !fundingWindowDays || fundingWindowDays <= 0) return null
  const expires = Date.parse(fundingExpiresAt)
  if (!Number.isFinite(expires)) return null
  const windowMs = fundingWindowDays * 86_400_000
  const start = expires - windowMs
  const elapsed = nowMs - start
  if (elapsed <= 0) return 0
  return Math.min(100, Math.max(0, (elapsed / windowMs) * 100))
}
