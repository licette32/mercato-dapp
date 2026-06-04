import type { BlogPost } from './types'

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'what-is-a-defindex-vault',
    publishedAt: '2026-06-04',
    readingTimeMinutes: 6,
    category: 'vault',
    tags: ['defindex', 'vault', 'usdc', 'yield', 'stellar'],
    en: {
      title: 'What Is a DeFindex Vault? A Plain-Language Guide',
      description:
        'Learn what a DeFindex vault is, how it holds your USDC, and why Mercato uses one — explained without crypto jargon.',
      excerpt:
        'Think of a vault as a shared, rule-based savings pool that puts idle dollars to work while you stay in control of your wallet.',
      sections: [
        {
          type: 'paragraph',
          text: 'If you have ever wondered why Mercato offers a “vault” alongside deal investing, you are not alone. Most people in supply chain finance have never touched crypto — and they should not need to in order to understand where their money sits and what it is doing.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'The simple idea',
        },
        {
          type: 'paragraph',
          text: 'A DeFindex vault is a smart, automated pool that holds stablecoins (in Mercato’s case, USDC — digital dollars pegged to $1) and allocates them across pre-approved lending strategies on the Stellar network. You deposit USDC, receive vault shares (dfTokens) that represent your portion of the pool, and can withdraw when you need liquidity.',
        },
        {
          type: 'callout',
          title: 'No crypto degree required',
          text: 'You do not “trade” inside the vault. You deposit dollars, earn yield while they sit idle, and withdraw when you are ready to fund a deal or move cash back to your wallet.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'How is this different from a bank savings account?',
        },
        {
          type: 'list',
          items: [
            'Transparency — balances and rules live on a public ledger anyone can audit.',
            'Non-custodial — Mercato never holds your private keys; you sign deposits and withdrawals from your own wallet.',
            'Programmable — the vault only moves funds according to its coded rules and approved strategies.',
            'Composable — yield earned in the vault can later flow into Mercato deal escrows when you invest.',
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Why Mercato uses a vault',
        },
        {
          type: 'paragraph',
          text: 'Investors on Mercato often have USDC sitting between deals — capital that is not yet allocated to a PyME purchase order. Instead of leaving that cash idle, the Mercato vault puts it to work in low-risk, on-chain lending markets while preserving quick access when a new deal appears.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'What you actually own',
        },
        {
          type: 'paragraph',
          text: 'When you deposit $1,000 USDC, the vault mints dfTokens to your wallet. Those tokens are your receipt — they track your share of the total pool. If the pool grows from yield, your share is worth more USDC when you withdraw. If other investors also deposit, the pool is larger but your percentage share reflects exactly what you contributed.',
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Is my money locked forever?',
              answer:
                'No. You can withdraw your share from the Mercato vault when liquidity is available. Withdrawals are initiated from your wallet, just like deposits.',
            },
            {
              question: 'Can Mercato take my funds?',
              answer:
                'Mercato cannot move vault funds on your behalf. Only your wallet signature authorizes deposits and withdrawals. The vault contract enforces the rules on-chain.',
            },
            {
              question: 'Is this the same as investing in a deal?',
              answer:
                'No. The vault is for idle USDC earning baseline yield. Deal investing funds a specific PyME escrow with its own term and return. Many investors use both: vault for parking cash, deals for targeted returns.',
            },
          ],
        },
      ],
    },
    es: {
      title: '¿Qué es un vault DeFindex? Guía en lenguaje claro',
      description:
        'Qué es un vault DeFindex, cómo guarda tu USDC y por qué Mercato lo usa — sin jerga crypto.',
      excerpt:
        'Un vault es un fondo compartido con reglas claras que pone dólares ociosos a trabajar mientras tú mantienes el control de tu billetera.',
      sections: [
        {
          type: 'paragraph',
          text: 'Si alguna vez te preguntaste por qué Mercato ofrece un “vault” además de invertir en órdenes, no estás solo. La mayoría de quienes operan en cadena de suministro nunca ha usado crypto — y no deberían necesitarlo para entender dónde está su dinero.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'La idea simple',
        },
        {
          type: 'paragraph',
          text: 'Un vault DeFindex es un fondo automatizado que guarda stablecoins (en Mercato, USDC — dólares digitales anclados a $1) y las asigna a estrategias de préstamo aprobadas en Stellar. Depositas USDC, recibes participaciones del vault (dfTokens) y puedes retirar cuando necesites liquidez.',
        },
        {
          type: 'callout',
          title: 'Sin ser experto en crypto',
          text: 'No “operas” dentro del vault. Depositas dólares, ganas rendimiento mientras esperas, y retiras cuando quieras financiar una orden o volver a tu billetera.',
        },
        {
          type: 'heading',
          level: 2,
          text: '¿En qué se diferencia de una cuenta de ahorro?',
        },
        {
          type: 'list',
          items: [
            'Transparencia — saldos y reglas en un libro público auditable.',
            'No custodial — Mercato no guarda tus claves; tú firmas depósitos y retiros.',
            'Programable — el vault solo mueve fondos según reglas y estrategias aprobadas.',
            'Integrable — el rendimiento del vault puede pasar después a escrows de Mercato.',
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Por qué Mercato usa un vault',
        },
        {
          type: 'paragraph',
          text: 'Los inversionistas suelen tener USDC entre órdenes — capital aún no asignado. En lugar de dejarlo quieto, el vault de Mercato lo coloca en mercados de préstamo on-chain de bajo riesgo, con acceso rápido cuando aparece una nueva oportunidad.',
        },
        {
          type: 'faq',
          items: [
            {
              question: '¿Mi dinero queda bloqueado para siempre?',
              answer:
                'No. Puedes retirar tu participación cuando haya liquidez. Los retiros se inician desde tu billetera, igual que los depósitos.',
            },
            {
              question: '¿Mercato puede tomar mis fondos?',
              answer:
                'Mercato no puede mover fondos del vault por ti. Solo tu firma autoriza depósitos y retiros.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'why-vaults-earn-yield',
    publishedAt: '2026-06-04',
    readingTimeMinutes: 7,
    category: 'vault',
    tags: ['yield', 'apy', 'defindex', 'lending', 'usdc'],
    en: {
      title: 'Why Do You Earn More Money in a Vault?',
      description:
        'Understand where vault yield comes from, why APY changes, and what risks non-crypto investors should know.',
      excerpt:
        'Vault yield is not magic — it is interest paid by borrowers who use the liquidity your USDC provides.',
      sections: [
        {
          type: 'paragraph',
          text: '“Why am I earning more just for parking money in the vault?” That is the right question. The answer is the same economic idea as a money-market fund or savings account — but with blockchain transparency and without a bank sitting in the middle.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'Where the yield comes from',
        },
        {
          type: 'paragraph',
          text: 'When you deposit USDC into the Mercato DeFindex vault, the vault allocates that liquidity to approved DeFi lending strategies on Stellar. Borrowers pay interest to access that liquidity. A portion of that interest flows back to vault depositors — that is your yield.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'You deposit USDC and receive dfTokens (your share of the pool).',
            'The vault deploys pooled USDC into lending markets via DeFindex strategies.',
            'Borrowers pay interest; the vault balance grows over time.',
            'Your dfTokens represent a larger USDC value when you withdraw.',
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Why APY goes up and down',
        },
        {
          type: 'paragraph',
          text: 'The displayed APY (Annual Percentage Yield) is an estimate based on recent strategy performance. It is not a guaranteed fixed rate like a CD. When demand to borrow USDC rises, rates tend to rise; when markets are quiet, rates fall. Mercato shows the current vault APY so you can compare idle cash vs. deal investments.',
        },
        {
          type: 'callout',
          title: 'Yield vs. deal returns',
          text: 'Vault yield is steady, pool-based income on idle cash. Deal investing targets higher, deal-specific returns but ties your capital to one PyME transaction for a defined term. They solve different jobs in your portfolio.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'What about risk?',
        },
        {
          type: 'paragraph',
          text: 'No yield product is risk-free. Vault strategies carry smart-contract risk, market liquidity risk, and strategy-specific risk. DeFindex vaults use audited contracts and diversified strategies, but you should treat vault yield as incremental return on cash you already hold in USDC — not as a substitute for due diligence on deal investments.',
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Do I need to claim yield manually?',
              answer:
                'No. Yield accrues inside the vault. Your share value increases; you realize gains when you withdraw USDC.',
            },
            {
              question: 'Why is my balance slightly different from what I deposited?',
              answer:
                'Small differences can reflect accrued yield, rounding, or timing between deposit and the next strategy rebalance. Your My Positions tab shows your current vault value and share of the pool.',
            },
            {
              question: 'Can I lose money?',
              answer:
                'Yes, in extreme scenarios (strategy failure, smart-contract exploit, or illiquidity). Mercato selects established DeFindex infrastructure, but all on-chain finance carries residual risk.',
            },
          ],
        },
      ],
    },
    es: {
      title: '¿Por qué ganas más dinero en un vault?',
      description:
        'De dónde sale el rendimiento del vault, por qué cambia el APY y qué riesgos debe conocer un inversionista sin experiencia crypto.',
      excerpt:
        'El rendimiento no es magia — es interés pagado por quienes piden prestada la liquidez que aporta tu USDC.',
      sections: [
        {
          type: 'paragraph',
          text: '“¿Por qué gano más solo por dejar dinero en el vault?” Es la pregunta correcta. La respuesta es la misma lógica que un fondo de mercado monetario — pero con transparencia blockchain y sin un banco intermediario.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'De dónde sale el rendimiento',
        },
        {
          type: 'paragraph',
          text: 'Al depositar USDC en el vault DeFindex de Mercato, el fondo asigna esa liquidez a estrategias de préstamo aprobadas en Stellar. Los prestatarios pagan interés; parte vuelve a los depositantes — ese es tu rendimiento.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'Por qué el APY sube y baja',
        },
        {
          type: 'paragraph',
          text: 'El APY mostrado es una estimación según el rendimiento reciente de las estrategias. No es una tasa fija garantizada. Cuando aumenta la demanda de préstamos en USDC, las tasas suelen subir; cuando el mercado está quieto, bajan.',
        },
        {
          type: 'faq',
          items: [
            {
              question: '¿Debo reclamar el rendimiento manualmente?',
              answer:
                'No. El rendimiento se acumula dentro del vault. Tu participación vale más en USDC al retirar.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'how-mercato-vault-fits-your-investing',
    publishedAt: '2026-06-04',
    readingTimeMinutes: 5,
    category: 'guides',
    tags: ['mercato', 'investors', 'vault', 'deals', 'portfolio'],
    en: {
      title: 'How the Mercato Vault Fits Your Investing Workflow',
      description:
        'A practical guide for investors: park USDC in the vault between deals, track your share, and move capital into escrows when you are ready.',
      excerpt:
        'Use the vault as your liquid staging area — earn on idle USDC, then deploy into deals without leaving Mercato.',
      sections: [
        {
          type: 'paragraph',
          text: 'Mercato investors typically juggle two questions: “Where should idle USDC sit?” and “Which deal should I fund next?” The vault answers the first. Deal marketplace answers the second.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'A simple workflow',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'On-ramp or transfer USDC to your Mercato-linked Stellar wallet.',
            'Deposit a portion into the Mercato vault to earn baseline yield.',
            'Monitor My Positions — see your vault value, share of the pool, and deposit history.',
            'When a deal matches your criteria, withdraw from the vault (or use wallet USDC) and fund the escrow.',
            'At repayment, principal and yield return to your wallet — optionally redeposit to the vault.',
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Reading “My Positions”',
        },
        {
          type: 'paragraph',
          text: 'The My Positions tab shows three things non-crypto users care about: how much is yours, how much belongs to other depositors in the same vault, and a ledger of your deposits and withdrawals. You always know what fraction of the pool you own — important when the vault holds capital from many investors.',
        },
        {
          type: 'callout',
          title: 'Shared pool, clear ownership',
          text: 'The vault TVL (total value locked) is the sum of everyone’s USDC. Your contribution and percentage are displayed separately so you never confuse pool size with personal balance.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'When the vault is not enough',
        },
        {
          type: 'paragraph',
          text: 'Vault yield is designed for liquidity and steady incremental return. If you want higher, deal-specific returns tied to a PyME repayment, fund escrows on the marketplace. Mercato is built so both products coexist — vault for waiting, deals for deploying.',
        },
        {
          type: 'paragraph',
          text: 'Ready to try it? Connect your wallet, open Vaults in the dashboard, and start with a small deposit. You can always withdraw and compare your experience against traditional idle cash.',
        },
      ],
    },
    es: {
      title: 'Cómo encaja el vault de Mercato en tu forma de invertir',
      description:
        'Guía práctica: guarda USDC en el vault entre órdenes, sigue tu participación y mueve capital al escrow cuando estés listo.',
      excerpt:
        'Usa el vault como área de espera líquida — gana con USDC ocioso y luego despliega en órdenes sin salir de Mercato.',
      sections: [
        {
          type: 'paragraph',
          text: 'Los inversionistas en Mercato suelen preguntarse: “¿Dónde dejo USDC ocioso?” y “¿Qué orden financio después?”. El vault responde lo primero; el marketplace, lo segundo.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'Flujo simple',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Recibe USDC en tu billetera Stellar vinculada a Mercato.',
            'Deposita una parte en el vault de Mercato para rendimiento base.',
            'Revisa My Positions — valor, participación en el fondo e historial.',
            'Cuando una orden encaje, retira del vault y financia el escrow.',
            'Al reembolso, vuelve capital a tu billetera — opcionalmente redeposita.',
          ],
        },
        {
          type: 'paragraph',
          text: '¿Listo? Conecta tu billetera, abre Vaults en el panel y prueba con un depósito pequeño.',
        },
      ],
    },
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  )
}

export function getBlogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug)
}
