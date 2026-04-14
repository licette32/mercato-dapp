import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Package,
  TrendingUp,
  Users,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Lock,
  Zap,
  Globe,
  ArrowDown,
  Star,
  BarChart3,
  FileCheck,
  RefreshCw,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const roles = [
  {
    id: 'smb',
    icon: Package,
    label: 'SMB (Buyer)',
    tagline: 'Get working capital for inventory without taking on traditional debt.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    dotColor: 'bg-blue-500',
    actions: [
      'Create deals specifying product, supplier, and payment terms',
      'Deploy a non-custodial Stellar escrow with your wallet',
      'Confirm deliveries and milestone releases',
      'Repay investor capital + yield after your sales cycle',
    ],
  },
  {
    id: 'investor',
    icon: TrendingUp,
    label: 'Investor',
    tagline: 'Fund real supply-chain deals and earn short-term yield in USDC.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dotColor: 'bg-emerald-500',
    actions: [
      'Browse open deals on the marketplace',
      'Fund escrow directly from your Stellar wallet in USDC',
      'Track milestones and deal progress in real time',
      'Receive repayment with yield once the deal completes',
    ],
  },
  {
    id: 'supplier',
    icon: Users,
    label: 'Supplier',
    tagline: 'Get paid faster with milestone-based on-chain payments.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    dotColor: 'bg-amber-500',
    actions: [
      'Manage your company profile and product catalog',
      'Accept orders once a deal is funded',
      'Submit shipment and delivery proof',
      'Receive 50% on shipment and 50% on delivery — on-chain',
    ],
  },
]

const phases = [
  {
    number: 1,
    title: 'SMB Creates Deal & Deploys Escrow',
    actor: 'SMB (Buyer)',
    actorColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ringColor: 'ring-blue-500',
    numBg: 'bg-blue-500',
    lineBg: 'from-blue-500 to-emerald-500',
    icon: FileCheck,
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500',
    description:
      'An SMB selects a supplier from the catalog, specifies the product, amount, and term, then signs a Stellar wallet transaction to deploy a non-custodial multi-release escrow contract via Trustless Work.',
    actions: [
      { label: 'Choose supplier & product from catalog' },
      { label: 'Set deal amount, term, and APR' },
      { label: 'Sign escrow deployment with Freighter or Albedo' },
      { label: 'Deal appears on marketplace as "Seeking Funding"' },
    ],
    tech: [
      { label: 'Trustless Work escrow', icon: Lock },
      { label: 'Stellar Network', icon: Globe },
    ],
  },
  {
    number: 2,
    title: 'Investor Funds the Escrow',
    actor: 'Investor',
    actorColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    ringColor: 'ring-emerald-500',
    numBg: 'bg-emerald-500',
    lineBg: 'from-emerald-500 to-amber-500',
    icon: Wallet,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-500',
    description:
      'An investor browses the open marketplace, reviews the deal terms, APR, and SMB reputation, then sends USDC directly to the escrow contract from their Stellar wallet. Funds never touch the platform.',
    actions: [
      { label: 'Browse marketplace and pick a deal' },
      { label: 'Review APR, term, and SMB track record' },
      { label: 'Sign transaction to send USDC to escrow' },
      { label: 'Deal status updates to "Funded" — supplier notified' },
    ],
    tech: [
      { label: 'USDC on Stellar', icon: Zap },
      { label: 'Non-custodial', icon: Lock },
    ],
  },
  {
    number: 3,
    title: 'Supplier Ships & Milestones Release',
    actor: 'Supplier + SMB + Admin',
    actorColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    ringColor: 'ring-amber-500',
    numBg: 'bg-amber-500',
    lineBg: 'from-amber-500 to-violet-500',
    icon: Package,
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-500',
    description:
      'The supplier accepts the order, submits shipment proof (Milestone 1), and later delivery confirmation (Milestone 2). Each milestone approval by the SMB triggers an on-chain fund release via Trustless Work.',
    actions: [
      { label: 'Supplier submits shipment proof (Milestone 1)' },
      { label: 'SMB confirms shipment → 50% released to supplier' },
      { label: 'Supplier submits delivery proof (Milestone 2)' },
      { label: 'Admin approves → final 50% released on-chain' },
    ],
    tech: [
      { label: 'Multi-release escrow', icon: ShieldCheck },
      { label: 'On-chain proof', icon: FileCheck },
    ],
  },
  {
    number: 4,
    title: 'SMB Repays Investor — Deal Complete',
    actor: 'SMB (Buyer)',
    actorColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    ringColor: 'ring-violet-500',
    numBg: 'bg-violet-500',
    lineBg: '',
    icon: RefreshCw,
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-500',
    description:
      'After the SMB sells the goods and the term completes, they repay the investor the principal plus the agreed yield. The deal is marked "Completed" on-chain, building the SMB\'s reputation for future financing.',
    actions: [
      { label: 'SMB repays principal + yield on Stellar' },
      { label: 'Transaction hash recorded for transparency' },
      { label: 'Investor receives USDC + yield in their wallet' },
      { label: 'Deal marked "Completed" — SMB reputation updated' },
    ],
    tech: [
      { label: 'Verified on-chain', icon: CheckCircle2 },
      { label: 'Reputation scoring', icon: Star },
    ],
  },
]

