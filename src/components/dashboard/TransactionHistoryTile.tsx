"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { Transaction } from "@/types/database.types";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  food: <Coffee className="w-3.5 h-3.5" />,
  groceries: <ShoppingBag className="w-3.5 h-3.5" />,
  utilities: <Zap className="w-3.5 h-3.5" />,
  travel: <Car className="w-3.5 h-3.5" />,
  health: <HeartPulse className="w-3.5 h-3.5" />,
  salary: <Briefcase className="w-3.5 h-3.5" />,
  other: <Layers className="w-3.5 h-3.5" />,
};

interface TransactionHistoryTileProps {
  onOpenPassbook?: (transactionId?: string) => void;
}

export function TransactionHistoryTile({ onOpenPassbook }: TransactionHistoryTileProps) {
  const { transactions } = useWallet();

  const getCategoryIcon = (tx: Transaction) => {
    if (tx.type === "credit" || tx.type === "transfer_in") {
      return <ArrowDownLeft className="w-3.5 h-3.5 text-[#00D632]" />;
    }
    const cat = tx.category.toLowerCase();
    return CATEGORY_ICONS[cat] || <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div className="flex h-full w-full flex-col justify-between p-1">
      {/* Tile Header */}
      <div className="flex items-center justify-between px-3 pt-1 pb-2">
        <span className="text-xs font-semibold text-zinc-300">Recent Passbook Activity</span>
        <button
          type="button"
          onClick={() => onOpenPassbook?.()}
          className="text-[10px] text-zinc-400 hover:text-[#00D632] flex items-center gap-1 font-mono transition-colors cursor-pointer group"
        >
          <span>{transactions.length} records</span>
          <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Transaction List */}
      <ScrollArea className="h-full w-full">
        <div className="scroll-fade scrollbar-none overflow-y-auto px-2 max-h-[175px]">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No recent transactions recorded.
            </div>
          ) : (
            transactions.slice(0, 15).map((tx, idx) => {
              const isCredit = tx.type === "credit" || tx.type === "transfer_in";
              const dateStr = new Date(tx.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              });

              return (
                <React.Fragment key={tx.id || idx}>
                  <div
                    onClick={() => onOpenPassbook?.(tx.id)}
                    className="flex items-center justify-between py-2 px-2 rounded-xl transition-colors hover:bg-white/5 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl border ${
                          isCredit
                            ? "bg-[#00D632]/10 border-[#00D632]/25 text-[#00D632]"
                            : "bg-white/5 border-white/10 text-zinc-300"
                        }`}
                      >
                        {getCategoryIcon(tx)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-100 truncate leading-snug group-hover:text-[#00D632] transition-colors">
                          {tx.counterparty_name || tx.description || "Payment"}
                        </p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 leading-none mt-0.5">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span className="capitalize">{tx.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <p
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isCredit ? "text-[#00D632]" : "text-zinc-100"
                        }`}
                      >
                        {isCredit ? "+" : "-"}{formatINR(Number(tx.amount))}
                      </p>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-mono">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                  {idx < Math.min(transactions.length, 15) - 1 && (
                    <Separator className="my-0.5 bg-white/5" />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer link to passbook modal */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 border-t border-white/10 text-[11px] text-zinc-400">
        <span className="text-[10px] font-mono text-zinc-500">NPCI Immutable Ledger</span>
        <button
          type="button"
          onClick={() => onOpenPassbook?.()}
          className="text-[#00D632] hover:underline flex items-center gap-1 font-semibold transition-all cursor-pointer"
        >
          <span>View Full Passbook</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
