'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOutApp } from '@/lib/auth/sign-out-app'
import { useWallet } from '@/hooks/use-wallet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { MercatoLogo } from '@/components/mercato-logo'
import { NavLinks } from '@/components/navigation/nav-links'
import { PublicNavLinks } from '@/components/navigation/public-nav-links'
import { UserNav, type NavProfile, type NavUser } from '@/components/navigation/user-nav'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useI18n } from '@/lib/i18n/provider'

export function Navigation() {
  const router = useRouter()
  const { t } = useI18n()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<NavUser | null>(null)
  const [profile, setProfile] = useState<NavProfile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const {
    walletInfo,
    isConnected,
    truncatedAddress,
    handleConnect,
    handleDisconnect,
    connectPollarWallet,
    provider,
    status,
    isEmbedded,
  } = useWallet()

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) {
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()
        setProfile(p)
      }
    }
    void init().finally(() => setAuthReady(true))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        if (newUser) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', newUser.id)
            .single()
            .then(({ data }) => setProfile(data))
        } else {
          setProfile(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    setUser(null)
    setProfile(null)
    try {
      await handleDisconnect()
    } catch (e) {
      console.error('[Navigation] wallet disconnect during logout failed', e)
    }
    try {
      await signOutApp()
    } catch (e) {
      console.error('[Navigation] signOutApp failed', e)
    }
    router.replace('/')
    router.refresh()
  }

  const isAuthenticated = authReady && !!user
  const closeMobile = () => setMobileOpen(false)
  const logoHref = isAuthenticated ? '/dashboard' : '/'
  const walletProps = {
    isConnected,
    address: walletInfo?.address,
    truncatedAddress,
    onConnect: handleConnect,
    onConnectPollar: connectPollarWallet,
    onDisconnect: handleDisconnect,
    provider,
    status,
    isEmbedded,
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur transition-[box-shadow,background-color] duration-200 ease-out supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            href={logoHref}
            className="group flex shrink-0 items-center gap-2 rounded-md outline-offset-4 transition-[opacity,transform] duration-200 ease-out hover:opacity-90 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            <MercatoLogo className="h-8 w-8 transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
            <span className="text-xl font-semibold tracking-tight">{t('common.brand')}</span>
          </Link>
          {authReady &&
            (isAuthenticated ? (
              <NavLinks variant="desktop" />
            ) : (
              <PublicNavLinks variant="desktop" />
            ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 md:flex md:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated && user?.id && (
              <NotificationDropdown userId={user.id} variant="desktop" />
            )}
            {authReady && !isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full px-5">
                  <Link href="/auth/sign-up">{t('nav.getStarted')}</Link>
                </Button>
              </>
            )}
            {authReady && isAuthenticated && (
              <UserNav
                variant="desktop"
                user={user}
                profile={profile}
                onLogout={handleLogout}
                wallet={walletProps}
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated && user?.id && (
              <NotificationDropdown userId={user.id} variant="mobile" />
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('nav.openMenu')}>
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overscroll-contain">
                <nav className="flex flex-col gap-4" aria-label={t('nav.main')}>
                  {authReady &&
                    (isAuthenticated ? (
                      <NavLinks variant="mobile" onNavigate={closeMobile} />
                    ) : (
                      <PublicNavLinks variant="mobile" onNavigate={closeMobile} />
                    ))}
                  <div className="my-2 border-t border-border" />
                  <UserNav
                    variant="mobile"
                    user={authReady ? user : null}
                    profile={profile}
                    onLogout={handleLogout}
                    wallet={isAuthenticated ? walletProps : undefined}
                  />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
