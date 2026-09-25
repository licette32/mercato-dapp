'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/lib/i18n/provider'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/dictionaries'
import { PollarProvider } from '@/providers/pollar-provider'
import { TrustlessWorkProvider } from '@/lib/trustless/config'
import { WalletProvider } from '@/providers/wallet-provider'
import { NotificationsProvider } from '@/components/notifications/notifications-provider'

export function AppProviders({
  children,
  locale,
  messages,
}: {
  children: ReactNode
  locale: Locale
  messages: Messages
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider locale={locale} messages={messages}>
        <NotificationsProvider>
          <PollarProvider>
            <TrustlessWorkProvider>
              <WalletProvider>{children}</WalletProvider>
            </TrustlessWorkProvider>
          </PollarProvider>
        </NotificationsProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
