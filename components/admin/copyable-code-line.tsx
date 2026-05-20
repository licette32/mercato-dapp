'use client'

import { useState } from 'react'
import { CheckCircle2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CopyableCodeLineProps = {
  value: string
  label?: string
  className?: string
}

export function CopyableCodeLine({ value, label, className }: CopyableCodeLineProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(label ? `Copied ${label}` : 'Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-border/80 bg-muted/50 px-2 py-1.5',
        className,
      )}
    >
      <code className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-foreground">
        {value}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => void onCopy()}
        aria-label={label ? `Copy ${label}` : 'Copy'}
        title={label ? `Copy ${label}` : 'Copy'}
      >
        {copied ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </Button>
    </div>
  )
}
