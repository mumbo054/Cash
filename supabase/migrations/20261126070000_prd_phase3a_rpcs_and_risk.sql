-- ==============================================================================
-- CASH FINTECH WALLET — PRD PHASE 3A: RISK QUOTES, FEES/GST & PAYEE COOLING-OFF
-- ==============================================================================
-- Migration: 20261126070000_prd_phase3a_rpcs_and_risk
-- ==============================================================================

alter table public.payees add column if not exists is_active boolean not null default true;
alter table public.budgets add column if not exists is_active boolean not null default true;

create or replace function private.guard_transactions_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'transactions is strictly append-only and cannot be erased'
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

    if current_setting('cash.allow_tx_category_edit', true) = 'on'
       and new.status = old.status
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

create or replace function private.emit_notification(
  p_user_id uuid,
  p_category text,
  p_title text,
  p_body text,
  p_is_security boolean default false,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prefs public.notification_preferences%rowtype;
  v_should_send boolean := true;
  v_notif_id uuid;
begin
  if p_user_id is null then
    return;
  end if;

  select * into v_prefs
  from public.notification_preferences
  where user_id = p_user_id;

  if found and not p_is_security then
    if p_category = 'transaction' then v_should_send := v_prefs.tx_alerts;
    elsif p_category = 'budget' then v_should_send := v_prefs.budget_alerts;
    elsif p_category = 'request' then v_should_send := v_prefs.request_alerts;
    elsif p_category = 'reward' then v_should_send := v_prefs.marketing_alerts;
    end if;
  end if;

  if not coalesce(v_should_send, true) then
    return;
  end if;

  insert into public.notifications (
    user_id, category, title, body, is_security_mandatory, metadata
  ) values (
    p_user_id, p_category, p_title, p_body, p_is_security, coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_notif_id;

  begin
    perform pgmq.send(
      'cash_jobs',
      jsonb_build_object(
        'job_type', 'notification_dispatch',
        'notification_id', v_notif_id,
        'user_id', p_user_id,
        'category', p_category,
        'created_at', now()
      )
    );
  exception when others then
    null;
  end;
end;
$$;

create or replace function private.resolve_smart_category(
  p_user_id uuid,
  p_identifier text,
  p_description text,
  p_requested text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req text := lower(trim(coalesce(p_requested, '')));
  v_haystack text := lower(trim(coalesce(p_identifier, '') || ' ' || coalesce(p_description, '')));
  v_rule_cat text;
  v_merchant_cat text;
begin
  if v_req <> '' and v_req not in ('other', 'auto', 'imps_payout') and v_req in (
    'salary', 'freelance', 'investment', 'refund', 'food', 'groceries', 'entertainment',
    'utilities', 'shopping', 'travel', 'health', 'education', 'pocket_transfer',
    'goal_deposit', 'peer_transfer', 'reversal'
  ) then
    return v_req;
  end if;

  select umr.category into v_rule_cat
  from public.user_merchant_rules umr
  where umr.user_id = p_user_id
    and v_haystack like '%' || lower(umr.merchant_key) || '%'
  order by length(umr.merchant_key) desc
  limit 1;

  if v_rule_cat is not null then
    return v_rule_cat;
  end if;

  select m.category into v_merchant_cat
  from public.merchants m
  where v_haystack like '%' || lower(m.keyword) || '%'
  order by length(m.keyword) desc
  limit 1;

  if v_merchant_cat is not null then
    return v_merchant_cat;
  end if;

  if v_req = 'imps_payout' then
    return 'utilities';
  end if;

  return coalesce(nullif(v_req, ''), 'peer_transfer');
end;
$$;

create or replace function private.assess_transfer_quote(
  p_sender_id uuid,
  p_recipient_identifier text,
  p_amount numeric,
  p_rail text default 'upi'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amt numeric(14, 2) := round(coalesce(p_amount, 0.00)::numeric, 2);
  v_profile public.profiles%rowtype;
  v_wallet public.wallets%rowtype;
  v_limits public.limits_config%rowtype;
  v_payee public.payees%rowtype;
  v_daily_spent numeric(14, 2) := 0.00;
  v_monthly_spent numeric(14, 2) := 0.00;
  v_avg_debit numeric(14, 2) := 0.00;
  v_recent_10m integer := 0;
  v_duplicate_recent boolean := false;
  v_cooling_active boolean := false;
  v_cooling_until timestamptz := null;
  v_cooling_cap numeric(14, 2) := 5000.00;
  v_fee numeric(14, 2) := 0.00;
  v_gst numeric(14, 2) := 0.00;
  v_risk_score integer := 5;
  v_risk_level text := 'low';
  v_risk_reasons text[] := array[]::text[];
  v_predicted_cat text;
  v_cashback_rate numeric(5, 4) := 0.0000;
  v_ident text := lower(trim(coalesce(p_recipient_identifier, '')));
begin
  select * into v_profile from public.profiles where id = p_sender_id;
  select * into v_wallet from public.wallets where user_id = p_sender_id;
  select * into v_limits from public.limits_config where tier = coalesce(v_profile.tier, 'standard');

  select coalesce(sum(amount), 0.00) into v_daily_spent
  from public.transactions
  where user_id = p_sender_id and type = 'debit' and status = 'completed'
    and (created_at at time zone 'Asia/Kolkata')::date = (now() at time zone 'Asia/Kolkata')::date;

  select coalesce(sum(amount), 0.00) into v_monthly_spent
  from public.transactions
  where user_id = p_sender_id and type = 'debit' and status = 'completed'
    and date_trunc('month', created_at at time zone 'Asia/Kolkata') = date_trunc('month', now() at time zone 'Asia/Kolkata');

  select coalesce(avg(amount), 0.00) into v_avg_debit
  from public.transactions
  where user_id = p_sender_id and type = 'debit' and status = 'completed'
    and created_at >= now() - interval '30 days';

  select count(*) into v_recent_10m
  from public.transactions
  where user_id = p_sender_id and type = 'debit'
    and created_at >= now() - interval '10 minutes';

  select exists (
    select 1 from public.transactions
    where user_id = p_sender_id
      and type = 'debit'
      and status = 'completed'
      and amount = v_amt
      and created_at >= now() - interval '5 minutes'
      and (
        lower(coalesce(counterparty_upi_id, '')) = v_ident
        or lower(coalesce(counterparty_name, '')) = v_ident
      )
  ) into v_duplicate_recent;

  select * into v_payee
  from public.payees
  where user_id = p_sender_id
    and is_active = true
    and (lower(payee_identifier) = v_ident or lower(coalesce(upi_id, '')) = v_ident)
  limit 1;

  if found and not v_payee.is_verified and v_payee.cooling_until > now() then
    v_cooling_active := true;
    v_cooling_until := v_payee.cooling_until;
  end if;

  if lower(coalesce(p_rail, 'upi')) in ('card', 'imps', 'imps_payout') and v_amt >= 5000.00 then
    v_fee := 10.00;
    v_gst := 1.80;
  end if;

  v_predicted_cat := private.resolve_smart_category(p_sender_id, p_recipient_identifier, '', 'other');

  select coalesce(m.cashback_rate, 0.0000) into v_cashback_rate
  from public.merchants m
  where v_ident like '%' || lower(m.keyword) || '%'
  order by length(m.keyword) desc
  limit 1;

  if v_duplicate_recent then
    v_risk_score := v_risk_score + 30;
    v_risk_reasons := array_append(v_risk_reasons, 'Duplicate amount to same payee within 5 minutes');
  end if;

  if v_cooling_active then
    v_risk_score := v_risk_score + 20;
    v_risk_reasons := array_append(v_risk_reasons, 'New payee in 24h cooling-off window');
  end if;

  if v_recent_10m >= 5 then
    v_risk_score := v_risk_score + 25;
    v_risk_reasons := array_append(v_risk_reasons, 'High transfer velocity in last 10 minutes');
  end if;

  if v_avg_debit > 0 and v_amt > greatest(v_avg_debit * 3.0, 5000.00) then
    v_risk_score := v_risk_score + 20;
    v_risk_reasons := array_append(v_risk_reasons, 'Amount >3x recent 30-day average spend');
  end if;

  v_risk_score := least(100, v_risk_score);
  if v_risk_score >= 70 then v_risk_level := 'high';
  elsif v_risk_score >= 35 then v_risk_level := 'medium';
  else v_risk_level := 'low';
  end if;

  return jsonb_build_object(
    'amount', v_amt,
    'fee_amount', v_fee,
    'gst_amount', v_gst,
    'total_payable', round((v_amt + v_fee + v_gst)::numeric, 2),
    'tier', coalesce(v_profile.tier, 'standard'),
    'per_txn_limit', coalesce(v_limits.per_txn_limit, 50000.00),
    'daily_limit', least(coalesce(v_wallet.daily_limit, 50000.00), coalesce(v_limits.daily_limit, 50000.00)),
    'daily_spent', v_daily_spent,
    'monthly_limit', coalesce(v_limits.monthly_limit, 200000.00),
    'monthly_spent', v_monthly_spent,
    'cooling_off_active', v_cooling_active,
    'cooling_until', v_cooling_until,
    'cooling_cap', v_cooling_cap,
    'duplicate_recent', v_duplicate_recent,
    'predicted_category', v_predicted_cat,
    'cashback_rate', coalesce(v_cashback_rate, 0.0000),
    'risk_score', v_risk_score,
    'risk_level', v_risk_level,
    'risk_reasons', v_risk_reasons
  );
end;
$$;

create or replace function public.preview_transfer_quote(
  p_recipient_identifier text,
  p_amount numeric,
  p_rail text default 'upi'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_quote jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  v_quote := private.assess_transfer_quote(v_user_id, p_recipient_identifier, p_amount, p_rail);
  return jsonb_build_object('success', true) || v_quote;
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
  v_fees_acct_id uuid;
  v_clean_ident text;
  v_amt numeric(14, 2);
  v_fee numeric(14, 2) := 0.00;
  v_gst numeric(14, 2) := 0.00;
  v_total_debit numeric(14, 2);
  v_quote jsonb;
  v_tier_limit numeric(14, 2);
  v_daily_limit numeric(14, 2);
  v_monthly_limit numeric(14, 2);
  v_spent_today numeric(14, 2);
  v_spent_month numeric(14, 2);
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
  v_risk_score integer := 5;
  v_risk_level text := 'low';
  v_rail text := 'upi';
  v_budget public.budgets%rowtype;
  v_budget_cat text;
  v_budget_spent numeric(14, 2);
  v_budget_pct integer;
  v_budget_cap numeric(14, 2);
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
        'utr_number', v_existing_txn.utr_number,
        'sender_balance', v_sender_new_bal,
        'recipient_name', v_existing_txn.counterparty_name,
        'recipient_upi', v_existing_txn.counterparty_upi_id,
        'fee_amount', v_existing_txn.fee_amount,
        'gst_amount', v_existing_txn.gst_amount,
        'risk_score', v_existing_txn.risk_score,
        'transaction', row_to_json(v_existing_txn)
      );
    end if;
  end if;

  if lower(coalesce(p_category, '')) = 'imps_payout' then
    v_rail := 'imps_payout';
  end if;

  v_quote := private.assess_transfer_quote(v_sender_id, p_recipient_identifier, v_amt, v_rail);
  v_fee := coalesce((v_quote->>'fee_amount')::numeric, 0.00);
  v_gst := coalesce((v_quote->>'gst_amount')::numeric, 0.00);
  v_total_debit := round((v_amt + v_fee + v_gst)::numeric, 2);
  v_risk_score := coalesce((v_quote->>'risk_score')::integer, 5);
  v_risk_level := coalesce(v_quote->>'risk_level', 'low');

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

  if v_sender_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is locked/frozen. Unfreeze before making payments.');
  end if;

  if coalesce((v_quote->>'cooling_off_active')::boolean, false)
     and v_amt > coalesce((v_quote->>'cooling_cap')::numeric, 5000.00) then
    return jsonb_build_object(
      'success', false,
      'error', format('New payee 24h cooling-off cap active: max ₹%s per transfer until verified.', coalesce((v_quote->>'cooling_cap')::numeric, 5000.00))
    );
  end if;

  if v_sender_wallet.balance < v_total_debit then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance. Available: ₹' || v_sender_wallet.balance);
  end if;

  select * into v_sender_profile from public.profiles where id = v_sender_id;
  v_tier_limit := coalesce((v_quote->>'per_txn_limit')::numeric, 50000.00);
  v_daily_limit := coalesce((v_quote->>'daily_limit')::numeric, v_sender_wallet.daily_limit);
  v_monthly_limit := coalesce((v_quote->>'monthly_limit')::numeric, 200000.00);
  v_spent_today := coalesce((v_quote->>'daily_spent')::numeric, 0.00);
  v_spent_month := coalesce((v_quote->>'monthly_spent')::numeric, 0.00);

  if v_amt > v_tier_limit then
    return jsonb_build_object(
      'success', false,
      'error', format('Amount exceeds your %s tier per-transaction limit (₹%s).', v_sender_profile.tier, v_tier_limit)
    );
  end if;

  if v_spent_today + v_amt > v_daily_limit then
    return jsonb_build_object(
      'success', false,
      'error', format('Daily transfer limit (₹%s) exceeded. Remaining today: ₹%s.', v_daily_limit, greatest(0.00, v_daily_limit - v_spent_today))
    );
  end if;

  if v_spent_month + v_amt > v_monthly_limit then
    return jsonb_build_object(
      'success', false,
      'error', format('Monthly transfer limit (₹%s) exceeded for %s tier.', v_monthly_limit, v_sender_profile.tier)
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

  select * into v_sec from public.user_security where user_id = v_sender_id;
  if found and v_sec.pin_hash is not null and v_amt >= v_sec.pin_threshold then
    v_pin_check := private.verify_user_pin_internal(v_sender_id, p_pin, false);
    if not coalesce((v_pin_check->>'ok')::boolean, false) then
      if coalesce((v_pin_check->>'locked')::boolean, false) then
        perform private.emit_notification(
          v_sender_id, 'security', 'Transaction PIN Temporarily Locked',
          '5 consecutive invalid Transaction PIN attempts locked PIN verification for 15 minutes.', true
        );
      end if;
      return jsonb_build_object(
        'success', false,
        'pin_required', true,
        'pin_locked', coalesce((v_pin_check->>'locked')::boolean, false),
        'error', coalesce(v_pin_check->>'error', 'Transaction PIN verification failed.')
      );
    end if;
  end if;

  v_safe_cat := private.resolve_smart_category(v_sender_id, p_recipient_identifier, p_description, p_category);
  v_sender_upi := coalesce(v_sender_profile.upi_id, split_part(coalesce(v_sender_profile.email, 'user'), '@', 1) || '@cash');
  v_ref_id := 'CSH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  v_utr := 'UTR' || to_char(now(), 'YYMMDDHH24MISS') || lpad((floor(random() * 900 + 100))::text, 3, '0');
  v_sender_new_bal := round((v_sender_wallet.balance - v_total_debit)::numeric, 2);
  v_journal_id := gen_random_uuid();

  select id into v_sender_acct_id from public.accounts where wallet_id = v_sender_wallet.id;
  select id into v_fees_acct_id from public.accounts where account_code = 'SYS_FEES';

  if v_is_internal then
    v_recipient_upi := coalesce(v_recipient_profile.upi_id, split_part(v_recipient_profile.email, '@', 1) || '@cash');
    v_recipient_new_bal := round((v_recipient_wallet.balance + v_amt)::numeric, 2);
    select id into v_recipient_acct_id from public.accounts where wallet_id = v_recipient_wallet.id;

    update public.wallets set balance = v_sender_new_bal where id = v_sender_wallet.id;
    update public.wallets set balance = v_recipient_new_bal where id = v_recipient_wallet.id;

    insert into public.transactions (
      user_id, wallet_id, reference_id, utr_number, idempotency_key, type, amount, currency,
      category, status, counterparty_name, counterparty_upi_id, description, tx_kind,
      fee_amount, gst_amount, risk_score, settled_at
    ) values (
      v_sender_id, v_sender_wallet.id, v_ref_id, v_utr, nullif(trim(coalesce(p_idempotency_key, '')), ''),
      'debit', v_amt, 'INR', v_safe_cat, 'completed',
      v_recipient_profile.full_name, v_recipient_upi,
      coalesce(p_description, 'Paid to ' || v_recipient_profile.full_name), 'p2p',
      v_fee, v_gst, v_risk_score, now()
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
      v_journal_id, v_sender_txn.id, v_sender_acct_id, v_recipient_acct_id,
      v_amt, 'principal', 'P2P transfer ' || v_ref_id
    );

    perform private.emit_notification(
      v_recipient_profile.id, 'transaction',
      format('Received ₹%s from %s', v_amt, coalesce(v_sender_profile.full_name, v_sender_upi)),
      format('UTR %s · New balance: ₹%s', v_utr, v_recipient_new_bal),
      false, jsonb_build_object('reference_id', v_ref_id || '-R', 'amount', v_amt)
    );
  else
    select id into v_external_acct_id from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING';

    update public.wallets set balance = v_sender_new_bal where id = v_sender_wallet.id;

    insert into public.transactions (
      user_id, wallet_id, reference_id, utr_number, idempotency_key, type, amount, currency,
      category, status, counterparty_name, counterparty_upi_id, description, tx_kind,
      fee_amount, gst_amount, risk_score, settled_at
    ) values (
      v_sender_id, v_sender_wallet.id, v_ref_id, v_utr, nullif(trim(coalesce(p_idempotency_key, '')), ''),
      'debit', v_amt, 'INR', v_safe_cat, 'completed',
      v_clean_ident, p_recipient_identifier,
      coalesce(p_description, 'Payment to ' || v_clean_ident), 'external',
      v_fee, v_gst, v_risk_score, now()
    ) returning * into v_sender_txn;

    perform private.post_ledger_pair(
      v_journal_id, v_sender_txn.id, v_sender_acct_id, v_external_acct_id,
      v_amt, 'principal', 'External clearing ' || v_ref_id
    );
  end if;

  if v_fees_acct_id is not null and v_fee > 0.00 then
    perform private.post_ledger_pair(
      v_journal_id, v_sender_txn.id, v_sender_acct_id, v_fees_acct_id,
      v_fee, 'fee', 'Platform convenience fee ' || v_ref_id
    );
  end if;
  if v_fees_acct_id is not null and v_gst > 0.00 then
    perform private.post_ledger_pair(
      v_journal_id, v_sender_txn.id, v_sender_acct_id, v_fees_acct_id,
      v_gst, 'gst', '18% GST on platform fee ' || v_ref_id
    );
  end if;

  v_budget_cat := case when v_safe_cat = 'investment' then 'investments' else v_safe_cat end;
  select * into v_budget
  from public.budgets
  where user_id = v_sender_id and category = v_budget_cat and is_active = true
  limit 1;

  if found then
    select coalesce(sum(amount), 0.00) into v_budget_spent
    from public.transactions
    where user_id = v_sender_id
      and type = 'debit'
      and status = 'completed'
      and (category = v_safe_cat or (v_safe_cat = 'investment' and category = 'investments'))
      and date_trunc('month', created_at at time zone 'Asia/Kolkata') = date_trunc('month', now() at time zone 'Asia/Kolkata');

    v_budget_cap := greatest(1.00, v_budget.amount_limit + coalesce(v_budget.rollover_amount, 0.00));
    v_budget_pct := floor((v_budget_spent / v_budget_cap) * 100.0)::integer;

    update public.budgets
    set spent_amount = v_budget_spent,
        last_alert_pct = greatest(last_alert_pct, v_budget_pct)
    where id = v_budget.id;

    if v_budget_pct >= 100 and coalesce(v_budget.last_alert_pct, 0) < 100 then
      perform private.emit_notification(
        v_sender_id, 'budget',
        format('%s Budget Exceeded (%s%%)', initcap(v_budget_cat), v_budget_pct),
        format('Spent ₹%s of ₹%s budget this month.', v_budget_spent, v_budget_cap),
        false, jsonb_build_object('budget_id', v_budget.id, 'category', v_budget_cat)
      );
    elsif v_budget_pct >= coalesce(v_budget.alert_threshold_pct, 80)
          and coalesce(v_budget.last_alert_pct, 0) < coalesce(v_budget.alert_threshold_pct, 80) then
      perform private.emit_notification(
        v_sender_id, 'budget',
        format('%s Budget Alert (%s%% used)', initcap(v_budget_cat), v_budget_pct),
        format('You have spent ₹%s of ₹%s budgeted for %s.', v_budget_spent, v_budget_cap, v_budget_cat),
        false, jsonb_build_object('budget_id', v_budget.id, 'category', v_budget_cat)
      );
    end if;
  end if;

  perform private.write_audit_log(
    v_sender_id,
    case when v_is_internal then v_recipient_profile.id else null end,
    'transfer_completed',
    'transaction',
    v_sender_txn.id::text,
    null,
    jsonb_build_object('reference_id', v_ref_id, 'amount', v_amt, 'fee', v_fee, 'gst', v_gst, 'risk_score', v_risk_score, 'is_internal', v_is_internal)
  );

  perform private.emit_notification(
    v_sender_id, 'transaction',
    format('Paid ₹%s to %s', v_amt, coalesce(v_sender_txn.counterparty_name, v_clean_ident)),
    format('UTR %s · Category: %s · Balance: ₹%s', v_utr, v_safe_cat, v_sender_new_bal),
    false, jsonb_build_object('reference_id', v_ref_id, 'amount', v_amt)
  );

  return jsonb_build_object(
    'success', true,
    'is_internal', v_is_internal,
    'reference_id', v_ref_id,
    'utr_number', v_utr,
    'sender_balance', v_sender_new_bal,
    'recipient_name', coalesce(v_sender_txn.counterparty_name, v_clean_ident),
    'recipient_upi', coalesce(v_recipient_upi, p_recipient_identifier),
    'recipient_new_balance', v_recipient_new_bal,
    'fee_amount', v_fee,
    'gst_amount', v_gst,
    'risk_score', v_risk_score,
    'risk_level', v_risk_level,
    'transaction', row_to_json(v_sender_txn)
  );
end;
$$;

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
  v_amt numeric(14, 2);
  v_wallet public.wallets%rowtype;
  v_profile public.profiles%rowtype;
  v_limits public.limits_config%rowtype;
  v_new_balance numeric(14, 2);
  v_ref_id text;
  v_utr text;
  v_txn public.transactions%rowtype;
  v_existing public.transactions%rowtype;
  v_wallet_acct_id uuid;
  v_external_acct_id uuid;
  v_auto_pocket public.pockets%rowtype;
  v_auto_amt numeric(14, 2) := 0.00;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Unauthorized. Please log in.');
  end if;

  if p_amount is null or p_amount <= 0 or round(p_amount::numeric, 2) <> p_amount then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive with at most 2 decimals.');
  end if;

  v_amt := round(p_amount::numeric, 2);
  if v_amt > 100000.00 then
    return jsonb_build_object('success', false, 'error', 'Maximum single top-up limit is ₹1,00,000.00.');
  end if;

  perform set_config('cash.trusted_rpc', 'on', true);

  if p_idempotency_key is not null and length(trim(p_idempotency_key)) > 0 then
    select * into v_existing
    from public.transactions
    where user_id = v_user_id and idempotency_key = trim(p_idempotency_key);
    if found then
      select balance into v_new_balance from public.wallets where id = v_existing.wallet_id;
      return jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'reference_id', v_existing.reference_id,
        'new_balance', v_new_balance,
        'transaction', row_to_json(v_existing)
      );
    end if;
  end if;

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found.');
  end if;
  if v_wallet.is_frozen then
    return jsonb_build_object('success', false, 'error', 'Wallet is frozen. Unfreeze before topping up.');
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  select * into v_limits from public.limits_config where tier = coalesce(v_profile.tier, 'standard');
  v_new_balance := round((v_wallet.balance + v_amt)::numeric, 2);

  if v_limits.max_wallet_balance is not null and v_new_balance > v_limits.max_wallet_balance then
    return jsonb_build_object(
      'success', false,
      'error', format('Top-up exceeds max wallet balance cap (₹%s) for your %s tier.', v_limits.max_wallet_balance, v_profile.tier)
    );
  end if;

  select id into v_wallet_acct_id from public.accounts where wallet_id = v_wallet.id;
  select id into v_external_acct_id from public.accounts where account_code = 'SYS_EXTERNAL_CLEARING';

  v_ref_id := 'CSH-ADD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  v_utr := 'UTR' || to_char(now(), 'YYMMDDHH24MISS') || lpad((floor(random() * 900 + 100))::text, 3, '0');

  update public.wallets set balance = v_new_balance where id = v_wallet.id;

  insert into public.transactions (
    user_id, wallet_id, reference_id, utr_number, idempotency_key, type, amount, currency,
    category, status, counterparty_name, counterparty_upi_id, description, tx_kind, settled_at
  ) values (
    v_user_id, v_wallet.id, v_ref_id, v_utr, nullif(trim(coalesce(p_idempotency_key, '')), ''),
    'credit', v_amt, 'INR', 'salary', 'completed',
    'Cash Top-up', 'gateway@npci', coalesce(p_description, 'Deposit via Net Banking / Card'), 'topup', now()
  ) returning * into v_txn;

  perform private.post_ledger_pair(
    gen_random_uuid(), v_txn.id, v_external_acct_id, v_wallet_acct_id, v_amt, 'principal', 'Wallet top-up ' || v_ref_id
  );

  perform private.emit_notification(
    v_user_id, 'transaction',
    format('Added ₹%s to Wallet', v_amt),
    format('UTR %s · Available balance: ₹%s', v_utr, v_new_balance),
    false, jsonb_build_object('reference_id', v_ref_id, 'amount', v_amt)
  );

  select * into v_auto_pocket
  from public.pockets
  where user_id = v_user_id and auto_save_pct > 0
  order by auto_save_pct desc
  limit 1;

  if found then
    v_auto_amt := round((v_amt * (v_auto_pocket.auto_save_pct / 100.0))::numeric, 2);
    if v_auto_amt >= 1.00 and v_new_balance >= v_auto_amt then
      perform public.move_pocket_funds(v_auto_pocket.id, v_auto_amt, 'allocate');
      select balance into v_new_balance from public.wallets where id = v_wallet.id;
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'reference_id', v_ref_id,
    'utr_number', v_utr,
    'new_balance', v_new_balance,
    'auto_saved_to_pocket', v_auto_amt,
    'transaction', row_to_json(v_txn)
  );
end;
$$;

create or replace function public.upsert_saved_payee(
  p_payee_identifier text,
  p_payee_name text,
  p_upi_id text default null,
  p_nickname text default null,
  p_is_favourite boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_ident text := trim(coalesce(p_payee_identifier, ''));
  v_name text := trim(coalesce(p_payee_name, ''));
  v_row public.payees%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;
  if v_ident = '' or v_name = '' then
    return jsonb_build_object('success', false, 'error', 'Payee name and UPI/identifier are required');
  end if;

  insert into public.payees (
    user_id, payee_identifier, payee_name, upi_id, nickname, is_favourite, is_active
  ) values (
    v_user_id, v_ident, v_name, coalesce(nullif(trim(p_upi_id), ''), v_ident), nullif(trim(coalesce(p_nickname, '')), ''), coalesce(p_is_favourite, false), true
  )
  on conflict (user_id, payee_identifier) do update set
    payee_name = excluded.payee_name,
    upi_id = excluded.upi_id,
    nickname = coalesce(excluded.nickname, public.payees.nickname),
    is_favourite = coalesce(p_is_favourite, public.payees.is_favourite),
    is_active = true
  returning * into v_row;

  perform private.write_audit_log(v_user_id, v_user_id, 'payee_saved', 'payees', v_row.id::text, null, jsonb_build_object('payee_identifier', v_ident));
  return jsonb_build_object('success', true, 'payee', row_to_json(v_row));
end;
$$;

create or replace function public.toggle_payee_favourite(p_payee_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.payees%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  update public.payees
  set is_favourite = not is_favourite
  where id = p_payee_id and user_id = v_user_id and is_active = true
  returning * into v_row;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Payee not found');
  end if;

  return jsonb_build_object('success', true, 'payee', row_to_json(v_row));
end;
$$;

create or replace function public.delete_saved_payee(p_payee_id uuid)
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

  update public.payees set is_active = false where id = p_payee_id and user_id = v_user_id;
  return jsonb_build_object('success', true);
end;
$$;

revoke execute on function public.preview_transfer_quote(text, numeric, text) from public, anon;
grant execute on function public.preview_transfer_quote(text, numeric, text) to authenticated;

revoke execute on function public.upsert_saved_payee(text, text, text, text, boolean) from public, anon;
grant execute on function public.upsert_saved_payee(text, text, text, text, boolean) to authenticated;

revoke execute on function public.toggle_payee_favourite(uuid) from public, anon;
grant execute on function public.toggle_payee_favourite(uuid) to authenticated;

revoke execute on function public.delete_saved_payee(uuid) from public, anon;
grant execute on function public.delete_saved_payee(uuid) to authenticated;
