-- ==============================================================================
-- CASH FINTECH WALLET — PRD PHASE 2: SCHEMA, QUEUES, SCHEDULER & RISK TABLES
-- ==============================================================================
-- Migration: 20261126060000_prd_phase2_schema_and_queues
-- Implements PRD Sections 4.3, 4.4, 4.5, 4.6, 4.7, 4.8 & Section 5:
--   1. Enables pgmq (message queue) & pg_cron (scheduled nightly recon & autopay).
--   2. Adds payees (with 24h cooling-off), payment_requests, scheduled_payments,
--      merchants, user_merchant_rules, disputes, kyc_documents, notifications,
--      notification_preferences, user_sessions.
--   3. Extends pockets (auto_save_pct), savings_goals (round_up_enabled),
--      and budgets (rollover_enabled, rollover_amount, last_alert_pct).
--   4. Enables strict RLS (TO authenticated, (select auth.uid())) & indexes.
-- ==============================================================================

-- 1. BACKGROUND QUEUE & CRON EXTENSIONS
create extension if not exists pgmq;
create extension if not exists pg_cron;

do $$
begin
  if not exists (select 1 from pgmq.list_queues() where queue_name = 'cash_jobs') then
    perform pgmq.create('cash_jobs');
  end if;
end $$;

-- 2. EXTEND POCKETS, GOALS & BUDGETS FOR AUTOMATION RULES (PRD 4.5)
alter table public.pockets
  add column if not exists auto_save_pct numeric(5, 2) not null default 0.00;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pockets_auto_save_pct_check'
      and conrelid = 'public.pockets'::regclass
  ) then
    alter table public.pockets
      add constraint pockets_auto_save_pct_check check (auto_save_pct >= 0.00 and auto_save_pct <= 50.00);
  end if;
end $$;

alter table public.savings_goals
  add column if not exists round_up_enabled boolean not null default false;

alter table public.budgets
  add column if not exists rollover_enabled boolean not null default false,
  add column if not exists rollover_amount numeric(14, 2) not null default 0.00,
  add column if not exists last_alert_pct integer not null default 0;

-- 3. SAVED PAYEES & COOLING-OFF PERIOD (PRD R-4, 4.4, Section 5)
create table if not exists public.payees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  payee_identifier text not null,
  payee_name text not null,
  upi_id text,
  nickname text,
  is_favourite boolean not null default false,
  is_verified boolean not null default false,
  cooling_until timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  unique (user_id, payee_identifier)
);

create index if not exists idx_payees_user_fav_created
  on public.payees (user_id, is_favourite desc, created_at desc);

alter table public.payees enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payees' and policyname = 'payees_select_own'
  ) then
    create policy "payees_select_own" on public.payees
      for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;

revoke insert, update, delete on table public.payees from public, anon, authenticated;

-- 4. PAYMENT REQUESTS & PAYMENT LINKS (PRD 4.4, Section 5)
create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  payer_id uuid references public.profiles(id) on delete set null,
  payer_identifier text not null,
  amount numeric(14, 2) not null check (amount > 0.00),
  note text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'declined', 'expired', 'cancelled')),
  reference_id text not null unique,
  settled_txn_id uuid references public.transactions(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_requests_requester
  on public.payment_requests (requester_id, status, created_at desc);
create index if not exists idx_payment_requests_payer
  on public.payment_requests (payer_id, status, created_at desc);
create index if not exists idx_payment_requests_pending_expiry
  on public.payment_requests (expires_at) where status = 'pending';

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_payment_requests_updated_at' and tgrelid = 'public.payment_requests'::regclass
  ) then
    create trigger set_payment_requests_updated_at
      before update on public.payment_requests
      for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.payment_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payment_requests' and policyname = 'payment_requests_select_participant'
  ) then
    create policy "payment_requests_select_participant" on public.payment_requests
      for select to authenticated
      using ((select auth.uid()) = requester_id or (select auth.uid()) = payer_id);
  end if;
end $$;

