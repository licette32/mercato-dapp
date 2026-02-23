import { ArrowRight, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Quote } from './types'

function formatCurrency(amount: string): string {
  const n = Number(amount)
  if (Number.isNaN(n)) return amount
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function QuoteCard({ quote }: { quote: Quote }) {
  const expiresAt = new Date(quote.expiresAt)
  const now = new Date()
  const secondsLeft = Math.max(
    0,
    Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
  )
  const expired = secondsLeft === 0

  return (
    <div className="rounded-xl border bg-gradient-to-br from-background to-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Quote summary
        </span>
        {expired ? (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 tabular-nums text-xs">
            <RefreshCw className="h-3 w-3" />
            Expires in {Math.floor(secondsLeft / 60)}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">You send</p>
          <p className="text-lg font-bold tabular-nums">
            {formatCurrency(quote.fromAmount)}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {quote.fromCurrency}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="flex-1 rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">You receive</p>
          <p className="text-lg font-bold tabular-nums text-primary">
            {formatCurrency(quote.toAmount)}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {quote.toCurrency}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Exchange rate</span>
        <span className="tabular-nums font-medium">{quote.exchangeRate}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Fee</span>
        <span className="tabular-nums font-medium">{quote.fee}</span>
      </div>
    </div>
  )
}
