'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWallet } from '@/hooks/use-wallet'
import { SUPPORTED_COUNTRIES } from '@/lib/constants'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n/provider'

export default function BlindPaySetupPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BlindPaySetupContent />
    </Suspense>
  )
}

function BlindPaySetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { walletInfo, isConnected, handleConnect } = useWallet()
  const { t } = useI18n()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [tosId, setTosId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    tax_id: '',
    address_line_1: '',
    city: '',
    state_province_region: '',
    country: 'MX',
    postal_code: '',
    phone_number: '',
    date_of_birth: '',
  })

  useEffect(() => {
    const id = searchParams.get('tos_id')
    if (id) {
      setTosId(id)
      setStep(2)
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    async function getEmail() {
      try {
        const res = await fetch('/api/ramp/config')
        if (res.ok) {
          const profileRes = await fetch('/api/ramp/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'blindpay' }),
          })
          if (profileRes.ok) {
            const data = await profileRes.json()
            if (!cancelled && data.email) setUserEmail(data.email)
          }
        }
      } catch {
        // ignore
      }
    }
    getEmail()
    return () => { cancelled = true }
  }, [])

  const handleOpenTos = async () => {
    setLoading(true)
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard/ramp/blindpay-setup`
        : ''
      const res = await fetch(
        `/api/ramp/blindpay/tos-url?provider=blindpay&redirectUrl=${encodeURIComponent(redirectUrl)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('blindpaySetup.errorTosUrl'))
      window.open(data.url, '_blank', 'noopener,noreferrer')
      toast.success(t('blindpaySetup.toastTosOpen'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('blindpaySetup.toastTosFail'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/ramp/blindpay/receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tos_id: tosId,
          type: 'individual',
          kyc_type: 'standard',
          email: form.email || userEmail,
          tax_id: form.tax_id,
          address_line_1: form.address_line_1,
          city: form.city,
          state_province_region: form.state_province_region,
          country: form.country,
          postal_code: form.postal_code,
          ip_address: '127.0.0.1',
          phone_number: form.phone_number,
          first_name: form.first_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('blindpaySetup.errorReceiver'))
      setReceiverId(data.id)
      setStep(3)
      toast.success(t('blindpaySetup.toastKycSuccess'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('blindpaySetup.toastKycFail'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterWallet = async () => {
    if (!walletInfo?.address) {
      toast.error(t('blindpaySetup.toastConnectFirst'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ramp/blindpay/register-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          address: walletInfo.address,
          name: t('blindpaySetup.walletDisplayName'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('blindpaySetup.errorRegister'))
      toast.success(t('blindpaySetup.toastSetupComplete'))
      router.push(`/dashboard/ramp?provider=blindpay&blindpay_setup=${encodeURIComponent(data.compositeId)}&blindpay_email=${encodeURIComponent(form.email || userEmail)}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('blindpaySetup.toastRegisterFail'))
    } finally {
      setLoading(false)
    }
  }

  return (
          <div className="container mx-auto max-w-lg px-4 py-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/ramp" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('blindpaySetup.backRamp')}
          </Link>
        </Button>
        <h1 className="mt-6 text-2xl font-bold">{t('blindpaySetup.pageTitle')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('blindpaySetup.pageDescription')}
        </p>

        <div className="mt-8 space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                  {t('blindpaySetup.step1Title')}
                </CardTitle>
                <CardDescription>
                  {t('blindpaySetup.step1Description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleOpenTos} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t('blindpaySetup.openTos')}
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('blindpaySetup.step1Hint')}
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    const id = prompt(t('blindpaySetup.tosPrompt'))
                    if (id) {
                      setTosId(id)
                      setStep(2)
                    }
                  }}
                >
                  {t('blindpaySetup.haveTosId')}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {tosId ? (
                    <CheckCircle2 className="h-7 w-7 text-green-500" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                  )}
                  {t('blindpaySetup.step2Title')}
                </CardTitle>
                <CardDescription>
                  {t('blindpaySetup.step2Description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitKyc} className="space-y-4">
                  {!tosId && (
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.labelTosId')}</Label>
                      <Input
                        placeholder={t('blindpaySetup.tosPlaceholder')}
                        value={tosId}
                        onChange={(e) => setTosId(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.firstName')}</Label>
                      <Input
                        value={form.first_name}
                        onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.lastName')}</Label>
                      <Input
                        value={form.last_name}
                        onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('blindpaySetup.email')}</Label>
                    <Input
                      type="email"
                      value={form.email || userEmail}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder={userEmail || t('blindpaySetup.emailPlaceholder')}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('blindpaySetup.taxId')}</Label>
                    <Input
                      value={form.tax_id}
                      onChange={(e) => setForm((f) => ({ ...f, tax_id: e.target.value }))}
                      placeholder={t('blindpaySetup.taxPlaceholder')}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('blindpaySetup.address')}</Label>
                    <Input
                      value={form.address_line_1}
                      onChange={(e) => setForm((f) => ({ ...f, address_line_1: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.city')}</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.stateRegion')}</Label>
                      <Input
                        value={form.state_province_region}
                        onChange={(e) => setForm((f) => ({ ...f, state_province_region: e.target.value }))}
                        placeholder={t('blindpaySetup.statePlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.country')}</Label>
                      <Select
                        value={form.country}
                        onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.postalCode')}</Label>
                      <Input
                        value={form.postal_code}
                        onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.phone')}</Label>
                      <Input
                        value={form.phone_number}
                        onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                        placeholder={t('blindpaySetup.phonePlaceholder')}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('blindpaySetup.dateOfBirth')}</Label>
                      <Input
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t('blindpaySetup.submitKyc')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                  {t('blindpaySetup.step3Title')}
                </CardTitle>
                <CardDescription>
                  {t('blindpaySetup.step3Description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConnected ? (
                  <Button onClick={handleConnect}>{t('blindpaySetup.connectWallet')}</Button>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t('blindpaySetup.walletLine', {
                        start: walletInfo?.address?.slice(0, 8) ?? '',
                        end: walletInfo?.address?.slice(-8) ?? '',
                      })}
                    </p>
                    <Button onClick={handleRegisterWallet} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {t('blindpaySetup.registerWallet')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  )
}
