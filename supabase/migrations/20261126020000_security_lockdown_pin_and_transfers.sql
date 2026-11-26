-- ==============================================================================
-- CASH FINTECH WALLET — PHASE 1B: SECURITY LOCKDOWN, PIN, AUDIT & ATOMIC RPCS
-- ==============================================================================
-- Migration: 20261126020000_security_lockdown_pin_and_transfers
-- Implements PRD Sections 4.1, 4.2, 4.3, 4.4, 8:
--   1. `public.user_security` (salted bcrypt Transaction PIN + 5-try lockout).
--   2. `public.audit_logs` (immutable append-only security & admin audit trail).
--   3. Column/table write lockdown on `wallets`, `profiles`, `pockets`, `savings_goals`,
--      `transactions`, `accounts`, `ledger_entries` (zero direct client balance writes).
--   4. Atomic double-entry RPCs: `execute_verified_transfer`, `execute_wallet_topup`,
--      `move_pocket_funds`, `move_goal_funds`, `create_pocket`, `create_savings_goal`,
--      `toggle_wallet_freeze`, `set_transaction_pin`, `verify_transaction_pin`,
--      `get_my_security_status`, plus backward-compatible `transfer_cash_funds` &
--      `add_cash_funds`.
-- ==============================================================================

-- 1. USER SECURITY TABLE (PRD S-3, S-5)
create table if not exists public.user_security (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  pin_hash text,
  pin_threshold numeric(14, 2) not null default 2000.00 check (pin_threshold >= 0.00),
  failed_pin_attempts integer not null default 0 check (failed_pin_attempts >= 0),
  pin_locked_until timestamptz,
  pin_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_user_security_updated_at'
      and tgrelid = 'public.user_security'::regclass
  ) then
    create trigger set_user_security_updated_at
      before update on public.user_security
      for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.user_security enable row level security;
revoke all on public.user_security from public, anon, authenticated;

-- 2. APPEND-ONLY AUDIT LOGS TABLE (PRD S-10)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor_created
  on public.audit_logs (actor_user_id, created_at desc)
  where actor_user_id is not null;
create index if not exists idx_audit_logs_target_created
  on public.audit_logs (target_user_id, created_at desc)
  where target_user_id is not null;
create index if not exists idx_audit_logs_created_desc
  on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'audit_logs_select_own'
  ) then
    create policy "audit_logs_select_own" on public.audit_logs
      for select
      to authenticated
      using (
        (select auth.uid()) = actor_user_id
        or (select auth.uid()) = target_user_id
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_audit_logs_immutable'
      and tgrelid = 'public.audit_logs'::regclass
  ) then
    create trigger trg_audit_logs_immutable
      before update or delete on public.audit_logs
      for each row execute function private.prevent_mutation();
  end if;
end $$;

create or replace function private.write_audit_log(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_reason text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (
    actor_user_id, target_user_id, action, entity_type, entity_id, reason, metadata
  ) values (
    p_actor_user_id, p_target_user_id, p_action, p_entity_type, p_entity_id, p_reason, coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke execute on function private.write_audit_log(uuid, uuid, text, text, text, text, jsonb) from public, anon, authenticated;

-- 3. TABLE & COLUMN PRIVILEGE LOCKDOWN + DEFENSE-IN-DEPTH TRIGGERS (PRD L-4, S-1)
revoke insert, update, delete on public.wallets from public, anon, authenticated;
revoke insert, update, delete on public.accounts from public, anon, authenticated;
revoke insert, update, delete on public.ledger_entries from public, anon, authenticated;
revoke insert, update, delete on public.transactions from public, anon, authenticated;
revoke insert, update, delete on public.reconciliation_runs from public, anon, authenticated;
revoke insert, update, delete on public.audit_logs from public, anon, authenticated;
revoke insert, update, delete on public.pockets from public, anon, authenticated;
revoke insert, update, delete on public.savings_goals from public, anon, authenticated;

revoke insert, update, delete on public.profiles from public, anon, authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

create or replace function private.guard_profile_sensitive_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_setting('cash.trusted_rpc', true) = 'on' then
    return new;
  end if;

  if current_user in ('anon', 'authenticated') then
    if new.kyc_status is distinct from old.kyc_status
       or new.tier is distinct from old.tier
       or new.email is distinct from old.email
       or new.upi_id is distinct from old.upi_id
       or new.id is distinct from old.id then
      raise exception 'Sensitive profile fields (kyc_status, tier, email, upi_id) cannot be modified directly'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_profiles_guard_sensitive'
      and tgrelid = 'public.profiles'::regclass
  ) then
    create trigger trg_profiles_guard_sensitive
      before update on public.profiles
      for each row execute function private.guard_profile_sensitive_columns();
  end if;
end $$;

create or replace function private.guard_financial_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_setting('cash.trusted_rpc', true) = 'on' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if current_user in ('anon', 'authenticated') then
    raise exception 'Direct client writes to % are blocked; use server-side RPCs', tg_table_name
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_wallets_guard_write'
      and tgrelid = 'public.wallets'::regclass
  ) then
    create trigger trg_wallets_guard_write
      before insert or update or delete on public.wallets
      for each row execute function private.guard_financial_write();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_pockets_guard_write'
      and tgrelid = 'public.pockets'::regclass
  ) then
    create trigger trg_pockets_guard_write
      before insert or update or delete on public.pockets
      for each row execute function private.guard_financial_write();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_goals_guard_write'
      and tgrelid = 'public.savings_goals'::regclass
  ) then
    create trigger trg_goals_guard_write
      before insert or update or delete on public.savings_goals
      for each row execute function private.guard_financial_write();
  end if;
end $$;

