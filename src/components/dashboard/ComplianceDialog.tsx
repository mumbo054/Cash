"use client";

import * as React from "react";
import { X, ShieldCheck, FileText, Info, Scale } from "lucide-react";

interface ComplianceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ComplianceDialog({ open, onClose }: ComplianceDialogProps) {
  const [tab, setTab] = React.useState<"simulation" | "regulatory" | "privacy" | "grievance">("simulation");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl border border-white/15 bg-zinc-950/95 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <Scale className="size-5 text-[#00D632]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Compliance, Disclosure & Policies</h3>
              <p className="text-[11px] text-zinc-400">Cash Simulation Environment · Architecture & Governance Note</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close disclosure"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/10 bg-black/40 flex-wrap">
          {(
            [
              { id: "simulation", label: "Simulation Notice", icon: Info },
              { id: "regulatory", label: "RBI / NPCI Learning Map", icon: ShieldCheck },
              { id: "privacy", label: "Privacy & DPDP", icon: FileText },
              { id: "grievance", label: "Grievance Contact", icon: Scale },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                tab === id ? "bg-[#00D632] text-black" : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto text-xs text-zinc-300 space-y-3 leading-relaxed">
          {tab === "simulation" && (
            <>
              <div className="p-3.5 rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-200 font-medium">
                IMPORTANT: Cash (GoCashless) is an engineering simulation. No real money, real bank clearing, or real NPCI/RBI PPI license is claimed or connected.
              </div>
              <p>
                Every simulated rupee obeys strict accounting invariants inside PostgreSQL: double-entry `ledger_entries` with commit-time balanced verification (`sum(credits) == sum(debits)`), deterministic wallet lock ordering, idempotency protection, Transaction PIN verification, and automated nightly reconciliation.
              </p>
            </>
          )}

          {tab === "regulatory" && (
            <ul className="space-y-2 list-disc pl-4">
              <li><strong>PPI KYC Tiers (`limits_config`):</strong> Enforces per-transaction, daily, monthly, and max balance caps (`basic` ₹10k wallet cap up to `pro` ₹200k).</li>
              <li><strong>24-Hour Cooling-Off (PRD R-4):</strong> Newly added payees are capped at ₹5,000 per transfer during the first 24 hours until verified.</li>
              <li><strong>RBI Card Tokenization & Masking:</strong> Full PAN/wallet numbers remain masked by default; only last-4 digits are displayed.</li>
              <li><strong>Immutable Ledger & Reversals:</strong> Past entries are never edited or deleted; disputes/errors always issue linked compensating reversal entries (`reversal_of`).</li>
            </ul>
          )}

          {tab === "privacy" && (
            <>
              <p>
                Only public `anon` credentials are shipped to the browser; all reads and server RPC writes execute inside strict Row Level Security (`(select auth.uid())`) policies without leaking PII into telemetry logs.
              </p>
              <p>
                Under the Security & Identity tab, members can download a complete JSON archive of their personal account data (`export_my_account_data`) or invoke account closure freeze (`request_account_closure`) while preserving regulated audit trails.
              </p>
            </>
          )}

          {tab === "grievance" && (
            <>
              <p><strong>Transaction Disputes:</strong> Open any settled transaction inside Passbook → <em>Report a Problem</em> to log an immutable dispute ticket linked to support queues.</p>
              <p><strong>Simulated Grievance Desk:</strong> `security-grievance@cash.local` · Turnaround SLA in real PPI systems: T+1 acknowledgement, T+5 ledger reversal resolution.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
