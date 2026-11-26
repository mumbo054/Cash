-- ==============================================================================
-- CASH FINTECH WALLET — PRD PHASE 3B: REQUESTS, AUTOPAY, BUDGETS, KYC & DISPUTES
-- ==============================================================================
-- Migration: 20261126080000_prd_phase3b_requests_budgets_kyc_disputes
-- ==============================================================================

create or replace function public.create_payment_request(
  p_payer_identifier text,
  p_amount numeric,
  p_note text default null,
  p_expires_hours integer default 48
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requester_id uuid := auth.uid();
  v_amt numeric(14, 2);
  v_ident text := trim(coalesce(p_payer_identifier, ''));
  v_clean text;
  v_payer public.profiles%rowtype;
  v_requester public.profiles%rowtype;
  v_ref text;
  v_req public.payment_requests%rowtype;
begin
  if v_requester_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Valid positive amount (max 2 decimals) is required');
  end if;
  if v_ident = '' then
    return jsonb_build_object('success', false, 'error', 'Payer handle or email is required');
  end if;

  v_amt := round(p_amount::numeric, 2);
  v_clean := lower(v_ident);
  if v_clean like '%@cash' then
    v_clean := substring(v_clean from 1 for length(v_clean) - 5);
  end if;

  select * into v_requester from public.profiles where id = v_requester_id;
  select * into v_payer
  from public.profiles
  where id <> v_requester_id
    and (
      lower(coalesce(upi_id, '')) = lower(v_ident)
      or lower(email) = lower(v_ident)
      or lower(coalesce(upi_id, '')) = v_clean || '@cash'
      or lower(split_part(email, '@', 1)) = v_clean
      or lower(full_name) = lower(v_ident)
    )
  order by created_at desc
  limit 1;

  v_ref := 'REQ-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  insert into public.payment_requests (
    requester_id, payer_id, payer_identifier, amount, note, reference_id, expires_at
  ) values (
    v_requester_id,
    v_payer.id,
    coalesce(v_payer.upi_id, v_payer.email, v_ident),
    v_amt,
    nullif(trim(coalesce(p_note, '')), ''),
    v_ref,
    now() + make_interval(hours => greatest(1, least(168, coalesce(p_expires_hours, 48))))
  ) returning * into v_req;

  if v_payer.id is not null then
    perform private.emit_notification(
      v_payer.id, 'request',
      format('%s requested ₹%s', coalesce(v_requester.full_name, v_requester.email), v_amt),
      coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Tap Requests & Autopay to approve or decline.'),
      false, jsonb_build_object('request_id', v_req.id, 'reference_id', v_ref, 'amount', v_amt)
    );
  end if;

  return jsonb_build_object('success', true, 'request', row_to_json(v_req));
end;
$$;

