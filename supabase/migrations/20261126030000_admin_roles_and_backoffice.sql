-- ==============================================================================
-- CASH FINTECH WALLET — PHASE 1C: RBAC ROLES, LIMITS CONFIG & ADMIN BACK OFFICE
-- ==============================================================================
-- Migration: 20261126030000_admin_roles_and_backoffice
-- Implements PRD Section 4.2 (S-2) & Section 4.6:
--   1. `public.user_roles` (user, support, risk_analyst, admin) + `private.has_role()`.
--   2. `public.limits_config` (per-tier transaction & daily/monthly caps).
--   3. Admin RLS read access for `audit_logs` & `reconciliation_runs`.
--   4. User & Admin RPCs: `get_my_roles`, `get_my_ledger_entries`, `admin_get_overview`,
--      `admin_search_users`, `admin_update_user_control`, `admin_reverse_transaction`,
--      `admin_run_reconciliation`, `admin_update_limits_config`.
-- ==============================================================================

-- 1. USER ROLES TABLE (PRD S-2)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'support', 'risk_analyst', 'admin')),
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists idx_user_roles_user_id on public.user_roles (user_id);
create index if not exists idx_user_roles_role on public.user_roles (role);

alter table public.user_roles enable row level security;
revoke insert, update, delete on public.user_roles from public, anon, authenticated;

-- Private RBAC role checker (never directly exposed via PostgREST)
create or replace function private.has_role(p_user_id uuid, p_roles text[])
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = p_user_id
      and role = any(p_roles)
  );
$$;

revoke execute on function private.has_role(uuid, text[]) from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles' and policyname = 'user_roles_select_own_or_admin'
  ) then
    create policy "user_roles_select_own_or_admin" on public.user_roles
      for select
      to authenticated
      using (
        (select auth.uid()) = user_id
        or private.has_role((select auth.uid()), array['admin', 'support', 'risk_analyst'])
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'audit_logs_select_staff'
  ) then
    create policy "audit_logs_select_staff" on public.audit_logs
      for select
      to authenticated
      using (
        private.has_role((select auth.uid()), array['admin', 'support', 'risk_analyst'])
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reconciliation_runs' and policyname = 'reconciliation_runs_select_staff'
  ) then
    create policy "reconciliation_runs_select_staff" on public.reconciliation_runs
      for select
      to authenticated
      using (
        private.has_role((select auth.uid()), array['admin', 'support', 'risk_analyst'])
      );
  end if;
end $$;

-- Seed baseline 'user' role for all existing profiles + 'admin' for primary owner demo account
insert into public.user_roles (user_id, role)
select id, 'user'
from public.profiles
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'admin'
from public.profiles
where lower(email) = 'anand@gmail.com'
on conflict (user_id, role) do nothing;

-- 2. LIMITS CONFIG TABLE (PRD 4.6, R-1)
create table if not exists public.limits_config (
  tier text primary key check (tier in ('basic', 'standard', 'premium', 'pro')),
  per_txn_limit numeric(14, 2) not null check (per_txn_limit > 0),
  daily_limit numeric(14, 2) not null check (daily_limit > 0),
  monthly_limit numeric(14, 2) not null check (monthly_limit > 0),
  max_wallet_balance numeric(14, 2) not null check (max_wallet_balance > 0),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.limits_config enable row level security;
revoke insert, update, delete on public.limits_config from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'limits_config' and policyname = 'limits_config_select_authenticated'
  ) then
    create policy "limits_config_select_authenticated" on public.limits_config
      for select
      to authenticated
      using (true);
  end if;
end $$;

insert into public.limits_config (tier, per_txn_limit, daily_limit, monthly_limit, max_wallet_balance)
values
  ('basic', 10000.00, 20000.00, 100000.00, 100000.00),
  ('standard', 50000.00, 50000.00, 300000.00, 500000.00),
  ('premium', 100000.00, 100000.00, 1000000.00, 1000000.00),
  ('pro', 200000.00, 250000.00, 2500000.00, 2500000.00)
