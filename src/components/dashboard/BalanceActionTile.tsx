"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Plus,
  Lock,
  Unlock,
  ShieldAlert,
  CreditCard,
  Zap,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BalanceActionTileProps {
  onOpenUPI: () => void;
  onOpenBankCard: () => void;
  onOpenAddFunds: () => void;
}

export function BalanceActionTile({
  onOpenUPI,
  onOpenBankCard,
  onOpenAddFunds,
}: BalanceActionTileProps) {
  const { currentWallet, toggleWalletFreeze } = useWallet();
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  // Default to false so balance looks like ***** initially
  const [showBalance, setShowBalance] = useState(false);

  const balance = currentWallet?.balance ?? 45280.5;
  const isFrozen = currentWallet?.is_frozen ?? false;
  const walletNumber = currentWallet?.wallet_number || "CASH-8492019";
  const dailyLimit = currentWallet?.daily_limit ?? 100000;

  const handleConfirmFreezeToggle = async () => {
    setIsFreezing(true);
    try {
      await toggleWalletFreeze();
    } finally {
      setIsFreezing(false);
      setFreezeDialogOpen(false);
    }
  };

  return (
    <div className="flex h-full w-full min-h-0 flex-col justify-between py-1 select-none overflow-hidden">
      {/* Top Meta Header Row */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className={`flex size-2 rounded-full ${isFrozen ? "bg-amber-400" : "bg-[#00D632] animate-pulse"}`} />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Active Wallet
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
            {walletNumber.slice(0, 4)} •••• {walletNumber.slice(-4)}
          </span>
          <span className="text-[10px] font-bold text-[#00D632] bg-[#00D632]/10 border border-[#00D632]/25 px-1.5 py-0.5 rounded-full">
            INR
          </span>
        </div>
      </div>

      {/* Main Balance Display with Eye Toggle (Defaults to *****) */}
      <div className="my-auto py-1">
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono leading-none truncate select-all">
            {showBalance ? formatINR(balance) : "*****"}
          </span>

          {/* Eye Button to toggle hide/show balance */}
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="flex size-8 items-center justify-center rounded-xl border border-white/15 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title={showBalance ? "Hide balance (show as *****)" : "Show balance"}
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? (
              <Eye className="size-4 text-[#00D632]" />
            ) : (
              <EyeOff className="size-4 text-zinc-400" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2.5 mt-2.5">
          <span className={`text-xs font-medium flex items-center gap-1.5 ${isFrozen ? "text-amber-400" : "text-zinc-400"}`}>
            {isFrozen ? (
              <>
                <Lock className="size-3.5 text-amber-400" />
                <span>Wallet Locked · Payments paused</span>
              </>
            ) : (
              <>
                <Zap className="size-3.5 text-[#00D632]" />
                <span>FastUPI 2.0 Live</span>
              </>
            )}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
            <ShieldCheck className="size-3 text-[#00D632]" />
            <span>Limit: {formatINR(dailyLimit)}/day</span>
          </span>
        </div>
      </div>

      {/* 4 Quick Action Buttons (Compact & Bleed-proof) */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 shrink-0">
        <Button
          type="button"
          onClick={onOpenUPI}
          disabled={isFrozen}
          className="h-9 sm:h-10 rounded-xl bg-[#00D632] text-black font-bold text-xs hover:bg-[#00D632]/90 shadow-md shadow-[#00D632]/20 flex items-center justify-center gap-1.5 px-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <ArrowUpRight className="size-3.5 stroke-[2.5]" />
          <span className="truncate">Pay UPI</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenBankCard}
          disabled={isFrozen}
          className="h-9 sm:h-10 rounded-xl border-white/15 bg-white/5 text-xs font-medium text-white hover:bg-white/10 flex items-center justify-center gap-1.5 px-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <CreditCard className="size-3.5 text-purple-400" />
          <span className="truncate">Bank / Card</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenAddFunds}
          className="h-9 sm:h-10 rounded-xl border-white/15 bg-white/5 text-xs font-medium text-white hover:bg-white/10 flex items-center justify-center gap-1.5 px-2 cursor-pointer active:scale-95"
        >
          <Plus className="size-3.5 text-[#00D632]" />
          <span className="truncate">Add Funds</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setFreezeDialogOpen(true)}
          className={`h-9 sm:h-10 rounded-xl border-white/15 text-xs font-medium flex items-center justify-center gap-1.5 px-2 cursor-pointer active:scale-95 ${
            isFrozen
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
              : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          {isFrozen ? (
            <>
              <Unlock className="size-3.5" />
              <span className="truncate">Unlock</span>
            </>
          ) : (
            <>
              <Lock className="size-3.5 text-zinc-400" />
              <span className="truncate">Lock Card</span>
            </>
          )}
        </Button>
      </div>

      {/* Freeze / Unfreeze Confirmation AlertDialog */}
      <AlertDialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="size-5 text-amber-400" />
              <AlertDialogTitle>
                {isFrozen ? "Unlock Cash Wallet?" : "Freeze Cash Wallet & Card?"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {isFrozen
                ? "Unfreezing will restore immediate UPI transfer and virtual card checkout privileges on your account."
                : "Freezing immediately blocks all outgoing UPI payments, card transactions, and automated mandates. You can unfreeze anytime."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFreezeToggle}
              className={isFrozen ? "bg-[#00D632] text-black" : "bg-rose-500 hover:bg-rose-600 text-white"}
            >
              {isFreezing ? "Updating..." : isFrozen ? "Yes, Unlock Wallet" : "Yes, Freeze Wallet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
