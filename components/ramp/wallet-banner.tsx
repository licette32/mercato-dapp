'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet } from 'lucide-react'
import { useRamp } from './ramp-provider'

export function WalletBanner() {
  const { meta } = useRamp()

  if (meta.isConnected) return null

  return (
    <Card className="mb-6 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardContent className="flex flex-wrap items-center gap-4 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Wallet className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Wallet required</p>
            <p className="text-xs text-muted-foreground">
              Connect your Stellar wallet to add funds or cash out.
            </p>
          </div>
        </div>
        <Button onClick={meta.handleConnect} size="sm" className="shrink-0">
          Connect wallet
        </Button>
      </CardContent>
    </Card>
  )
}
