# Security Policy & Secrets Hygiene

## Scope & Simulation Disclosure
Cash (GoCashless) is an engineering simulation demonstrating double-entry accounting, PostgreSQL Row Level Security (RLS), and fintech controls. **No real money, bank accounts, or NPCI/RBI production rails are connected.**

## Supported Architecture Safeguards
1. **Zero Client Write Authority:** All money-moving tables (`wallets`, `accounts`, `ledger_entries`, `transactions`, `audit_logs`, `user_roles`, `user_security`, `reconciliation_runs`) revoke `INSERT`/`UPDATE`/`DELETE` from `anon` and `authenticated` roles and enforce trigger guards (`guard_financial_write`, `guard_transactions_immutable`, `prevent_mutation`).
2. **Sensitive Column Protection:** `profiles` restricts browser updates strictly to `(full_name, phone, avatar_url)`. `kyc_status`, `tier`, `upi_id`, and `email` cannot be modified client-side.
3. **Key Management & Rotation:**
   - Only `VITE_SUPABASE_URL` and the public `VITE_SUPABASE_ANON_KEY` may exist in `.env` or browser bundles.
   - `service_role` keys must **never** be committed or placed in `src/`.
   - Rotate keys immediately via Supabase Dashboard -> Settings -> API if exposed; revoke affected Edge secrets with `supabase secrets set`.
4. **Transaction PIN & MFA:** Transaction PINs are hashed server-side via `pgcrypto` bcrypt (`bf`, cost 10) with a 5-attempt / 15-minute lockout window; accounts also support Supabase Auth TOTP 2FA.
5. **Security Headers:** Configured in `vercel.json` (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`).

## Reporting a Vulnerability
Please report security issues privately by emailing `security-grievance@cash.local` or opening a confidential GitHub Security Advisory before public disclosure.
