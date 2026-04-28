# 3 Obtención y sincronización de saldo de DeFindex Vault

## Objetivo del cambio

Implementar, de forma acotada al Drip #3, la obtención y sincronización de:

- saldo en bóveda DeFindex (`vaultBalance`)
- saldo en billetera (`walletBalance`)

ambos normalizados al mismo formato USDC y expuestos desde un hook compartido para reutilizarse en dashboard y flujos de capital.

## Archivos modificados

- `hooks/useDefindex.ts` (nuevo)
- `hooks/use-wallet.ts`
- `lib/format.ts`
- `env.sample`

## Detalle por archivo

### `hooks/useDefindex.ts` (nuevo)

Se creó el hook compartido para centralizar estado de balances DeFindex + wallet.

Incluye:

- `getVaultBalance(address: string)`
  - consulta el balance de la vault vía API de DeFindex
  - usa `NEXT_PUBLIC_DEFINDEX_API_KEY` y `NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS`
  - normaliza el valor con formato USDC consistente
- `refreshBalances()`
  - refresca en paralelo:
    - balance de wallet (reutilizando `useWallet`)
    - balance de vault (`getVaultBalance`)
- wrappers para sincronización post-transacción:
  - `depositToVault(...)` -> ejecuta acción inyectada y luego refresca balances
  - `withdrawFromVault(...)` -> ejecuta acción inyectada y luego refresca balances
- estado expuesto:
  - `vaultBalance`
  - `walletBalance`
  - `isLoadingBalances`
  - `balanceError`
  - además de `getVaultBalance`, `refreshBalances`, `depositToVault`, `withdrawFromVault`

### `hooks/use-wallet.ts`

Se amplió el hook existente (sin duplicar lógica de conexión/desconexión) para exponer el balance USDC de la wallet.

Cambios:

- agregado de estado `balance`
- agregado de `refreshBalance()`
  - consulta balance USDC del contrato token por Soroban RPC
  - usa la trustline existente (`USDC_TRUSTLINE`)
  - normaliza el resultado al mismo formato USDC del resto de la app
- auto-refresh del balance cuando cambia la wallet conectada

### `lib/format.ts`

Se agregó utilidad común:

- `normalizeUSDC(value: number): number`
  - estandariza representación numérica de USDC (2 decimales)
  - evita inconsistencias entre wallet y vault

### `env.sample`

Se documentaron variables de entorno para la integración de balances DeFindex:

- `NEXT_PUBLIC_DEFINDEX_API_KEY=`
- `NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS=`
- `# NEXT_PUBLIC_DEFINDEX_API_URL=https://api.defindex.io` (opcional)

## Cómo se cumple el Drip #3

- **Obtención de saldo de vault**: implementada en `getVaultBalance`.
- **Obtención de saldo de wallet reutilizando hook existente**: `useDefindex` consume `useWallet` y usa `refreshBalance`.
- **Normalización al mismo formato USDC**: centralizada con `normalizeUSDC`.
- **Exposición de ambos saldos en hook compartido**: `useDefindex` retorna `vaultBalance` y `walletBalance`.
- **Actualización después de depósito/retiro**: wrappers `depositToVault` y `withdrawFromVault` refrescan balances al finalizar.
- **Sin lógica de UI**: todo quedó dentro de hooks/utilidades.

## Nota de alcance

La implementación se mantuvo intencionalmente dentro del alcance del Drip #3, sin agregar funcionalidades de otros drips ni cambios de interfaz.