create or replace function public.respond_payment_request(
  p_request_id uuid,
  p_action text,
  p_pin text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_req public.payment_requests%rowtype;
  v_requester public.profiles%rowtype;
  v_pay_res jsonb;
  v_txn_id uuid;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select * into v_req from public.payment_requests where id = p_request_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Payment request not found');
  end if;

  if v_req.status <> 'pending' then
    return jsonb_build_object('success', false, 'error', 'Request is already ' || v_req.status);
  end if;

  if v_req.expires_at <= now() then
    update public.payment_requests set status = 'expired' where id = v_req.id;
    return jsonb_build_object('success', false, 'error', 'Payment request has expired');
  end if;

  if p_action = 'cancel' then
    if v_req.requester_id <> v_user_id then
      return jsonb_build_object('success', false, 'error', 'Only the requester can cancel this request');
    end if;
    update public.payment_requests set status = 'cancelled' where id = v_req.id;
    return jsonb_build_object('success', true, 'status', 'cancelled');
  elsif p_action = 'decline' then
    if v_req.payer_id <> v_user_id then
      return jsonb_build_object('success', false, 'error', 'Only the designated payer can decline this request');
    end if;
    update public.payment_requests set status = 'declined' where id = v_req.id;
    perform private.emit_notification(
      v_req.requester_id, 'request',
      format('Payment Request %s Declined', v_req.reference_id),
      format('₹%s request was declined.', v_req.amount),
      false, jsonb_build_object('request_id', v_req.id)
    );
    return jsonb_build_object('success', true, 'status', 'declined');
  elsif p_action = 'pay' then
    if v_req.payer_id <> v_user_id then
      return jsonb_build_object('success', false, 'error', 'Only the payer can settle this request');
    end if;

    select * into v_requester from public.profiles where id = v_req.requester_id;
    v_pay_res := public.execute_verified_transfer(
      coalesce(v_requester.upi_id, v_requester.email),
      v_req.amount,
      'peer_transfer',
      coalesce('Paid request ' || v_req.reference_id || ': ' || v_req.note, 'Paid request ' || v_req.reference_id),
      'req-' || v_req.id::text,
      p_pin
    );

    if not coalesce((v_pay_res->>'success')::boolean, false) then
      return v_pay_res;
    end if;

    v_txn_id := (v_pay_res->'transaction'->>'id')::uuid;
    update public.payment_requests
    set status = 'paid', settled_txn_id = v_txn_id
    where id = v_req.id;

    return jsonb_build_object('success', true, 'status', 'paid', 'transfer', v_pay_res);
  else
    return jsonb_build_object('success', false, 'error', 'Invalid action (use pay, decline, or cancel)');
  end if;
end;
$$;

create or replace function private.execute_scheduled_payment_row(p_sched public.scheduled_payments)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wallet public.wallets%rowtype;
  v_recipient record;
  v_recipient_wallet public.wallets%rowtype;
  v_sender_profile public.profiles%rowtype;
  v_sender_acct_id uuid;
  v_recipient_acct_id uuid;
  v_external_acct_id uuid;
  v_clean text;
  v_ref text;
  v_utr text;
  v_txn public.transactions%rowtype;
  v_next_run timestamptz;
  v_w1 uuid;
  v_w2 uuid;
begin
  perform set_config('cash.trusted_rpc', 'on', true);

  v_next_run := case p_sched.frequency
    when 'daily' then greatest(now(), p_sched.next_run_at) + interval '1 day'
    when 'weekly' then greatest(now(), p_sched.next_run_at) + interval '7 days'
    else greatest(now(), p_sched.next_run_at) + interval '1 month'
  end;

  select * into v_wallet from public.wallets where user_id = p_sched.user_id;
  select * into v_sender_profile from public.profiles where id = p_sched.user_id;

  if not found or v_wallet.is_frozen or v_wallet.balance < p_sched.amount then
    update public.scheduled_payments
    set retry_count = retry_count + 1,
        last_run_at = now(),
        last_status = 'failed',
        last_error = case
          when v_wallet.id is null then 'Wallet missing'
          when v_wallet.is_frozen then 'Wallet is frozen'
          else 'Insufficient balance'
        end,
        status = case when retry_count + 1 >= 3 then 'failed' else status end
    where id = p_sched.id;

    perform private.emit_notification(
      p_sched.user_id, 'transaction',
      format('Autopay Failed: %s', p_sched.recipient_name),
      format('Scheduled ₹%s could not run (retry %s/3).', p_sched.amount, least(3, p_sched.retry_count + 1)),
      false, jsonb_build_object('scheduled_payment_id', p_sched.id)
    );
    return jsonb_build_object('success', false, 'error', 'Scheduled payment skipped/failed');
  end if;

  v_clean := trim(p_sched.recipient_identifier);
  select p.*, w.id as wallet_id into v_recipient
  from public.profiles p
  join public.wallets w on w.user_id = p.id
  where (lower(coalesce(p.upi_id, '')) = lower(v_clean) or lower(p.email) = lower(v_clean))
    and p.id <> p_sched.user_id
  limit 1;

  if v_recipient.wallet_id is not null then
    v_w1 := least(v_wallet.id, v_recipient.wallet_id);
    v_w2 := greatest(v_wallet.id, v_recipient.wallet_id);
    perform id from public.wallets where id in (v_w1, v_w2) order by id for update;
    select * into v_wallet from public.wallets where id = v_wallet.id;
    select * into v_recipient_wallet from public.wallets where id = v_recipient.wallet_id;
  else
    select * into v_wallet from public.wallets where id = v_wallet.id for update;
  end if;

  if v_wallet.balance < p_sched.amount then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance under lock');
  end if;

  v_ref := 'CSH-AUTO-' || to_char(now(), 'YYYYMMDDHH24MI') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4));
  v_utr := 'UTR' || to_char(now(), 'YYMMDDHH24MISS') || lpad((floor(random() * 900 + 100))::text, 3, '0');
  select id into v_sender_acct_id from public.accounts where wallet_id = v_wallet.id;

  update public.wallets set balance = round((balance - p_sched.amount)::numeric, 2) where id = v_wallet.id;

  insert into public.transactions (
    user_id, wallet_id, reference_id, utr_number, type, amount, currency, category, status,
    counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
  ) values (
    p_sched.user_id, v_wallet.id, v_ref, v_utr, 'debit', p_sched.amount, 'INR',
    private.resolve_smart_category(p_sched.user_id, p_sched.recipient_identifier, p_sched.description, p_sched.category),
    'completed', p_sched.recipient_name, p_sched.recipient_identifier,
    coalesce('Autopay (' || p_sched.frequency || '): ' || p_sched.description, 'Scheduled Autopay'),
    case when v_recipient.wallet_id is not null then 'p2p' else 'external' end, now()
  ) returning * into v_txn;

  if v_recipient.wallet_id is not null then
    select id into v_recipient_acct_id from public.accounts where wallet_id = v_recipient_wallet.id;
    update public.wallets set balance = round((balance + p_sched.amount)::numeric, 2) where id = v_recipient_wallet.id;
    insert into public.transactions (
      user_id, wallet_id, reference_id, utr_number, type, amount, currency, category, status,
      counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
    ) values (
      v_recipient.id, v_recipient_wallet.id, v_ref || '-R', v_utr, 'credit', p_sched.amount, 'INR', 'peer_transfer', 'completed',
      coalesce(v_sender_profile.full_name, 'Cash Autopay'), v_sender_profile.upi_id,
      'Autopay received from ' || coalesce(v_sender_profile.full_name, v_sender_profile.email),
      'p2p', now()
    );
    perform private.post_ledger_pair(gen_random_uuid(), v_txn.id, v_sender_acct_id, v_recipient_acct_id, p_sched.amount, 'principal', 'Scheduled P2P ' || v_ref);
  else
    select id into v_external_acct_id from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING';
    perform private.post_ledger_pair(gen_random_uuid(), v_txn.id, v_sender_acct_id, v_external_acct_id, p_sched.amount, 'principal', 'Scheduled external ' || v_ref);
  end if;

  update public.scheduled_payments
  set next_run_at = v_next_run,
      last_run_at = now(),
      last_status = 'completed',
      last_error = null,
      retry_count = 0
  where id = p_sched.id;

  perform private.emit_notification(
    p_sched.user_id, 'transaction',
    format('Autopay Sent: ₹%s to %s', p_sched.amount, p_sched.recipient_name),
    format('Ref %s · Next run: %s', v_ref, to_char(v_next_run at time zone 'Asia/Kolkata', 'DD Mon YYYY')),
    false, jsonb_build_object('reference_id', v_ref, 'scheduled_payment_id', p_sched.id)
  );

  return jsonb_build_object('success', true, 'reference_id', v_ref, 'next_run_at', v_next_run);
