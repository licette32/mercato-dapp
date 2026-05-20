'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Scroll to `#section` after navigating to the homepage with a hash. */
export function LandingHashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return
    const hash = window.location.hash
    if (!hash) return

    const id = hash.replace('#', '')
    const scrollToTarget = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTarget)
    })
  }, [pathname])

  return null
}
