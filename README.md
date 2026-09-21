# Digital Heroes — Full-Stack Platform

> **Performance • Prize • Purpose**  
> A subscription-based consumer platform combining golf performance tracking (rolling 5-score Stableford window), monthly algorithmic & random prize draws, and transparent direct charity fundraising.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App Router                           │
│     (TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌───────────────────┐       ┌──────────────────┐
│  Public Web  │          │   Subscriber Hub  │       │   Admin Suite    │
│  • Homepage  │          │ • 5-Score Tracker │       │ • Draws & Sim    │
│  • Spotlight │          │ • Next Countdown  │       │ • Winners Audit  │
│  • Directory │          │ • Charity Slider  │       │ • User Accounts  │
│  • Subscribe │          │ • Proof Upload    │       │ • Charity CMS    │
│  • Mechanics │          │ • Lifetime Wins   │       │ • Analytics (Re) │
└──────────────┘          └───────────────────┘       └──────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Deterministic Core Engine                        │
│             (/src/lib/draw/engine.ts — 100% Test Coverage)             │
│ • Scalable pool calculation ($10/subscriber)                           │
│ • 40% Tier 1 (Rollover Jackpot) / 35% Tier 2 / 25% Tier 3              │
│ • Algorithmic score consistency weighting vs. Random Lottery           │
│ • Equal prize division among multiple winners                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┴────────────────────────────┐
      ▼                                                         ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────┐
│     Supabase Postgres & Storage      │     │      Stripe Billing Integration   │
│ • Row Level Security (RLS) policies  │     │ • Test Mode Checkout Sessions     │
│ • Rolling 5-score DB trigger eviction│     │ • Webhooks for subscription states│
│ • Proof image screenshot storage     │     │ • Monthly ($19) & Yearly ($190)   │
└──────────────────────────────────────┘     └───────────────────────────────────┘
```

---

## 2. Ambiguity Resolutions (PRD Clarifications)

As specified in the PRD, intentional ambiguities have been formally resolved as follows:

| Ambiguity | Resolution & Implementation | Rationale |
| :--- | :--- | :--- |
| **Yearly Plan Savings %** | **$190/year** vs. $19/month = **17% Savings (2 Months Free)** | Industry-standard consumer subscription pricing that maximizes annual conversions. |
| **Algorithmic Weighting Formula** | $W = 1.0 + \left(\frac{\text{Count}}{5} \times 1.0\right) + \text{Consistency Bonus (0.1–0.5)}$ | Rewards players who log all 5 rolling scores ($+1.0$) and rewards lower standard deviation in Stableford scores ($+0.1\text{ to }+0.5$). |
| **Rolling 5 Eviction Order** | Evicts oldest round by `date ASC, created_at ASC` | Strict rolling window ensures current form is reflected while discarding historical rounds. |
| **Jackpot Rollover Rule** | Only **Tier 1 (5 matches)** rolls over if 0 winners. Tiers 2 & 3 do not roll over. | Preserves huge, escalating headline jackpots while awarding recreational tiers every cycle. |
| **Charity Allocation Baseline** | Minimum **10%** mandatory contribution. Voluntary slider allows up to **50%**. | Ensures every active subscriber supports grass-roots causes with player agency. |

---

## 3. Test Credentials & Evaluator Switcher

The top navigation bar includes an **Evaluator Persona Switcher** dropdown for instantaneous multi-role review:

| Role | Name | Email / ID | Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | Marcus Vance | `admin@digitalheroes.org` / `admin-001` | Full control: configure draws, simulate dry-runs, publish draws, review winner proofs, edit user scores, charity CMS, analytics. |
| **Active Subscriber** | Alex Morgan | `alex.morgan@example.com` / `sub-001` | Active rolling 5 scores, draw eligibility, charity slider (15%), proof upload. |
| **Active Subscriber** | Sarah Jenkins | `sarah.jenkins@example.com` / `sub-002` | Active subscriber, designated to Veterans On The Green (25%). |
| **Past Due / Lapsed** | Elena Rostova | `elena.rostova@example.com` / `sub-004` | Demonstrates server-side restriction: cannot log scores or enter draws until payment is updated. |

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 18+ or 20+ (developed and tested on Node v24)
- npm 10+

### Installation
```bash
# Clone repository and enter directory
cd "Digital Heroes"

# Install dependencies
npm install

# Run isolated unit test suite (Vitest)
npm run test

# Run End-to-End API and Business Logic verification
node scripts/verify-e2e.mjs

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 5. Environment Variables (`.env.example`)

```ini
# Supabase PostgreSQL & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Test Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Database Migrations & Seeds

The full SQL schema with Row Level Security (RLS) policies and PostgreSQL triggers is located at:
- Schema Migration: [`supabase/migrations/01_initial_schema.sql`](supabase/migrations/01_initial_schema.sql)
- Seed Data: [`supabase/seed.sql`](supabase/seed.sql)

To apply to your live Supabase project:
1. Open your Supabase Project Dashboard $\rightarrow$ **SQL Editor**.
2. Run `supabase/migrations/01_initial_schema.sql`.
3. Run `supabase/seed.sql`.

---

## 7. Automated Test Suites

### Unit Tests (`npm run test`)
- 13 passing unit tests verifying:
  - Exact 40% / 35% / 25% tier splits.
  - Multi-winner penny-perfect equal divisions.
  - Rollover accumulation and rollover award on win.
  - Algorithmic score consistency weighting.
  - Stableford bounds (1–45) and charity minimums.
  - Rolling 5-score automatic eviction and duplicate date rejection.

### E2E Suite (`node scripts/verify-e2e.mjs`)
- 29 passing automated assertions verifying:
  - Core web routes (`/`, `/dashboard`, `/admin`, `/charities`, `/how-it-works`, `/subscribe`).
  - Stripe Checkout API session generation.
  - Duplicate date rejection and 6th score auto-eviction.
  - Draw dry-run simulation and publication.
  - Winner scorecard proof submission and admin verification lifecycle.

---

## 8. Deployment Instructions (Vercel)

1. Push code to your GitHub / GitLab repository.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import this repository.
4. Under **Environment Variables**, paste the values from `.env.example`.
5. Click **Deploy**.
