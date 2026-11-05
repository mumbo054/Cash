"use client";

import { CreditCard, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { formatINR } from "@/utils/formatters";
import { useWallet } from "@/context/WalletContext";

interface BankCardQuickTileProps {
  onOpenCardTransfer: () => void;
  onOpenBankTransfer: () => void;
}

export function BankCardQuickTile({
  onOpenCardTransfer,
  onOpenBankTransfer,
}: BankCardQuickTileProps) {
  const { currentWallet } = useWallet();
  const isFrozen = currentWallet?.is_frozen ?? false;

  return (
    <div className="flex h-full w-full flex-col justify-between p-2 select-none overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Direct Clearing
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#00D632] font-semibold bg-[#00D632]/10 border border-[#00D632]/25 px-2 py-0.5 rounded-full">
            <ShieldCheck className="size-3" />
            24x7 IMPS
          </span>
        </div>
        <h4 className="text-sm font-bold text-white tracking-tight">
          Bank & Card Transfers
        </h4>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
          Transfer instantly via 16-digit card number or Bank A/C & IFSC.
        </p>
      </div>

      {/* Two Quick Action Rows */}
      <div className="space-y-2 my-auto py-1">
        <button
          type="button"
          onClick={onOpenCardTransfer}
          disabled={isFrozen}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left cursor-pointer group disabled:opacity-50"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <CreditCard className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-[#00D632] transition-colors leading-tight">
                Pay via Card Number
              </p>
              <p className="text-[10px] text-zinc-400">Debit / Credit card settlement</p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={onOpenBankTransfer}
          disabled={isFrozen}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left cursor-pointer group disabled:opacity-50"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#00D632]/15 border border-[#00D632]/30 text-[#00D632]">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-[#00D632] transition-colors leading-tight">
                Transfer to Bank (A/C)
              </p>
              <p className="text-[10px] text-zinc-400">IMPS instant RTGS routing</p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-zinc-400 font-mono">
        <span>Daily Limit: {formatINR(currentWallet?.daily_limit ?? 100000)}</span>
        <span className="text-[#00D632]">Zero Surcharge</span>
      </div>
    </div>
  );
}
