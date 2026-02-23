'use client'

import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BadgeCheck } from 'lucide-react'
import { useRamp } from './ramp-provider'
import { ProviderBadges } from './provider-badges'

export function ProviderSelector() {
  const { state, actions } = useRamp()
  const { config, selectedProvider, selectedProviderConfig } = state

  if (!config?.providers?.length) return null

  return (
    <Card className="mb-6">
      <CardContent className="pt-5 pb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Provider
            </Label>
            <Select
              value={selectedProvider ?? ''}
              onValueChange={actions.selectProvider}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {config.providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-medium">{p.displayName}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProviderConfig && (
            <div className="flex items-center gap-2 pb-1">
              <BadgeCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
          )}
        </div>
        {selectedProviderConfig && (
          <ProviderBadges capabilities={selectedProviderConfig.capabilities} />
        )}
      </CardContent>
    </Card>
  )
}
