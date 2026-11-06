"use client";

import * as React from "react";
import { X, CreditCard, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { SlideToConfirm } from "@/components/kokonutui/SlideToConfirm";
import { formatINR } from "@/utils/formatters";

interface BankCardTransferModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "card" | "bank";
}

const BANK_IFSC_MAP: Record<string, string> = {
  HDFC: "HDFC Bank Ltd.",
  SBIN: "State Bank of India",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  PUNB: "Punjab National Bank",
  BARB: "Bank of Baroda",
};

export function BankCardTransferModal({
  open,
  onClose,
  defaultTab = "card",
}: BankCardTransferModalProps) {
  const { currentWallet, sendMoney } = useWallet();
  const [tab, setTab] = React.useState<"card" | "bank">(defaultTab);

  // Card Form state
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardName, setCardName] = React.useState("Aarav Sharma");
  const [cardExpiry, setCardExpiry] = React.useState("12/28");
  const [cardCvv, setCardCvv] = React.useState("429");
  const [cardAmount, setCardAmount] = React.useState("2500");
  const [cardNote, setCardNote] = React.useState("Credit Card Bill Settlement");

  // Bank Form state
  const [accountNumber, setAccountNumber] = React.useState("98210048192019");
  const [confirmAccountNumber, setConfirmAccountNumber] = React.useState("98210048192019");
  const [ifsc, setIfsc] = React.useState("HDFC0000128");
  const [beneficiaryName, setBeneficiaryName] = React.useState("Priya Patel");
  const [bankAmount, setBankAmount] = React.useState("5000");
  const [bankRemarks, setBankRemarks] = React.useState("Monthly Apartment Rent");

  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setStatusMessage(null);
      setIsSuccess(false);
    }
  }, [open, defaultTab]);

  if (!open) return null;

  const detectedBank = ifsc.length >= 4 ? BANK_IFSC_MAP[ifsc.slice(0, 4).toUpperCase()] : null;

  // Format Card Number input with spaces
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleCardTransfer = async () => {
    const amt = parseFloat(cardAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatusMessage("Please enter a valid transfer amount");
      return;
    }
    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (cleanCard.length < 12) {
      setStatusMessage("Please enter a valid 16-digit card number");
      return;
    }

    const res = await sendMoney({
      recipientUpiOrPhone: `CARD-${cleanCard.slice(-4)}`,
      recipientName: cardName || "Cardholder",
      amount: amt,
      category: "utilities",
      description: `${cardNote} (${cleanCard.slice(0, 4)}••••${cleanCard.slice(-4)})`,
    });

    if (res.success) {
      setIsSuccess(true);
      setStatusMessage(`Payment of ${formatINR(amt)} to Card ending in ${cleanCard.slice(-4)} processed!`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setStatusMessage(res.error || "Payment failed");
    }
  };

  const handleBankTransfer = async () => {
    const amt = parseFloat(bankAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatusMessage("Please enter a valid transfer amount");
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setStatusMessage("Account numbers do not match");
      return;
    }
    if (ifsc.length < 11) {
      setStatusMessage("Please enter a valid 11-character IFSC code");
      return;
    }

    const res = await sendMoney({
      recipientUpiOrPhone: `A/C ${accountNumber.slice(-4)} (${ifsc})`,
      recipientName: beneficiaryName || "Beneficiary",
      amount: amt,
      category: "transfer",
      description: `IMPS to ${beneficiaryName} - ${detectedBank || ifsc}: ${bankRemarks}`,
    });

    if (res.success) {
      setIsSuccess(true);
      setStatusMessage(`IMPS Transfer of ${formatINR(amt)} to ${beneficiaryName} dispatched successfully!`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setStatusMessage(res.error || "Bank transfer failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 bg-zinc-950/95 p-5 sm:p-6 md:p-8 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00D632]/10 border border-[#00D632]/25 text-[#00D632] text-xs font-medium mb-2">
            <ShieldCheck className="size-3.5" />
            <span>RBI / NPCI 24x7 Instant Settlement</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Bank & Card Direct Transfer</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Transfer money to any Indian Bank Account or pay any 16-digit debit/credit card
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-900/80 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setTab("card");
              setStatusMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === "card"
                ? "bg-[#00D632] text-black shadow-md shadow-[#00D632]/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <CreditCard className="size-4" />
            <span>Pay via Card Number</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("bank");
              setStatusMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === "bank"
                ? "bg-[#00D632] text-black shadow-md shadow-[#00D632]/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Building2 className="size-4" />
            <span>Bank Account (IMPS)</span>
          </button>
        </div>

        {/* Tab 1: Pay via 16-digit Card Number */}
        {tab === "card" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                16-Digit Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4532 8910 2049 8291"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/15 bg-zinc-900/80 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 uppercase">
                  Visa / RuPay / MC
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Name on Card / Beneficiary
                </label>
                <input
                  type="text"
                  placeholder="Aarav Sharma"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Transfer Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₹</span>
                  <input
                    type="number"
                    placeholder="2500"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    className="w-full h-10 pl-7 pr-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  placeholder="12/28"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full h-10 px-3 text-center rounded-xl border border-white/15 bg-zinc-900/80 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  placeholder="•••"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="w-full h-10 px-3 text-center rounded-xl border border-white/15 bg-zinc-900/80 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Available Bal
                </label>
                <div className="h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[11px] font-mono text-[#00D632]">
                  {formatINR(currentWallet?.balance ?? 0)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Payment Purpose / Note
              </label>
              <input
                type="text"
                placeholder="Credit Card Bill Settlement"
                value={cardNote}
                onChange={(e) => setCardNote(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
              />
            </div>

            {/* Swipe to Pay with SlideToConfirm */}
            <div className="pt-2">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 text-center">
                Swipe slider below to dispatch payment
              </label>
              <SlideToConfirm
                onConfirm={handleCardTransfer}
                label={`Slide to Pay ${formatINR(Number(cardAmount || 0))} to Card`}
                confirmedLabel="Payment Authorized & Sent!"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Bank Account Transfer (IMPS) */}
        {tab === "bank" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                placeholder="e.g. 98210048192019"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-white/15 bg-zinc-900/80 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  placeholder="Re-enter Account Number"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="HDFC0000128"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs font-mono uppercase text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>
            </div>

            {detectedBank && (
              <div className="text-[11px] text-[#00D632] bg-[#00D632]/10 border border-[#00D632]/25 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>Verified: {detectedBank}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Beneficiary Account Name
                </label>
                <input
                  type="text"
                  placeholder="Priya Patel"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Transfer Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₹</span>
                  <input
                    type="number"
                    placeholder="5000"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    className="w-full h-10 pl-7 pr-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="Monthly Apartment Rent / Invoice"
                value={bankRemarks}
                onChange={(e) => setBankRemarks(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-white/15 bg-zinc-900/80 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
              />
            </div>

            {/* Swipe to Pay with SlideToConfirm */}
            <div className="pt-2">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 text-center">
                Swipe slider below for instant 24x7 IMPS transfer
              </label>
              <SlideToConfirm
                onConfirm={handleBankTransfer}
                label={`Slide to Transfer ${formatINR(Number(bankAmount || 0))} via IMPS`}
                confirmedLabel="IMPS Transfer Completed!"
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`mt-3 text-xs text-center font-medium p-2 rounded-xl ${
            isSuccess
              ? "bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30"
              : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
          }`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
