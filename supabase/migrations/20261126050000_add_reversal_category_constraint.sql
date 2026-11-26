-- ==============================================================================
-- CASH FINTECH WALLET — ALLOW 'reversal' IN TRANSACTIONS CATEGORY CHECK
-- ==============================================================================
-- Migration: 20261126050000_add_reversal_category_constraint
-- Fixes:
--   `transactions_category_check` lacked `'reversal'`, which blocked
--   `public.admin_reverse_transaction()` from inserting compensating
--   reversal transaction rows.
-- ==============================================================================

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_category_check'
  ) then
    execute 'alter table public.transactions drop constraint transactions_category_check';
  end if;

  execute $c$
    alter table public.transactions
      add constraint transactions_category_check check (
        category = any (array[
          'salary'::text, 'freelance'::text, 'investment'::text, 'refund'::text,
          'food'::text, 'groceries'::text, 'entertainment'::text, 'utilities'::text,
          'shopping'::text, 'travel'::text, 'health'::text, 'education'::text,
          'pocket_transfer'::text, 'goal_deposit'::text, 'peer_transfer'::text,
          'reversal'::text, 'other'::text
        ])
      )
  $c$;
end $$;
