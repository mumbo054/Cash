-- ==============================================================================
-- CASH FINTECH WALLET — CORE DATABASE SCHEMA MIGRATION
-- ==============================================================================
-- Description: Establishes the database foundation for Cash:
--   1. Extensions (pgcrypto / uuid-ossp)
--   2. Enums and helper domain types
--   3. Tables: profiles, wallets, pockets, savings_goals, budgets, transactions
--   4. Audit triggers (updated_at auto-updater)
--   5. Auth onboarding trigger (automatic profile & wallet creation on signup)
--   6. Performance Indexes (all Foreign Keys and RLS predicates)
--   7. Row Level Security (RLS) Policies (strictly isolated to owner)
--   8. Supabase Realtime publication setup
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- 2. HELPER FUNCTIONS: updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

comment on function public.handle_updated_at() is 'Automatically updates the updated_at column to current timestamp on row update.';

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- 3.1 PROFILES
-- Extends Supabase auth.users with fintech user metadata (KYC, phone, tier)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  kyc_status text not null default 'verified' check (kyc_status in ('unverified', 'pending', 'verified', 'rejected')),
  tier text not null default 'standard' check (tier in ('basic', 'standard', 'premium', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile domain data linked 1:1 with auth.users.';
comment on column public.profiles.id is 'Matches the Supabase Auth user UUID.';

-- 3.2 WALLETS
-- Primary digital INR account for each user
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  wallet_number text not null unique,
  currency text not null default 'INR' check (currency = 'INR'),
  balance numeric(14, 2) not null default 0.00 check (balance >= 0.00),
  is_frozen boolean not null default false,
  daily_limit numeric(14, 2) not null default 50000.00 check (daily_limit >= 0.00),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.wallets is 'Primary simulated INR currency wallet for each user.';
comment on column public.wallets.balance is 'Available balance in INR with 2 decimal precision (paise).';
comment on column public.wallets.wallet_number is 'Unique 12-character wallet identifier (e.g., CSH-8492018374).';

-- 3.3 POCKETS
-- Virtual sub-wallets / money compartments within the primary wallet (e.g. Rent, Groceries, Rainy Day)
create table if not exists public.pockets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  name text not null,
  icon text not null default 'wallet',
  color text not null default '#10B981',
  balance numeric(14, 2) not null default 0.00 check (balance >= 0.00),
  target_amount numeric(14, 2) check (target_amount is null or target_amount > 0.00),
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pockets is 'Virtual sub-wallets / budget envelopes allocated from user wallet balance.';

-- 3.4 SAVINGS GOALS
-- Goal-driven savings targets with milestone tracking
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  title text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0.00),
  current_amount numeric(14, 2) not null default 0.00 check (current_amount >= 0.00),
  target_date date,
  category text not null default 'general',
  status text not null default 'in_progress' check (status in ('in_progress', 'achieved', 'paused', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.savings_goals is 'Savings milestones and target-driven accounts.';

-- 3.5 BUDGETS
-- Monthly/periodic spending caps by category with alerts
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in (
    'food', 'groceries', 'entertainment', 'utilities', 
    'shopping', 'travel', 'health', 'education', 'investments', 'other'
  )),
  amount_limit numeric(14, 2) not null check (amount_limit > 0.00),
  spent_amount numeric(14, 2) not null default 0.00 check (spent_amount >= 0.00),
  period text not null default 'monthly' check (period in ('weekly', 'monthly', 'quarterly', 'yearly')),
  alert_threshold_pct integer not null default 80 check (alert_threshold_pct between 1 and 100),
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, period, start_date)
);

comment on table public.budgets is 'Category budget limits and spend tracking.';

-- 3.6 TRANSACTIONS
-- Immutable transaction ledger recording all inflows, outflows, transfers, and UPI simulations
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  pocket_id uuid references public.pockets(id) on delete set null,
  goal_id uuid references public.savings_goals(id) on delete set null,
  reference_id text not null unique,
  type text not null check (type in ('credit', 'debit', 'transfer_in', 'transfer_out')),
  amount numeric(14, 2) not null check (amount > 0.00),
  currency text not null default 'INR' check (currency = 'INR'),
  category text not null check (category in (
    'salary', 'freelance', 'investment', 'refund',
    'food', 'groceries', 'entertainment', 'utilities',
    'shopping', 'travel', 'health', 'education',
    'pocket_transfer', 'goal_deposit', 'peer_transfer', 'other'
  )),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'reversed')),
  counterparty_name text,
  counterparty_upi_id text,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.transactions is 'Immutable financial ledger tracking all credits, debits, and transfers.';

-- ==============================================================================
-- 4. PERFORMANCE & FOREIGN KEY INDEXES
-- ==============================================================================
-- Critical best practice: PostgreSQL does not automatically index foreign keys!
-- Missing FK indexes cause full table sequential scans on JOINs and cascading operations.

-- Profiles
create index if not exists idx_profiles_email on public.profiles(email);

-- Wallets
create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_wallets_wallet_number on public.wallets(wallet_number);

-- Pockets
create index if not exists idx_pockets_user_id on public.pockets(user_id);
create index if not exists idx_pockets_wallet_id on public.pockets(wallet_id);