on conflict (tier) do nothing;

-- 3. USER ROLE & LEDGER VIEW RPCS
create or replace function public.get_my_roles()
returns text[]
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    array(
      select role
      from public.user_roles
      where user_id = auth.uid()
      order by case role
        when 'admin' then 1
        when 'risk_analyst' then 2
        when 'support' then 3
        else 4
      end
    ),
    array['user']::text[]
  );
$$;

create or replace function public.get_my_ledger_entries(p_limit integer default 40)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_entries jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  into v_entries
  from (
    select
      le.id,
      le.journal_id,
      le.transaction_id,
      a.account_code,
      a.account_name,
      a.account_type,
      le.direction,
      le.amount,
      le.running_balance,
      le.entry_type,
      le.reversal_of,
      le.description,
      le.created_at
    from public.ledger_entries le
    join public.accounts a on a.id = le.account_id
    where a.owner_user_id = v_user_id
    order by le.created_at desc, le.id desc
    limit least(greatest(coalesce(p_limit, 40), 1), 100)
  ) t;

  return jsonb_build_object('success', true, 'entries', v_entries);
end;
$$;

-- 4. ADMIN BACK-OFFICE RPCS (PRD 4.6)
create or replace function public.admin_get_overview()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_kpis jsonb;
  v_latest_recon jsonb;
  v_recent_txns jsonb;
  v_recent_audits jsonb;
  v_limits jsonb;
