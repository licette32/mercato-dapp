# 3 DeFindex Vault Balance Retrieval and Synchronization

## Change objective

Implement, strictly within Drip #3 scope, balance retrieval and synchronization for:

- DeFindex vault balance (`vaultBalance`)
- wallet balance (`walletBalance`)

Both balances are normalized to the same USDC format and exposed through a shared hook for dashboard and capital flow usage.

## Modified files

- `hooks/useDefindex.ts` (new)
- `hooks/use-wallet.ts`
- `lib/format.ts`
- `env.sample`

## File-by-file details

### `hooks/useDefindex.ts` (new)

A shared hook was created to centralize DeFindex + wallet balance state.

Includes:

- `getVaultBalance(address: string)`
  - requests vault balance from the DeFindex API
  - uses `NEXT_PUBLIC_DEFINDEX_API_KEY` and `NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS`
  - normalizes the returned value to a consistent USDC format
- `refreshBalances()`
  - refreshes in parallel:
    - wallet balance (reusing `useWallet`)
    - vault balance (`getVaultBalance`)
- post-transaction sync wrappers:
  - `depositToVault(...)` -> runs injected action, then refreshes balances
  - `withdrawFromVault(...)` -> runs injected action, then refreshes balances
- exposed state:
  - `vaultBalance`
  - `walletBalance`
  - `isLoadingBalances`
  - `balanceError`
  - plus `getVaultBalance`, `refreshBalances`, `depositToVault`, `withdrawFromVault`

### `hooks/use-wallet.ts`

The existing hook was extended (without duplicating wallet connection logic) to expose wallet USDC balance.

Changes:

- added `balance` state
- added `refreshBalance()`
  - queries USDC token contract balance through Soroban RPC
  - uses the existing trustline (`USDC_TRUSTLINE`)
  - normalizes result to the same USDC format used across the app
- auto-refreshes balance when connected wallet changes

### `lib/format.ts`

A common utility was added:

- `normalizeUSDC(value: number): number`
  - standardizes USDC numeric representation (2 decimals)
  - avoids formatting inconsistencies between wallet and vault balances

### `env.sample`

Environment variables were documented for DeFindex balance integration:

- `NEXT_PUBLIC_DEFINDEX_API_KEY=`
- `NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS=`
- `# NEXT_PUBLIC_DEFINDEX_API_URL=https://api.defindex.io` (optional)

## How this satisfies Drip #3

- **Vault balance retrieval**: implemented in `getVaultBalance`.
- **Wallet balance retrieval reusing existing hook**: `useDefindex` consumes `useWallet` and calls `refreshBalance`.
- **Normalization to the same USDC format**: centralized via `normalizeUSDC`.
- **Shared hook exposing both balances**: `useDefindex` returns `vaultBalance` and `walletBalance`.
- **Balance refresh after deposit/withdraw**: `depositToVault` and `withdrawFromVault` wrappers refresh balances after completion.
- **No UI logic introduced**: all behavior is contained in hooks/utilities.

## Scope note

Implementation was intentionally kept within Drip #3 requirements only, without adding cross-drip features or UI-level changes.
