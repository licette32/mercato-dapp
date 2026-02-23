'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Landmark, Loader2, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRamp } from './ramp-provider'
import type { FiatAccount } from './types'

interface BankAccountSelectorProps {
  fiatAccounts: FiatAccount[]
  fiatAccountsLoaded: boolean
  selectedId: string
  onSelect: (id: string) => void
  onRefresh: () => void
}

export function BankAccountSelector({
  fiatAccounts,
  fiatAccountsLoaded,
  selectedId,
  onSelect,
  onRefresh,
}: BankAccountSelectorProps) {
  const { state, actions } = useRamp()
  const { selectedProvider, customer } = state

  const [showAddBank, setShowAddBank] = useState(false)
  const [newBankClabe, setNewBankClabe] = useState('')
  const [newBankBeneficiary, setNewBankBeneficiary] = useState('')
  const [newBankName, setNewBankName] = useState('')
  const [addingFiatAccount, setAddingFiatAccount] = useState(false)

  const handleAddFiatAccount = async () => {
    if (!selectedProvider || !newBankClabe.trim() || !newBankBeneficiary.trim()) {
      toast.error('Enter CLABE and beneficiary name')
      return
    }
    const c = customer ?? (await actions.ensureCustomer())
    const effectiveId = actions.getFiatCustomerId(c)
    setAddingFiatAccount(true)
    try {
      const res = await fetch('/api/ramp/fiat-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          customerId: effectiveId,
          account: {
            type: 'spei',
            clabe: newBankClabe.trim(),
            beneficiary: newBankBeneficiary.trim(),
            bankName: newBankName.trim() || undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add bank account')
      setNewBankClabe('')
      setNewBankBeneficiary('')
      setNewBankName('')
      setShowAddBank(false)
      onRefresh()
      toast.success('Bank account added')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add bank account')
    } finally {
      setAddingFiatAccount(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Bank account</Label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 text-xs gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddBank(!showAddBank)}
            className="h-7 text-xs gap-1.5"
          >
            <Plus className="h-3 w-3" />
            Add new
          </Button>
        </div>
      </div>

      {fiatAccounts.length > 0 ? (
        <Select value={selectedId} onValueChange={onSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a bank account" />
          </SelectTrigger>
          <SelectContent>
            {fiatAccounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <span className="flex items-center gap-2">
                  <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
                  {a.bankName ? `${a.bankName} ·· ` : ''}
                  {a.accountNumber?.slice(-4) ?? a.id?.slice(0, 8)}
                  <span className="text-muted-foreground">
                    ({a.accountHolderName})
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : fiatAccountsLoaded ? (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-3 text-center">
          No bank accounts found. Add one below to get started.
        </p>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading bank accounts…
        </div>
      )}

      {showAddBank && (
        <div className="rounded-lg border border-dashed p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-sm font-medium">New SPEI bank account</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="new-clabe" className="text-xs">
                CLABE (18 digits)
              </Label>
              <Input
                id="new-clabe"
                placeholder="012345678901234567"
                value={newBankClabe}
                onChange={(e) => setNewBankClabe(e.target.value)}
                maxLength={18}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-beneficiary" className="text-xs">
                Beneficiary name
              </Label>
              <Input
                id="new-beneficiary"
                placeholder="Full name"
                value={newBankBeneficiary}
                onChange={(e) => setNewBankBeneficiary(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-bank" className="text-xs">
              Bank name (optional)
            </Label>
            <Input
              id="new-bank"
              placeholder="e.g. BBVA"
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddFiatAccount}
              disabled={
                addingFiatAccount ||
                !newBankClabe.trim() ||
                !newBankBeneficiary.trim()
              }
            >
              {addingFiatAccount ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save account
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddBank(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