begin
  if v_user_id is null or not private.has_role(v_user_id, array['admin', 'support', 'risk_analyst']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin/Support role required');
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'total_wallet_float', (select coalesce(sum(balance), 0.00) from public.wallets),
    'total_pocket_float', (select coalesce(sum(balance), 0.00) from public.pockets),
    'total_goal_float', (select coalesce(sum(current_amount), 0.00) from public.savings_goals),
    'treasury_balance', (select coalesce(balance, 0.00) from public.accounts where account_code = 'SYS_TREASURY'),
    'external_clearing_balance', (select coalesce(balance, 0.00) from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING'),
    'total_transactions', (select count(*) from public.transactions),
    'frozen_wallets', (select count(*) from public.wallets where is_frozen = true),
    'reversed_transactions', (select count(*) from public.transactions where status = 'reversed')
  ) into v_kpis;

  select row_to_json(r)::jsonb into v_latest_recon
  from (
    select id, run_at, accounts_checked, mismatches_found, total_system_net
    from public.reconciliation_runs
    order by run_at desc
    limit 1
  ) r;

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_recent_txns
  from (
    select
      tx.id,
      tx.reference_id,
      tx.type,
      tx.amount,
      tx.category,
      tx.status,
      tx.tx_kind,
      tx.counterparty_name,
      tx.counterparty_upi_id,
      tx.reversal_of,
      tx.created_at,
      p.full_name as user_name,
      p.email as user_email
    from public.transactions tx
    join public.profiles p on p.id = tx.user_id
    order by tx.created_at desc
    limit 30
  ) t;

  select coalesce(jsonb_agg(row_to_json(a)), '[]'::jsonb) into v_recent_audits
  from (
    select
      al.id,
      al.action,
      al.entity_type,
      al.entity_id,
      al.reason,
      al.metadata,
      al.created_at,
      actor.email as actor_email,
      target.email as target_email
    from public.audit_logs al
    left join public.profiles actor on actor.id = al.actor_user_id
    left join public.profiles target on target.id = al.target_user_id
    order by al.created_at desc
    limit 30
  ) a;

  select coalesce(jsonb_agg(row_to_json(lc)), '[]'::jsonb) into v_limits
  from (
    select tier, per_txn_limit, daily_limit, monthly_limit, max_wallet_balance, updated_at
    from public.limits_config
    order by per_txn_limit asc
  ) lc;

  return jsonb_build_object(
    'success', true,
    'kpis', v_kpis,
    'latest_reconciliation', v_latest_recon,
    'recent_transactions', v_recent_txns,
    'recent_audits', v_recent_audits,
    'limits_config', v_limits
  );
end;
$$;

create or replace function public.admin_search_users(p_query text default '')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_q text := lower(trim(coalesce(p_query, '')));
  v_users jsonb;
begin
  if v_user_id is null or not private.has_role(v_user_id, array['admin', 'support', 'risk_analyst']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin/Support role required');
  end if;

  select coalesce(jsonb_agg(row_to_json(u)), '[]'::jsonb) into v_users
  from (
    select
      p.id,
      p.full_name,
      p.email,
      p.phone,
      p.upi_id,
      p.kyc_status,
      p.tier,
      w.id as wallet_id,
      w.wallet_number,
      w.balance,
      w.is_frozen,
      w.daily_limit,
      coalesce(array(select ur.role from public.user_roles ur where ur.user_id = p.id), array['user']::text[]) as roles
    from public.profiles p
    left join public.wallets w on w.user_id = p.id
    where v_q = ''
       or lower(p.full_name) like '%' || v_q || '%'
       or lower(p.email) like '%' || v_q || '%'
       or lower(coalesce(p.upi_id, '')) like '%' || v_q || '%'
       or lower(coalesce(w.wallet_number, '')) like '%' || v_q || '%'
    order by p.created_at desc
    limit 40
  ) u;

  return jsonb_build_object('success', true, 'users', v_users);
end;
$$;

create or replace function public.admin_update_user_control(
  p_target_user_id uuid,
  p_action text,
  p_value text default null,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_reason text := trim(coalesce(p_reason, ''));
  v_new_daily numeric(14, 2);
begin
  if v_actor_id is null or not private.has_role(v_actor_id, array['admin', 'support', 'risk_analyst']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin/Support role required');
  end if;

  if length(v_reason) < 3 then
    return jsonb_build_object('success', false, 'error', 'A reason (at least 3 characters) is required for audit compliance.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  if p_action in ('freeze', 'unfreeze') then
    update public.wallets
    set is_frozen = (p_action = 'freeze')
    where user_id = p_target_user_id;

    if not found then
      return jsonb_build_object('success', false, 'error', 'Target wallet not found');
    end if;

    update public.accounts
    set status = case when p_action = 'freeze' then 'frozen' else 'active' end
    where owner_user_id = p_target_user_id and account_type = 'user_wallet';

    perform private.write_audit_log(
      v_actor_id, p_target_user_id,
      case when p_action = 'freeze' then 'admin_freeze' else 'admin_unfreeze' end,
      'wallet', p_target_user_id::text, v_reason
    );

    return jsonb_build_object('success', true, 'action', p_action);
  elsif p_action = 'kyc_status' then
    if p_value not in ('unverified', 'pending', 'verified', 'rejected') then
      return jsonb_build_object('success', false, 'error', 'Invalid KYC status');
    end if;

    update public.profiles set kyc_status = p_value where id = p_target_user_id;
    if not found then
      return jsonb_build_object('success', false, 'error', 'Target profile not found');
    end if;

    perform private.write_audit_log(
      v_actor_id, p_target_user_id, 'admin_kyc_update', 'profile', p_target_user_id::text, v_reason,
      jsonb_build_object('kyc_status', p_value)
    );

    return jsonb_build_object('success', true, 'kyc_status', p_value);
  elsif p_action = 'tier' then
    if p_value not in ('basic', 'standard', 'premium', 'pro') then
      return jsonb_build_object('success', false, 'error', 'Invalid user tier');
    end if;

    select daily_limit into v_new_daily from public.limits_config where tier = p_value;

    update public.profiles set tier = p_value where id = p_target_user_id;
    if not found then
      return jsonb_build_object('success', false, 'error', 'Target profile not found');
    end if;

    if v_new_daily is not null then
      update public.wallets set daily_limit = v_new_daily where user_id = p_target_user_id;
    end if;

    perform private.write_audit_log(
      v_actor_id, p_target_user_id, 'admin_tier_update', 'profile', p_target_user_id::text, v_reason,
      jsonb_build_object('tier', p_value, 'daily_limit', v_new_daily)
    );

    return jsonb_build_object('success', true, 'tier', p_value, 'daily_limit', v_new_daily);
  else
    return jsonb_build_object('success', false, 'error', 'Unsupported admin action');
  end if;
end;
$$;

create or replace function public.admin_reverse_transaction(
  p_transaction_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_reason text := trim(coalesce(p_reason, ''));
  v_orig public.transactions%rowtype;
  v_linked_credit public.transactions%rowtype;
  v_sender_wallet public.wallets%rowtype;
  v_recipient_wallet public.wallets%rowtype;
  v_sender_acct_id uuid;
  v_recipient_acct_id uuid;
  v_external_acct_id uuid;
  v_rev_ref text;
  v_rev_txn public.transactions%rowtype;
  v_w1 uuid;
  v_w2 uuid;
begin
  if v_actor_id is null or not private.has_role(v_actor_id, array['admin', 'support']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin or Support role required');
  end if;

  if length(v_reason) < 3 then
    return jsonb_build_object('success', false, 'error', 'A reversal reason (at least 3 characters) is required.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);
  perform set_config('cash.allow_tx_reversal', 'on', true);

  select * into v_orig from public.transactions where id = p_transaction_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Transaction not found.');
  end if;

  if v_orig.status <> 'completed' then
    return jsonb_build_object('success', false, 'error', 'Only completed transactions can be reversed.');
  end if;

  if v_orig.reversal_of is not null or exists (select 1 from public.transactions where reversal_of = v_orig.id) then
    return jsonb_build_object('success', false, 'error', 'Transaction has already been reversed.');
  end if;

  v_rev_ref := 'REV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  -- Check if internal P2P transfer with linked '-R' credit leg
  if v_orig.type = 'debit' and v_orig.tx_kind = 'p2p' then
    select * into v_linked_credit
    from public.transactions
    where reference_id = v_orig.reference_id || '-R'
      and type = 'credit'
      and status = 'completed'
    for update;

    if found then
      v_w1 := least(v_orig.wallet_id, v_linked_credit.wallet_id);
      v_w2 := greatest(v_orig.wallet_id, v_linked_credit.wallet_id);
      perform id from public.wallets where id in (v_w1, v_w2) order by id for update;

      select * into v_sender_wallet from public.wallets where id = v_orig.wallet_id;
      select * into v_recipient_wallet from public.wallets where id = v_linked_credit.wallet_id;

      if v_recipient_wallet.balance < v_orig.amount then
        return jsonb_build_object('success', false, 'error', 'Recipient has insufficient balance to cover reversal.');
      end if;

      select id into v_sender_acct_id from public.accounts where wallet_id = v_sender_wallet.id;
      select id into v_recipient_acct_id from public.accounts where wallet_id = v_recipient_wallet.id;

      update public.wallets set balance = round((balance + v_orig.amount)::numeric, 2) where id = v_sender_wallet.id;
      update public.wallets set balance = round((balance - v_orig.amount)::numeric, 2) where id = v_recipient_wallet.id;

      update public.transactions set status = 'reversed' where id in (v_orig.id, v_linked_credit.id);

      insert into public.transactions (
        user_id, wallet_id, reference_id, type, amount, currency, category, status,
        counterparty_name, counterparty_upi_id, description, reversal_of, tx_kind, settled_at
      ) values (
        v_orig.user_id, v_orig.wallet_id, v_rev_ref, 'credit', v_orig.amount, 'INR', 'reversal', 'completed',
        v_orig.counterparty_name, v_orig.counterparty_upi_id,
        'Reversal of ' || v_orig.reference_id || ': ' || v_reason,
        v_orig.id, 'reversal', now()
      ) returning * into v_rev_txn;

      insert into public.transactions (
        user_id, wallet_id, reference_id, type, amount, currency, category, status,
        counterparty_name, counterparty_upi_id, description, reversal_of, tx_kind, settled_at
      ) values (
        v_linked_credit.user_id, v_linked_credit.wallet_id, v_rev_ref || '-R', 'debit', v_orig.amount, 'INR', 'reversal', 'completed',
        v_linked_credit.counterparty_name, v_linked_credit.counterparty_upi_id,
        'Reversal debit for ' || v_orig.reference_id || ': ' || v_reason,
        v_linked_credit.id, 'reversal', now()
      );

      perform private.post_ledger_pair(
        gen_random_uuid(), v_rev_txn.id, v_recipient_acct_id, v_sender_acct_id,
        v_orig.amount, 'reversal', 'Admin reversal of ' || v_orig.reference_id
      );

      perform private.write_audit_log(
        v_actor_id, v_orig.user_id, 'admin_reverse_txn', 'transaction', v_orig.id::text, v_reason,
        jsonb_build_object('reversal_reference', v_rev_ref, 'amount', v_orig.amount, 'is_internal', true)
      );

      return jsonb_build_object('success', true, 'reversal_reference', v_rev_ref, 'transaction', row_to_json(v_rev_txn));
    end if;
  end if;

  -- External debit or topup reversal
  select * into v_sender_wallet from public.wallets where id = v_orig.wallet_id for update;
  select id into v_sender_acct_id from public.accounts where wallet_id = v_sender_wallet.id;
  select id into v_external_acct_id from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING';

  if v_orig.type = 'debit' then
    update public.wallets set balance = round((balance + v_orig.amount)::numeric, 2) where id = v_sender_wallet.id;
    update public.transactions set status = 'reversed' where id = v_orig.id;

    insert into public.transactions (
      user_id, wallet_id, reference_id, type, amount, currency, category, status,
      counterparty_name, counterparty_upi_id, description, reversal_of, tx_kind, settled_at
    ) values (
      v_orig.user_id, v_orig.wallet_id, v_rev_ref, 'credit', v_orig.amount, 'INR', 'reversal', 'completed',
      v_orig.counterparty_name, v_orig.counterparty_upi_id,
      'Reversal of ' || v_orig.reference_id || ': ' || v_reason,
      v_orig.id, 'reversal', now()
    ) returning * into v_rev_txn;

    perform private.post_ledger_pair(
      gen_random_uuid(), v_rev_txn.id, v_external_acct_id, v_sender_acct_id,
      v_orig.amount, 'reversal', 'Admin reversal of ' || v_orig.reference_id
    );
  elsif v_orig.type = 'credit' then
    if v_sender_wallet.balance < v_orig.amount then
      return jsonb_build_object('success', false, 'error', 'Wallet has insufficient balance to reverse this credit.');
    end if;

    update public.wallets set balance = round((balance - v_orig.amount)::numeric, 2) where id = v_sender_wallet.id;
    update public.transactions set status = 'reversed' where id = v_orig.id;

    insert into public.transactions (
      user_id, wallet_id, reference_id, type, amount, currency, category, status,
      counterparty_name, counterparty_upi_id, description, reversal_of, tx_kind, settled_at
    ) values (
      v_orig.user_id, v_orig.wallet_id, v_rev_ref, 'debit', v_orig.amount, 'INR', 'reversal', 'completed',
      v_orig.counterparty_name, v_orig.counterparty_upi_id,
      'Reversal of ' || v_orig.reference_id || ': ' || v_reason,
      v_orig.id, 'reversal', now()
    ) returning * into v_rev_txn;

    perform private.post_ledger_pair(
      gen_random_uuid(), v_rev_txn.id, v_sender_acct_id, v_external_acct_id,
      v_orig.amount, 'reversal', 'Admin reversal of ' || v_orig.reference_id
    );
  else
    return jsonb_build_object('success', false, 'error', 'Pocket/goal transfers cannot be reversed from this action.');
  end if;

  perform private.write_audit_log(
    v_actor_id, v_orig.user_id, 'admin_reverse_txn', 'transaction', v_orig.id::text, v_reason,
    jsonb_build_object('reversal_reference', v_rev_ref, 'amount', v_orig.amount, 'is_internal', false)
  );

  return jsonb_build_object('success', true, 'reversal_reference', v_rev_ref, 'transaction', row_to_json(v_rev_txn));
end;
$$;

create or replace function public.admin_run_reconciliation()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_res jsonb;
begin
  if v_actor_id is null or not private.has_role(v_actor_id, array['admin', 'risk_analyst']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin or Risk Analyst role required');
  end if;

  v_res := private.run_reconciliation_internal(v_actor_id);

  perform private.write_audit_log(
    v_actor_id, null, 'reconciliation_run', 'reconciliation_runs', v_res->>'run_id',
    'Manual reconciliation triggered from Admin Back Office',
    v_res
  );

  return jsonb_build_object('success', true) || v_res;
end;
$$;

create or replace function public.admin_update_limits_config(
  p_tier text,
  p_per_txn_limit numeric,
  p_daily_limit numeric,
  p_monthly_limit numeric,
  p_max_wallet_balance numeric,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_reason text := trim(coalesce(p_reason, ''));
begin
  if v_actor_id is null or not private.has_role(v_actor_id, array['admin']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin role required');
  end if;

  if length(v_reason) < 3 then
    return jsonb_build_object('success', false, 'error', 'A reason is required for limit configuration changes.');
  end if;

  if p_tier not in ('basic', 'standard', 'premium', 'pro') then
    return jsonb_build_object('success', false, 'error', 'Invalid tier');
  end if;

  update public.limits_config
  set per_txn_limit = round(p_per_txn_limit::numeric, 2),
      daily_limit = round(p_daily_limit::numeric, 2),
      monthly_limit = round(p_monthly_limit::numeric, 2),
      max_wallet_balance = round(p_max_wallet_balance::numeric, 2),
      updated_by = v_actor_id,
      updated_at = now()
  where tier = p_tier;

  perform private.write_audit_log(
    v_actor_id, null, 'admin_limits_update', 'limits_config', p_tier, v_reason,
    jsonb_build_object('per_txn_limit', p_per_txn_limit, 'daily_limit', p_daily_limit)
  );

  return jsonb_build_object('success', true, 'tier', p_tier);
end;
$$;

-- Restrict execute permissions to authenticated users only
revoke execute on function public.get_my_roles() from public, anon;
grant execute on function public.get_my_roles() to authenticated;

revoke execute on function public.get_my_ledger_entries(integer) from public, anon;
grant execute on function public.get_my_ledger_entries(integer) to authenticated;

revoke execute on function public.admin_get_overview() from public, anon;
grant execute on function public.admin_get_overview() to authenticated;

revoke execute on function public.admin_search_users(text) from public, anon;
grant execute on function public.admin_search_users(text) to authenticated;

revoke execute on function public.admin_update_user_control(uuid, text, text, text) from public, anon;
grant execute on function public.admin_update_user_control(uuid, text, text, text) to authenticated;

revoke execute on function public.admin_reverse_transaction(uuid, text) from public, anon;
grant execute on function public.admin_reverse_transaction(uuid, text) to authenticated;

revoke execute on function public.admin_run_reconciliation() from public, anon;
grant execute on function public.admin_run_reconciliation() to authenticated;

revoke execute on function public.admin_update_limits_config(text, numeric, numeric, numeric, numeric, text) from public, anon;
grant execute on function public.admin_update_limits_config(text, numeric, numeric, numeric, numeric, text) to authenticated;
