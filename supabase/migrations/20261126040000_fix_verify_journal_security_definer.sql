-- ==============================================================================
-- CASH FINTECH WALLET — FIX COMMIT-TIME JOURNAL INVARIANT TRIGGER SECURITY CONTEXT
-- ==============================================================================
-- Migration: 20261126040000_fix_verify_journal_security_definer
-- Fixes:
--   `private.verify_journal_balanced()` runs at transaction commit under RLS on
--   `public.ledger_entries`. Without SECURITY DEFINER, `anon` (signup) sees 0
--   rows and `authenticated` P2P senders see only their own debit leg instead
--   of the full balanced debit+credit pair. Making the trigger function
--   SECURITY DEFINER (owned by postgres with search_path = '') evaluates the
--   double-entry invariant across both legs of every journal reliably.
-- ==============================================================================

create or replace function private.verify_journal_balanced()
returns trigger
language plpgsql
security definer
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
