'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Landmark,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { signTransaction } from '@/lib/trustless/wallet-kit'
import { useWallet } from '@/hooks/use-wallet'
import { PollarWalletKitLimitations } from '@/lib/mercato-wallet'
import type { SendTransactionResponse } from '@defindex/sdk'

type Props = {
  configuredVaultAddress: string
}

interface VaultFormState {
  name: string
  symbol: string
  vaultFeeBps: string
  upgradable: boolean
  emergencyManager: string
  feeReceiver: string
  manager: string
  rebalanceManager: string
  assetAddress: string
  strategyAddress: string
  strategyName: string
}

const DEFAULTS: VaultFormState = {
  name: 'Mercato Vault',
  symbol: 'mVLT',
  vaultFeeBps: '100',
  upgradable: true,
  emergencyManager: '',
  feeReceiver: '',
  manager: '',
  rebalanceManager: '',
  assetAddress: '',
  strategyAddress: '',
  strategyName: 'Primary Strategy',
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown }
    if (typeof data?.error === 'string' && data.error) return data.error
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`
}

function buildConfig(form: VaultFormState, callerAddress: string): Record<string, unknown> {
  const feeBps = Number(form.vaultFeeBps)
  return {
    caller: callerAddress,
    name: form.name.trim(),
    symbol: form.symbol.trim(),
    vaultFeeBps: Number.isFinite(feeBps) ? feeBps : 100,
    upgradable: form.upgradable,
    roles: {
      emergencyManager: form.emergencyManager.trim() || callerAddress,
      feeReceiver: form.feeReceiver.trim() || callerAddress,
      manager: form.manager.trim() || callerAddress,
      rebalanceManager: form.rebalanceManager.trim() || callerAddress,
    },
    assets: form.assetAddress.trim()
      ? [
          {
            address: form.assetAddress.trim(),
            strategies: form.strategyAddress.trim()
              ? [
                  {
                    address: form.strategyAddress.trim(),
                    name: form.strategyName.trim() || 'Primary Strategy',
                    paused: false,
                  },
                ]
              : [],
          },
        ]
      : [],
  }
}

export function AdminDefindexVaultPanel({ configuredVaultAddress }: Props) {
  const { walletInfo, canSignTransactions } = useWallet()
  const [form, setForm] = useState<VaultFormState>(DEFAULTS)
  const [busy, setBusy] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  const hasVaultEnv = Boolean(configuredVaultAddress.trim())

  const set = (key: keyof VaultFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const previewJson = JSON.stringify(
    buildConfig(form, walletInfo?.address ?? 'G…your-wallet'),
    null,
    2
  )

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(previewJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const signAndSubmit = useCallback(
    async (unsignedXdr: string, signerAddress: string): Promise<SendTransactionResponse> => {
      const signedXdr = await signTransaction({
        unsignedTransaction: unsignedXdr,
        address: signerAddress,
      })
      const submitResponse = await fetch('/api/defindex/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xdr: signedXdr }),
      })
      if (!submitResponse.ok) throw new Error(await readErrorMessage(submitResponse))
      return (await submitResponse.json()) as SendTransactionResponse
    },
    []
  )

  const onDeploy = useCallback(async () => {
    const address = walletInfo?.address?.trim()
    if (!address) {
      toast.error('Connect your admin wallet first (Freighter / Albedo).')
      return
    }
    if (!canSignTransactions) {
      toast.error(PollarWalletKitLimitations)
      return
    }
    if (!form.assetAddress.trim()) {
      toast.error('Asset address is required to create a vault.')
      return
    }

    const config = buildConfig(form, address)
    setBusy(true)
    setLastTxHash(null)
    try {
      const res = await fetch('/api/defindex/admin/create-vault', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error(await readErrorMessage(res))

      const { xdr } = (await res.json()) as { xdr: string }
      if (!xdr) throw new Error('No XDR returned from DeFindex.')

      const submitted = await signAndSubmit(xdr, address)
      if (submitted?.success === false) {
        toast.error('Transaction was not successful on-chain.')
        return
      }

      if (submitted?.txHash) setLastTxHash(submitted.txHash)
      toast.success('Vault created successfully!', {
        description: submitted?.txHash ? `Tx: ${submitted.txHash}` : 'Set NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS to the new vault address.',
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Vault creation failed.')
    } finally {
      setBusy(false)
    }
  }, [canSignTransactions, form, signAndSubmit, walletInfo?.address])

  return (
    <div className="space-y-4">
      {/* Current vault status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-violet-500" aria-hidden />
            Mercato DeFindex Vault
          </CardTitle>
          <CardDescription>
            The shared yield vault that MERCATO investors deposit into. Only one vault address
            is configured at a time via the <code className="text-xs">NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS</code> env var.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasVaultEnv ? (
            <div className="flex flex-wrap items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Vault configured</p>
                <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">{configuredVaultAddress}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">Active</Badge>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">No vault configured</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Deploy a vault below, then set{' '}
                  <code className="rounded bg-muted px-1">NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS</code> to the new{' '}
                  <code className="rounded bg-muted px-1">C…</code> contract address and redeploy.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create vault form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create new vault</CardTitle>
          <CardDescription>
            Fill in the vault parameters. Fields left blank in the roles section default to your connected wallet address.
            See the{' '}
            <a
              href="https://docs.defindex.io"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 underline underline-offset-2"
            >
              DeFindex docs <ExternalLink className="h-3 w-3" />
            </a>{' '}
            for strategy addresses.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!canSignTransactions && walletInfo?.address && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Use a Stellar Wallets Kit wallet (e.g. Freighter) to sign vault deployment.</span>
            </div>
          )}

          {/* Basic info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vault identity</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="vault-name">Name</Label>
                <Input
                  id="vault-name"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Mercato Vault"
                  disabled={busy}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vault-symbol">Symbol</Label>
                <Input
                  id="vault-symbol"
                  value={form.symbol}
                  onChange={set('symbol')}
                  placeholder="mVLT"
                  disabled={busy}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vault-fee">
                  Fee (bps)
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {Number(form.vaultFeeBps) / 100}%
                  </span>
                </Label>
                <Input
                  id="vault-fee"
                  type="number"
                  min={0}
                  max={10000}
                  value={form.vaultFeeBps}
                  onChange={set('vaultFeeBps')}
                  placeholder="100"
                  disabled={busy}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Switch
                id="vault-upgradable"
                checked={form.upgradable}
                onCheckedChange={(v) => setForm((p) => ({ ...p, upgradable: v }))}
                disabled={busy}
              />
              <Label htmlFor="vault-upgradable" className="cursor-pointer">
                Upgradable contract
                <span className="ml-1 text-xs text-muted-foreground">(recommended for testnet)</span>
              </Label>
            </div>
          </div>

          <Separator />

          {/* Asset & strategy */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asset &amp; strategy</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="asset-address">
                  Asset contract address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="asset-address"
                  value={form.assetAddress}
                  onChange={set('assetAddress')}
                  placeholder="C… (e.g. Soroban USDC SAC)"
                  className="font-mono text-xs"
                  disabled={busy}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="strategy-address">Strategy contract address</Label>
                <Input
                  id="strategy-address"
                  value={form.strategyAddress}
                  onChange={set('strategyAddress')}
                  placeholder="C… (leave blank for no strategy)"
                  className="font-mono text-xs"
                  disabled={busy}
                />
              </div>
              {form.strategyAddress.trim() && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="strategy-name">Strategy label</Label>
                  <Input
                    id="strategy-name"
                    value={form.strategyName}
                    onChange={set('strategyName')}
                    placeholder="Primary Strategy"
                    disabled={busy}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Roles */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roles</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Leave any field blank to default to your connected wallet address (
              <span className="font-mono">{walletInfo?.address ? walletInfo.address.slice(0, 8) + '…' : 'not connected'}</span>).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  { id: 'manager', label: 'Manager', key: 'manager' },
                  { id: 'rebalance-manager', label: 'Rebalance manager', key: 'rebalanceManager' },
                  { id: 'fee-receiver', label: 'Fee receiver', key: 'feeReceiver' },
                  { id: 'emergency-manager', label: 'Emergency manager', key: 'emergencyManager' },
                ] as const
              ).map(({ id, label, key }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder="G… (defaults to your wallet)"
                    className="font-mono text-xs"
                    disabled={busy}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* JSON preview (collapsible) */}
          <div className="rounded-lg border border-border bg-muted/30">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
              onClick={() => setShowAdvanced((p) => !p)}
            >
              <span>Preview JSON payload</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            </button>
            {showAdvanced && (
              <div className="relative border-t border-border">
                <pre className="max-h-64 overflow-auto p-4 text-[11px] leading-relaxed text-muted-foreground">
                  {previewJson}
                </pre>
                <button
                  type="button"
                  onClick={() => void handleCopyJson()}
                  className="absolute right-3 top-3 rounded-md border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground"
                  title="Copy JSON"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Success state */}
          {lastTxHash && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">Vault deployed!</p>
                <p className="mt-0.5 break-all font-mono text-muted-foreground">{lastTxHash}</p>
                <p className="mt-1 text-muted-foreground">
                  Copy the new vault <code>C…</code> contract address from the transaction and set{' '}
                  <code className="rounded bg-muted px-0.5">NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS</code>.
                </p>
              </div>
            </div>
          )}

          <Button
            className="gap-2"
            disabled={busy || !form.assetAddress.trim()}
            onClick={() => void onDeploy()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Landmark className="h-4 w-4" aria-hidden />}
            {busy ? 'Deploying vault…' : 'Build XDR & deploy vault'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
