"use client";

import * as React from "react";
import {
  X,
  Plus,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  AlertCircle,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";

interface SavingsVaultModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "view" | "create";
}

const GOAL_CATEGORIES = [
  { id: "tech", label: "Tech & Gadgets" },
  { id: "vacation", label: "Vacation & Travel" },
  { id: "vehicle", label: "Car & Bike" },
  { id: "education", label: "Education & Skills" },
  { id: "emergency", label: "Emergency Safety" },
  { id: "home", label: "Home & Living" },
];

export function SavingsVaultModal({ open, onClose, defaultMode = "view" }: SavingsVaultModalProps) {
  const { currentWallet, savingsGoals, contributeToGoal, withdrawFromGoal, createGoal } = useWallet();

  const [activeTab, setActiveTab] = React.useState<"view" | "create">(defaultMode);
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(null);
  const [transferAmount, setTransferAmount] = React.useState<string>("");
  const [transferAction, setTransferAction] = React.useState<"add" | "withdraw">("add");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  // New Goal Form State
  const [newTitle, setNewTitle] = React.useState("");
  const [newTargetAmount, setNewTargetAmount] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("tech");
  const [newTargetDate, setNewTargetDate] = React.useState("");
  const [createError, setCreateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  if (!open) return null;

  const currentBal = Number(currentWallet?.balance || 0);
  const selectedGoal = savingsGoals.find((g) => g.id === selectedGoalId) || savingsGoals[0];

  // Total savings across all goals
  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleTransferFunds = async () => {
    setActionError(null);
    setActionSuccess(null);
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError("Please enter a valid amount.");
      return;
    }

    if (!selectedGoal) {
      setActionError("Please select a savings goal.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (transferAction === "add") {
        if (amt > currentBal) {
          setActionError(`Insufficient wallet balance. You have ${formatINR(currentBal)} available.`);
          setIsSubmitting(false);
          return;
        }
        const success = await contributeToGoal(selectedGoal.id, amt);
        if (success) {
          setActionSuccess(`Deposited ${formatINR(amt)} towards "${selectedGoal.title}"`);
          setTransferAmount("");
        } else {
          setActionError("Failed to contribute to goal.");
        }
      } else {
        if (amt > Number(selectedGoal.current_amount || 0)) {
          setActionError(`Goal only has ${formatINR(Number(selectedGoal.current_amount || 0))} deposited.`);
          setIsSubmitting(false);
          return;
        }
        const success = await withdrawFromGoal(selectedGoal.id, amt);
        if (success) {
          setActionSuccess(`Withdrew ${formatINR(amt)} from "${selectedGoal.title}" back to main wallet.`);
          setTransferAmount("");
        } else {
          setActionError("Failed to withdraw from savings goal.");
        }
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newTitle.trim()) {
      setCreateError("Please enter a goal title.");
      return;
    }
    const targetAmt = parseFloat(newTargetAmount);
    if (isNaN(targetAmt) || targetAmt <= 0) {
      setCreateError("Please enter a valid target amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createGoal({
        title: newTitle.trim(),
        targetAmount: targetAmt,
        category: newCategory,
        targetDate: newTargetDate || undefined,
      });

      if (success) {
        setNewTitle("");
        setNewTargetAmount("");
        setNewTargetDate("");
        setActiveTab("view");
        setActionSuccess(`Savings goal "${newTitle.trim()}" created!`);
      } else {
        setCreateError("Failed to create savings goal in database.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create savings goal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="relative z-50 flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <Target className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Savings Vault & Compounding Goals
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  3.2% p.a.
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Lock savings into targeted milestone vaults with daily interest accrual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("view");
                  setActionError(null);
                  setActionSuccess(null);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "view"
                    ? "bg-amber-400 text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Goals ({savingsGoals.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("create");
                  setActionError(null);
                  setActionSuccess(null);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "create"
                    ? "bg-amber-400 text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>New Goal</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Vault Summary KPI Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 sm:p-5 border-b border-white/10 bg-black/40">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Total Saved in Vault
            </span>
            <p className="font-mono text-base sm:text-xl font-bold text-amber-400">
              {formatINR(totalSaved)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Across {savingsGoals.length} goals</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Overall Progress
            </span>
            <p className="font-mono text-base sm:text-xl font-bold text-white">
              {overallPct}%
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-1.5">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1 flex items-center gap-1">
              <ShieldCheck className="size-3 text-[#00D632]" />
              <span>DICGC Insured</span>
            </span>
            <p className="font-mono text-base sm:text-xl font-bold text-[#00D632]">
              ₹5,00,000
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">RBI statutory guarantee</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {actionSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#00D632]/10 border border-[#00D632]/30 text-xs text-[#00D632]">
              <Check className="size-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {activeTab === "view" ? (
            <div className="space-y-4">
              {savingsGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-500 mb-3">
                    <Target className="size-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">No Savings Goals Yet</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                    Set a milestone like a trip, gadget, or down-payment and earn 3.2% daily interest.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("create")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-400/25 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                    <span>Create Your First Goal</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savingsGoals.map((goal) => {
                    const current = Number(goal.current_amount || 0);
                    const target = Number(goal.target_amount || 50000);
                    const pct = Math.min(100, Math.round((current / target) * 100));
                    const isSelected = selectedGoal?.id === goal.id;
                    const isAchieved = current >= target;

                    return (
                      <div
                        key={goal.id}
                        onClick={() => setSelectedGoalId(goal.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-400/10 border-amber-400/40 shadow-sm ring-1 ring-amber-400/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
                              {isAchieved ? <Trophy className="size-4 text-[#00D632]" /> : <Target className="size-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-sm font-semibold text-white leading-tight">
                                  {goal.title}
                                </h5>
                                {isAchieved && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00D632]/20 text-[#00D632]">
                                    ACHIEVED
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-400 capitalize">
                                {goal.category || "Personal Vault"}
                                {goal.target_date && ` • Target: ${new Date(goal.target_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-mono text-base font-bold text-white">
                              {formatINR(current)}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              of {formatINR(target)} ({pct}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAchieved ? "bg-[#00D632]" : "bg-amber-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            Deposit
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                contributeToGoal(goal.id, 1000);
                              }}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/20 transition-all cursor-pointer"
                            >
                              +₹1k
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                contributeToGoal(goal.id, 5000);
                              }}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/20 transition-all cursor-pointer"
                            >
                              +₹5k
                            </button>
                            {current > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  withdrawFromGoal(goal.id, Math.min(current, 1000));
                                }}
                                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-all cursor-pointer"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Deposit/Withdraw Drawer when a goal is selected */}
              {selectedGoal && (
                <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-white/15 bg-zinc-900/60 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                        Contribute or Withdraw from "{selectedGoal.title}"
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Funds in your vault earn 3.2% p.a. interest calculated daily
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setTransferAction("add")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                          transferAction === "add"
                            ? "bg-amber-400 text-black font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <ArrowDownLeft className="size-3" />
                        <span>Deposit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferAction("withdraw")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                          transferAction === "withdraw"
                            ? "bg-amber-400 text-black font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <ArrowUpRight className="size-3" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-zinc-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter amount (e.g. 5000)"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleTransferFunds}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-400/90 disabled:opacity-50 text-black text-xs font-bold shadow-md shadow-amber-400/25 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isSubmitting ? "Processing..." : transferAction === "add" ? "Deposit into Goal" : "Withdraw to Wallet"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Create New Goal Form */
            <form onSubmit={handleCreateNewGoal} className="space-y-4 max-w-lg mx-auto py-2">
              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro M4 Max, Goa Vacation, Bike Down Payment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Target Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="500"
                    step="500"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("view")}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-400/90 disabled:opacity-50 text-black text-xs font-bold shadow-md shadow-amber-400/25 transition-all cursor-pointer"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                  <span>{isSubmitting ? "Creating Goal..." : "Create Savings Goal"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
