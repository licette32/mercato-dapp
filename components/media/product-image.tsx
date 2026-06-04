'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizeStyles = {
  xs: { box: 'h-8 w-8 shrink-0 rounded-md', icon: 'h-3.5 w-3.5' },
  sm: { box: 'h-10 w-10 shrink-0 rounded-lg', icon: 'h-4 w-4' },
  md: { box: 'h-16 w-16 shrink-0 rounded-xl', icon: 'h-6 w-6' },
  cover: { box: 'h-40 w-full shrink-0 rounded-none', icon: 'h-10 w-10' },
} as const

type ProductImageProps = {
  imageUrl: string | null | undefined
  alt: string
  size?: keyof typeof sizeStyles
  className?: string
}

export function ProductImage({
  imageUrl,
  alt,
  size = 'sm',
  className,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const styles = sizeStyles[size]
  const showImage = Boolean(imageUrl) && !imageError

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden border border-border/50 bg-muted/30',
        styles.box,
        className,
      )}
    >
      {showImage ? (
        <img
          src={imageUrl!}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Package className={cn('text-muted-foreground/50', styles.icon)} aria-hidden />
      )}
    </div>
  )
}