revoke insert, update, delete on table public.payment_requests from public, anon, authenticated;

-- 5. SCHEDULED & RECURRING PAYMENTS (PRD 4.4, Section 5)
create table if not exists public.scheduled_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_identifier text not null,
  recipient_name text not null,
  amount numeric(14, 2) not null check (amount > 0.00),
  category text not null default 'utilities',
  description text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  next_run_at timestamptz not null,
  last_run_at timestamptz,
  last_status text,
  last_error text,
  retry_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_scheduled_payments_user_created
  on public.scheduled_payments (user_id, created_at desc);
create index if not exists idx_scheduled_payments_due
  on public.scheduled_payments (next_run_at) where status = 'active';

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_scheduled_payments_updated_at' and tgrelid = 'public.scheduled_payments'::regclass
  ) then
    create trigger set_scheduled_payments_updated_at
      before update on public.scheduled_payments
      for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.scheduled_payments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'scheduled_payments' and policyname = 'scheduled_payments_select_own'
  ) then
    create policy "scheduled_payments_select_own" on public.scheduled_payments
      for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;

revoke insert, update, delete on table public.scheduled_payments from public, anon, authenticated;

-- 6. MERCHANTS & LEARNED CATEGORISATION RULES (PRD 4.5, 4.4 Rewards)
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  display_name text not null,
  category text not null,
  is_recurring_typical boolean not null default false,
  cashback_rate numeric(5, 4) not null default 0.0000
);

alter table public.merchants enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'merchants' and policyname = 'merchants_select_authenticated'
  ) then
    create policy "merchants_select_authenticated" on public.merchants
      for select to authenticated using (true);
  end if;
end $$;

revoke insert, update, delete on table public.merchants from public, anon, authenticated;

insert into public.merchants (keyword, display_name, category, is_recurring_typical, cashback_rate)
values
  ('swiggy', 'Swiggy', 'food', false, 0.0200),
  ('zomato', 'Zomato', 'food', false, 0.0200),
  ('starbucks', 'Starbucks', 'food', false, 0.0150),
  ('zepto', 'Zepto', 'groceries', false, 0.0150),
  ('blinkit', 'Blinkit', 'groceries', false, 0.0150),
  ('bigbasket', 'BigBasket', 'groceries', false, 0.0100),
  ('kirana', 'Kirana Store', 'groceries', false, 0.0100),
  ('bescom', 'BESCOM Electricity', 'utilities', true, 0.0100),
  ('tatapower', 'Tata Power', 'utilities', true, 0.0100),
  ('jio', 'Jio Fiber & Mobile', 'utilities', true, 0.0100),
  ('airtel', 'Airtel Payments', 'utilities', true, 0.0100),
  ('netflix', 'Netflix India', 'entertainment', true, 0.0000),
  ('spotify', 'Spotify', 'entertainment', true, 0.0000),
  ('bookmyshow', 'BookMyShow', 'entertainment', false, 0.0200),
  ('uber', 'Uber India', 'travel', false, 0.0100),
  ('ola', 'Ola Cabs', 'travel', false, 0.0100),
  ('irctc', 'IRCTC Railways', 'travel', false, 0.0100),
  ('indigo', 'IndiGo Airlines', 'travel', false, 0.0100),
  ('amazon', 'Amazon Pay', 'shopping', false, 0.0150),
  ('flipkart', 'Flipkart', 'shopping', false, 0.0150),
  ('myntra', 'Myntra', 'shopping', false, 0.0150),
  ('apollo', 'Apollo Pharmacy', 'health', false, 0.0200),
  ('1mg', 'Tata 1mg', 'health', false, 0.0200),
  ('udemy', 'Udemy', 'education', false, 0.0100),
  ('coursera', 'Coursera', 'education', true, 0.0100)
on conflict (keyword) do nothing;

create table if not exists public.user_merchant_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  merchant_key text not null,
  category text not null,
  created_at timestamptz not null default now(),
  unique (user_id, merchant_key)
);

