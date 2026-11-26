-- ==============================================================================
-- CASH FINTECH WALLET — PERFORMANCE INDEXES, KEYSET PAGINATION & ATOMIC TRANSFERS
-- ==============================================================================
-- Migration: 20261126000000_performance_indexes_and_pagination
-- Purpose:
--   1. Composite indexes for O(1) keyset pagination and filtered passbook queries.
--   2. Idempotency key support for safe transfer deduplication (PRD L-6).
--   3. Atomic SECURITY INVOKER RPCs for pocket/goal transfers (eliminates client N+1 updates).
-- Rollback notes:
--   Drop added indexes/functions and `idempotency_key` column if reverting.
-- ==============================================================================

-- 1. COMPOSITE INDEXES FOR KEYSET PAGINATION & COMMON QUERIES
-- Equality columns first, sort/range columns last (PostgreSQL leftmost-prefix rule).
create index if not exists idx_transactions_wallet_created_id
  on public.transactions (wallet_id, created_at desc, id desc);

create index if not exists idx_transactions_user_created_id
  on public.transactions (user_id, created_at desc, id desc);

create index if not exists idx_transactions_user_status_created
  on public.transactions (user_id, status, created_at desc);

create index if not exists idx_transactions_user_category_created
  on public.transactions (user_id, category, created_at desc);

create index if not exists idx_pockets_user_created
  on public.pockets (user_id, created_at desc);

create index if not exists idx_savings_goals_user_created
  on public.savings_goals (user_id, created_at desc);

create index if not exists idx_budgets_user_category
  on public.budgets (user_id, category);

-- 2. IDEMPOTENCY KEY COLUMN & UNIQUE PARTIAL INDEX
alter table public.transactions
  add column if not exists idempotency_key text;

create unique index if not exists idx_transactions_user_idempotency
  on public.transactions (user_id, idempotency_key)
  where idempotency_key is not null;

-- 3. ATOMIC SUB-WALLET POCKET TRANSFER (Eliminates sequential client updates)
create or replace function public.move_pocket_funds(
  p_pocket_id uuid,
  p_amount numeric,
  p_direction text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_pocket public.pockets%rowtype;
  v_amt numeric(14, 2);
  v_new_wallet_balance numeric(14, 2);
  v_new_pocket_balance numeric(14, 2);
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be greater than zero');
  end if;

  if p_direction not in ('allocate', 'withdraw') then
    return jsonb_build_object('success', false, 'error', 'Invalid transfer direction');
  end if;

  v_amt := round(p_amount, 2);

  -- Lock wallet first, then pocket in deterministic parent -> child order to avoid deadlocks
  select * into v_wallet
  from public.wallets
  where user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  if v_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is frozen');
  end if;

  select * into v_pocket
  from public.pockets
  where id = p_pocket_id and user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Pocket not found');
  end if;

  if p_direction = 'allocate' then
    if v_wallet.balance < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient wallet balance');
    end if;
    v_new_wallet_balance := v_wallet.balance - v_amt;
    v_new_pocket_balance := v_pocket.balance + v_amt;
  else
    if v_pocket.balance < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient pocket balance');
    end if;
    v_new_wallet_balance := v_wallet.balance + v_amt;
    v_new_pocket_balance := v_pocket.balance - v_amt;
  end if;

  update public.wallets
  set balance = v_new_wallet_balance
  where id = v_wallet.id;

  update public.pockets
  set balance = v_new_pocket_balance
  where id = v_pocket.id;

  return jsonb_build_object(
    'success', true,
    'wallet_balance', v_new_wallet_balance,
    'pocket_balance', v_new_pocket_balance
  );
end;
$$;

-- 4. ATOMIC SAVINGS GOAL TRANSFER (Eliminates sequential client updates)
create or replace function public.move_goal_funds(
  p_goal_id uuid,
  p_amount numeric,
  p_direction text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.wallets%rowtype;
  v_goal public.savings_goals%rowtype;
  v_amt numeric(14, 2);
  v_new_wallet_balance numeric(14, 2);
  v_new_goal_amount numeric(14, 2);
  v_new_status text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be greater than zero');
  end if;

  if p_direction not in ('contribute', 'withdraw') then
    return jsonb_build_object('success', false, 'error', 'Invalid transfer direction');
  end if;

  v_amt := round(p_amount, 2);

  select * into v_wallet
  from public.wallets
  where user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  if v_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is frozen');
  end if;

  select * into v_goal
  from public.savings_goals
  where id = p_goal_id and user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Savings goal not found');
  end if;

  if p_direction = 'contribute' then
    if v_wallet.balance < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient wallet balance');
    end if;
    v_new_wallet_balance := v_wallet.balance - v_amt;
    v_new_goal_amount := v_goal.current_amount + v_amt;
  else
    if v_goal.current_amount < v_amt then
      return jsonb_build_object('success', false, 'error', 'Insufficient goal balance');
    end if;
    v_new_wallet_balance := v_wallet.balance + v_amt;
    v_new_goal_amount := v_goal.current_amount - v_amt;
  end if;

  v_new_status := case
    when v_new_goal_amount >= v_goal.target_amount then 'achieved'
    else 'in_progress'
  end;

  update public.wallets
  set balance = v_new_wallet_balance
  where id = v_wallet.id;

  update public.savings_goals
  set current_amount = v_new_goal_amount,
      status = v_new_status
  where id = v_goal.id;

  return jsonb_build_object(
    'success', true,
    'wallet_balance', v_new_wallet_balance,
    'goal_amount', v_new_goal_amount,
    'goal_status', v_new_status
  );
end;
$$;
