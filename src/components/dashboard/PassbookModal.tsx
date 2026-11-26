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
  Loader2,
  RotateCcw,
  FileText,
  Flag,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { Transaction } from "@/types/database.types";
import { useDebounce } from "@/hooks/use-debounce";
import { VirtualList } from "@/components/ui/virtual-list";
import { TransactionRowSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { downloadAccountStatementPdf } from "@/lib/pdfExport";

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

const PassbookTransactionRow = React.memo(function PassbookTransactionRow({
  tx,
  isSelected,
  onSelect,
}: {
  tx: Transaction;
  isSelected: boolean;
  onSelect: (tx: Transaction) => void;
}) {
  const isCredit = tx.type === "credit" || tx.type === "transfer_in";
  const isReversed = tx.status === "reversed" || tx.category === "reversal";
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
    <div className="pb-1.5 h-full">
      <div
        onClick={() => onSelect(tx)}
        className={`h-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
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
              <span>
                {dateStr}, {timeStr}
              </span>
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
            {isCredit ? "+" : "-"}
            {formatINR(Number(tx.amount))}
          </p>
          <span
            className={`text-[10px] font-mono uppercase tracking-wider block ${
              isReversed ? "text-amber-300" : "text-zinc-400"
            }`}
          >
            {tx.status}
          </span>
        </div>
      </div>
    </div>
  );
});

export function PassbookModal({ open, onClose, initialTransactionId }: PassbookModalProps) {
  const {
    currentProfile,
    currentWallet,
    transactions,
    isLoading,
    hasMoreTransactions,
    isLoadingMoreTransactions,
    loadMoreTransactions,
    updateTransactionCategory,
    claimCashback,
    submitDispute,
  } = useWallet();

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 200);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedType, setSelectedType] = React.useState<"all" | "credit" | "debit">("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "highest" | "lowest">("newest");
  const [activeTxn, setActiveTxn] = React.useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [disputeOpen, setDisputeOpen] = React.useState(false);
  const [disputeReason, setDisputeReason] = React.useState("");
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDisputeOpen(false);
    setDisputeReason("");
    setActionFeedback(null);
  }, [activeTxn?.id]);

  React.useEffect(() => {
    if (initialTransactionId && transactions.length > 0) {
      const found = transactions.find((t) => t.id === initialTransactionId);
      if (found) setActiveTxn(found);
    }
  }, [initialTransactionId, transactions]);

  const filteredTransactions = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        if (selectedType === "credit" && tx.type !== "credit" && tx.type !== "transfer_in") return false;
        if (selectedType === "debit" && tx.type !== "debit" && tx.type !== "transfer_out") return false;

        if (selectedCategory !== "all") {
          if (tx.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        if (query) {
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
  }, [transactions, selectedType, selectedCategory, debouncedSearch, sortBy]);

  const { totalInflow, totalOutflow, netBalanceChange } = React.useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const t of transactions) {
      const amt = Number(t.amount);
      if (t.type === "credit" || t.type === "transfer_in") {
        inflow += amt;
      } else if (t.type === "debit" || t.type === "transfer_out") {
        outflow += amt;
      }
    }
    return {
      totalInflow: inflow,
      totalOutflow: outflow,
      netBalanceChange: inflow - outflow,
    };
  }, [transactions]);

  const handleCopy = React.useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleExportCsv = React.useCallback(() => {
    const header = "Reference,Date,Type,Category,Counterparty,UPI_ID,Amount_INR,Status,Description";
    const rows = filteredTransactions.map((tx) => {
      const cols = [
        tx.reference_id,
        tx.created_at,
        tx.type,
        tx.category,
        tx.counterparty_name || "",
        tx.counterparty_upi_id || "",
        Number(tx.amount).toFixed(2),
        tx.status,
        (tx.description || "").replace(/"/g, '""'),
      ];
      return cols.map((c) => `"${c}"`).join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cash-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  const handleExportPdf = React.useCallback(() => {
    const closingBalance = Number(currentWallet?.balance || 0);
    const openingBalance = Math.max(0, Number((closingBalance - totalInflow + totalOutflow).toFixed(2)));
    const wNum = currentWallet?.wallet_number || "CSH-0000";
    downloadAccountStatementPdf(
      {
        holderName: currentProfile?.full_name || "Cash User",
        upiId: currentProfile?.upi_id || currentProfile?.email || "user@cash",
        walletMasked: `CSH-••••${wNum.slice(-4)}`,
        tier: currentProfile?.tier || "standard",
        kycStatus: currentProfile?.kyc_status || "verified",
        closingBalance,
        openingBalance,
        totalCredits: totalInflow,
        totalDebits: totalOutflow,
        generatedAtIso: new Date().toISOString(),
        rows: filteredTransactions.map((tx) => ({
          date: tx.settled_at || tx.created_at,
          reference: tx.reference_id,
          utr: tx.utr_number,
          type: tx.type,
          category: tx.category,
          counterparty: tx.counterparty_name || tx.counterparty_upi_id || "Transfer",
          amount: Number(tx.amount),
          fee: Number(tx.fee_amount || 0),
          gst: Number(tx.gst_amount || 0),
          status: tx.status,
        })),
      },
      `cash-statement-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  }, [filteredTransactions, currentProfile, currentWallet, totalInflow, totalOutflow]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

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
                  {transactions.length}
                  {hasMoreTransactions ? "+" : ""} loaded
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Keyset-paginated immutable ledger statement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D632]/15 hover:bg-[#00D632]/25 border border-[#00D632]/30 text-xs font-semibold text-[#00D632] transition-colors cursor-pointer"
            >
              <FileText className="size-3.5" />
              <span>PDF Statement</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="size-3.5 text-[#00D632]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close passbook"
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
              {netBalanceChange >= 0 ? "+" : ""}
              {formatINR(netBalanceChange)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Net wallet liquidity</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 border-b border-white/10 bg-zinc-950/60">
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

          <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-1 rounded-xl shrink-0">
            {(["all", "debit", "credit"] as const).map((typeOpt) => (
              <button
                key={typeOpt}
                type="button"
                onClick={() => setSelectedType(typeOpt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedType === typeOpt
                    ? "bg-[#00D632] text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {typeOpt === "all" ? "All" : typeOpt === "debit" ? "Debits (-₹)" : "Credits (+₹)"}
              </button>
            ))}
          </div>

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

          <div className="flex items-center gap-1.5 shrink-0 text-xs text-zinc-400">
            <span className="hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "lowest")}
              className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#00D632] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[350px]">
          {isLoading && transactions.length === 0 ? (
            <div className="flex-1 p-5">
              <TransactionRowSkeleton count={5} />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <Search className="size-8 stroke-[1.5] text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-zinc-400">No matching transactions found</p>
              <p className="text-xs text-zinc-600 mt-1">Try modifying your search or filter keywords</p>
            </div>
          ) : (
            <VirtualList
              items={filteredTransactions}
              itemHeight={72}
              overscan={5}
              getKey={(tx) => tx.id}
              className={`flex-1 overflow-y-auto p-3 sm:p-5 scrollbar-thin ${
                activeTxn ? "hidden md:block md:w-1/2 border-r border-white/10" : "w-full"
              }`}
              renderItem={(tx) => (
                <PassbookTransactionRow
                  tx={tx}
                  isSelected={activeTxn?.id === tx.id}
                  onSelect={setActiveTxn}
                />
              )}
              footer={
                hasMoreTransactions ? (
                  <div className="pt-3 pb-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => void loadMoreTransactions()}
                      disabled={isLoadingMoreTransactions}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingMoreTransactions && <Loader2 className="size-3.5 animate-spin text-[#00D632]" />}
                      <span>{isLoadingMoreTransactions ? "Loading older records..." : "Load older transactions"}</span>
                    </button>
                  </div>
                ) : null
              }
            />
          )}

          {activeTxn && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-zinc-950/80 overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <div
                      className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${
                        activeTxn.status === "reversed" || activeTxn.category === "reversal"
                          ? "text-amber-300"
                          : "text-[#00D632]"
                      }`}
                    >
                      {activeTxn.status === "reversed" || activeTxn.category === "reversal" ? (
                        <>
                          <RotateCcw className="size-4" />
                          <span>
                            {activeTxn.category === "reversal"
                              ? "Compensating Reversal Entry"
                              : "Transaction Reversed"}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>Payment Verified & Cleared</span>
                        </>
                      )}
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

                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Transacted Amount
                  </span>
                  <p
                    className={`font-mono text-3xl sm:text-4xl font-extrabold mt-1 ${
                      activeTxn.type === "credit" ||
                      activeTxn.type === "transfer_in"
                        ? "text-[#00D632]"
                        : "text-white"
                    }`}
                  >
                    {activeTxn.type === "credit" ||
                    activeTxn.type === "transfer_in"
                      ? "+"
                      : "-"}
                    {formatINR(Number(activeTxn.amount))}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#00D632]/10 border border-[#00D632]/25 text-[#00D632] mt-2">
                    NPCI 24x7 Double-Entry Verified
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">UTR / Reference No.</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeTxn.utr_number || activeTxn.reference_id, "ref")}
                      className="font-mono text-zinc-200 flex items-center gap-1.5 hover:text-[#00D632] transition-colors"
                    >
                      <span>{activeTxn.utr_number || activeTxn.reference_id}</span>
                      {copiedId === "ref" ? (
                        <Check className="size-3 text-[#00D632]" />
                      ) : (
                        <Copy className="size-3 text-zinc-500" />
                      )}
                    </button>
                  </div>

                  {activeTxn.utr_number && activeTxn.utr_number !== activeTxn.reference_id && (
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-zinc-400">Gateway Ref ID</span>
                      <span className="font-mono text-zinc-300">{activeTxn.reference_id}</span>
                    </div>
                  )}

                  {activeTxn.reversal_of && (
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-zinc-400">Reversal Of Tx</span>
                      <span className="font-mono text-amber-300 text-[11px]">{activeTxn.reversal_of}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Settled Timestamp</span>
                    <span className="font-mono text-zinc-200">
                      {new Date(activeTxn.settled_at || activeTxn.created_at).toLocaleString("en-IN", {
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
                    <span className="text-zinc-400">Category (Learns Merchant)</span>
                    <select
                      value={activeTxn.category}
                      onChange={async (e) => {
                        const newCat = e.target.value;
                        const ok = await updateTransactionCategory(activeTxn.id, newCat, true);
                        if (ok) {
                          setActiveTxn({ ...activeTxn, category: newCat as Transaction["category"] });
                          setActionFeedback(`Category updated to "${newCat}" & remembered for merchant.`);
                        }
                      }}
                      className="h-7 px-2 rounded-lg bg-zinc-900 border border-white/15 text-xs font-semibold text-zinc-100 capitalize cursor-pointer"
                    >
                      {["food", "groceries", "utilities", "shopping", "travel", "entertainment", "health", "education", "peer_transfer", "salary", "refund", "other"].map((c) => (
                        <option key={c} value={c}>
                          {c.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {((activeTxn.fee_amount || 0) > 0 || (activeTxn.gst_amount || 0) > 0) && (
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-zinc-400">Fee + 18% GST</span>
                      <span className="font-mono text-amber-300">
                        {formatINR(Number(activeTxn.fee_amount || 0))} + {formatINR(Number(activeTxn.gst_amount || 0))} GST
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Clearing & Risk Score</span>
                    <span className="font-mono text-zinc-200">
                      FastUPI 2.0 · Score {activeTxn.risk_score ?? 5}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-zinc-400">Note / Description</span>
                    <span className="text-zinc-300 italic">"{activeTxn.description || "Regular settlement"}"</span>
                  </div>
                </div>

                {actionFeedback && (
                  <p className="text-[11px] font-medium text-[#00D632] bg-[#00D632]/10 border border-[#00D632]/25 px-3 py-2 rounded-xl">
                    {actionFeedback}
                  </p>
                )}

                {activeTxn.type === "debit" && activeTxn.status === "completed" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await claimCashback(activeTxn.id);
                          setActionFeedback(
                            res.success
                              ? `Claimed ${formatINR(res.rewardAmount || 0)} Cashback from Marketing Ledger!`
                              : res.error || "Not eligible or already claimed."
                          );
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#00D632]/15 border border-[#00D632]/30 text-[#00D632] text-xs font-semibold hover:bg-[#00D632]/25 cursor-pointer"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Claim Cashback</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDisputeOpen((p) => !p)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 cursor-pointer"
                      >
                        <Flag className="size-3.5" />
                        <span>Report a Problem</span>
                      </button>
                    </div>

                    {disputeOpen && (
                      <div className="p-3 rounded-2xl border border-amber-400/30 bg-amber-500/5 space-y-2">
                        <input
                          type="text"
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          placeholder="Describe issue (e.g. unauthorized / duplicate debit)"
                          className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/15 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const r = await submitDispute({ transactionId: activeTxn.id, reason: disputeReason });
                            if (r.success) {
                              setDisputeOpen(false);
                              setDisputeReason("");
                              setActionFeedback("Dispute logged in Support Queue.");
                            } else {
                              setActionFeedback(r.error || "Could not submit dispute.");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold cursor-pointer"
                        >
                          Submit Dispute Ticket
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `Cash Payment Receipt\nUTR: ${activeTxn.utr_number || activeTxn.reference_id}\nRef: ${activeTxn.reference_id}\nAmount: ${formatINR(Number(activeTxn.amount))}\nSettled: ${activeTxn.settled_at || activeTxn.created_at}`,
                      "receipt"
                    )
                  }
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
                  onClick={handleExportPdf}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-xs font-bold text-black shadow-md shadow-[#00D632]/20 transition-all cursor-pointer"
                >
                  <FileText className="size-3.5 stroke-[2.5]" />
                  <span>PDF Statement</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
