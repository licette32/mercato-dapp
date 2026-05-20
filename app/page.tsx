import { Navigation } from '@/components/navigation'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingRoles } from '@/components/landing/landing-roles'
import { LandingRateComparison } from '@/components/landing/landing-rate-comparison'
import { OrderFlow } from '@/components/landing/order-flow'
import { LandingCta } from '@/components/landing/landing-cta'
import { LandingLiveDeals } from '@/components/landing/landing-live-deals'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingHashScroll } from '@/components/landing/landing-hash-scroll'
import { LandingHowItWorksIntro, LandingPartnersStrip } from '@/components/landing/landing-page-intro'

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Navigation />
      <LandingHashScroll />

      <LandingHero />

      <LandingRoles />

      <LandingRateComparison />

      <section
        id="how-it-works"
        className="landing-section-anchor relative overflow-hidden bg-background py-24 md:py-32"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--brand-pale)/0.5),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(0_0%_100%/0.03),transparent)]"
          aria-hidden
        />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <LandingHowItWorksIntro />
            <OrderFlow />
          </div>
        </div>
      </section>

      <LandingPartnersStrip />

      <LandingCta />

      <section className="border-t border-border/50 bg-background">
        <LandingLiveDeals />
      </section>

      <LandingFaq />

      <LandingFooter />
    </div>
  )
}
