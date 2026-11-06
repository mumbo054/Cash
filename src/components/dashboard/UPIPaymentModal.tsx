"use client";

import * as React from "react";
import {
  X,
  Smartphone,
  Plus,
  Delete,
  RotateCcw,
  Store,
  User,
  CheckCircle2,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { SlideToConfirm } from "@/components/kokonutui/SlideToConfirm";

interface UPIPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

interface Recipient {
  name: string;
  handle: string;
  type: "store" | "person";
}

const FREQUENT_CONTACTS: Recipient[] = [
  { name: "Local Kirana & Supermarket", handle: "kirana.mart@okhdfc", type: "store" },
  { name: "Blue Tokai Coffee", handle: "bluetokai@paytm", type: "store" },
  { name: "Aarav Sharma", handle: "aarav@oksbi", type: "person" },
  { name: "Priya Patel", handle: "priya@okaxis", type: "person" },
  { name: "Rohan Verma", handle: "rohan@okhdfcbank", type: "person" },
];

export function UPIPaymentModal({ open, onClose }: UPIPaymentModalProps) {
  const { currentWallet, sendMoney, profiles } = useWallet();

  const registeredContacts = React.useMemo<Recipient[]>(() => {
    const list: Recipient[] = [];

    // Add registered profiles first
    if (profiles && profiles.length > 0) {
      profiles
        .filter((p) => p.id !== currentWallet?.user_id)
        .slice(0, 6)
        .forEach((p) => {
          list.push({
            name: p.full_name,
            handle: p.email ? `${p.email.split("@")[0]}@cash` : p.phone || "user@cash",
            type: "person",
          });
        });
    }

    // Add frequent stores
    list.push(
      { name: "Local Kirana & Supermarket", handle: "kirana.mart@okhdfc", type: "store" },
      { name: "Blue Tokai Coffee", handle: "bluetokai@paytm", type: "store" }
    );

    return list;
  }, [profiles, currentWallet?.user_id]);

  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient>(FREQUENT_CONTACTS[0]);
  const [customVpa, setCustomVpa] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);

  React.useEffect(() => {
    if (registeredContacts.length > 0) {
      setSelectedRecipient(registeredContacts[0]);
    }
  }, [registeredContacts]);

  // Shop Calculator & Itemized Tally state
  const [tallyItems, setTallyItems] = React.useState<number[]>([]);
  const [currentBuffer, setCurrentBuffer] = React.useState<string>("");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Calculate live total: sum of committed tally items + current buffer
  const committedSum = tallyItems.reduce((acc, curr) => acc + curr, 0);
  const currentNum = parseFloat(currentBuffer) || 0;
  const totalAmount = committedSum + currentNum;

  React.useEffect(() => {
    if (open) {
      setTallyItems([]);
      setCurrentBuffer("");
      setStatusMessage(null);
      setIsSuccess(false);
    }
  }, [open]);

  if (!open) return null;

  const activeRecipient = isCustom && customVpa.trim()
    ? { name: customVpa.trim(), handle: customVpa.trim(), type: "person" as const }
    : selectedRecipient;

  // Keypad actions
  const handleDigit = (digit: string) => {
    if (digit === "." && currentBuffer.includes(".")) return;
    if (currentBuffer.length >= 7) return;
    setCurrentBuffer((prev) => (prev === "0" && digit !== "." ? digit : prev + digit));
  };

  const handleBackspace = () => {
    if (currentBuffer.length > 0) {
      setCurrentBuffer((prev) => prev.slice(0, -1));
    } else if (tallyItems.length > 0) {
      const last = tallyItems[tallyItems.length - 1];
      setTallyItems((prev) => prev.slice(0, -1));
      setCurrentBuffer(last.toString());
    }
  };

  // The requested '+' button: adds the current item to the shop tally
  const handleAddPlus = () => {
    if (currentNum > 0) {
      setTallyItems((prev) => [...prev, currentNum]);
      setCurrentBuffer("");
    }
  };

  const handleResetAll = () => {
    setTallyItems([]);
    setCurrentBuffer("");
  };

  const handleAddQuickPreset = (val: number) => {
    setTallyItems((prev) => [...prev, val]);
  };

  // Payment Execution
  const handleExecutePayment = async () => {
    if (totalAmount <= 0) {
      setStatusMessage("Please enter an amount to pay");
      return;
    }

    if (currentWallet && currentWallet.balance < totalAmount) {
      setStatusMessage(`Insufficient wallet balance (${formatINR(currentWallet.balance)})`);
      return;
    }

    const itemsSummary = tallyItems.length > 0
      ? ` (${tallyItems.length + (currentNum > 0 ? 1 : 0)} items shop tally)`
      : "";

    const res = await sendMoney({
      recipientUpiOrPhone: activeRecipient.handle,
      recipientName: activeRecipient.name,
      amount: Number(totalAmount.toFixed(2)),
      category: "peer_transfer",
      description: `Payment to ${activeRecipient.name}${itemsSummary}`,
    });

    if (res.success) {
      setIsSuccess(true);
      const recipientLabel = res.recipientName || activeRecipient.name;
      const internalText = res.isInternal ? " · Receiver Credited ✓" : "";
      setStatusMessage(`Paid ${formatINR(totalAmount)} to ${recipientLabel}${internalText}`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setStatusMessage(res.error || "Payment failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 flex flex-col md:flex-row gap-4 items-stretch max-w-2xl w-full max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 bg-zinc-950/95 p-4 sm:p-5 md:p-6 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Left Side: Recipient Selector & Shop Contacts */}
        <div className="hidden md:flex flex-col w-64 border-r border-white/10 pr-5 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-[#00D632]">
              <Smartphone className="size-5" />
              <span className="font-semibold text-sm tracking-tight text-white">Instant UPI Pay</span>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2 font-medium">Recent Stores & Contacts</p>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
              {registeredContacts.map((c) => {
                const isSelected = !isCustom && selectedRecipient.handle === c.handle;
                return (
                  <button
                    key={c.handle}
                    type="button"
                    onClick={() => {
                      setSelectedRecipient(c);
                      setIsCustom(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00D632]/15 border border-[#00D632]/30 text-white shadow-sm"
                        : "hover:bg-white/5 border border-transparent text-zinc-300"
                    }`}
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200">
                      {c.type === "store" ? <Store className="size-3.5 text-[#00D632]" /> : <User className="size-3.5 text-sky-400" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{c.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{c.handle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom VPA input */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <label className="text-[11px] text-zinc-400 block mb-1 font-medium">Or enter UPI ID / Phone</label>
              <input
                type="text"
                placeholder="shopname@okhdfc"
                value={customVpa}
                onChange={(e) => {
                  setCustomVpa(e.target.value);
                  setIsCustom(true);
                }}
                className="w-full text-xs bg-zinc-900/80 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632] font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>NPCI UPI 2.0 Live</span>
            <span className="text-[#00D632] flex items-center gap-1">
              <ShieldCheck className="size-3" /> Zero Fee
            </span>
          </div>
        </div>

        {/* Right Side: Amount Display with Real-Time '+' Shop Calculator */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Payee Banner */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#00D632]/15 text-[#00D632] text-xs font-bold border border-[#00D632]/25">
                  {activeRecipient.name[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{activeRecipient.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">{activeRecipient.handle}</p>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                Bal: {formatINR(currentWallet?.balance ?? 0)}
              </span>
            </div>

            {/* Mobile Contact Quick-Pick Ribbon */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-b border-white/10">
              {registeredContacts.map((c) => {
                const isSelected = !isCustom && selectedRecipient.handle === c.handle;
                return (
                  <button
                    key={c.handle}
                    type="button"
                    onClick={() => {
                      setSelectedRecipient(c);
                      setIsCustom(false);
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00D632]/20 border border-[#00D632]/40 text-[#00D632] font-semibold"
                        : "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{c.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Shop Itemized Tally Ribbon */}
            <div className="mt-2 min-h-[28px] flex items-center justify-between bg-zinc-900/60 rounded-xl px-2.5 py-1 border border-white/10">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono text-zinc-300">
                <Receipt className="size-3 text-[#00D632] shrink-0" />
                {tallyItems.length === 0 && !currentBuffer ? (
                  <span className="text-zinc-500 text-[11px]">Tap digits or use '+' to tally multiple shop items</span>
                ) : (
                  <div className="flex items-center gap-1 flex-wrap">
                    {tallyItems.map((amt, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-white">
                        <span>₹{amt}</span>
                        <span className="text-[#00D632]">+</span>
                      </span>
                    ))}
                    {currentBuffer && (
                      <span className="bg-[#00D632]/20 text-[#00D632] px-1.5 py-0.5 rounded font-bold">
                        ₹{currentBuffer}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {(tallyItems.length > 0 || currentBuffer) && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[10px] text-zinc-400 hover:text-white ml-2 flex items-center gap-0.5 cursor-pointer"
                  title="Clear all items"
                >
                  <RotateCcw className="size-3" /> Clear
                </button>
              )}
            </div>

            {/* Total Amount Display */}
            <div className="my-3 text-center py-2 bg-zinc-900/40 rounded-2xl border border-white/10">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
                Total Transfer Amount
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-2xl font-bold text-[#00D632]">₹</span>
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: totalAmount % 1 === 0 ? 0 : 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {tallyItems.length > 0 && (
                <p className="text-[11px] text-[#00D632] font-mono mt-1">
                  ✓ {tallyItems.length + (currentNum > 0 ? 1 : 0)} items tallied
                </p>
              )}
            </div>

            {/* Quick Add Presets Row */}
            <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap">
              {[50, 100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddQuickPreset(preset)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-zinc-900/80 hover:bg-[#00D632]/10 hover:border-[#00D632]/30 hover:text-[#00D632] text-[11px] font-mono text-zinc-300 transition-all cursor-pointer active:scale-95"
                >
                  +₹{preset}
                </button>
              ))}
            </div>

            {/* Keypad Grid with Prominent '+' Button for Shop Multi-Item Addition */}
            <div className="grid grid-cols-4 gap-1.5 max-w-sm mx-auto">
              {["1", "2", "3"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
              {/* The '+' button on top right of keypad */}
              <button
                type="button"
                onClick={handleAddPlus}
                className="h-11 rounded-xl border border-[#00D632]/30 bg-[#00D632]/15 hover:bg-[#00D632]/25 text-[#00D632] font-bold text-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-0.5"
                title="Add current item and enter next item cost"
              >
                <Plus className="size-5 stroke-[3]" />
              </button>

              {["4", "5", "6"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
              {/* Backspace Button */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                title="Delete digit or remove last item"
              >
                <Delete className="size-4" />
              </button>

              {["7", "8", "9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
              {/* Decimal Point */}
              <button
                type="button"
                onClick={() => handleDigit(".")}
                className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                .
              </button>

              {/* Zero spanning 2 columns */}
              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="col-span-2 h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              {/* '00' double zero for fast amounts */}
              <button
                type="button"
                onClick={() => {
                  handleDigit("0");
                  handleDigit("0");
                }}
                className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                00
              </button>
              {/* Equal / Done Key */}
              <button
                type="button"
                onClick={handleAddPlus}
                className="h-11 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                Tally
              </button>
            </div>
          </div>

          {/* Slide to Pay Slider + Status Output */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <SlideToConfirm
              onConfirm={handleExecutePayment}
              label={totalAmount > 0 ? `Slide to Pay ${formatINR(totalAmount)} via UPI` : "Enter amount to Slide & Pay"}
              confirmedLabel={`Paid ${formatINR(totalAmount)}! ✓`}
              disabled={totalAmount <= 0}
            />

            {statusMessage && (
              <div className={`text-xs text-center font-medium p-2 rounded-xl transition-all ${
                isSuccess
                  ? "bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30 flex items-center justify-center gap-1.5"
                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}>
                {isSuccess && <CheckCircle2 className="size-3.5" />}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
