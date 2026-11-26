-- ==============================================================================
-- CASH FINTECH WALLET — PHASE 1A: DOUBLE-ENTRY LEDGER & RECONCILIATION
-- ==============================================================================
-- Migration: 20261126010000_double_entry_ledger_schema
-- Implements PRD Section 4.1 (L-1..L-12) & Section 5:
--   1. Non-exposed `private` schema for internal ledger/security helpers.
--   2. `public.accounts` (user wallets, pockets, goals, and system contra accounts).
--   3. `public.ledger_entries` (immutable double-entry journal with deferred
--      commit-time balance check: sum(credits) == sum(debits) per journal_id).
--   4. `public.transactions` lifecycle columns (settled_at, fees, utr, reversal_of).
--   5. `public.reconciliation_runs` & `private.run_reconciliation_internal()`.
--   6. Safe backfill of existing wallets, pockets, and goals so ledger reconciles 100%.
-- ==============================================================================

-- 1. NON-EXPOSED PRIVATE SCHEMA
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- 2. TRANSACTION LIFECYCLE & AUDIT COLUMNS (PRD L-7, L-8, L-10, L-11, L-12)
alter table public.transactions
  add column if not exists settled_at timestamptz,
  add column if not exists fee_amount numeric(14, 2) not null default 0.00,
  add column if not exists gst_amount numeric(14, 2) not null default 0.00,
  add column if not exists utr_number text,
  add column if not exists reversal_of uuid references public.transactions(id) on delete restrict,
  add column if not exists failure_reason text,
  add column if not exists risk_score integer not null default 0,
  add column if not exists tx_kind text not null default 'transfer';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'transactions_fee_non_negative'
      and conrelid = 'public.transactions'::regclass
  ) then
    alter table public.transactions
      add constraint transactions_fee_non_negative check (fee_amount >= 0.00 and gst_amount >= 0.00);
  end if;
end $$;

create index if not exists idx_transactions_reversal_of
  on public.transactions (reversal_of)
  where reversal_of is not null;

-- 3. ACCOUNTS TABLE (PRD Section 5)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id) on delete cascade,
  wallet_id uuid unique references public.wallets(id) on delete cascade,
  pocket_id uuid unique references public.pockets(id) on delete cascade,
  goal_id uuid unique references public.savings_goals(id) on delete cascade,
  account_code text not null unique,
  account_name text not null,
  account_type text not null check (account_type in (
    'user_wallet', 'user_pocket', 'user_goal',
    'system_treasury', 'system_external', 'system_fees',
    'system_suspense', 'system_refunds', 'system_marketing'
  )),
  currency text not null default 'INR' check (currency = 'INR'),
  balance numeric(14, 2) not null default 0.00,
  status text not null default 'active' check (status in ('active', 'frozen', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_user_non_negative check (
    account_type not in ('user_wallet', 'user_pocket', 'user_goal') or balance >= 0.00
  )
);

create index if not exists idx_accounts_owner_user_id on public.accounts (owner_user_id) where owner_user_id is not null;
create index if not exists idx_accounts_account_type on public.accounts (account_type);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_accounts_updated_at'
      and tgrelid = 'public.accounts'::regclass
  ) then
    create trigger set_accounts_updated_at
      before update on public.accounts
      for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.accounts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'accounts' and policyname = 'accounts_select_own'
  ) then
    create policy "accounts_select_own" on public.accounts
      for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;
end $$;

-- 4. IMMUTABLE DOUBLE-ENTRY LEDGER TABLE (PRD L-1, L-8, L-9)
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null,
  transaction_id uuid references public.transactions(id) on delete restrict,
  account_id uuid not null references public.accounts(id) on delete restrict,
  direction text not null check (direction in ('debit', 'credit')),
  amount numeric(14, 2) not null check (amount > 0.00),
  signed_amount numeric(14, 2) generated always as (
    case when direction = 'credit' then amount else -amount end
  ) stored,
  running_balance numeric(14, 2) not null,
  currency text not null default 'INR' check (currency = 'INR'),
  entry_type text not null default 'principal' check (
    entry_type in ('principal', 'fee', 'gst', 'reversal', 'opening_sync', 'bonus')
  ),
  reversal_of uuid references public.ledger_entries(id) on delete restrict,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ledger_entries_account_created
  on public.ledger_entries (account_id, created_at desc, id desc);
