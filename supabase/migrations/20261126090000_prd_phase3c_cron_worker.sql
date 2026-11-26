-- ==============================================================================
-- CASH FINTECH WALLET — PRD PHASE 3C: BACKGROUND WORKER & PG_CRON SCHEDULER
-- ==============================================================================
-- Migration: 20261126090000_prd_phase3c_cron_worker
-- ==============================================================================

create or replace function private.run_background_worker()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expired_count integer := 0;
  v_sched_count integer := 0;
  v_archived_jobs integer := 0;
  v_sched public.scheduled_payments%rowtype;
  v_msg record;
begin
  update public.payment_requests
  set status = 'expired'
  where status = 'pending' and expires_at <= now();
  get diagnostics v_expired_count = row_count;

  for v_sched in
    select * from public.scheduled_payments
    where status = 'active' and next_run_at <= now()
    order by next_run_at asc
    limit 25
  loop
    perform private.execute_scheduled_payment_row(v_sched);
    v_sched_count := v_sched_count + 1;
  end loop;

  begin
    for v_msg in
      select msg_id from pgmq.read('cash_jobs', 30, 100)
    loop
      perform pgmq.archive('cash_jobs', v_msg.msg_id);
      v_archived_jobs := v_archived_jobs + 1;
    end loop;
  exception when others then
    null;
  end;

  return jsonb_build_object(
    'success', true,
    'expired_requests', v_expired_count,
    'processed_scheduled_payments', v_sched_count,
    'archived_queue_jobs', v_archived_jobs
  );
end;
$$;

create or replace function public.admin_run_worker_jobs()
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

  v_res := private.run_background_worker();
  perform private.write_audit_log(v_actor_id, null, 'worker_jobs_run', 'pgmq', 'cash_jobs', 'Manual worker sweep from Admin Console', v_res);
  return v_res;
end;
$$;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'cash_nightly_reconciliation') then
    perform cron.schedule('cash_nightly_reconciliation', '30 18 * * *', $c$select private.run_reconciliation_internal(null);$c$);
  end if;
  if not exists (select 1 from cron.job where jobname = 'cash_background_worker') then
    perform cron.schedule('cash_background_worker', '*/5 * * * *', $c$select private.run_background_worker();$c$);
  end if;
exception when others then
  raise notice 'pg_cron job scheduling notice: %', sqlerrm;
end $$;

revoke execute on function public.admin_run_worker_jobs() from public, anon;
grant execute on function public.admin_run_worker_jobs() to authenticated;
