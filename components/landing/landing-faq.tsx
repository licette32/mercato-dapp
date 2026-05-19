'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useReveal } from '@/lib/landing/use-scroll-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircleQuestion } from 'lucide-react'

const FAQ_ITEMS = [
  {
    id: 'what-is-mercato',
    question: 'What is Mercato?',
    answer:
      'Mercato is a supply chain finance marketplace for Latin America. SMEs post real purchase orders, investors fund them through milestone escrow on Stellar, and suppliers get paid as goods move — all tied to one transparent deal.',
  },
  {
    id: 'who-can-use',
    question: 'Who can use the platform?',
    answer:
      'SMEs (buyers) create and manage purchase orders. Investors browse open deals and fund escrow. Verified suppliers fulfill orders and receive milestone payments. Each role has a dedicated flow after signing up.',
  },
  {
    id: 'how-funded',
    question: 'How are deals funded?',
    answer:
      'Once an SME publishes a PO, investors commit USDC into a non-custodial escrow contract. Capital stays locked until predefined milestones — such as production start or delivery — are confirmed on-chain.',
  },
  {
    id: 'milestones',
    question: 'What are payment milestones?',
    answer:
      'Milestones split the deal into stages (for example 50% on shipment, 50% on delivery). Funds release to the supplier only when the agreed proof is submitted and approved, reducing risk for every party.',
  },
  {
    id: 'investor-risk',
    question: 'How is investor capital protected?',
    answer:
      'Your funds are held in escrow and tied to a specific purchase order — not a generic credit line. You see the product, supplier, terms, and APR upfront, and releases are gated by milestones rather than discretionary payouts.',
  },
  {
    id: 'supplier-payment',
    question: 'When do suppliers get paid?',
    answer:
      'After the deal is funded, payments release at each confirmed milestone. Suppliers know funds are secured before production starts, instead of waiting on long invoice cycles after delivery.',
  },
  {
    id: 'stellar',
    question: 'Why Stellar?',
    answer:
      'Stellar enables fast, low-cost USDC settlement and transparent on-chain escrow. Mercato integrates with the Stellar ecosystem — including partners like Trustless Work — for milestone-based trade finance.',
  },
  {
    id: 'get-started',
    question: 'How do I get started?',
    answer:
      'Create a free account, choose your role (SME, investor, or supplier), and follow the guided flows. SMEs can create a deal in minutes; investors can browse open deals immediately after signing up.',
  },
] as const

export function LandingFaq() {
  const { ref, visible } = useReveal<HTMLElement>(0.12)

  return (
    <section
      ref={ref}
      className="border-t border-border/50 bg-brand-ultra/30 py-20 dark:bg-muted/40 md:py-24"
      aria-labelledby="landing-faq-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div
            className={cn(
              'relative isolate mb-10 text-center md:mb-12',
              'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
          >
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-mid">
              <MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden />
              FAQ
            </p>
            <h2
              id="landing-faq-heading"
              className="font-display text-[clamp(1.85rem,4vw,2.75rem)] font-normal leading-[1.08] tracking-tight text-foreground text-balance"
            >
              Questions before you{' '}
              <span className="text-brand-mid dark:text-brand-light">join the flow.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              How funding works, who participates, and what keeps capital safe on Mercato.
            </p>
          </div>

          <div
            className={cn(
              'transition-all duration-700 delay-100 motion-reduce:transition-none',
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
          >
            <Accordion
              type="single"
              collapsible
              className="space-y-3"
              defaultValue="what-is-mercato"
            >
              {FAQ_ITEMS.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-background/90 px-5 shadow-sm data-[state=open]:border-brand-light/40 data-[state=open]:shadow-md dark:bg-card/80"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline [&[data-state=open]]:text-brand-mid dark:[&[data-state=open]]:text-brand-light">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                variant="outline"
                asChild
                className="rounded-full border-brand-mid/30 px-6 font-semibold text-brand-mid hover:bg-brand-pale/80 dark:text-brand-light"
              >
                <Link href="/how-it-works">
                  Full walkthrough
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-brand-mid px-6 font-semibold text-white shadow-glow-brand hover:bg-brand-dark"
              >
                <Link href="/auth/sign-up">Create free account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
