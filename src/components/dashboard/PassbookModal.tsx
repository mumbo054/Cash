"use client";

import * as React from "react";
import {
  X,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Briefcase,
  Layers,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { Transaction } from "@/types/database.types";

interface PassbookModalProps {
  open: boolean;
  onClose: () => void;
  initialTransactionId?: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  food: <Coffee className="size-4" />,
  groceries: <ShoppingBag className="size-4" />,
  utilities: <Zap className="size-4" />,
  travel: <Car className="size-4" />,
  health: <HeartPulse className="size-4" />,
  salary: <Briefcase className="size-4" />,
  peer_transfer: <ArrowUpRight className="size-4" />,
  pocket_transfer: <Layers className="size-4" />,
  other: <Layers className="size-4" />,
};

export function PassbookModal({ open, onClose, initialTransactionId }: PassbookModalProps) {
  const { transactions } = useWallet();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedType, setSelectedType] = React.useState<"all" | "credit" | "debit">("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "highest" | "lowest">("newest");
  const [activeTxn, setActiveTxn] = React.useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Set initial transaction if provided
  React.useEffect(() => {
    if (initialTransactionId && transactions.length > 0) {
      const found = transactions.find((t) => t.id === initialTransactionId);
      if (found) setActiveTxn(found);
    }
  }, [initialTransactionId, transactions]);

  if (!open) return null;

  // Filtered and sorted transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // Type filter
      if (selectedType === "credit" && tx.type !== "credit" && tx.type !== "transfer_in") return false;
      if (selectedType === "debit" && tx.type !== "debit" && tx.type !== "transfer_out") return false;

      // Category filter
      if (selectedCategory !== "all") {
        if (tx.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const party = (tx.counterparty_name || "").toLowerCase();
        const upi = (tx.counterparty_upi_id || "").toLowerCase();
        const desc = (tx.description || "").toLowerCase();
        const ref = (tx.reference_id || "").toLowerCase();
        const cat = (tx.category || "").toLowerCase();
        return (
          party.includes(query) ||
          upi.includes(query) ||
          desc.includes(query) ||
          ref.includes(query) ||
          cat.includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return Number(b.amount) - Number(a.amount);
      if (sortBy === "lowest") return Number(a.amount) - Number(b.amount);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Calculate totals
  const totalInflow = transactions
    .filter((t) => t.type === "credit" || t.type === "transfer_in")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === "debit" || t.type === "transfer_out")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalanceChange = totalInflow - totalOutflow;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Main Modal Dialog */}
      <div className="relative z-50 flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#00D632]/15 border border-[#00D632]/30 text-[#00D632]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Passbook & Transaction Stream
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                  {transactions.length} records
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live immutable NPCI UPI & Bank clearing statement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 sm:p-5 border-b border-white/10 bg-black/40">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Inflow
              </span>
              <ArrowDownLeft className="size-3.5 text-[#00D632]" />
            </div>
            <p className="font-mono text-sm sm:text-lg font-bold text-[#00D632]">
              +{formatINR(totalInflow)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Salary, transfers & top-ups</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Outflow
              </span>
              <ArrowUpRight className="size-3.5 text-zinc-400" />
            </div>
            <p className="font-mono text-sm sm:text-lg font-bold text-zinc-100">
              -{formatINR(totalOutflow)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">UPI, QR, bills & cards</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Net Flow
              </span>
              <span className={`text-[10px] font-bold ${netBalanceChange >= 0 ? "text-[#00D632]" : "text-rose-400"}`}>
                {netBalanceChange >= 0 ? "Surplus" : "Deficit"}
              </span>
            </div>
            <p className={`font-mono text-sm sm:text-lg font-bold ${netBalanceChange >= 0 ? "text-[#00D632]" : "text-rose-400"}`}>
              {netBalanceChange >= 0 ? "+" : ""}{formatINR(netBalanceChange)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Net wallet liquidity</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 border-b border-white/10 bg-zinc-950/60">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search counterparty, UPI VPA, reference ID or note..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00D632] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedType === "all"
                  ? "bg-[#00D632] text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("debit")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedType === "debit"
                  ? "bg-[#00D632] text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Debits (-₹)
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("credit")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedType === "credit"
                  ? "bg-[#00D632] text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Credits (+₹)
            </button>
          </div>

          {/* Category Filter Selector */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-zinc-400">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#00D632] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="peer_transfer">UPI Transfer</option>
              <option value="food">Food & Dining</option>
              <option value="shopping">Shopping</option>
              <option value="utilities">Bills & Utilities</option>
              <option value="travel">Travel</option>
              <option value="health">Health</option>
              <option value="salary">Salary & Inflow</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-zinc-400">
            <span className="hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#00D632] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Content Body: Two columns if transaction selected, else single scroll area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[350px]">
          {/* Transaction Stream List */}
          <div className={`flex-1 overflow-y-auto p-3 sm:p-5 space-y-1.5 scrollbar-thin ${
            activeTxn ? "hidden md:block md:w-1/2 border-r border-white/10" : "w-full"
          }`}>
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                <Search className="size-8 stroke-[1.5] text-zinc-600 mb-2" />
                <p className="text-sm font-medium text-zinc-400">No matching transactions found</p>
                <p className="text-xs text-zinc-600 mt-1">Try modifying your search or filter keywords</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isCredit = tx.type === "credit" || tx.type === "transfer_in";
                const isSelected = activeTxn?.id === tx.id;
                const date = new Date(tx.created_at);
                const dateStr = date.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                });
                const timeStr = date.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <div
                    key={tx.id}
                    onClick={() => setActiveTxn(tx)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00D632]/10 border-[#00D632]/40 shadow-sm"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                          isCredit
                            ? "bg-[#00D632]/15 border-[#00D632]/30 text-[#00D632]"
                            : "bg-white/5 border-white/10 text-zinc-300"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="size-4" />
                        ) : (
                          CATEGORY_ICONS[tx.category.toLowerCase()] || <ArrowUpRight className="size-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">
                            {tx.counterparty_name || tx.description || "UPI Payment"}
                          </p>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">
                            {tx.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1.5">
                          <span>{dateStr}, {timeStr}</span>
                          {tx.counterparty_upi_id && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-zinc-500">{tx.counterparty_upi_id}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p
                        className={`font-mono text-xs sm:text-sm font-bold ${
                          isCredit ? "text-[#00D632]" : "text-white"
                        }`}
                      >
                        {isCredit ? "+" : "-"}{formatINR(Number(tx.amount))}
                      </p>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Digital Receipt Panel (Desktop side panel, mobile full overlay) */}
          {activeTxn && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-zinc-950/80 overflow-y-auto">
              <div className="space-y-5">
                {/* Receipt Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#00D632] font-semibold mb-1">
                      <CheckCircle2 className="size-4" />
                      <span>Payment Verified & Cleared</span>
                    </div>
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      {activeTxn.counterparty_name || activeTxn.description || "Payment Transfer"}
                    </h4>
                    <p className="font-mono text-xs text-zinc-400">
                      {activeTxn.counterparty_upi_id || "IMPS / NPCI Gateway"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTxn(null)}
                    className="md:hidden flex size-8 items-center justify-center rounded-full bg-white/10 text-zinc-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Amount Big Display */}
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Transacted Amount
                  </span>
                  <p
                    className={`font-mono text-3xl sm:text-4xl font-extrabold mt-1 ${
                      activeTxn.type === "credit" || activeTxn.type === "transfer_in"
                        ? "text-[#00D632]"
                        : "text-white"
                    }`}
                  >
                    {activeTxn.type === "credit" || activeTxn.type === "transfer_in" ? "+" : "-"}
                    {formatINR(Number(activeTxn.amount))}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#00D632]/10 border border-[#00D632]/25 text-[#00D632] mt-2">
                    NPCI 24x7 FastUPI Verified
                  </span>
                </div>

                {/* Breakdown Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">UTR / Reference No.</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeTxn.reference_id, "ref")}
                      className="font-mono text-zinc-200 flex items-center gap-1.5 hover:text-[#00D632] transition-colors"
                    >
                      <span>{activeTxn.reference_id}</span>
                      {copiedId === "ref" ? (
                        <Check className="size-3 text-[#00D632]" />
                      ) : (
                        <Copy className="size-3 text-zinc-500" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Date & Timestamp</span>
                    <span className="font-mono text-zinc-200">
                      {new Date(activeTxn.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Payment Category</span>
                    <span className="font-semibold text-zinc-200 capitalize">
                      {activeTxn.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Clearing Method</span>
                    <span className="font-mono text-zinc-200">
                      FastUPI 2.0 / Immediate Settlement
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Note / Description</span>
                    <span className="text-zinc-300 italic">
                      "{activeTxn.description || "Regular settlement"}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleCopy(`Cash Payment Receipt\nRef: ${activeTxn.reference_id}\nAmount: ${formatINR(Number(activeTxn.amount))}\nDate: ${activeTxn.created_at}`, "receipt")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/15 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {copiedId === "receipt" ? (
                    <>
                      <Check className="size-3.5 text-[#00D632]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5 text-zinc-400" />
                      <span>Share Receipt</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    alert(`Statement receipt for transaction ${activeTxn.reference_id} downloaded.`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-xs font-bold text-black shadow-md shadow-[#00D632]/20 transition-all cursor-pointer"
                >
                  <Download className="size-3.5 stroke-[2.5]" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