end;
$$;

create or replace function public.create_scheduled_payment(
  p_recipient_identifier text,
  p_recipient_name text,
  p_amount numeric,
  p_category text default 'utilities',
  p_description text default 'Recurring Autopay',
  p_frequency text default 'monthly'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.scheduled_payments%rowtype;
  v_next timestamptz;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive (max 2 decimals)');
  end if;
  if p_frequency not in ('daily', 'weekly', 'monthly') then
    return jsonb_build_object('success', false, 'error', 'Frequency must be daily, weekly, or monthly');
  end if;

  v_next := case p_frequency
    when 'daily' then now() + interval '1 day'
    when 'weekly' then now() + interval '7 days'
    else now() + interval '1 month'
  end;

  insert into public.scheduled_payments (
    user_id, recipient_identifier, recipient_name, amount, category, description, frequency, next_run_at
  ) values (
    v_user_id, trim(p_recipient_identifier), trim(p_recipient_name), round(p_amount::numeric, 2),
    coalesce(nullif(trim(p_category), ''), 'utilities'),
    nullif(trim(coalesce(p_description, '')), ''),
    p_frequency, v_next
  ) returning * into v_row;

  perform private.write_audit_log(v_user_id, v_user_id, 'scheduled_payment_created', 'scheduled_payments', v_row.id::text);
  return jsonb_build_object('success', true, 'scheduled_payment', row_to_json(v_row));
end;
$$;

create or replace function public.update_scheduled_payment_status(
  p_scheduled_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.scheduled_payments%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if p_status not in ('active', 'paused', 'completed') then
    return jsonb_build_object('success', false, 'error', 'Invalid status');
  end if;

  update public.scheduled_payments
  set status = p_status
  where id = p_scheduled_id and user_id = v_user_id
  returning * into v_row;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Scheduled payment not found');
  end if;

  return jsonb_build_object('success', true, 'scheduled_payment', row_to_json(v_row));
end;
$$;

create or replace function public.run_my_scheduled_payment_now(p_scheduled_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.scheduled_payments%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select * into v_row
  from public.scheduled_payments
  where id = p_scheduled_id and user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Scheduled payment not found');
  end if;

  return private.execute_scheduled_payment_row(v_row);
end;
$$;

create or replace function public.claim_transaction_cashback(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_txn public.transactions%rowtype;
  v_wallet public.wallets%rowtype;
  v_wallet_acct_id uuid;
  v_mkt_acct_id uuid;
  v_rate numeric(5, 4) := 0.0100;
  v_reward numeric(14, 2);
  v_ref text;
  v_reward_txn public.transactions%rowtype;
  v_new_bal numeric(14, 2);
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select * into v_txn
  from public.transactions
  where id = p_transaction_id and user_id = v_user_id;

  if not found or v_txn.type <> 'debit' or v_txn.status <> 'completed' then
    return jsonb_build_object('success', false, 'error', 'Only your completed debit payments qualify for cashback');
  end if;

  v_ref := 'CBK-' || substring(replace(v_txn.id::text, '-', '') from 1 for 16);
  if exists (select 1 from public.transactions where reference_id = v_ref) then
    return jsonb_build_object('success', false, 'error', 'Cashback already claimed for this payment');
  end if;

  select m.cashback_rate into v_rate
  from public.merchants m
  where lower(coalesce(v_txn.counterparty_upi_id, '') || ' ' || coalesce(v_txn.counterparty_name, '') || ' ' || coalesce(v_txn.description, ''))
        like '%' || lower(m.keyword) || '%'
  order by m.cashback_rate desc
  limit 1;

  v_rate := coalesce(v_rate, 0.0100);
  if v_rate <= 0 then
    v_rate := 0.0100;
  end if;

  v_reward := least(100.00, greatest(1.00, round((v_txn.amount * v_rate)::numeric, 2)));

  perform set_config('cash.trusted_rpc', 'on', true);
  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  select id into v_wallet_acct_id from public.accounts where wallet_id = v_wallet.id;
  select id into v_mkt_acct_id from public.accounts where account_code = 'SYS_MARKETING';

  v_new_bal := round((v_wallet.balance + v_reward)::numeric, 2);
  update public.wallets set balance = v_new_bal where id = v_wallet.id;

  insert into public.transactions (
    user_id, wallet_id, reference_id, type, amount, currency, category, status,
    counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
  ) values (
    v_user_id, v_wallet.id, v_ref, 'credit', v_reward, 'INR', 'refund', 'completed',
    'Cash Rewards', 'rewards@cash',
    format('Instant %s%% Cashback on %s', round((v_rate * 100)::numeric, 1), coalesce(v_txn.counterparty_name, v_txn.reference_id)),
    'bonus', now()
  ) returning * into v_reward_txn;

  perform private.post_ledger_pair(
    gen_random_uuid(), v_reward_txn.id, v_mkt_acct_id, v_wallet_acct_id, v_reward, 'bonus', 'Cashback reward ' || v_ref
  );

  perform private.emit_notification(
    v_user_id, 'reward',
    format('₹%s Cashback Credited!', v_reward),
    format('Funded from Cash Marketing Rewards for %s.', v_txn.reference_id),
    false, jsonb_build_object('reference_id', v_ref, 'amount', v_reward)
  );

  return jsonb_build_object('success', true, 'reward_amount', v_reward, 'new_balance', v_new_bal, 'transaction', row_to_json(v_reward_txn));
end;
$$;

create or replace function public.update_transaction_category(
  p_transaction_id uuid,
  p_new_category text,
  p_learn_merchant boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_txn public.transactions%rowtype;
  v_cat text := lower(trim(coalesce(p_new_category, '')));
  v_key text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if v_cat not in (
    'salary', 'freelance', 'investment', 'refund', 'food', 'groceries', 'entertainment',
    'utilities', 'shopping', 'travel', 'health', 'education', 'pocket_transfer',
    'goal_deposit', 'peer_transfer', 'other'
  ) then
    return jsonb_build_object('success', false, 'error', 'Unsupported category');
  end if;

  select * into v_txn from public.transactions where id = p_transaction_id and user_id = v_user_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Transaction not found');
  end if;

  perform set_config('cash.allow_tx_category_edit', 'on', true);
  update public.transactions set category = v_cat where id = v_txn.id;

  if p_learn_merchant then
    v_key := lower(trim(coalesce(nullif(split_part(coalesce(v_txn.counterparty_upi_id, ''), '@', 1), ''), v_txn.counterparty_name, '')));
    if length(v_key) >= 3 then
      insert into public.user_merchant_rules (user_id, merchant_key, category)
      values (v_user_id, v_key, v_cat)
      on conflict (user_id, merchant_key) do update set category = excluded.category;
    end if;
  end if;

  return jsonb_build_object('success', true, 'category', v_cat);
end;
$$;

create or replace function public.upsert_budget(
  p_category text,
  p_amount_limit numeric,
  p_period text default 'monthly',
  p_alert_threshold_pct integer default 80,
  p_rollover_enabled boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cat text := lower(trim(coalesce(p_category, '')));
  v_limit numeric(14, 2);
  v_spent numeric(14, 2) := 0.00;
  v_existing public.budgets%rowtype;
  v_row public.budgets%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if v_cat = 'investment' then v_cat := 'investments'; end if;
  if v_cat not in ('food', 'groceries', 'entertainment', 'utilities', 'shopping', 'travel', 'health', 'education', 'investments', 'other') then
    return jsonb_build_object('success', false, 'error', 'Invalid budget category');
  end if;
  if p_amount_limit is null or p_amount_limit <= 0 then
    return jsonb_build_object('success', false, 'error', 'Budget limit must be positive');
  end if;

  v_limit := round(p_amount_limit::numeric, 2);
  select coalesce(sum(amount), 0.00) into v_spent
  from public.transactions
  where user_id = v_user_id and type = 'debit' and status = 'completed'
    and (category = v_cat or (v_cat = 'investments' and category = 'investment'))
    and date_trunc('month', created_at at time zone 'Asia/Kolkata') = date_trunc('month', now() at time zone 'Asia/Kolkata');

  select * into v_existing from public.budgets where user_id = v_user_id and category = v_cat limit 1;
  if found then
    update public.budgets
    set amount_limit = v_limit,
        spent_amount = v_spent,
        period = coalesce(nullif(p_period, ''), 'monthly'),
        alert_threshold_pct = least(100, greatest(20, coalesce(p_alert_threshold_pct, 80))),
        rollover_enabled = coalesce(p_rollover_enabled, false),
        is_active = true
    where id = v_existing.id
    returning * into v_row;
  else
    insert into public.budgets (
      user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, rollover_enabled, is_active
    ) values (
      v_user_id, v_cat, v_limit, v_spent, coalesce(nullif(p_period, ''), 'monthly'),
      least(100, greatest(20, coalesce(p_alert_threshold_pct, 80))), coalesce(p_rollover_enabled, false), true
    ) returning * into v_row;
  end if;

  return jsonb_build_object('success', true, 'budget', row_to_json(v_row));
end;
$$;

create or replace function public.delete_budget(p_budget_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  update public.budgets set is_active = false where id = p_budget_id and user_id = auth.uid();
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.update_pocket_automation(p_pocket_id uuid, p_auto_save_pct numeric)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_pct numeric(5, 2) := least(50.00, greatest(0.00, round(coalesce(p_auto_save_pct, 0)::numeric, 2)));
  v_row public.pockets%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  perform set_config('cash.trusted_rpc', 'on', true);
  update public.pockets set auto_save_pct = v_pct where id = p_pocket_id and user_id = v_user_id returning * into v_row;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Pocket not found');
  end if;
  return jsonb_build_object('success', true, 'pocket', row_to_json(v_row));
end;
$$;

create or replace function public.update_goal_automation(p_goal_id uuid, p_round_up_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.savings_goals%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  perform set_config('cash.trusted_rpc', 'on', true);
  update public.savings_goals set round_up_enabled = coalesce(p_round_up_enabled, false) where id = p_goal_id and user_id = v_user_id returning * into v_row;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Goal not found');
  end if;
  return jsonb_build_object('success', true, 'goal', row_to_json(v_row));
end;
$$;

create or replace function public.submit_kyc_document(
  p_doc_type text,
  p_doc_number_masked text,
  p_full_legal_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_doc public.kyc_documents%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if p_doc_type not in ('pan', 'aadhaar_masked', 'passport', 'driving_license') then
    return jsonb_build_object('success', false, 'error', 'Invalid document type');
  end if;
  if length(trim(coalesce(p_doc_number_masked, ''))) < 4 or length(trim(coalesce(p_full_legal_name, ''))) < 2 then
    return jsonb_build_object('success', false, 'error', 'Provide masked document ID (4+ chars) and full legal name');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  insert into public.kyc_documents (user_id, doc_type, doc_number_masked, full_legal_name, status)
  values (v_user_id, p_doc_type, upper(trim(p_doc_number_masked)), trim(p_full_legal_name), 'pending')
  returning * into v_doc;

  update public.profiles set kyc_status = 'pending' where id = v_user_id;

  perform private.write_audit_log(v_user_id, v_user_id, 'kyc_submitted', 'kyc_documents', v_doc.id::text, null, jsonb_build_object('doc_type', p_doc_type));
  perform private.emit_notification(v_user_id, 'kyc', 'KYC Submission Received', 'Your verification document is queued for staff review.', false);

  return jsonb_build_object('success', true, 'document', row_to_json(v_doc));
end;
$$;

create or replace function public.submit_dispute(
  p_transaction_id uuid,
  p_reason text,
  p_details text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_txn public.transactions%rowtype;
  v_disp public.disputes%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then
    return jsonb_build_object('success', false, 'error', 'Please provide a dispute reason');
  end if;

  select * into v_txn from public.transactions where id = p_transaction_id and user_id = v_user_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Transaction not found');
  end if;
  if v_txn.status <> 'completed' then
    return jsonb_build_object('success', false, 'error', 'Disputes can only be opened on completed transactions');
  end if;

  if exists (select 1 from public.disputes where user_id = v_user_id and transaction_id = p_transaction_id and status in ('open', 'under_review')) then
    return jsonb_build_object('success', false, 'error', 'An active dispute is already open for this transaction');
  end if;

  insert into public.disputes (user_id, transaction_id, reason, details)
  values (v_user_id, p_transaction_id, trim(p_reason), nullif(trim(coalesce(p_details, '')), ''))
  returning * into v_disp;

  perform private.write_audit_log(v_user_id, v_user_id, 'dispute_opened', 'disputes', v_disp.id::text, trim(p_reason), jsonb_build_object('reference_id', v_txn.reference_id));
  perform private.emit_notification(v_user_id, 'transaction', format('Dispute Opened: %s', v_txn.reference_id), 'Support will review and respond via the resolution queue.', false);

  return jsonb_build_object('success', true, 'dispute', row_to_json(v_disp));
end;
$$;

create or replace function public.mark_notifications_read(p_ids uuid[] default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_ids is null or cardinality(p_ids) = 0 then
    update public.notifications set read_at = now() where user_id = v_user_id and read_at is null;
  else
    update public.notifications set read_at = now() where user_id = v_user_id and id = any(p_ids) and read_at is null;
  end if;

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.register_device_session(
  p_device_fingerprint text,
  p_device_label text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existed boolean := false;
  v_row public.user_sessions%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if trim(coalesce(p_device_fingerprint, '')) = '' then
    return jsonb_build_object('success', false, 'error', 'Device fingerprint required');
  end if;

  select exists (
    select 1 from public.user_sessions
    where user_id = v_user_id and device_fingerprint = trim(p_device_fingerprint)
  ) into v_existed;

  insert into public.user_sessions (user_id, device_fingerprint, device_label, user_agent, is_revoked, last_seen_at)
  values (v_user_id, trim(p_device_fingerprint), coalesce(nullif(trim(p_device_label), ''), 'Web Browser'), left(coalesce(p_user_agent, ''), 240), false, now())
  on conflict (user_id, device_fingerprint) do update set
    device_label = excluded.device_label,
    user_agent = excluded.user_agent,
    last_seen_at = now()
  returning * into v_row;

  if not v_existed then
    perform private.write_audit_log(v_user_id, v_user_id, 'new_device_login', 'user_sessions', v_row.id::text, null, jsonb_build_object('device', v_row.device_label));
    perform private.emit_notification(v_user_id, 'security', 'New Device Login Detected', format('Signed in on %s.', v_row.device_label), true);
  end if;

  return jsonb_build_object('success', true, 'session', row_to_json(v_row), 'is_new_device', not v_existed);
end;
$$;

create or replace function public.revoke_device_sessions(p_session_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if p_session_id is null then
    update public.user_sessions set is_revoked = true where user_id = v_user_id;
    perform private.write_audit_log(v_user_id, v_user_id, 'sessions_revoked_all', 'user_sessions', v_user_id::text);
  else
    update public.user_sessions set is_revoked = true where id = p_session_id and user_id = v_user_id;
    perform private.write_audit_log(v_user_id, v_user_id, 'session_revoked', 'user_sessions', p_session_id::text);
  end if;

  perform private.emit_notification(v_user_id, 'security', 'Device Session Revoked', 'Active session revocation was recorded.', true);
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.export_my_account_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_payload jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select row_to_json(p) from (select id, full_name, email, phone, upi_id, kyc_status, tier, created_at from public.profiles where id = v_user_id) p),
    'wallet', (select row_to_json(w) from (select id, 'CSH-••••' || right(wallet_number, 4) as wallet_number_masked, currency, balance, is_frozen, daily_limit, created_at from public.wallets where user_id = v_user_id) w),
    'pockets', coalesce((select jsonb_agg(row_to_json(pk)) from public.pockets pk where pk.user_id = v_user_id), '[]'::jsonb),
    'savings_goals', coalesce((select jsonb_agg(row_to_json(sg)) from public.savings_goals sg where sg.user_id = v_user_id), '[]'::jsonb),
    'budgets', coalesce((select jsonb_agg(row_to_json(b)) from public.budgets b where b.user_id = v_user_id and b.is_active = true), '[]'::jsonb),
    'payees', coalesce((select jsonb_agg(row_to_json(py)) from public.payees py where py.user_id = v_user_id and py.is_active = true), '[]'::jsonb),
    'transactions', coalesce((select jsonb_agg(row_to_json(t) order by t.created_at desc) from public.transactions t where t.user_id = v_user_id), '[]'::jsonb),
    'disputes', coalesce((select jsonb_agg(row_to_json(d)) from public.disputes d where d.user_id = v_user_id), '[]'::jsonb)
  ) into v_payload;

  perform private.write_audit_log(v_user_id, v_user_id, 'data_exported', 'profiles', v_user_id::text);
  return jsonb_build_object('success', true, 'export', v_payload);
end;
$$;

create or replace function public.request_account_closure(p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reason text := trim(coalesce(p_reason, ''));
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if length(v_reason) < 3 then
    return jsonb_build_object('success', false, 'error', 'Please enter a reason (3+ chars)');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);
  update public.wallets set is_frozen = true where user_id = v_user_id;
  update public.accounts set status = 'frozen' where owner_user_id = v_user_id;
  update public.scheduled_payments set status = 'paused' where user_id = v_user_id and status = 'active';
  update public.user_sessions set is_revoked = true where user_id = v_user_id;

  perform private.write_audit_log(v_user_id, v_user_id, 'account_closure_requested', 'profiles', v_user_id::text, v_reason);
  perform private.emit_notification(v_user_id, 'security', 'Account Closure Requested', 'Wallet frozen & recurring autopays paused while immutable ledger history is archived.', true);

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.admin_get_queues()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_kyc jsonb;
  v_disputes jsonb;
  v_queue_metrics jsonb := null;
begin
  if v_user_id is null or not private.has_role(v_user_id, array['admin', 'support', 'risk_analyst']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Staff role required');
  end if;

  select coalesce(jsonb_agg(row_to_json(k)), '[]'::jsonb) into v_kyc
  from (
    select kd.*, p.full_name as user_name, p.email as user_email, p.tier as current_tier
    from public.kyc_documents kd
    join public.profiles p on p.id = kd.user_id
    order by case kd.status when 'pending' then 1 else 2 end, kd.submitted_at desc
    limit 40
  ) k;

  select coalesce(jsonb_agg(row_to_json(d)), '[]'::jsonb) into v_disputes
  from (
    select disp.*, p.full_name as user_name, p.email as user_email,
           tx.reference_id as txn_reference_id, tx.amount as txn_amount, tx.counterparty_name as txn_counterparty
    from public.disputes disp
    join public.profiles p on p.id = disp.user_id
    join public.transactions tx on tx.id = disp.transaction_id
    order by case disp.status when 'open' then 1 when 'under_review' then 2 else 3 end, disp.created_at desc
    limit 40
  ) d;

  begin
    select row_to_json(m)::jsonb into v_queue_metrics from pgmq.metrics('cash_jobs') m;
  exception when others then
    v_queue_metrics := jsonb_build_object('queue_name', 'cash_jobs', 'note', 'metrics unavailable');
  end;

  return jsonb_build_object('success', true, 'kyc_documents', v_kyc, 'disputes', v_disputes, 'queue_metrics', v_queue_metrics);
end;
$$;

create or replace function public.admin_review_kyc(
  p_kyc_id uuid,
  p_decision text,
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
  v_doc public.kyc_documents%rowtype;
begin
  if v_actor_id is null or not private.has_role(v_actor_id, array['admin', 'risk_analyst']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin or Risk Analyst role required');
  end if;
  if p_decision not in ('verified', 'rejected') then
    return jsonb_build_object('success', false, 'error', 'Decision must be verified or rejected');
  end if;
  if length(v_reason) < 3 then
    return jsonb_build_object('success', false, 'error', 'Review reason (3+ chars) required');
  end if;

  select * into v_doc from public.kyc_documents where id = p_kyc_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'KYC document not found');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  update public.kyc_documents
  set status = p_decision,
      rejection_reason = case when p_decision = 'rejected' then v_reason else null end,
      reviewed_by = v_actor_id,
      reviewed_at = now()
  where id = v_doc.id;

  update public.profiles
  set kyc_status = p_decision,
      tier = case when p_decision = 'verified' and tier = 'basic' then 'standard' else tier end
  where id = v_doc.user_id;

  perform private.write_audit_log(v_actor_id, v_doc.user_id, 'admin_kyc_' || p_decision, 'kyc_documents', v_doc.id::text, v_reason);
  perform private.emit_notification(
    v_doc.user_id, 'kyc',
    case when p_decision = 'verified' then 'KYC Approved ✓' else 'KYC Needs Attention' end,
    v_reason, true
  );

  return jsonb_build_object('success', true, 'status', p_decision);
end;
$$;

create or replace function public.admin_resolve_dispute(
  p_dispute_id uuid,
  p_action text,
  p_resolution_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_note text := trim(coalesce(p_resolution_note, ''));
  v_disp public.disputes%rowtype;
  v_rev_res jsonb;
begin
  if v_actor_id is null or not private.has_role(v_actor_id, array['admin', 'support']) then
    return jsonb_build_object('success', false, 'error', 'Forbidden: Admin or Support role required');
  end if;
  if p_action not in ('under_review', 'refund', 'reject') then
    return jsonb_build_object('success', false, 'error', 'Invalid dispute action');
  end if;
  if length(v_note) < 3 then
    return jsonb_build_object('success', false, 'error', 'Resolution note (3+ chars) required');
  end if;

  select * into v_disp from public.disputes where id = p_dispute_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Dispute not found');
  end if;

  if p_action = 'refund' then
    v_rev_res := public.admin_reverse_transaction(v_disp.transaction_id, 'Dispute refund: ' || v_note);
    if not coalesce((v_rev_res->>'success')::boolean, false) then
      return v_rev_res;
    end if;
    update public.disputes
    set status = 'resolved_refunded', resolution_note = v_note, resolved_by = v_actor_id, resolved_at = now()
    where id = v_disp.id;
  elsif p_action = 'reject' then
    update public.disputes
    set status = 'rejected', resolution_note = v_note, resolved_by = v_actor_id, resolved_at = now()
    where id = v_disp.id;
  else
    update public.disputes
    set status = 'under_review', resolution_note = v_note
    where id = v_disp.id;
  end if;

  perform private.write_audit_log(v_actor_id, v_disp.user_id, 'admin_dispute_' || p_action, 'disputes', v_disp.id::text, v_note);
  perform private.emit_notification(
    v_disp.user_id, 'transaction',
    format('Dispute Update: %s', replace(p_action, '_', ' ')),
    v_note, false, jsonb_build_object('dispute_id', v_disp.id)
  );

  return jsonb_build_object('success', true, 'action', p_action, 'reversal', v_rev_res);
end;
$$;

revoke execute on function public.create_payment_request(text, numeric, text, integer) from public, anon;
grant execute on function public.create_payment_request(text, numeric, text, integer) to authenticated;

revoke execute on function public.respond_payment_request(uuid, text, text) from public, anon;
grant execute on function public.respond_payment_request(uuid, text, text) to authenticated;

revoke execute on function public.create_scheduled_payment(text, text, numeric, text, text, text) from public, anon;
grant execute on function public.create_scheduled_payment(text, text, numeric, text, text, text) to authenticated;

revoke execute on function public.update_scheduled_payment_status(uuid, text) from public, anon;
grant execute on function public.update_scheduled_payment_status(uuid, text) to authenticated;

revoke execute on function public.run_my_scheduled_payment_now(uuid) from public, anon;
grant execute on function public.run_my_scheduled_payment_now(uuid) to authenticated;

revoke execute on function public.claim_transaction_cashback(uuid) from public, anon;
grant execute on function public.claim_transaction_cashback(uuid) to authenticated;

revoke execute on function public.update_transaction_category(uuid, text, boolean) from public, anon;
grant execute on function public.update_transaction_category(uuid, text, boolean) to authenticated;

revoke execute on function public.upsert_budget(text, numeric, text, integer, boolean) from public, anon;
grant execute on function public.upsert_budget(text, numeric, text, integer, boolean) to authenticated;

revoke execute on function public.delete_budget(uuid) from public, anon;
grant execute on function public.delete_budget(uuid) to authenticated;

revoke execute on function public.update_pocket_automation(uuid, numeric) from public, anon;
grant execute on function public.update_pocket_automation(uuid, numeric) to authenticated;

revoke execute on function public.update_goal_automation(uuid, boolean) from public, anon;
grant execute on function public.update_goal_automation(uuid, boolean) to authenticated;

revoke execute on function public.submit_kyc_document(text, text, text) from public, anon;
grant execute on function public.submit_kyc_document(text, text, text) to authenticated;

revoke execute on function public.submit_dispute(uuid, text, text) from public, anon;
grant execute on function public.submit_dispute(uuid, text, text) to authenticated;

revoke execute on function public.mark_notifications_read(uuid[]) from public, anon;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

revoke execute on function public.register_device_session(text, text, text) from public, anon;
grant execute on function public.register_device_session(text, text, text) to authenticated;

revoke execute on function public.revoke_device_sessions(uuid) from public, anon;
grant execute on function public.revoke_device_sessions(uuid) to authenticated;

revoke execute on function public.export_my_account_data() from public, anon;
grant execute on function public.export_my_account_data() to authenticated;

revoke execute on function public.request_account_closure(text) from public, anon;
grant execute on function public.request_account_closure(text) to authenticated;

revoke execute on function public.admin_get_queues() from public, anon;
grant execute on function public.admin_get_queues() to authenticated;

revoke execute on function public.admin_review_kyc(uuid, text, text) from public, anon;
grant execute on function public.admin_review_kyc(uuid, text, text) to authenticated;

revoke execute on function public.admin_resolve_dispute(uuid, text, text) from public, anon;
grant execute on function public.admin_resolve_dispute(uuid, text, text) to authenticated;
