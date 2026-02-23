# MERCATO — Architecture Documentation

**Supply chain finance, transparently secured.**

This document describes the MERCATO application architecture: what it does, which tools and Stellar-based projects it uses, and how ramp providers integrate. Diagrams use [Mermaid](https://mermaid.js.org/) and render in GitHub, GitLab, and most Markdown viewers.

---

## 1. High-Level System Overview

```mermaid
flowchart TB
  subgraph Users["Users"]
    PyME[PyME]
    Investor[Investor]
    Supplier[Supplier]
  end

  subgraph App["MERCATO Application"]
    Next[Next.js App]
    API[API Routes]
  end

  subgraph AuthAndData["Auth & Data"]
    Supabase[Supabase<br/>Auth + Postgres]
  end

  subgraph Stellar["Stellar Ecosystem"]
    Trustless[Trustless Work API]
    StellarNet[Stellar Network]
    Wallets[Stellar Wallets Kit<br/>Freighter, Albedo]
  end

  subgraph Ramps["Fiat On/Off Ramps"]
    Etherfuse[Etherfuse]
    AlfredPay[Alfred Pay]
    BlindPay[BlindPay]
  end

  PyME --> Next
  Investor --> Next
  Supplier --> Next
  Next --> API
  Next --> Supabase
  API --> Supabase
  Next --> Wallets
  Next --> Trustless
  API --> Etherfuse
  API --> AlfredPay
  API --> BlindPay
  Trustless --> StellarNet
  Wallets --> StellarNet
  Ramps -.-> StellarNet
```

**Summary:** MERCATO is a web app that connects **PyMEs**, **investors**, and **suppliers** through blockchain-secured escrow. Auth and deal data live in **Supabase**; escrow and payments are **non-custodial** on **Stellar** via **Trustless Work**. Users can move fiat to/from Stellar assets via configurable **ramp** providers (Etherfuse, AlfredPay, BlindPay).

---

## 2. What the Application Does

### 2.1 Core Flows

```mermaid
sequenceDiagram
  participant PyME
  participant App
  participant Trustless
  participant Stellar
  participant Investor
  participant Supplier

  Note over PyME,Supplier: 1. PyME creates deal & deploys escrow
  PyME->>App: Create deal (basics, supplier, milestones)
  App->>Trustless: Initialize multi-release escrow
  Trustless->>Stellar: Deploy escrow contract
  PyME->>Stellar: Sign with wallet (Freighter/Albedo)
  Stellar-->>App: Escrow address

  Note over PyME,Supplier: 2. Investors fund the deal
  Investor->>App: Browse marketplace, select deal
  Investor->>Stellar: Fund escrow in USDC (wallet)

  Note over PyME,Supplier: 3. Supplier delivers; milestones released
  Supplier->>App: Submit delivery proof
  PyME->>App: Approve milestone
  App->>Trustless: Request release
  Trustless->>Stellar: Release payment to supplier

  Note over PyME,Supplier: 4. PyME repays investors
  PyME->>Stellar: Repay principal + yield (after term)
```

### 2.2 User Roles and Capabilities

| Role      | Main actions |
|----------|--------------|
| **PyME** | Create deal, configure milestones, approve releases, repay investors; connect Stellar wallet for escrow deployment. |
| **Investor** | Browse marketplace, fund deals in USDC; funds locked in escrow until milestones. |
| **Supplier** | Profile in directory, submit delivery proof; receive milestone payments to Stellar address. |

### 2.3 Application Structure (Routes)

```mermaid
flowchart LR
  subgraph Public["Public"]
    Landing["/"]
    How["/how-it-works"]
    Market["/marketplace"]
    Auth["/auth/login, sign-up"]
  end

  subgraph Dashboard["Dashboard"]
    Dash["/dashboard"]
    CreateDeal["/dashboard/create-deal"]
    Ramp["/dashboard/ramp"]
    SupplierProfile["/dashboard/supplier-profile"]
    Settings["/dashboard/settings"]
  end

  subgraph Deals["Deals"]
    DealDetail["/deals/[id]"]
  end

  subgraph Suppliers["Suppliers"]
    SuppliersDir["/suppliers"]
  end

  Landing --> How
  Landing --> Market
  Market --> DealDetail
  Auth --> Dash
  Dash --> CreateDeal
  Dash --> Ramp
  Dash --> SupplierProfile
  Dash --> Settings
```

---

## 3. Tools and Tech Stack

```mermaid
flowchart TB
  subgraph Frontend["Frontend"]
    Next["Next.js 16"]
    React["React 19"]
    Tailwind["Tailwind CSS"]
    Shadcn["shadcn/ui"]
    Themes["next-themes"]
  end

  subgraph Backend["Backend / API"]
    NextAPI["Next.js API Routes"]
  end

  subgraph AuthDB["Auth & Database"]
    Supabase["Supabase"]
    Postgres["Postgres"]
    Supabase --> Postgres
  end

  subgraph StellarStack["Stellar Stack"]
    TrustlessPkg["@trustless-work/escrow"]
    StellarSDK["@stellar/stellar-sdk"]
    WalletKit["@creit.tech/stellar-wallets-kit"]
  end

  subgraph RampLib["Ramp Integration"]
    Anchors["lib/anchors (Etherfuse, AlfredPay, BlindPay)"]
    SEP["SEP protocol lib (SEP-1, 6, 10, 12, 24, 31, 38)"]
  end

  Next --> React
  Next --> Tailwind
  Next --> Shadcn
  Next --> NextAPI
  NextAPI --> Supabase
  NextAPI --> Anchors
  Next --> TrustlessPkg
  Next --> StellarSDK
  Next --> WalletKit
  Anchors --> SEP
```

| Layer        | Technology |
|-------------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, shadcn/ui, next-themes (light/dark) |
| **Auth & DB** | Supabase (Auth, Postgres) |
| **Escrow** | Trustless Work API + Stellar (non-custodial) |
| **Wallets** | Stellar Wallets Kit (Freighter, Albedo) |
| **Ramps** | Custom anchor clients (Etherfuse, AlfredPay, BlindPay) + optional SEP modules |

---

## 4. Stellar and Trustless Work (Trustless Escrow)

Escrow is **non-custodial**: funds sit in a Stellar contract; the platform does not hold them. **Trustless Work** provides the API and contract logic; the PyME signs deployment with their Stellar wallet.

### 4.1 Trustless Work in the Stack

```mermaid
flowchart LR
  subgraph App["MERCATO App"]
    Config["TrustlessWorkProvider\n(config)"]
    Hooks["useInitializeEscrow\nuseSendTransaction"]
    Wallet["signTransaction\n(wallet-kit)"]
  end

  subgraph Trustless["Trustless Work"]
    API["Trustless Work API"]
  end

  subgraph Stellar["Stellar"]
    Contract["Multi-release escrow contract"]
    USDC["USDC trustline"]
  end

  Config --> Hooks
  Hooks --> API
  Hooks --> Wallet
  Wallet --> Stellar
  API --> Contract
  Contract --> USDC
```

### 4.2 Escrow Configuration (from app)

- **Platform address** (`NEXT_PUBLIC_MERCATO_PLATFORM_ADDRESS`): Used as `releaseSigner`, `disputeResolver`, and `platformAddress` in escrow roles.
- **USDC trustline** (`NEXT_PUBLIC_TRUSTLESSLINE_ADDRESS`): Stellar asset (trustline contract) used for escrow payments.
- **Network**: `testnet` or `mainnet` via `NEXT_PUBLIC_TRUSTLESS_NETWORK`.

### 4.3 Escrow Flow (Create Deal)

```mermaid
sequenceDiagram
  participant User
  participant CreateDeal
  participant useEscrow
  participant TrustlessAPI
  participant Wallet
  participant Stellar

  User->>CreateDeal: Submit deal (milestones, supplier, approver)
  CreateDeal->>useEscrow: initializeAndDeployEscrow(params)
  useEscrow->>TrustlessAPI: deployEscrow(payload)
  TrustlessAPI-->>useEscrow: Unsigned XDR
  useEscrow->>Wallet: signTransaction(XDR)
  User->>Wallet: Approve in Freighter/Albedo
  Wallet-->>useEscrow: Signed XDR
  useEscrow->>Stellar: sendTransaction(signed)
  Stellar-->>CreateDeal: escrow address / tx hash
```

---

## 5. Ramp Providers (Fiat On/Off)

MERCATO supports **multiple ramp providers**. Users choose one in the UI; the app proxies all anchor calls through **API routes** so API keys stay server-side.

### 5.1 Ramp Providers Overview

```mermaid
flowchart TB
  subgraph UI["Dashboard Ramp UI"]
    RampPage["/dashboard/ramp"]
    ProviderSelect["Provider selector"]
    OnRampForm["On-ramp form"]
    OffRampForm["Off-ramp form"]
  end

  subgraph API["API Routes (server)"]
    ConfigAPI["/api/ramp/config"]
    CustomerAPI["/api/ramp/customer"]
    QuoteAPI["/api/ramp/quote"]
    OnRampAPI["/api/ramp/on-ramp"]
    OffRampAPI["/api/ramp/off-ramp"]
    KYCAPI["/api/ramp/kyc-url, kyc-status"]
    BlindPayAPIs["/api/ramp/blindpay/*"]
  end

  subgraph Anchors["Anchor Clients (lib/anchors)"]
    Etherfuse["Etherfuse"]
    AlfredPay["Alfred Pay"]
    BlindPay["BlindPay"]
  end

  subgraph External["External"]
    EtherfuseAPI["Etherfuse API"]
    AlfredPayAPI["Alfred Pay API"]
    BlindPayAPI["BlindPay API"]
  end

  RampPage --> ProviderSelect
  RampPage --> OnRampForm
  RampPage --> OffRampForm
  OnRampForm --> CustomerAPI
  OnRampForm --> QuoteAPI
  OnRampForm --> OnRampAPI
  OffRampForm --> OffRampAPI
  ProviderSelect --> ConfigAPI
  ConfigAPI --> Anchors
  CustomerAPI --> Anchors
  QuoteAPI --> Anchors
  OnRampAPI --> Anchors
  OffRampAPI --> Anchors
  KYCAPI --> Anchors
  BlindPayAPIs --> BlindPay
  Etherfuse --> EtherfuseAPI
  AlfredPay --> AlfredPayAPI
  BlindPay --> BlindPayAPI
```

### 5.2 Ramp Companies and Capabilities

| Provider    | Region / focus     | Fiat rail | Stellar asset | KYC flow   | Off-ramp signing |
|------------|--------------------|-----------|----------------|------------|-------------------|
| **Etherfuse** | Mexico             | SPEI      | USDC, CETES    | Iframe     | Deferred (poll for XDR, then sign) |
| **Alfred Pay** | Latin America      | SPEI      | USDC           | Form       | Standard          |
| **BlindPay**  | Global             | Multiple  | USDB           | Redirect   | Anchor payout submission |

Provider availability is driven by **environment variables**; `getConfiguredProviders()` returns only anchors with all required env vars set. Users see and select from this list on the ramp page.

### 5.3 Ramp Data Flow (On-ramp example)

```mermaid
sequenceDiagram
  participant User
  participant RampUI
  participant API
  participant Anchor
  participant External

  User->>RampUI: Enter amount, request quote
  RampUI->>API: POST /api/ramp/customer (if needed)
  API->>Anchor: createCustomer / getCustomer
  Anchor->>External: Anchor API
  External-->>API-->>RampUI: customer

  RampUI->>API: POST /api/ramp/quote
  API->>Anchor: getQuote(...)
  Anchor->>External: Quote API
  External-->>API-->>RampUI: quote

  User->>RampUI: Confirm, start on-ramp
  RampUI->>API: POST /api/ramp/on-ramp
  API->>Anchor: createOnRamp(...)
  Anchor->>External: Create order
  External-->>API-->>RampUI: payment instructions (e.g. CLABE)

  User->>External: Send fiat (e.g. SPEI)
  Note over User,External: Poll GET /api/ramp/on-ramp/[id] until completed
  External->>Stellar: Credit user wallet (e.g. USDC)
```

---

## 6. Data and Responsibility Split

```mermaid
flowchart LR
  subgraph Supabase["Supabase (Postgres)"]
    Profiles["profiles"]
    Deals["deals"]
    Milestones["milestones"]
    SupplierCompanies["supplier_companies"]
    SupplierProducts["supplier_products"]
  end

  subgraph Stellar["Stellar Network"]
    EscrowState["Escrow contract state"]
    Balances["USDC balances"]
    TxHistory["Transaction history"]
  end

  App["MERCATO App"] --> Profiles
  App --> Deals
  App --> Milestones
  App --> SupplierCompanies
  App --> SupplierProducts
  App --> EscrowState
  App --> Balances
  App --> TxHistory
```

- **Supabase**: Users, profiles, roles, deal metadata, milestones, supplier directory and products. Source of truth for “who created what” and milestone approval state.
- **Stellar**: Escrow deployment, USDC locking, milestone releases, repayments. Source of truth for funds and on-chain escrow state.

---

## 7. Environment and External Services

```mermaid
flowchart TB
  subgraph Env["Environment Variables"]
    SupabaseEnv["NEXT_PUBLIC_SUPABASE_*"]
    TrustlessEnv["NEXT_PUBLIC_TRUSTLESS_*\nNEXT_PUBLIC_MERCATO_PLATFORM_*\nNEXT_PUBLIC_TRUSTLESSLINE_*"]
    EtherfuseEnv["ETHERFUSE_API_KEY\nETHERFUSE_BASE_URL"]
    AlfredEnv["ALFREDPAY_API_KEY\nALFREDPAY_API_SECRET\nALFREDPAY_BASE_URL"]
    BlindEnv["BLINDPAY_API_KEY\nBLINDPAY_INSTANCE_ID\nBLINDPAY_BASE_URL"]
  end

  subgraph Services["External Services"]
    SupabaseSvc[Supabase]
    TrustlessSvc[Trustless Work]
    EtherfuseSvc[Etherfuse]
    AlfredSvc[Alfred Pay]
    BlindSvc[BlindPay]
  end

  SupabaseEnv --> SupabaseSvc
  TrustlessEnv --> TrustlessSvc
  EtherfuseEnv --> EtherfuseSvc
  AlfredEnv --> AlfredSvc
  BlindEnv --> BlindSvc
```

- **Supabase**: Auth and Postgres (profiles, deals, milestones, suppliers).
- **Trustless Work**: Escrow API and Stellar contract deployment/management.
- **Ramp providers**: One or more of Etherfuse, AlfredPay, BlindPay; only those with env vars set are exposed in `/api/ramp/config`.

---

## 8. Summary Diagram

Single-page overview of **what MERCATO uses** and **what it does**:

```mermaid
flowchart TB
  subgraph What["What MERCATO does"]
    D1["PyMEs get working capital via escrow"]
    D2["Investors fund deals in USDC for yield"]
    D3["Suppliers get milestone payments on-chain"]
    D4["Users ramp fiat ↔ USDC via chosen anchor"]
  end

  subgraph Tools["What MERCATO uses"]
    T1["Next.js, React, Tailwind, shadcn/ui"]
    T2["Supabase (Auth + Postgres)"]
    T3["Trustless Work API + Stellar"]
    T4["Stellar Wallets Kit (Freighter, Albedo)"]
    T5["Etherfuse / Alfred Pay / BlindPay"]
  end

  What --> Tools
```

---

## References

- [Trustless Work](https://docs.trustlesswork.com/) — Escrow API and Stellar integration
- [Stellar](https://stellar.org) — Network and assets
- [Stellar Wallets Kit](https://stellarwalletskit.dev/) — Wallet connection (Freighter, Albedo)
- [Supabase](https://supabase.com) — Auth and database
- [lib/anchors/README.md](../lib/anchors/README.md) — Anchor interface and ramp provider details