create index if not exists idx_ledger_entries_journal_id
  on public.ledger_entries (journal_id);
create index if not exists idx_ledger_entries_transaction_id
  on public.ledger_entries (transaction_id)
  where transaction_id is not null;

alter table public.ledger_entries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ledger_entries' and policyname = 'ledger_entries_select_own'
  ) then
    create policy "ledger_entries_select_own" on public.ledger_entries
      for select
      to authenticated
      using (
        exists (
          select 1 from public.accounts a
          where a.id = account_id
            and a.owner_user_id = (select auth.uid())
        )
      );
  end if;
end $$;

-- 5. IMMUTABILITY & DOUBLE-ENTRY INVARIANT TRIGGERS (PRD L-1, L-9)
create or replace function private.prevent_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is strictly immutable; append a new reversal entry instead', tg_table_name
    using errcode = '42501';
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_ledger_entries_immutable'
      and tgrelid = 'public.ledger_entries'::regclass
  ) then
    create trigger trg_ledger_entries_immutable
      before update or delete on public.ledger_entries
      for each row execute function private.prevent_mutation();
  end if;
end $$;

create or replace function private.verify_journal_balanced()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_net numeric(14, 2);
  v_count integer;
begin
  select coalesce(sum(signed_amount), 0.00), count(*)
  into v_net, v_count
  from public.ledger_entries
  where journal_id = new.journal_id;

  if v_count < 2 or v_net <> 0.00 then
    raise exception 'Double-entry violation for journal %: net=% count=%', new.journal_id, v_net, v_count
      using errcode = '23514';
  end if;

  return null;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_ledger_entries_balanced'
      and tgrelid = 'public.ledger_entries'::regclass
  ) then
    create constraint trigger trg_ledger_entries_balanced
      after insert on public.ledger_entries
      deferrable initially deferred
      for each row execute function private.verify_journal_balanced();
  end if;
end $$;

-- 6. RECONCILIATION RUNS TABLE (PRD L-3, Section 6.3)
create table if not exists public.reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_by uuid references public.profiles(id) on delete set null,
  run_at timestamptz not null default now(),
  accounts_checked integer not null default 0,
  mismatches_found integer not null default 0,
  total_system_net numeric(14, 2) not null default 0.00,
  mismatch_details jsonb not null default '[]'::jsonb
);

alter table public.reconciliation_runs enable row level security;