create or replace function private.guard_transactions_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'transactions is strictly append-only and cannot be deleted'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    if current_setting('cash.allow_tx_reversal', true) = 'on'
       and old.status = 'completed'
       and new.status = 'reversed'
       and new.amount = old.amount
       and new.type = old.type
       and new.reference_id = old.reference_id
       and new.user_id = old.user_id
       and new.wallet_id = old.wallet_id then
      return new;
    end if;

    raise exception 'transactions rows are immutable; post a reversal transaction instead'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_transactions_immutable'
      and tgrelid = 'public.transactions'::regclass
  ) then
    create trigger trg_transactions_immutable
      before update or delete on public.transactions
      for each row execute function private.guard_transactions_immutable();
  end if;
end $$;

-- 4. INTERNAL PIN CHECKER (PRD S-3)
create or replace function private.verify_user_pin_internal(
  p_user_id uuid,
  p_pin text,
  p_log_success boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sec public.user_security%rowtype;
  v_attempts integer;
  v_locked_until timestamptz;
begin
  select * into v_sec
  from public.user_security
  where user_id = p_user_id
  for update;

  if not found or v_sec.pin_hash is null then
    return jsonb_build_object('ok', false, 'has_pin', false, 'error', 'Transaction PIN has not been set.');
  end if;

  if v_sec.pin_locked_until is not null and v_sec.pin_locked_until > now() then
    return jsonb_build_object(
      'ok', false,
      'has_pin', true,
      'locked', true,
      'locked_until', v_sec.pin_locked_until,
      'error', 'Transaction PIN is locked after 5 failed attempts. Try again later.'
    );
  end if;

  if p_pin is null or p_pin !~ '^\d{4}(\d{2})?$' then
    return jsonb_build_object('ok', false, 'has_pin', true, 'error', 'Please enter your 4 or 6 digit Transaction PIN.');
  end if;

  if extensions.crypt(p_pin, v_sec.pin_hash) = v_sec.pin_hash then
    update public.user_security
    set failed_pin_attempts = 0,
        pin_locked_until = null
    where user_id = p_user_id;

    if p_log_success then
      perform private.write_audit_log(p_user_id, p_user_id, 'pin_verified', 'user_security', p_user_id::text);
    end if;

    return jsonb_build_object('ok', true, 'has_pin', true);
  end if;

  v_attempts := case
    when v_sec.pin_locked_until is not null and v_sec.pin_locked_until <= now() then 1
    else v_sec.failed_pin_attempts + 1
  end;

  v_locked_until := case
    when v_attempts >= 5 then now() + interval '15 minutes'
    else null
  end;

  update public.user_security
  set failed_pin_attempts = v_attempts,
      pin_locked_until = v_locked_until
  where user_id = p_user_id;

  perform private.write_audit_log(
    p_user_id,
    p_user_id,
    case when v_attempts >= 5 then 'pin_locked' else 'pin_failed' end,
    'user_security',
    p_user_id::text,
    null,
    jsonb_build_object('attempt_count', v_attempts)
  );

  if v_attempts >= 5 then
    return jsonb_build_object(
      'ok', false,
      'has_pin', true,
      'locked', true,
      'locked_until', v_locked_until,
      'error', 'Too many wrong PIN attempts. PIN locked for 15 minutes.'
    );
  end if;

  return jsonb_build_object(
    'ok', false,
    'has_pin', true,
    'attempts_remaining', 5 - v_attempts,
    'error', format('Incorrect Transaction PIN (%s attempts remaining).', 5 - v_attempts)
  );
end;
$$;

revoke execute on function private.verify_user_pin_internal(uuid, text, boolean) from public, anon, authenticated;

-- 5. PUBLIC PIN RPCS (PRD S-3)
create or replace function public.get_my_security_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_sec public.user_security%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select * into v_sec
  from public.user_security
  where user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'has_pin', coalesce(v_sec.pin_hash is not null, false),
    'pin_threshold', coalesce(v_sec.pin_threshold, 2000.00),
    'failed_pin_attempts', coalesce(v_sec.failed_pin_attempts, 0),
    'pin_locked_until', v_sec.pin_locked_until,
    'is_locked', coalesce(v_sec.pin_locked_until is not null and v_sec.pin_locked_until > now(), false),
    'pin_updated_at', v_sec.pin_updated_at
  );
end;
$$;

