"use client";

import * as React from "react";
import {
  X,
  Plus,
  FolderHeart,
  Home,
  Coffee,
  ShoppingBag,
  Car,
  Shield,
  Smartphone,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";

interface PocketsManagerModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "view" | "create";
}

const AVAILABLE_ICONS = [
  { id: "folder", label: "Folder", icon: FolderHeart },
  { id: "home", label: "Home", icon: Home },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "car", label: "Travel", icon: Car },
  { id: "phone", label: "Tech", icon: Smartphone },
  { id: "shield", label: "Safety", icon: Shield },
];

const AVAILABLE_COLORS = [
  { id: "green", label: "Green", class: "bg-[#00D632]", hex: "#00D632" },
  { id: "purple", label: "Purple", class: "bg-purple-500", hex: "#A855F7" },
  { id: "sky", label: "Sky", class: "bg-sky-500", hex: "#0EA5E9" },
  { id: "amber", label: "Amber", class: "bg-amber-400", hex: "#FBBF24" },
  { id: "rose", label: "Rose", class: "bg-rose-500", hex: "#F43F5E" },
];

export function PocketsManagerModal({ open, onClose, defaultMode = "view" }: PocketsManagerModalProps) {
  const { currentWallet, pockets, allocateToPocket, withdrawFromPocket, createPocket } = useWallet();

  const [activeTab, setActiveTab] = React.useState<"view" | "create">(defaultMode);
  const [selectedPocketId, setSelectedPocketId] = React.useState<string | null>(null);
  const [transferAmount, setTransferAmount] = React.useState<string>("");
  const [transferAction, setTransferAction] = React.useState<"add" | "withdraw">("add");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  // New Pocket Form State
  const [newPocketName, setNewPocketName] = React.useState("");
  const [newPocketTarget, setNewPocketTarget] = React.useState("");
  const [newPocketIcon, setNewPocketIcon] = React.useState("folder");
  const [newPocketColor, setNewPocketColor] = React.useState("green");
  const [createError, setCreateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  if (!open) return null;

  const currentBal = Number(currentWallet?.balance || 0);
  const selectedPocket = pockets.find((p) => p.id === selectedPocketId) || pockets[0];

  const handleTransferFunds = async () => {
    setActionError(null);
    setActionSuccess(null);
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError("Please enter a valid amount.");
      return;
    }

    if (!selectedPocket) {
      setActionError("Please select a pocket.");
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
        const success = await allocateToPocket(selectedPocket.id, amt);
        if (success) {
          setActionSuccess(`Transferred ${formatINR(amt)} into ${selectedPocket.name}`);
          setTransferAmount("");
        } else {
          setActionError("Failed to add funds to pocket.");
        }
      } else {
        if (amt > Number(selectedPocket.balance || 0)) {
          setActionError(`Pocket only has ${formatINR(Number(selectedPocket.balance || 0))} available to withdraw.`);
          setIsSubmitting(false);
          return;
        }
        const success = await withdrawFromPocket(selectedPocket.id, amt);
        if (success) {
          setActionSuccess(`Withdrew ${formatINR(amt)} from ${selectedPocket.name} back into main wallet.`);
          setTransferAmount("");
        } else {
          setActionError("Failed to withdraw funds from pocket.");
        }
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewPocket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newPocketName.trim()) {
      setCreateError("Please enter a pocket name.");
      return;
    }
    const targetAmt = newPocketTarget ? parseFloat(newPocketTarget) : undefined;
    if (newPocketTarget && (isNaN(targetAmt!) || targetAmt! <= 0)) {
      setCreateError("Target amount must be a positive number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createPocket({
        name: newPocketName.trim(),
        icon: newPocketIcon,
        color: newPocketColor,
        targetAmount: targetAmt,
      });

      if (success) {
        setNewPocketName("");
        setNewPocketTarget("");
        setActiveTab("view");
        setActionSuccess(`Smart pocket "${newPocketName.trim()}" created successfully!`);
      } else {
        setCreateError("Failed to create pocket in database.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create pocket.");
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
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#00D632]/15 border border-[#00D632]/30 text-[#00D632]">
              <FolderHeart className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Smart Pockets Manager
              </h3>
              <p className="text-xs text-zinc-400">
                Organize and isolate funds for rent, travel, groceries & buffers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View / Create Switcher */}
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
                    ? "bg-[#00D632] text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pockets ({pockets.length})
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
                    ? "bg-[#00D632] text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>New Pocket</span>
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

        {/* Available Wallet Balance Banner */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 bg-black/50 border-b border-white/10 text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#00D632]" />
            <span>Main Cash Balance:</span>
            <span className="font-mono font-bold text-white">{formatINR(currentBal)}</span>
          </span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Pocket money is isolated from everyday swipe card debits
          </span>
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
              {pockets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-500 mb-3">
                    <FolderHeart className="size-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">No Smart Pockets Yet</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                    Pockets keep money tucked away so you don’t accidentally spend bill or rent money.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("create")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D632] text-black font-bold text-xs shadow-md shadow-[#00D632]/25 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                    <span>Create Your First Pocket</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pockets.map((pocket) => {
                    const bal = Number(pocket.balance || 0);
                    const target = Number(pocket.target_amount || 10000);
                    const pct = Math.min(100, Math.round((bal / target) * 100));
                    const isSelected = selectedPocket?.id === pocket.id;

                    return (
                      <div
                        key={pocket.id}
                        onClick={() => setSelectedPocketId(pocket.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00D632]/10 border-[#00D632]/40 shadow-sm ring-1 ring-[#00D632]/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-xl bg-[#00D632]/20 text-[#00D632]">
                              <FolderHeart className="size-4" />
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-white leading-tight">
                                {pocket.name}
                              </h5>
                              <p className="text-[10px] text-zinc-400">
                                Target: {formatINR(target)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-mono text-base font-bold text-white">
                              {formatINR(bal)}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {pct}% filled
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-3">
                          <div
                            className="bg-[#00D632] h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            Quick Transfer
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                allocateToPocket(pocket.id, 500);
                              }}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#00D632]/15 text-[#00D632] hover:bg-[#00D632]/25 border border-[#00D632]/20 transition-all cursor-pointer"
                            >
                              +₹500
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                allocateToPocket(pocket.id, 1000);
                              }}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#00D632]/15 text-[#00D632] hover:bg-[#00D632]/25 border border-[#00D632]/20 transition-all cursor-pointer"
                            >
                              +₹1k
                            </button>
                            {bal > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  withdrawFromPocket(pocket.id, Math.min(bal, 500));
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

              {/* Transfer Drawer Form when a pocket is selected */}
              {selectedPocket && (
                <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-white/15 bg-zinc-900/60 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                        Transfer Money with "{selectedPocket.name}"
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Move money between your main wallet balance and this pocket
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setTransferAction("add")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                          transferAction === "add"
                            ? "bg-[#00D632] text-black font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <ArrowDownLeft className="size-3" />
                        <span>Add Money</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferAction("withdraw")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                          transferAction === "withdraw"
                            ? "bg-[#00D632] text-black font-semibold"
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
                        placeholder="Enter amount (e.g. 1500)"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#00D632] transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleTransferFunds}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 disabled:opacity-50 text-black text-xs font-bold shadow-md shadow-[#00D632]/25 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isSubmitting ? "Processing..." : transferAction === "add" ? "Deposit into Pocket" : "Withdraw to Wallet"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Create New Pocket Form */
            <form onSubmit={handleCreateNewPocket} className="space-y-4 max-w-lg mx-auto py-2">
              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Pocket Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPocketName}
                  onChange={(e) => setNewPocketName(e.target.value)}
                  placeholder="e.g. Goa Trip, Rent & Maintenance, Gadget Fund"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00D632] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Target Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newPocketTarget}
                    onChange={(e) => setNewPocketTarget(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#00D632] transition-colors"
                  />
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Select Icon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = newPocketIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewPocketIcon(item.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00D632]/15 border-[#00D632] text-[#00D632]"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span className="text-[9px] mt-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewPocketColor(c.id)}
                      className={`flex size-8 items-center justify-center rounded-full ${c.class} cursor-pointer transition-transform ${
                        newPocketColor === c.id ? "ring-4 ring-white/30 scale-110" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {newPocketColor === c.id && <Check className="size-4 text-black stroke-[3]" />}
                    </button>
                  ))}
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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 disabled:opacity-50 text-black text-xs font-bold shadow-md shadow-[#00D632]/25 transition-all cursor-pointer"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                  <span>{isSubmitting ? "Creating Pocket..." : "Create Pocket"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
