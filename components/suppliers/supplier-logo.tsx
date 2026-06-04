'use client'

import { useState } from 'react'
import { Building2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizeStyles = {
  xs: { box: 'h-5 w-5 rounded', icon: 'h-3 w-3' },
  sm: { box: 'h-10 w-10 rounded-lg', icon: 'h-5 w-5' },
  md: { box: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
  lg: { box: 'h-16 w-16 rounded-2xl', icon: 'h-8 w-8' },
} as const

type SupplierLogoProps = {
  logoUrl: string | null | undefined
  companyName: string
  size?: keyof typeof sizeStyles
  fallbackIcon?: LucideIcon
  className?: string
}

export function SupplierLogo({
  logoUrl,
  companyName,
  size = 'lg',
  fallbackIcon: FallbackIcon = Building2,
  className,
}: SupplierLogoProps) {
  const [imageError, setImageError] = useState(false)
  const styles = sizeStyles[size]
  const showLogo = Boolean(logoUrl) && !imageError

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden border border-border/50 bg-primary/5',
        styles.box,
        className,
      )}
    >
      {showLogo ? (
        <img
          src={logoUrl!}
          alt={companyName}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <FallbackIcon className={cn('text-primary', styles.icon)} aria-hidden />
      )}
    </div>
  )
}