-- Savings Goals
create index if not exists idx_savings_goals_user_id on public.savings_goals(user_id);
create index if not exists idx_savings_goals_wallet_id on public.savings_goals(wallet_id);
create index if not exists idx_savings_goals_status on public.savings_goals(status);

-- Budgets
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_category on public.budgets(category);

-- Transactions
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_wallet_id on public.transactions(wallet_id);
create index if not exists idx_transactions_pocket_id on public.transactions(pocket_id) where pocket_id is not null;
create index if not exists idx_transactions_goal_id on public.transactions(goal_id) where goal_id is not null;
create index if not exists idx_transactions_created_at_desc on public.transactions(created_at desc);
create index if not exists idx_transactions_user_created on public.transactions(user_id, created_at desc);

-- ==============================================================================
-- 5. AUTOMATED TRIGGERS
-- ==============================================================================

-- 5.1 Updated_at triggers
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_wallets_updated_at on public.wallets;
create trigger set_wallets_updated_at
  before update on public.wallets
  for each row execute function public.handle_updated_at();

drop trigger if exists set_pockets_updated_at on public.pockets;
create trigger set_pockets_updated_at
  before update on public.pockets
  for each row execute function public.handle_updated_at();

drop trigger if exists set_savings_goals_updated_at on public.savings_goals;
create trigger set_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.handle_updated_at();

drop trigger if exists set_budgets_updated_at on public.budgets;
create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute function public.handle_updated_at();

-- 5.2 Automatic Profile & Wallet Creation upon Auth Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_wallet_num text;
  v_full_name text;
begin
  -- Resolve user full name from auth metadata or default
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- 1. Insert Profile
  insert into public.profiles (id, full_name, email, phone, kyc_status, tier)
  values (
    new.id,
    v_full_name,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'kyc_status', 'verified'),
    coalesce(new.raw_user_meta_data->>'tier', 'standard')
  );

  -- 2. Generate random 10-digit wallet number e.g. CSH-9182374650
  v_wallet_num := 'CSH-' || lpad((floor(random() * 9000000000 + 1000000000))::text, 10, '0');

  -- 3. Create Default Wallet with ₹10,000 simulated welcome bonus
  insert into public.wallets (user_id, wallet_number, currency, balance, daily_limit)
  values (
    new.id,
    v_wallet_num,
    'INR',
    10000.00,
    50000.00
  );

  -- 4. Record Initial Welcome Bonus Transaction
  insert into public.transactions (
    user_id,
    wallet_id,
    reference_id,
    type,
    amount,
    currency,
    category,
    status,
    counterparty_name,
    description
  )
  select
    new.id,
    w.id,
    'TXN_WELCOME_' || upper(substring(replace(new.id::text, '-', '') from 1 for 12)),
    'credit',
    10000.00,
    'INR',
    'refund',
    'completed',
    'Cash Onboarding',
    'Welcome bonus credited to simulated wallet'
  from public.wallets w
  where w.user_id = new.id;

  return new;
end;
$$;

comment on function public.handle_new_user() is 'Trigger function that provisions a profile, wallet, and welcome balance on signup.';

-- Attach to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Security Best Practices:
-- 1. Enable RLS explicitly on all tables in public schema.
-- 2. Use `TO authenticated` clause (auth.role() is deprecated).
-- 3. Wrap (select auth.uid()) in a subselect for statement-level caching (100x speedup).
-- 4. Use both USING and WITH CHECK on UPDATE policies to prevent row reassignment.
-- 5. Transactions are append-only: authenticated users can SELECT and INSERT their own transactions.

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.pockets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.budgets enable row level security;
alter table public.transactions enable row level security;

-- 6.1 PROFILES POLICIES
-- SELECT: Users can read their own profile
create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- UPDATE: Users can update their own profile (name, phone, avatar)
create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 6.2 WALLETS POLICIES
-- SELECT: Users can view their own wallet
create policy "wallets_select_own" on public.wallets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- UPDATE: Users can update preferences on their wallet (e.g. daily limit)
create policy "wallets_update_own" on public.wallets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 6.3 POCKETS POLICIES
-- SELECT
create policy "pockets_select_own" on public.pockets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "pockets_insert_own" on public.pockets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "pockets_update_own" on public.pockets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE
create policy "pockets_delete_own" on public.pockets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 6.4 SAVINGS GOALS POLICIES
-- SELECT
create policy "savings_goals_select_own" on public.savings_goals
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "savings_goals_insert_own" on public.savings_goals
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "savings_goals_update_own" on public.savings_goals
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE
create policy "savings_goals_delete_own" on public.savings_goals
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 6.5 BUDGETS POLICIES
-- SELECT
create policy "budgets_select_own" on public.budgets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "budgets_insert_own" on public.budgets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "budgets_update_own" on public.budgets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE
create policy "budgets_delete_own" on public.budgets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 6.6 TRANSACTIONS POLICIES (Append-only Ledger)
-- SELECT: Users can read their own transactions
create policy "transactions_select_own" on public.transactions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT: Users can create transactions for their own account
create policy "transactions_insert_own" on public.transactions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Note: Financial transactions are immutable; no UPDATE or DELETE policies are granted to authenticated users.

-- ==============================================================================
-- 7. SUPABASE REALTIME REPLICATION
-- ==============================================================================
-- Enables instantaneous client-side UI updates on balance changes and transactions.
alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.pockets;
alter publication supabase_realtime add table public.savings_goals;