const benefits = [
  {
    icon: Lock,
    title: 'Non-Custodial',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    body: 'Funds go directly into a Stellar smart contract. MERCATO never holds your money — only the contract logic controls release.',
  },
  {
    icon: ShieldCheck,
    title: 'Fully Transparent',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    body: 'Every transaction, milestone approval, and proof hash is recorded on-chain. Anyone can verify deal progress at any time.',
  },
  {
    icon: BarChart3,
    title: 'Reputation-Backed',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    body: 'Each completed deal builds the SMB\'s on-chain track record. Investors can assess repayment history before funding.',
  },
  {
    icon: Globe,
    title: 'LATAM-Focused',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    body: 'Built for LATAM supply chains with fiat ramps via Etherfuse, Alfred Pay, and BlindPay to convert between USDC and local currency.',
  },
]

const techStack = [
  { label: 'Stellar Network', sub: 'Smart contracts & USDC' },
  { label: 'Trustless Work', sub: 'Multi-release escrow API' },
  { label: 'Freighter / Albedo', sub: 'Non-custodial wallets' },
  { label: 'Supabase', sub: 'Auth & deal metadata' },
]

const rampProviders = [
  { name: 'Etherfuse', region: 'Mexico · SPEI' },
  { name: 'Alfred Pay', region: 'LATAM · SPEI' },
  { name: 'BlindPay', region: 'Global' },
]

const hiwEnter =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:ease-out motion-safe:fill-mode-both'

const hiwCardHover =
  'transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-colors motion-reduce:hover:translate-y-0'

