# Cash — Simulated Fintech Wallet Application 💳🇮🇳

A modern simulated fintech wallet application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL + Auth + Realtime)**.

> **Project Scope**: This is a financial simulation project. It uses mock balances, simulated UPI handles, and virtual accounts to demonstrate production-grade fintech database architecture, Row Level Security, and real-time state synchronization. It does **not** process real banking or actual money transfers.

---

## 🏗️ 1. Architecture Overview (For Supabase Beginners)

### 1.1 Auth Isolation (`auth.users` vs `public.profiles`)
Supabase maintains authentication credentials (passwords, JWTs, OAuth providers) in an internal schema (`auth.users`). In fintech applications, you never store application domain data directly in `auth.users`. 
- `public.profiles` references `auth.users.id` with a 1:1 foreign key.
- A PostgreSQL database trigger (`handle_new_user`) automatically provisions a profile, a default INR wallet, and a welcome bonus whenever a new user signs up.

### 1.2 Exact Monetary Precision (`numeric(14,2)`)
Never use floating-point types (`float`, `real`, `double precision`) for monetary calculations due to IEEE-754 precision issues (e.g. `0.1 + 0.2 != 0.3`).
- Indian Rupee (INR) amounts are stored as `numeric(14, 2)` (12 digits before decimal, 2 digits for Paise).
- Non-negative constraints (`CHECK (balance >= 0)`) ensure overdrafts and race-condition balance anomalies are stopped directly at the database layer.

### 1.3 Immutable Financial Ledger (`transactions`)
- Wallets maintain the current available balance for low-latency balance reads.
- `transactions` acts as an append-only audit trail recording every credit, debit, and simulated UPI payment.
- To preserve financial audit trails, regular users can never edit (`UPDATE`) or delete (`DELETE`) transactions.

### 1.4 Cryptographic Row Level Security (RLS)
PostgreSQL evaluates RLS on every single query sent from public clients:
- Every table has `ENABLE ROW LEVEL SECURITY`.
- Policies use `TO authenticated` and match against `(select auth.uid()) = user_id`.
- Wrapping `(select auth.uid())` inside a subselect forces Postgres to evaluate the JWT identity once per statement and cache it across rows, speeding up queries by 5-10x.

### 1.5 Safe Client-Side Architecture
- Frontend only contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The `service_role` key bypasses RLS and has root database power — it is **never** embedded in client-side code.

---

## 📁 2. Project Structure

```
Project/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.example
├── src/
│   ├── App.tsx                    # Architectural overview & dashboard
│   ├── index.css                  # Tailwind styles
│   ├── main.tsx                   # React root
│   ├── lib/
│   │   └── supabase.ts            # Typed Supabase client (anon key only)
│   ├── types/
│   │   └── database.types.ts      # Complete TypeScript database interfaces
│   └── utils/
│       └── formatters.ts          # INR currency & timestamp formatters
└── supabase/
    ├── migrations/
    │   └── 20261104000000_init_cash_fintech_schema.sql  # Complete schema, RLS, indexes & triggers
    └── seeds/
        ├── demo_dataset.sql       # 50 users, wallets, pockets, goals, budgets & 527 transactions
        └── generate_seed.py       # Reproducible Python generator script
```

---

## 🗄️ 3. Database Schema Entities

| Entity | Primary Key | Parent Reference | Description |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `id uuid` | `auth.users(id)` | User identity, KYC status (`verified`, `pending`), tier (`basic` to `pro`). |
| **`wallets`** | `id uuid` | `profiles(id)` | Master INR balance (`numeric(14,2)`), wallet number (`CSH-...`), daily limit. |
| **`pockets`** | `id uuid` | `profiles(id)`, `wallets(id)` | Virtual envelopes (e.g. Rent, Groceries, Emergency Fund). |
| **`savings_goals`** | `id uuid` | `profiles(id)`, `wallets(id)` | Target milestones (e.g. MacBook Pro, Vacation) with target dates & progress. |
| **`budgets`** | `id uuid` | `profiles(id)` | Category spending limits (`monthly`, `weekly`) with alert thresholds. |
| **`transactions`** | `id uuid` | `profiles(id)`, `wallets(id)` | Immutable ledger for credits, debits, simulated UPI IDs, and categories. |

---

## 🚀 4. How to Apply Migrations & Verify in Supabase

### Option A: Via Supabase Dashboard (Web UI)
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **`cash-dev`**
3. Navigate to the **SQL Editor** (icon `>_` on left sidebar)
4. Click **+ New Query**
5. Copy & paste the contents of `supabase/migrations/20261104000000_init_cash_fintech_schema.sql` and click **Run**
6. Open another query, paste the contents of `supabase/seeds/demo_dataset.sql`, and click **Run**

### Option B: Automatic Execution via Antigravity Assistant
The Antigravity assistant has access to the connected Supabase MCP server for project `cash-dev`. Upon your approval, the assistant can execute the migration and seed directly.

### 5. Verification Checklist in Supabase Dashboard
- **Table Editor**:
  - Check `profiles` (50 rows)
  - Check `wallets` (50 rows with INR balances)
  - Check `pockets`, `savings_goals`, `budgets`
  - Check `transactions` (527 records with Indian merchants like Swiggy, Zomato, Zepto, etc.)
- **Authentication**:
  - Open **Authentication > Users** in the dashboard to see 50 registered users.
- **Database > Roles & Policies**:
  - Check **Policies** under Table Editor to confirm green RLS badges on all 6 tables.
- **Database > Replication**:
  - Verify that `wallets`, `transactions`, `pockets`, and `savings_goals` are added to `supabase_realtime`.
