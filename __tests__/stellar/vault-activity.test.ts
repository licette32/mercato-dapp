import { test, expect, beforeEach, afterEach, mock } from 'bun:test'

import {
  getCachedVaultActivityPage,
  setCachedVaultActivityPage,
  invalidateVaultActivityCache,
} from '@/lib/stellar/vault-activity-cache'
import { summarizeVaultActivity } from '@/lib/stellar/vault-activity'

beforeEach(() => {
  invalidateVaultActivityCache('GA-a', 'CA-a')
  invalidateVaultActivityCache('GA-b', 'CA-b')
})

afterEach(() => {
  invalidateVaultActivityCache('GA-a', 'CA-a')
  invalidateVaultActivityCache('GA-b', 'CA-b')
})

test('setCachedVaultActivityPage and getCachedVaultActivityPage work directly', () => {
  const data = { entries: [], nextCursor: 'abc', hasMore: false }
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 10, data)
  const got = getCachedVaultActivityPage('GA-a', 'CA-a', null, 10)
  expect(got).toEqual(data)
})

test('getCachedVaultActivityPage returns null for uncached key', () => {
  const got = getCachedVaultActivityPage('GA-x', 'CA-x', null, 10)
  expect(got).toBeNull()
})

test('getCachedVaultActivityPage returns null after TTL expiry', () => {
  const data = { entries: [], nextCursor: null, hasMore: false }
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 10, data, -1)
  const got = getCachedVaultActivityPage('GA-a', 'CA-a', null, 10)
  expect(got).toBeNull()
})

test('different account produces different cache key', () => {
  setCachedVaultActivityPage('GA-a', 'CA-v', null, 10, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-b', 'CA-v', null, 10, { entries: [], nextCursor: null, hasMore: false })
  const a = getCachedVaultActivityPage('GA-a', 'CA-v', null, 10)
  const b = getCachedVaultActivityPage('GA-b', 'CA-v', null, 10)
  expect(a).not.toBeNull()
  expect(b).not.toBeNull()
})

test('different vault produces different cache key', () => {
  setCachedVaultActivityPage('GA-a', 'CA-v1', null, 10, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-a', 'CA-v2', null, 10, { entries: [], nextCursor: null, hasMore: false })
  const a = getCachedVaultActivityPage('GA-a', 'CA-v1', null, 10)
  const b = getCachedVaultActivityPage('GA-a', 'CA-v2', null, 10)
  expect(a).not.toBeNull()
  expect(b).not.toBeNull()
})

test('different cursor produces different cache entry', () => {
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 10, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-a', 'CA-a', 'cursor1', 10, { entries: [], nextCursor: null, hasMore: false })
  const a = getCachedVaultActivityPage('GA-a', 'CA-a', null, 10)
  const b = getCachedVaultActivityPage('GA-a', 'CA-a', 'cursor1', 10)
  expect(a).not.toBeNull()
  expect(b).not.toBeNull()
})

test('different limit produces different cache entry', () => {
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 5, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 20, { entries: [], nextCursor: null, hasMore: false })
  const a = getCachedVaultActivityPage('GA-a', 'CA-a', null, 5)
  const b = getCachedVaultActivityPage('GA-a', 'CA-a', null, 20)
  expect(a).not.toBeNull()
  expect(b).not.toBeNull()
})

test('invalidateVaultActivityCache clears all entries for account+vault', () => {
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 10, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-a', 'CA-a', 'c1', 10, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 20, { entries: [], nextCursor: null, hasMore: false })

  invalidateVaultActivityCache('GA-a', 'CA-a')

  expect(getCachedVaultActivityPage('GA-a', 'CA-a', null, 10)).toBeNull()
  expect(getCachedVaultActivityPage('GA-a', 'CA-a', 'c1', 10)).toBeNull()
  expect(getCachedVaultActivityPage('GA-a', 'CA-a', null, 20)).toBeNull()
})

test('invalidateVaultActivityCache does not affect other pairs', () => {
  setCachedVaultActivityPage('GA-a', 'CA-a', null, 10, { entries: [], nextCursor: null, hasMore: false })
  setCachedVaultActivityPage('GA-b', 'CA-b', null, 10, { entries: [], nextCursor: null, hasMore: false })

  invalidateVaultActivityCache('GA-a', 'CA-a')

  expect(getCachedVaultActivityPage('GA-a', 'CA-a', null, 10)).toBeNull()
  expect(getCachedVaultActivityPage('GA-b', 'CA-b', null, 10)).not.toBeNull()
})

test('invalidateVaultActivityCache is idempotent', () => {
  expect(() => invalidateVaultActivityCache('GA-x', 'CA-x')).not.toThrow()
})

test('summarizeVaultActivity aggregates deposits and withdrawals', () => {
  const entries = [
    { kind: 'deposit', amountDisplay: 100 } as any,
    { kind: 'deposit', amountDisplay: 50 } as any,
    { kind: 'withdraw', amountDisplay: 30 } as any,
  ]
  const summary = summarizeVaultActivity(entries)
  expect(summary.depositCount).toBe(2)
  expect(summary.withdrawCount).toBe(1)
  expect(summary.totalDepositedDisplay).toBe(150)
  expect(summary.totalWithdrawnDisplay).toBe(30)
})

test('summarizeVaultActivity handles empty array', () => {
  const summary = summarizeVaultActivity([])
  expect(summary.depositCount).toBe(0)
  expect(summary.withdrawCount).toBe(0)
  expect(summary.totalDepositedDisplay).toBe(0)
  expect(summary.totalWithdrawnDisplay).toBe(0)
})
