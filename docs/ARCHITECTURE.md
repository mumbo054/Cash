# Cash (GoCashless) — Architecture, Double-Entry Ledger & Runbook

## 1. Deployment & Proximity Topology
- **Frontend SPA:** React 18 + TypeScript + Vite + Tailwind hosted on Vercel, pinned via `"regions": ["hnd1"]` (Tokyo) to colocate compute beside the Supabase database (`ap-northeast-1`).
- **Database & Auth:** Supabase PostgreSQL 17 with managed **PgBouncer connection pooling**, Row Level Security (`(select auth.uid())`), `pgcrypto`, `pgmq` (`cash_jobs`), and `pg_cron`.
- **Edge Compute:** Deployed Supabase Edge Function [`cash-ops`](../supabase/functions/cash-ops/index.ts) emitting W3C `traceparent` spans and `/health` DB reachability telemetry.

## 2. Double-Entry Ledger Model (`L-1 .. L-12`)
```
  SYS_TREASURY ────────(welcome bonus)───────▶ WALLET_<id>
  SYS_EXTERNAL_CLEARING ◀───(topup / ext pay)──▶ WALLET_<id> ◀──(P2P transfer)──▶ WALLET_<peer>
                                                     │  │
                                      (fee + GST) ───┘  └──▶ POCKET_<id> / GOAL_<id>
                                           ▼
                                       SYS_FEES
  SYS_MARKETING ───────(cashback reward)──────▶ WALLET_<id>
```
- **Commit-Time Invariant:** `trg_ledger_entries_balanced` (`DEFERRABLE INITIALLY DEFERRED`) calls `SECURITY DEFINER` `private.verify_journal_balanced()` on every `COMMIT`, rejecting any journal where `count < 2` or `sum(signed_amount) != 0.00`.
- **Concurrency & Deadlock Prevention:** Multi-wallet mutations (`execute_verified_transfer`, `admin_reverse_transaction`, `execute_scheduled_payment_row`) lock wallet rows with `SELECT ... FOR UPDATE` in ascending UUID order.
- **Reversals & Reconciliations:** Ledger rows and settled transactions are strictly immutable; corrections append linked compensating reversal rows (`reversal_of`), and `private.run_reconciliation_internal()` checks every account balance against `sum(signed_amount)` nightly via `pg_cron` (`30 18 * * *` UTC).

## 3. Threat Model Summary
| Threat | Mitigation |
| --- | --- |
| Direct client tampering with balances/KYC/tier | Direct table `INSERT/UPDATE/DELETE` revoked + trigger guards + column-restricted `profiles` update |
| Double spend / replay under flaky networks | Unique per-user `idempotency_key` index checked atomically before debit |
| Concurrent withdrawal race condition | Row locks (`FOR UPDATE`) in deterministic UUID order |
| Brute-force PIN guessing | Server-side bcrypt verification (`user_security`) with 5-attempt / 15-min lockout |
| New-payee fraud / accidental duplicate send | 24h `₹5,000` payee cooling-off cap + 5-min duplicate-amount risk scoring |

## 4. Backup & Recovery Drill Runbook
1. Supabase Automated Daily Backups + Point-in-Time Recovery (PITR) protect the primary PostgreSQL cluster.
2. Verification drill checklist after any restore:
   - Execute `select private.run_reconciliation_internal(null);` and assert `mismatches_found = 0` and `total_system_net = 0.00`.
   - Run `npm run backtest` (`node scripts/run_all_backtests.mjs`) to verify all RLS, concurrency, PIN, and ledger invariants.