create or replace function public.set_transaction_pin(
  p_new_pin text,
  p_current_pin text default null,
  p_threshold numeric default 2000.00
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing public.user_security%rowtype;
  v_check jsonb;
  v_threshold numeric(14, 2);
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_new_pin is null or p_new_pin !~ '^\d{4}(\d{2})?$' then
    return jsonb_build_object('success', false, 'error', 'Transaction PIN must be exactly 4 or 6 digits.');
  end if;

  v_threshold := greatest(0.00, round(coalesce(p_threshold, 2000.00)::numeric, 2));

  select * into v_existing
  from public.user_security
  where user_id = v_user_id
  for update;

  if found and v_existing.pin_hash is not null then
    v_check := private.verify_user_pin_internal(v_user_id, p_current_pin, false);
    if not coalesce((v_check->>'ok')::boolean, false) then
      return jsonb_build_object('success', false, 'error', coalesce(v_check->>'error', 'Current PIN is incorrect.'));
    end if;
  end if;

  insert into public.user_security (
    user_id, pin_hash, pin_threshold, failed_pin_attempts, pin_locked_until, pin_updated_at
  ) values (
    v_user_id,
    extensions.crypt(p_new_pin, extensions.gen_salt('bf', 10)),
    v_threshold,
    0,
    null,
    now()
  )
  on conflict (user_id) do update set
    pin_hash = excluded.pin_hash,
    pin_threshold = excluded.pin_threshold,
    failed_pin_attempts = 0,
    pin_locked_until = null,
    pin_updated_at = now();

  perform private.write_audit_log(
    v_user_id,
    v_user_id,
    case when v_existing.pin_hash is null then 'pin_set' else 'pin_changed' end,
    'user_security',
    v_user_id::text,
    null,
    jsonb_build_object('pin_threshold', v_threshold)
  );

  return jsonb_build_object(
    'success', true,
    'has_pin', true,
    'pin_threshold', v_threshold
  );
end;
$$;

create or replace function public.verify_transaction_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_res jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  v_res := private.verify_user_pin_internal(v_user_id, p_pin, true);
  return jsonb_build_object(
    'success', coalesce((v_res->>'ok')::boolean, false),
    'error', v_res->>'error',
    'locked', coalesce((v_res->>'locked')::boolean, false),
    'attempts_remaining', v_res->'attempts_remaining'
  );
end;
$$;

-- 6. WALLET FREEZE, POCKETS & SAVINGS GOALS SERVER RPCS (PRD L-4, R-5)
create or replace function public.toggle_wallet_freeze()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_next boolean;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  select * into v_wallet
  from public.wallets
  where user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  v_next := not v_wallet.is_frozen;

  update public.wallets
  set is_frozen = v_next
  where id = v_wallet.id;

  update public.accounts
  set status = case when v_next then 'frozen' else 'active' end
  where wallet_id = v_wallet.id;

  perform private.write_audit_log(
    v_user_id,
    v_user_id,
    case when v_next then 'wallet_frozen' else 'wallet_unfrozen' end,
    'wallet',
    v_wallet.id::text
  );

  return jsonb_build_object('success', true, 'is_frozen', v_next);
end;
$$;

create or replace function public.create_pocket(
  p_name text,
  p_icon text default 'folder',
  p_color text default 'green',
  p_target_amount numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_pocket public.pockets%rowtype;
  v_clean_name text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  v_clean_name := trim(coalesce(p_name, ''));
  if length(v_clean_name) < 1 or length(v_clean_name) > 80 then
    return jsonb_build_object('success', false, 'error', 'Pocket name must be 1 to 80 characters.');
  end if;

  if p_target_amount is not null and p_target_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Target amount must be positive.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  select * into v_wallet from public.wallets where user_id = v_user_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  insert into public.pockets (user_id, wallet_id, name, icon, color, target_amount, balance)
  values (
    v_user_id,
    v_wallet.id,
    v_clean_name,
    coalesce(nullif(trim(p_icon), ''), 'folder'),
    coalesce(nullif(trim(p_color), ''), 'green'),
    case when p_target_amount is null then null else round(p_target_amount::numeric, 2) end,
    0.00
  ) returning * into v_pocket;

  insert into public.accounts (owner_user_id, pocket_id, account_code, account_name, account_type, balance)
  values (
    v_user_id,
    v_pocket.id,
    'POCKET_' || replace(v_pocket.id::text, '-', ''),
    'Smart Pocket: ' || v_pocket.name,
    'user_pocket',
    0.00
  );

  return jsonb_build_object('success', true, 'pocket', row_to_json(v_pocket));
end;
$$;

create or replace function public.create_savings_goal(
  p_title text,
  p_target_amount numeric,
  p_category text default 'general',
  p_target_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_goal public.savings_goals%rowtype;
  v_clean_title text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  v_clean_title := trim(coalesce(p_title, ''));
  if length(v_clean_title) < 1 or length(v_clean_title) > 100 then
    return jsonb_build_object('success', false, 'error', 'Goal title must be 1 to 100 characters.');
  end if;

  if p_target_amount is null or p_target_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Target amount must be positive.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  select * into v_wallet from public.wallets where user_id = v_user_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  insert into public.savings_goals (
    user_id, wallet_id, title, target_amount, current_amount, category, target_date, status
  ) values (
    v_user_id,
    v_wallet.id,
    v_clean_title,
    round(p_target_amount::numeric, 2),
    0.00,
    coalesce(nullif(trim(p_category), ''), 'general'),
    p_target_date,
    'in_progress'
  ) returning * into v_goal;

  insert into public.accounts (owner_user_id, goal_id, account_code, account_name, account_type, balance)
  values (
    v_user_id,
    v_goal.id,
    'GOAL_' || replace(v_goal.id::text, '-', ''),
    'Savings Goal: ' || v_goal.title,
    'user_goal',
    0.00
  );

  return jsonb_build_object('success', true, 'goal', row_to_json(v_goal));
end;
$$;

create or replace function public.move_pocket_funds(
  p_pocket_id uuid,
  p_amount numeric,
  p_direction text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_pocket public.pockets%rowtype;
  v_wallet_acct_id uuid;
  v_pocket_acct_id uuid;
  v_amt numeric(14, 2);
  v_new_wallet_balance numeric(14, 2);
  v_new_pocket_balance numeric(14, 2);
  v_txn_id uuid;
  v_ref_id text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive with at most 2 decimals');
  end if;

  if p_direction not in ('allocate', 'withdraw') then
    return jsonb_build_object('success', false, 'error', 'Invalid transfer direction');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);
  v_amt := round(p_amount::numeric, 2);

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;
  if v_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is frozen');
  end if;

  select * into v_pocket from public.pockets where id = p_pocket_id and user_id = v_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Pocket not found');
  end if;

  select id into v_wallet_acct_id from public.accounts where wallet_id = v_wallet.id;
  select id into v_pocket_acct_id from public.accounts where pocket_id = v_pocket.id;

  if p_direction = 'allocate' then
    if v_wallet.balance < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient wallet balance');
    end if;
    v_new_wallet_balance := round((v_wallet.balance - v_amt)::numeric, 2);
    v_new_pocket_balance := round((v_pocket.balance + v_amt)::numeric, 2);
  else
    if v_pocket.balance < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient pocket balance');
    end if;
    v_new_wallet_balance := round((v_wallet.balance + v_amt)::numeric, 2);
    v_new_pocket_balance := round((v_pocket.balance - v_amt)::numeric, 2);
  end if;

  v_ref_id := 'CSH-PKT-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || lpad((floor(random() * 9000 + 1000))::text, 4, '0');

  insert into public.transactions (
    user_id, wallet_id, pocket_id, reference_id, type, amount, currency, category, status,
    counterparty_name, description, tx_kind, settled_at
  ) values (
    v_user_id,
    v_wallet.id,
    v_pocket.id,
    v_ref_id,
    case when p_direction = 'allocate' then 'transfer_out' else 'transfer_in' end,
    v_amt,
    'INR',
    'pocket_transfer',
    'completed',
    v_pocket.name,
    case when p_direction = 'allocate' then 'Moved to pocket: ' || v_pocket.name else 'Withdrawn from pocket: ' || v_pocket.name end,
    'pocket_transfer',
    now()
  ) returning id into v_txn_id;

  if p_direction = 'allocate' then
    perform private.post_ledger_pair(gen_random_uuid(), v_txn_id, v_wallet_acct_id, v_pocket_acct_id, v_amt, 'principal', 'Pocket allocation: ' || v_pocket.name);
  else
    perform private.post_ledger_pair(gen_random_uuid(), v_txn_id, v_pocket_acct_id, v_wallet_acct_id, v_amt, 'principal', 'Pocket withdrawal: ' || v_pocket.name);
  end if;

  update public.wallets set balance = v_new_wallet_balance where id = v_wallet.id;
  update public.pockets set balance = v_new_pocket_balance where id = v_pocket.id;

  return jsonb_build_object(
    'success', true,
    'wallet_balance', v_new_wallet_balance,
    'pocket_balance', v_new_pocket_balance,
    'reference_id', v_ref_id
  );
end;
$$;

create or replace function public.move_goal_funds(
  p_goal_id uuid,
  p_amount numeric,
  p_direction text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_goal public.savings_goals%rowtype;
  v_wallet_acct_id uuid;
  v_goal_acct_id uuid;
  v_amt numeric(14, 2);
  v_new_wallet_balance numeric(14, 2);
  v_new_goal_amount numeric(14, 2);
  v_new_status text;
  v_txn_id uuid;
  v_ref_id text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive with at most 2 decimals');
  end if;

  if p_direction not in ('contribute', 'withdraw') then
    return jsonb_build_object('success', false, 'error', 'Invalid transfer direction');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);
  v_amt := round(p_amount::numeric, 2);

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;
  if v_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is frozen');
  end if;

  select * into v_goal from public.savings_goals where id = p_goal_id and user_id = v_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Savings goal not found');
  end if;

  select id into v_wallet_acct_id from public.accounts where wallet_id = v_wallet.id;
  select id into v_goal_acct_id from public.accounts where goal_id = v_goal.id;

  if p_direction = 'contribute' then
    if v_wallet.balance < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient wallet balance');
    end if;
    v_new_wallet_balance := round((v_wallet.balance - v_amt)::numeric, 2);
    v_new_goal_amount := round((v_goal.current_amount + v_amt)::numeric, 2);
  else
    if v_goal.current_amount < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient goal balance');
    end if;
    v_new_wallet_balance := round((v_wallet.balance + v_amt)::numeric, 2);
    v_new_goal_amount := round((v_goal.current_amount - v_amt)::numeric, 2);
  end if;

  v_new_status := case when v_new_goal_amount >= v_goal.target_amount then 'achieved' else 'in_progress' end;
  v_ref_id := 'CSH-GL-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || lpad((floor(random() * 9000 + 1000))::text, 4, '0');

  insert into public.transactions (
    user_id, wallet_id, goal_id, reference_id, type, amount, currency, category, status,
    counterparty_name, description, tx_kind, settled_at
  ) values (
    v_user_id,
    v_wallet.id,
    v_goal.id,
    v_ref_id,
    case when p_direction = 'contribute' then 'transfer_out' else 'transfer_in' end,
    v_amt,
    'INR',
    'goal_deposit',
    'completed',
    v_goal.title,
    case when p_direction = 'contribute' then 'Saved towards goal: ' || v_goal.title else 'Withdrawn from goal: ' || v_goal.title end,
    'goal_transfer',
    now()
  ) returning id into v_txn_id;

  if p_direction = 'contribute' then
    perform private.post_ledger_pair(gen_random_uuid(), v_txn_id, v_wallet_acct_id, v_goal_acct_id, v_amt, 'principal', 'Goal deposit: ' || v_goal.title);
  else
    perform private.post_ledger_pair(gen_random_uuid(), v_txn_id, v_goal_acct_id, v_wallet_acct_id, v_amt, 'principal', 'Goal withdrawal: ' || v_goal.title);
  end if;

  update public.wallets set balance = v_new_wallet_balance where id = v_wallet.id;
  update public.savings_goals set current_amount = v_new_goal_amount, status = v_new_status where id = v_goal.id;

  return jsonb_build_object(
    'success', true,
    'wallet_balance', v_new_wallet_balance,
    'goal_amount', v_new_goal_amount,
    'goal_status', v_new_status,
    'reference_id', v_ref_id
  );
end;
$$;

-- 7. DOUBLE-ENTRY DEPOSIT & TRANSFER RPCS (PRD L-1..L-12, S-3, S-5, S-7, R-1)
create or replace function public.execute_wallet_topup(
  p_amount numeric,
  p_description text default 'Deposit via Net Banking / Card',
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_wallet_acct_id uuid;
  v_external_acct_id uuid;
  v_amt numeric(14, 2);
  v_new_bal numeric(14, 2);
  v_ref_id text;
  v_utr text;
  v_existing_txn public.transactions%rowtype;
  v_txn public.transactions%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Unauthorized. Please sign in.');
  end if;

  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Deposit amount must be positive with at most 2 decimals.');
  end if;

  v_amt := round(p_amount::numeric, 2);
  if v_amt > 500000.00 then
    return jsonb_build_object('success', false, 'error', 'Single deposit cannot exceed ₹5,00,000.00.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'No active wallet found for this account.');
  end if;

  -- Idempotency check
  if p_idempotency_key is not null and length(trim(p_idempotency_key)) > 0 then
    select * into v_existing_txn
    from public.transactions
    where user_id = v_user_id and idempotency_key = trim(p_idempotency_key);
    if found then
      return jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'new_balance', v_wallet.balance,
        'reference_id', v_existing_txn.reference_id,
        'transaction', row_to_json(v_existing_txn)
      );
    end if;
  end if;

  select id into v_wallet_acct_id from public.accounts where wallet_id = v_wallet.id;
  select id into v_external_acct_id from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING';

  v_new_bal := round((v_wallet.balance + v_amt)::numeric, 2);
  v_ref_id := 'CSH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  v_utr := 'UTR' || to_char(now(), 'YYMMDDHH24MISS') || lpad((floor(random() * 900 + 100))::text, 3, '0');

  insert into public.transactions (
    user_id, wallet_id, reference_id, utr_number, idempotency_key, type, amount, currency,
    category, status, counterparty_name, description, tx_kind, settled_at
  ) values (
    v_user_id, v_wallet.id, v_ref_id, v_utr, nullif(trim(coalesce(p_idempotency_key, '')), ''),
    'credit', v_amt, 'INR', 'other', 'completed',
    'Cash Add Funds Gateway', coalesce(nullif(trim(p_description), ''), 'Deposit via Net Banking / Card'),
    'topup', now()
  ) returning * into v_txn;

  perform private.post_ledger_pair(
    gen_random_uuid(),
    v_txn.id,
    v_external_acct_id,
    v_wallet_acct_id,
    v_amt,
    'principal',
    'Wallet top-up: ' || v_ref_id
  );

  update public.wallets set balance = v_new_bal where id = v_wallet.id;

  return jsonb_build_object(
    'success', true,
    'new_balance', v_new_bal,
    'reference_id', v_ref_id,
    'utr_number', v_utr,
    'transaction', row_to_json(v_txn)
  );
end;
$$;

create or replace function public.add_cash_funds(
  p_amount numeric,
  p_description text default 'Deposit via Net Banking / Card'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.execute_wallet_topup(p_amount, p_description, null);
end;
$$;

create or replace function public.execute_verified_transfer(
  p_recipient_identifier text,
  p_amount numeric,
  p_category text default 'peer_transfer',
  p_description text default 'Direct UPI Payment',
  p_idempotency_key text default null,
  p_pin text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender_id uuid := auth.uid();
  v_sender_wallet public.wallets%rowtype;
  v_sender_profile public.profiles%rowtype;
  v_recipient_profile record;
  v_recipient_wallet public.wallets%rowtype;
  v_sender_acct_id uuid;
  v_recipient_acct_id uuid;
  v_external_acct_id uuid;
  v_clean_ident text;
  v_amt numeric(14, 2);
  v_tier_limit numeric(14, 2);
  v_spent_today numeric(14, 2);
  v_recent_count integer;
  v_sec public.user_security%rowtype;
  v_pin_check jsonb;
  v_sender_new_bal numeric(14, 2);
  v_recipient_new_bal numeric(14, 2);
  v_ref_id text;
  v_utr text;
  v_safe_cat text;
  v_is_internal boolean := false;
  v_sender_txn public.transactions%rowtype;
  v_existing_txn public.transactions%rowtype;
  v_recipient_upi text;
  v_sender_upi text;
  v_journal_id uuid;
  v_w1 uuid;
  v_w2 uuid;
begin
  if v_sender_id is null then
    return jsonb_build_object('success', false, 'error', 'Unauthorized. Please log in.');
  end if;

  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Transfer amount must be positive with at most 2 decimals.');
  end if;

  v_amt := round(p_amount::numeric, 2);
  if trim(coalesce(p_recipient_identifier, '')) = '' then
    return jsonb_build_object('success', false, 'error', 'Recipient identifier is required.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  -- 1. Check idempotency key BEFORE moving funds (PRD L-6)
  if p_idempotency_key is not null and length(trim(p_idempotency_key)) > 0 then
    select * into v_existing_txn
    from public.transactions
    where user_id = v_sender_id and idempotency_key = trim(p_idempotency_key);
    if found then
      select balance into v_sender_new_bal from public.wallets where id = v_existing_txn.wallet_id;
      return jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'is_internal', (v_existing_txn.tx_kind = 'p2p'),
        'reference_id', v_existing_txn.reference_id,
        'sender_balance', v_sender_new_bal,
        'recipient_name', v_existing_txn.counterparty_name,
        'recipient_upi', v_existing_txn.counterparty_upi_id,
        'transaction', row_to_json(v_existing_txn)
      );
    end if;
  end if;

  -- 2. Resolve recipient (unlocked read) so we can lock both wallets in deterministic UUID order (PRD L-5)
  v_clean_ident := trim(p_recipient_identifier);
  if lower(v_clean_ident) like '%@cash' then
    v_clean_ident := substring(v_clean_ident from 1 for length(v_clean_ident) - 5);
  end if;

  select p.*, w.id as wallet_id
  into v_recipient_profile
  from public.profiles p
  join public.wallets w on w.user_id = p.id
  where (
    lower(coalesce(p.upi_id, '')) = lower(trim(p_recipient_identifier))
    or lower(p.email) = lower(trim(p_recipient_identifier))
    or lower(coalesce(p.upi_id, '')) = lower(v_clean_ident) || '@cash'
    or lower(p.email) = lower(v_clean_ident)
    or lower(split_part(p.email, '@', 1)) = lower(v_clean_ident)
    or replace(replace(replace(coalesce(p.phone, ''), ' ', ''), '-', ''), '+91', '') = replace(replace(replace(v_clean_ident, ' ', ''), '-', ''), '+91', '')
    or upper(w.wallet_number) = upper(v_clean_ident)
    or lower(p.full_name) = lower(v_clean_ident)
    or lower(p.full_name) = lower(trim(p_recipient_identifier))
  )
  and p.id <> v_sender_id
  order by
    case
      when lower(coalesce(p.upi_id, '')) = lower(trim(p_recipient_identifier)) then 1
      when lower(p.email) = lower(trim(p_recipient_identifier)) then 2
      when lower(coalesce(p.upi_id, '')) = lower(v_clean_ident) || '@cash' then 3
      when p.email like '%@cash.me' then 4
      when p.email like '%@gmail.com' then 5
      else 6
    end,
    p.created_at desc
  limit 1;

  -- 3. Lock wallets in deterministic ascending UUID order to prevent deadlocks
  select * into v_sender_wallet from public.wallets where user_id = v_sender_id;
  if v_sender_wallet.id is null then
    return jsonb_build_object('success', false, 'error', 'Sender wallet not found.');
  end if;

  if v_recipient_profile.wallet_id is not null then
    v_is_internal := true;
    v_w1 := least(v_sender_wallet.id, v_recipient_profile.wallet_id);
    v_w2 := greatest(v_sender_wallet.id, v_recipient_profile.wallet_id);
    perform id from public.wallets where id in (v_w1, v_w2) order by id for update;
    select * into v_sender_wallet from public.wallets where id = v_sender_wallet.id;
    select * into v_recipient_wallet from public.wallets where id = v_recipient_profile.wallet_id;
  else
    select * into v_sender_wallet from public.wallets where id = v_sender_wallet.id for update;
  end if;

  -- 4. Frozen, balance, tier, daily limit & rate checks (PRD S-5, S-7, R-1)
  if v_sender_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is locked/frozen. Unfreeze before making payments.');
  end if;

  if v_sender_wallet.balance < v_amt then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance. Available: ₹' || v_sender_wallet.balance);
  end if;

  select * into v_sender_profile from public.profiles where id = v_sender_id;
  v_tier_limit := case v_sender_profile.tier
    when 'basic' then 10000.00
    when 'standard' then 50000.00
    when 'premium' then 100000.00
    when 'pro' then 200000.00
    else 50000.00
  end;

  if v_amt > v_tier_limit then
    return jsonb_build_object(
      'success', false,
      'error', format('Amount exceeds your %s tier per-transaction limit (₹%s).', v_sender_profile.tier, v_tier_limit)
    );
  end if;

  select coalesce(sum(amount), 0.00)
  into v_spent_today
  from public.transactions
  where user_id = v_sender_id
    and type = 'debit'
    and status = 'completed'
    and (created_at at time zone 'Asia/Kolkata')::date = (now() at time zone 'Asia/Kolkata')::date;

  if v_spent_today + v_amt > v_sender_wallet.daily_limit then
    return jsonb_build_object(
      'success', false,
      'error', format('Daily transfer limit (₹%s) exceeded. Remaining today: ₹%s.', v_sender_wallet.daily_limit, greatest(0.00, v_sender_wallet.daily_limit - v_spent_today))
    );
  end if;

  select count(*) into v_recent_count
  from public.transactions
  where user_id = v_sender_id
    and type = 'debit'
    and created_at >= now() - interval '1 minute';

  if v_recent_count >= 50 then
    return jsonb_build_object('success', false, 'error', 'Rate limit exceeded. Please wait a minute before sending more payments.');
  end if;

  -- 5. Transaction PIN enforcement when configured and above threshold (PRD S-3)
  select * into v_sec from public.user_security where user_id = v_sender_id;
  if found and v_sec.pin_hash is not null and v_amt >= v_sec.pin_threshold then
    v_pin_check := private.verify_user_pin_internal(v_sender_id, p_pin, false);
    if not coalesce((v_pin_check->>'ok')::boolean, false) then
      return jsonb_build_object(
        'success', false,
        'pin_required', true,
        'pin_locked', coalesce((v_pin_check->>'locked')::boolean, false),
        'error', coalesce(v_pin_check->>'error', 'Transaction PIN verification failed.')
      );
    end if;
  end if;

  -- 6. Category & Reference generation
  v_safe_cat := lower(coalesce(p_category, 'peer_transfer'));
  if v_safe_cat not in (
    'salary', 'freelance', 'investment', 'refund', 'food', 'groceries', 'entertainment',
    'utilities', 'shopping', 'travel', 'health', 'education', 'pocket_transfer',
    'goal_deposit', 'peer_transfer', 'reversal', 'other'
  ) then
    v_safe_cat := 'peer_transfer';
  end if;

  v_sender_upi := coalesce(v_sender_profile.upi_id, split_part(coalesce(v_sender_profile.email, 'user'), '@', 1) || '@cash');
  v_ref_id := 'CSH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  v_utr := 'UTR' || to_char(now(), 'YYMMDDHH24MISS') || lpad((floor(random() * 900 + 100))::text, 3, '0');
  v_sender_new_bal := round((v_sender_wallet.balance - v_amt)::numeric, 2);
  v_journal_id := gen_random_uuid();

  select id into v_sender_acct_id from public.accounts where wallet_id = v_sender_wallet.id;

  if v_is_internal then
    v_recipient_upi := coalesce(v_recipient_profile.upi_id, split_part(v_recipient_profile.email, '@', 1) || '@cash');
    v_recipient_new_bal := round((v_recipient_wallet.balance + v_amt)::numeric, 2);
    select id into v_recipient_acct_id from public.accounts where wallet_id = v_recipient_wallet.id;

    update public.wallets set balance = v_sender_new_bal where id = v_sender_wallet.id;
    update public.wallets set balance = v_recipient_new_bal where id = v_recipient_wallet.id;

    insert into public.transactions (
      user_id, wallet_id, reference_id, utr_number, idempotency_key, type, amount, currency,
      category, status, counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
    ) values (
      v_sender_id, v_sender_wallet.id, v_ref_id, v_utr, nullif(trim(coalesce(p_idempotency_key, '')), ''),
      'debit', v_amt, 'INR', v_safe_cat, 'completed',
      v_recipient_profile.full_name, v_recipient_upi,
      coalesce(p_description, 'Paid to ' || v_recipient_profile.full_name), 'p2p', now()
    ) returning * into v_sender_txn;

    insert into public.transactions (
      user_id, wallet_id, reference_id, utr_number, type, amount, currency,
      category, status, counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
    ) values (
      v_recipient_profile.id, v_recipient_wallet.id, v_ref_id || '-R', v_utr,
      'credit', v_amt, 'INR', 'peer_transfer', 'completed',
      coalesce(v_sender_profile.full_name, 'Cash User'), v_sender_upi,
      'Received from ' || coalesce(v_sender_profile.full_name, 'Cash User') || ': ' || coalesce(p_description, 'UPI Transfer'),
      'p2p', now()
    );

    perform private.post_ledger_pair(
      v_journal_id,
      v_sender_txn.id,
      v_sender_acct_id,
      v_recipient_acct_id,
      v_amt,
      'principal',
      'P2P transfer ' || v_ref_id
    );

    perform private.write_audit_log(
      v_sender_id,
      v_recipient_profile.id,
      'transfer_completed',
      'transaction',
      v_sender_txn.id::text,
      null,
      jsonb_build_object('reference_id', v_ref_id, 'amount', v_amt, 'is_internal', true)
    );

    return jsonb_build_object(
      'success', true,
      'is_internal', true,
      'reference_id', v_ref_id,
      'utr_number', v_utr,
      'sender_balance', v_sender_new_bal,
      'recipient_name', v_recipient_profile.full_name,
      'recipient_upi', v_recipient_upi,
      'recipient_new_balance', v_recipient_new_bal,
      'transaction', row_to_json(v_sender_txn)
    );
  else
    select id into v_external_acct_id from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING';

    update public.wallets set balance = v_sender_new_bal where id = v_sender_wallet.id;

    insert into public.transactions (
      user_id, wallet_id, reference_id, utr_number, idempotency_key, type, amount, currency,
      category, status, counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
    ) values (
      v_sender_id, v_sender_wallet.id, v_ref_id, v_utr, nullif(trim(coalesce(p_idempotency_key, '')), ''),
      'debit', v_amt, 'INR', v_safe_cat, 'completed',
      v_clean_ident, p_recipient_identifier,
      coalesce(p_description, 'Payment to ' || v_clean_ident), 'external', now()
    ) returning * into v_sender_txn;

    perform private.post_ledger_pair(
      v_journal_id,
      v_sender_txn.id,
      v_sender_acct_id,
      v_external_acct_id,
      v_amt,
      'principal',
      'External clearing ' || v_ref_id
    );

    perform private.write_audit_log(
      v_sender_id,
      null,
      'transfer_completed',
      'transaction',
      v_sender_txn.id::text,
      null,
      jsonb_build_object('reference_id', v_ref_id, 'amount', v_amt, 'is_internal', false)
    );

    return jsonb_build_object(
      'success', true,
      'is_internal', false,
      'reference_id', v_ref_id,
      'utr_number', v_utr,
      'sender_balance', v_sender_new_bal,
      'recipient_name', v_clean_ident,
      'recipient_upi', p_recipient_identifier,
      'transaction', row_to_json(v_sender_txn)
    );
  end if;
end;
$$;

create or replace function public.transfer_cash_funds(
  p_recipient_identifier text,
  p_amount numeric,
  p_category text default 'peer_transfer',
  p_description text default 'Direct UPI Payment'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.execute_verified_transfer(
    p_recipient_identifier,
    p_amount,
    p_category,
    p_description,
    null,
    null
  );
end;
$$;

-- 8. UPDATE ONBOARDING FUNCTIONS TO PROVISION LEDGER ACCOUNTS + BALANCED BONUS
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wallet_num text;
  v_wallet_id uuid;
  v_full_name text;
  v_txn_id uuid;
  v_treasury_id uuid;
  v_acct_id uuid;
begin
  perform set_config('cash.trusted_rpc', 'on', true);

  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, full_name, email, phone, upi_id, kyc_status, tier)
  values (
    new.id,
    v_full_name,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'upi_id',
    coalesce(new.raw_user_meta_data->>'kyc_status', 'verified'),
    coalesce(new.raw_user_meta_data->>'tier', 'standard')
  )
  on conflict (id) do nothing;

  v_wallet_num := 'CSH-' || lpad((floor(random() * 9000000000 + 1000000000))::text, 10, '0');

  insert into public.wallets (user_id, wallet_number, currency, balance, daily_limit)
  values (new.id, v_wallet_num, 'INR', 10000.00, 50000.00)
  on conflict (user_id) do nothing
  returning id into v_wallet_id;

  if v_wallet_id is null then
    select id, wallet_number into v_wallet_id, v_wallet_num from public.wallets where user_id = new.id;
  end if;

  insert into public.transactions (
    user_id, wallet_id, reference_id, type, amount, currency, category, status,
    counterparty_name, description, tx_kind, settled_at
  )
  select
    new.id,
    v_wallet_id,
    'TXN_WELCOME_' || upper(substring(replace(new.id::text, '-', '') from 1 for 12)),
    'credit',
    10000.00,
    'INR',
    'refund',
    'completed',
    'Cash Onboarding',
    'Welcome bonus credited from Cash Treasury',
    'bonus',
    now()
  where not exists (
    select 1 from public.transactions where user_id = new.id
  )
  returning id into v_txn_id;

  if not exists (select 1 from public.accounts where wallet_id = v_wallet_id) then
    insert into public.accounts (
      owner_user_id, wallet_id, account_code, account_name, account_type, balance, status
    ) values (
      new.id,
      v_wallet_id,
      'WALLET_' || replace(v_wallet_id::text, '-', ''),
      'Primary Wallet (' || v_wallet_num || ')',
      'user_wallet',
      0.00,
      'active'
    ) returning id into v_acct_id;

    select id into v_treasury_id from public.accounts where account_code = 'SYS_TREASURY';
    if v_treasury_id is not null then
      perform private.post_ledger_pair(
        gen_random_uuid(),
        v_txn_id,
        v_treasury_id,
        v_acct_id,
        10000.00,
        'bonus',
        'Onboarding welcome bonus from Treasury'
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.create_cash_account(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_wallet_num text;
  v_wallet_id uuid;
  v_existing_profile uuid;
  v_base_handle text;
  v_upi_id text;
  v_suffix int := 1;
begin
  perform set_config('cash.trusted_rpc', 'on', true);

  select id into v_existing_profile from public.profiles where lower(email) = lower(p_email) limit 1;
  if v_existing_profile is not null then
    return jsonb_build_object('success', false, 'error', 'An account with this email already exists.');
  end if;

  v_user_id := gen_random_uuid();
  v_base_handle := lower(split_part(p_email, '@', 1));
  v_upi_id := v_base_handle || '@cash';
  while exists (select 1 from public.profiles where lower(upi_id) = lower(v_upi_id)) loop
    v_suffix := v_suffix + 1;
    v_upi_id := v_base_handle || v_suffix::text || '@cash';
  end loop;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    lower(p_email),
    extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone, 'upi_id', v_upi_id, 'tier', 'standard', 'kyc_status', 'verified'),
    now(), now()
  );

  select id, wallet_number into v_wallet_id, v_wallet_num from public.wallets where user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', lower(p_email),
    'full_name', p_full_name,
    'upi_id', v_upi_id,
    'wallet_number', v_wallet_num
  );
end;
$$;

-- 9. LEAST-PRIVILEGE FUNCTION GRANTS (Fixes anon_security_definer_function_executable lints)
revoke execute on function public.add_cash_funds(numeric, text) from public, anon;
grant execute on function public.add_cash_funds(numeric, text) to authenticated;

revoke execute on function public.execute_wallet_topup(numeric, text, text) from public, anon;
grant execute on function public.execute_wallet_topup(numeric, text, text) to authenticated;

revoke execute on function public.transfer_cash_funds(text, numeric, text, text) from public, anon;
grant execute on function public.transfer_cash_funds(text, numeric, text, text) to authenticated;

revoke execute on function public.execute_verified_transfer(text, numeric, text, text, text, text) from public, anon;
grant execute on function public.execute_verified_transfer(text, numeric, text, text, text, text) to authenticated;

revoke execute on function public.search_cash_users(text) from public, anon;
grant execute on function public.search_cash_users(text) to authenticated;

revoke execute on function public.toggle_wallet_freeze() from public, anon;
grant execute on function public.toggle_wallet_freeze() to authenticated;

revoke execute on function public.create_pocket(text, text, text, numeric) from public, anon;
grant execute on function public.create_pocket(text, text, text, numeric) to authenticated;

revoke execute on function public.create_savings_goal(text, numeric, text, date) from public, anon;
grant execute on function public.create_savings_goal(text, numeric, text, date) to authenticated;

revoke execute on function public.move_pocket_funds(uuid, numeric, text) from public, anon;
grant execute on function public.move_pocket_funds(uuid, numeric, text) to authenticated;

revoke execute on function public.move_goal_funds(uuid, numeric, text) from public, anon;
grant execute on function public.move_goal_funds(uuid, numeric, text) to authenticated;

revoke execute on function public.get_my_security_status() from public, anon;
grant execute on function public.get_my_security_status() to authenticated;

revoke execute on function public.set_transaction_pin(text, text, numeric) from public, anon;
grant execute on function public.set_transaction_pin(text, text, numeric) to authenticated;

revoke execute on function public.verify_transaction_pin(text) from public, anon;
grant execute on function public.verify_transaction_pin(text) to authenticated;

revoke execute on function public.create_cash_account(text, text, text, text) from public;
grant execute on function public.create_cash_account(text, text, text, text) to anon, authenticated;