alter table public.user_merchant_rules enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_merchant_rules' and policyname = 'user_merchant_rules_select_own'
  ) then
    create policy "user_merchant_rules_select_own" on public.user_merchant_rules
      for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;

revoke insert, update, delete on table public.user_merchant_rules from public, anon, authenticated;

-- 7. DISPUTES & REFUNDS (PRD 4.6, 6.2, Section 5)
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete restrict,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved_refunded', 'rejected')),
  resolution_note text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_disputes_active_txn_unique
  on public.disputes (user_id, transaction_id)
  where status in ('open', 'under_review');
create index if not exists idx_disputes_status_created
  on public.disputes (status, created_at desc);
create index if not exists idx_disputes_user_created
  on public.disputes (user_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_disputes_updated_at' and tgrelid = 'public.disputes'::regclass
  ) then
    create trigger set_disputes_updated_at
      before update on public.disputes
      for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.disputes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'disputes' and policyname = 'disputes_select_own_or_staff'
  ) then
    create policy "disputes_select_own_or_staff" on public.disputes
      for select to authenticated
      using (
        (select auth.uid()) = user_id
        or private.has_role((select auth.uid()), array['admin', 'support', 'risk_analyst'])
      );
  end if;
end $$;

revoke insert, update, delete on table public.disputes from public, anon, authenticated;

-- 8. KYC DOCUMENTS & ADMIN REVIEW QUEUE (PRD R-7, 4.6, Section 5)
create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('pan', 'aadhaar_masked', 'passport', 'driving_license')),
  doc_number_masked text not null,
  full_legal_name text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_kyc_documents_status_submitted
  on public.kyc_documents (status, submitted_at desc);
create index if not exists idx_kyc_documents_user_submitted
  on public.kyc_documents (user_id, submitted_at desc);

alter table public.kyc_documents enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'kyc_documents' and policyname = 'kyc_documents_select_own_or_staff'
  ) then
    create policy "kyc_documents_select_own_or_staff" on public.kyc_documents
      for select to authenticated
      using (
        (select auth.uid()) = user_id
        or private.has_role((select auth.uid()), array['admin', 'support', 'risk_analyst'])
      );
  end if;
end $$;

revoke insert, update, delete on table public.kyc_documents from public, anon, authenticated;

-- 9. SERVER-DRIVEN NOTIFICATIONS & PREFERENCES (PRD 4.7, Section 5)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('transaction', 'security', 'budget', 'request', 'kyc', 'system', 'reward')),
  title text not null,
  body text not null,
  is_security_mandatory boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, created_at desc) where read_at is null;

alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_select_own'
  ) then
    create policy "notifications_select_own" on public.notifications
      for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update_read_own'
  ) then
    create policy "notifications_update_read_own" on public.notifications
      for update to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

revoke insert, update, delete on table public.notifications from public, anon, authenticated;
grant update (read_at) on table public.notifications to authenticated;

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tx_alerts boolean not null default true,
  budget_alerts boolean not null default true,
  request_alerts boolean not null default true,
  marketing_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notification_preferences' and policyname = 'notif_prefs_manage_own'
  ) then
    create policy "notif_prefs_manage_own" on public.notification_preferences
      for all to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

-- 10. SESSION & DEVICE MANAGEMENT (PRD S-6)
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_fingerprint text not null,
  device_label text not null,
  user_agent text,
  is_revoked boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, device_fingerprint)
);

create index if not exists idx_user_sessions_user_seen
  on public.user_sessions (user_id, last_seen_at desc);

alter table public.user_sessions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_sessions' and policyname = 'user_sessions_select_own'
  ) then
    create policy "user_sessions_select_own" on public.user_sessions
      for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;

revoke insert, update, delete on table public.user_sessions from public, anon, authenticated;

-- 11. ADD REALTIME PUBLICATION FOR LIVE UPDATES
do $$
declare
  t text;
begin
  foreach t in array array['notifications', 'payment_requests', 'disputes', 'kyc_documents', 'scheduled_payments', 'budgets'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