/** Timeline step numbers: same phased pulse as home deal-cycle (4s loop). */
function hiwPhaseNumPulseClass(n: number) {
  return cn(
    'origin-center motion-reduce:animate-none',
    n === 1 && 'motion-safe:animate-mercato-cycle-step-1',
    n === 2 && 'motion-safe:animate-mercato-cycle-step-2',
    n === 3 && 'motion-safe:animate-mercato-cycle-step-3',
    n === 4 && 'motion-safe:animate-mercato-cycle-step-4',
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      {/* ── Hero ── */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-transparent">
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <Badge variant="secondary" className={cn('mb-5 gap-1.5 px-3 py-1', hiwEnter)}>
            <Zap className="h-3.5 w-3.5" aria-hidden />
            Supply Chain Finance on Stellar
          </Badge>
          <h1
            className={cn(
              'mb-5 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl',
              hiwEnter,
              'motion-safe:delay-75',
            )}
          >
            How MERCATO Works
          </h1>
          <p
            className={cn(
              'mx-auto mb-8 max-w-2xl text-lg text-muted-foreground',
              hiwEnter,
              'motion-safe:delay-150',
            )}
          >
            MERCATO connects SMBs, investors, and suppliers through
            non-custodial, milestone-based escrow on Stellar — giving
            businesses working capital, investors short-term yield, and
            suppliers faster payments.
          </p>
          <div
            className={cn(
              'flex flex-wrap items-center justify-center gap-3 text-sm',
              hiwEnter,
              'motion-safe:delay-200',
            )}
          >
            {[
              { icon: Lock, label: 'Non-custodial escrow' },
              { icon: Zap, label: 'USDC on Stellar' },
              { icon: Globe, label: 'LATAM supply chains' },
            ].map(({ icon: Icon, label }, i) => (
              <span
                key={label}
                style={{ animationDelay: `${220 + i * 60}ms` }}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 font-medium',
                  hiwEnter,
                  'motion-safe:fill-mode-backwards',
                )}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="container mx-auto max-w-6xl px-4 py-16" aria-labelledby="hiw-roles-heading">
        <div className="mb-10 text-center">
          <h2
            id="hiw-roles-heading"
            className={cn('mb-2 text-2xl font-bold tracking-tight sm:text-3xl', hiwEnter)}
          >
            Three roles, one platform
          </h2>
          <p className={cn('text-muted-foreground', hiwEnter, 'motion-safe:delay-100')}>
            Every participant benefits from the same transparent deal lifecycle.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {roles.map((role, i) => (
            <div
              key={role.id}
              style={{ animationDelay: `${i * 90}ms` }}
              className={cn(
                'group rounded-xl border p-6',
                hiwEnter,
                hiwCardHover,
                'motion-safe:fill-mode-backwards',
                role.bg,
                role.border,
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg bg-white/60 transition-transform duration-200 dark:bg-black/20',
                    'group-hover:scale-[1.04] motion-reduce:group-hover:scale-100',
                  )}
                >
                  <role.icon className={cn('h-5 w-5', role.color)} aria-hidden />
                </div>
                <h3 className={`font-semibold ${role.color}`}>{role.label}</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                {role.tagline}
              </p>
              <ul className="space-y-2">
                {role.actions.map((action) => (
                  <li key={action} className="flex items-start gap-2 text-sm">
                    <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${role.dotColor}`} />
                    <span className="text-foreground/80">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deal Flow Timeline ── */}
      <section
        className="border-t border-border bg-muted/20 py-16"
        aria-labelledby="hiw-flow-heading"
      >
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className={cn('mb-4', hiwEnter)}>
              The Deal Flow
            </Badge>
            <h2
              id="hiw-flow-heading"
              className={cn('mb-2 text-2xl font-bold tracking-tight sm:text-3xl', hiwEnter, 'motion-safe:delay-75')}
            >
              From deal creation to repayment
            </h2>
            <p className={cn('text-muted-foreground', hiwEnter, 'motion-safe:delay-150')}>
              4 phases, all secured by Stellar smart contracts via Trustless Work.
            </p>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-violet-500 opacity-30 hidden sm:block" />

            <div className="space-y-0">
              {phases.map((phase, index) => (
                <div key={phase.number} className="relative">
                  <div
                    style={{ animationDelay: `${index * 100}ms` }}
                    className={cn('flex gap-5 sm:gap-8', hiwEnter, 'motion-safe:fill-mode-backwards')}
                  >
                    {/* Step circle */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-bold text-lg shadow-md',
                          phase.numBg,
                          hiwPhaseNumPulseClass(phase.number),
                        )}
                      >
                        {phase.number}
                      </div>
                    </div>

                    {/* Content card */}
                    <div
                      className={cn(
                        'group mb-6 flex-1 rounded-xl border border-border bg-background p-5 shadow-sm',
                        hiwCardHover,
                      )}
                    >
                      {/* Header */}
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200',
                              phase.iconBg,
                              'group-hover:scale-[1.05] motion-reduce:group-hover:scale-100',
                            )}
                          >
                            <phase.icon className={cn('h-5 w-5', phase.iconColor)} aria-hidden />
                          </div>
                          <div>
                            <h3 className="font-semibold leading-tight">{phase.title}</h3>
                            <span className={`mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${phase.actorColor}`}>
                              {phase.actor}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                        {phase.description}
                      </p>

                      {/* Actions */}
                      <div className="mb-4 grid gap-1.5 sm:grid-cols-2">
                        {phase.actions.map((action) => (
                          <div key={action.label} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${phase.iconColor}`} />
                            <span className="text-foreground/80">{action.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tech badges */}
                      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                        {phase.tech.map(({ label, icon: Icon }) => (
                          <span
                            key={label}
                            className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                          >
                            <Icon className="h-3 w-3" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow between phases */}
                  {index < phases.length - 1 && (
                    <div className="mb-1 flex items-center justify-center sm:justify-start sm:pl-[3.25rem]">
                      <ArrowDown
                        className="h-5 w-5 text-muted-foreground/40 motion-safe:animate-mercato-flow-down motion-reduce:animate-none"
                        style={{ animationDelay: `${index * 1000}ms` }}
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why MERCATO ── */}
      <section className="container mx-auto max-w-6xl px-4 py-16" aria-labelledby="hiw-why-heading">
        <div className="mb-10 text-center">
          <h2 id="hiw-why-heading" className={cn('mb-2 text-2xl font-bold tracking-tight sm:text-3xl', hiwEnter)}>
            Why MERCATO?
          </h2>
          <p className={cn('text-muted-foreground', hiwEnter, 'motion-safe:delay-100')}>
            Designed from the ground up for fair, transparent supply chain finance.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              style={{ animationDelay: `${i * 80}ms` }}
              className={cn(
                'group rounded-xl border border-border bg-background p-5',
                hiwEnter,
                hiwCardHover,
                'motion-safe:fill-mode-backwards',
              )}
            >
              <div
                className={cn(
                  'mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200',
                  b.bg,
                  'group-hover:scale-[1.05] motion-reduce:group-hover:scale-100',
                )}
              >
                <b.icon className={cn('h-5 w-5', b.color)} aria-hidden />
              </div>
              <h3 className="mb-2 font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Powered by ── */}
      <section className="border-t border-border bg-muted/20 py-10" aria-labelledby="hiw-powered-heading">
        <div className="container mx-auto max-w-4xl px-4">
          <p
            id="hiw-powered-heading"
            className={cn(
              'mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground',
              hiwEnter,
            )}
          >
            Powered by
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {techStack.map((t, i) => (
              <div
                key={t.label}
                style={{ animationDelay: `${i * 70}ms` }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-4 text-center',
                  hiwEnter,
                  hiwCardHover,
                  'motion-safe:fill-mode-backwards',
                )}
              >
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fiat On/Off Ramp ── */}
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div
          className={cn(
            'rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6 sm:p-8',
            hiwEnter,
            hiwCardHover,
          )}
        >
          <div className="flex flex-wrap items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <RefreshCw className="h-6 w-6 text-primary motion-safe:animate-spin motion-safe:[animation-duration:12s] motion-reduce:animate-none" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 text-lg font-semibold">Convert between USDC and local fiat</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Deposit or withdraw via integrated ramp providers. Move money in and out of the
                Stellar ecosystem without leaving the platform.
              </p>
              <div className="flex flex-wrap gap-3">
                {rampProviders.map((p, i) => (
                  <div
                    key={p.name}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={cn(
                      'rounded-lg border border-border bg-background px-4 py-2',
                      hiwEnter,
                      'motion-safe:fill-mode-backwards',
                    )}
                  >
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.region}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href="/dashboard/ramp">
                Add Funds
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-muted/20 py-16" aria-labelledby="hiw-cta-heading">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 id="hiw-cta-heading" className={cn('mb-3 text-2xl font-bold sm:text-3xl', hiwEnter)}>
            Ready to get started?
          </h2>
          <p className={cn('mb-8 text-muted-foreground', hiwEnter, 'motion-safe:delay-100')}>
            Whether you're an SMB seeking financing, an investor seeking yield, or a supplier
            wanting faster payments — MERCATO has you covered.
          </p>
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-3 sm:flex-row',
              hiwEnter,
              'motion-safe:delay-200',
            )}
          >
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/deals">Browse Open Deals</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
