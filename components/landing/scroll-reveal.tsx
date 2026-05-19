'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useReveal } from '@/lib/landing/use-scroll-motion'

type ScrollRevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'article'
}

export function ScrollReveal({ children, className, delay = 0, as: Tag = 'div' }: ScrollRevealProps) {
  const { ref, visible } = useReveal<HTMLElement>(0.1)

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
