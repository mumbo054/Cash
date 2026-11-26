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

revoke execute on function public.export_my_account_data() from public, anon;
grant execute on function public.export_my_account_data() to authenticated;