-- 7. INTERNAL DOUBLE-ENTRY POSTING HELPER
create or replace function private.post_ledger_pair(
  p_journal_id uuid,
  p_transaction_id uuid,
  p_debit_account_id uuid,
  p_credit_account_id uuid,
  p_amount numeric,
  p_entry_type text default 'principal',
  p_description text default null,
  p_reversal_debit_entry_id uuid default null,
  p_reversal_credit_entry_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amt numeric(14, 2);
  v_debit_acct public.accounts%rowtype;
  v_credit_acct public.accounts%rowtype;
  v_new_debit_bal numeric(14, 2);
  v_new_credit_bal numeric(14, 2);
  v_debit_entry_id uuid;
  v_credit_entry_id uuid;
begin
  v_amt := round(p_amount::numeric, 2);
  if v_amt is null or v_amt <= 0.00 then
    raise exception 'Ledger entry amount must be positive';
  end if;

  if p_debit_account_id = p_credit_account_id then
    raise exception 'Debit and credit account cannot be the same';
  end if;

  if p_debit_account_id < p_credit_account_id then
    select * into v_debit_acct from public.accounts where id = p_debit_account_id for update;
    select * into v_credit_acct from public.accounts where id = p_credit_account_id for update;
  else
    select * into v_credit_acct from public.accounts where id = p_credit_account_id for update;
    select * into v_debit_acct from public.accounts where id = p_debit_account_id for update;
  end if;

  if v_debit_acct.id is null or v_credit_acct.id is null then
    raise exception 'Invalid ledger account reference';
  end if;

  v_new_debit_bal := round((v_debit_acct.balance - v_amt)::numeric, 2);
  v_new_credit_bal := round((v_credit_acct.balance + v_amt)::numeric, 2);

  update public.accounts set balance = v_new_debit_bal where id = v_debit_acct.id;
  update public.accounts set balance = v_new_credit_bal where id = v_credit_acct.id;

  insert into public.ledger_entries (
    journal_id, transaction_id, account_id, direction, amount, running_balance, entry_type, reversal_of, description
  ) values (
    p_journal_id, p_transaction_id, v_debit_acct.id, 'debit', v_amt, v_new_debit_bal, p_entry_type, p_reversal_debit_entry_id, p_description
  ) returning id into v_debit_entry_id;

  insert into public.ledger_entries (
    journal_id, transaction_id, account_id, direction, amount, running_balance, entry_type, reversal_of, description
  ) values (
    p_journal_id, p_transaction_id, v_credit_acct.id, 'credit', v_amt, v_new_credit_bal, p_entry_type, p_reversal_credit_entry_id, p_description
  ) returning id into v_credit_entry_id;

  return jsonb_build_object(
    'debit_account_balance', v_new_debit_bal,
    'credit_account_balance', v_new_credit_bal,
    'debit_entry_id', v_debit_entry_id,
    'credit_entry_id', v_credit_entry_id
  );
end;
$$;

revoke execute on function private.post_ledger_pair(uuid, uuid, uuid, uuid, numeric, text, text, uuid, uuid) from public, anon, authenticated;

-- 8. SEED SYSTEM ACCOUNTS (PRD L-2)
insert into public.accounts (account_code, account_name, account_type, balance)
values
  ('SYS_TREASURY', 'Cash Treasury Reserve', 'system_treasury', 0.00),
  ('SYS_EXTERNAL_CLEARING', 'External NPCI / Bank Clearing', 'system_external', 0.00),
  ('SYS_FEES', 'Platform Fees & GST Clearing', 'system_fees', 0.00),
  ('SYS_SUSPENSE', 'Settlement Suspense', 'system_suspense', 0.00),
  ('SYS_REFUNDS', 'Disputes & Refunds Pool', 'system_refunds', 0.00),
  ('SYS_MARKETING', 'Cashback & Rewards Pool', 'system_marketing', 0.00)
on conflict (account_code) do nothing;

-- 9. BACKFILL EXISTING WALLETS, POCKETS & GOALS INTO BALANCED LEDGER
do $$
declare
  v_treasury_id uuid;
  v_wallet record;
  v_pocket record;
  v_goal record;
  v_acct_id uuid;
  v_journal_id uuid;
begin
  select id into v_treasury_id
  from public.accounts
  where account_code = 'SYS_TREASURY';

  for v_wallet in
    select w.id, w.user_id, w.wallet_number, w.balance, w.is_frozen
    from public.wallets w
    left join public.accounts a on a.wallet_id = w.id
    where a.id is null
  loop
    insert into public.accounts (
      owner_user_id, wallet_id, account_code, account_name, account_type, balance, status
    ) values (
      v_wallet.user_id,
      v_wallet.id,
      'WALLET_' || replace(v_wallet.id::text, '-', ''),
      'Primary Wallet (' || v_wallet.wallet_number || ')',
      'user_wallet',
      0.00,
      case when v_wallet.is_frozen then 'frozen' else 'active' end
    ) returning id into v_acct_id;

    if v_wallet.balance > 0 then
      v_journal_id := gen_random_uuid();
      perform private.post_ledger_pair(
        v_journal_id,
        null,
        v_treasury_id,
        v_acct_id,
        v_wallet.balance,
        'opening_sync',
        'Initial wallet ledger migration sync'
      );
    end if;
  end loop;

  for v_pocket in
    select p.id, p.user_id, p.name, p.balance
    from public.pockets p
    left join public.accounts a on a.pocket_id = p.id
    where a.id is null
  loop
    insert into public.accounts (
      owner_user_id, pocket_id, account_code, account_name, account_type, balance
    ) values (
      v_pocket.user_id,
      v_pocket.id,
      'POCKET_' || replace(v_pocket.id::text, '-', ''),
      'Smart Pocket: ' || v_pocket.name,
      'user_pocket',
      0.00
    ) returning id into v_acct_id;

    if v_pocket.balance > 0 then
      v_journal_id := gen_random_uuid();
      perform private.post_ledger_pair(
        v_journal_id,
        null,
        v_treasury_id,
        v_acct_id,
        v_pocket.balance,
        'opening_sync',
        'Initial pocket ledger migration sync'
      );
    end if;
  end loop;

  for v_goal in
    select g.id, g.user_id, g.title, g.current_amount
    from public.savings_goals g
    left join public.accounts a on a.goal_id = g.id
    where a.id is null
  loop
    insert into public.accounts (
      owner_user_id, goal_id, account_code, account_name, account_type, balance
    ) values (
      v_goal.user_id,
      v_goal.id,
      'GOAL_' || replace(v_goal.id::text, '-', ''),
      'Savings Goal: ' || v_goal.title,
      'user_goal',
      0.00
    ) returning id into v_acct_id;

    if v_goal.current_amount > 0 then
      v_journal_id := gen_random_uuid();
      perform private.post_ledger_pair(
        v_journal_id,
        null,
        v_treasury_id,
        v_acct_id,
        v_goal.current_amount,
        'opening_sync',
        'Initial savings goal ledger migration sync'
      );
    end if;
  end loop;
end $$;

-- 10. RECONCILIATION ENGINE (PRD L-3, Section 6.3)
create or replace function private.run_reconciliation_internal(p_triggered_by uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_accounts_checked integer := 0;
  v_mismatches jsonb := '[]'::jsonb;
  v_mismatches_count integer := 0;
  v_system_net numeric(14, 2) := 0.00;
  v_run_id uuid;
begin
  select count(*), coalesce(sum(a.balance), 0.00)
  into v_accounts_checked, v_system_net
  from public.accounts a;

  with ledger_sums as (
    select account_id, coalesce(sum(signed_amount), 0.00)::numeric(14, 2) as computed_balance
    from public.ledger_entries
    group by account_id
  ),
  discrepancies as (
    select
      a.id as account_id,
      a.account_code,
      a.account_type,
      a.balance as account_balance,
      coalesce(ls.computed_balance, 0.00) as ledger_balance,
      coalesce(w.balance, p.balance, g.current_amount, a.balance) as projection_balance
    from public.accounts a
    left join ledger_sums ls on ls.account_id = a.id
    left join public.wallets w on w.id = a.wallet_id
    left join public.pockets p on p.id = a.pocket_id
    left join public.savings_goals g on g.id = a.goal_id
    where a.balance <> coalesce(ls.computed_balance, 0.00)
       or a.balance <> coalesce(w.balance, p.balance, g.current_amount, a.balance)
  )
  select count(*), coalesce(jsonb_agg(row_to_json(d)), '[]'::jsonb)
  into v_mismatches_count, v_mismatches
  from discrepancies d;

  insert into public.reconciliation_runs (
    triggered_by, accounts_checked, mismatches_found, total_system_net, mismatch_details
  ) values (
    p_triggered_by, v_accounts_checked, v_mismatches_count, v_system_net, v_mismatches
  ) returning id into v_run_id;

  return jsonb_build_object(
    'run_id', v_run_id,
    'accounts_checked', v_accounts_checked,
    'mismatches_found', v_mismatches_count,
    'total_system_net', v_system_net,
    'mismatches', v_mismatches
  );
end;
$$;

revoke execute on function private.run_reconciliation_internal(uuid) from public, anon, authenticated;
