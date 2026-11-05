"use client";

import * as React from "react";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/context/WalletContext";

const months = [
  { label: "01 - Jan", value: "01" },
  { label: "02 - Feb", value: "02" },
  { label: "03 - Mar", value: "03" },
  { label: "04 - Apr", value: "04" },
  { label: "05 - May", value: "05" },
  { label: "06 - Jun", value: "06" },
  { label: "07 - Jul", value: "07" },
  { label: "08 - Aug", value: "08" },
  { label: "09 - Sep", value: "09" },
  { label: "10 - Oct", value: "10" },
  { label: "11 - Nov", value: "11" },
  { label: "12 - Dec", value: "12" },
];

const years = [
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },
];

interface AddBalanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddBalanceModal({ open, onClose }: AddBalanceModalProps) {
  const { addFunds } = useWallet();
  const [amount, setAmount] = React.useState("5000");
  const [name, setName] = React.useState("Aarav Sharma");
  const [cardNumber, setCardNumber] = React.useState("4321 8765 2109 4589");
  const [month, setMonth] = React.useState<string | null>("08");
  const [year, setYear] = React.useState<string | null>("2027");
  const [cvv, setCvv] = React.useState("829");
  const [comments, setComments] = React.useState("Initial deposit for monthly expenses");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg("Please enter a valid deposit amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await addFunds(val, comments || "Debit / Credit Card Deposit");
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setLoading(false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || "Deposit failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[3px] animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-lg rounded-3xl border border-white/20 bg-zinc-950/90 p-6 md:p-8 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00D632]/10 border border-[#00D632]/25 text-[#00D632] text-xs font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit Encrypted Banking Gateway</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Add Balance to Cash Wallet</h2>
          <p className="text-xs text-zinc-400 mt-1">Load Indian Rupees directly to your instant spending wallet</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <FieldGroup>
            {/* Amount input */}
            <Field>
              <FieldLabel htmlFor="deposit-amount">Amount to Add (₹ INR)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">₹</span>
                <Input
                  id="deposit-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-base font-bold text-white bg-zinc-900/70 border-white/15"
                  placeholder="5000"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                {[1000, 2000, 5000, 10000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setAmount(quick.toString())}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-white/10 bg-zinc-900/60 hover:bg-white/10 text-zinc-300 transition-colors"
                  >
                    +₹{quick.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </Field>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Payment Method</FieldLegend>
              <FieldDescription>
                All transactions are secure, zero fee and instant
              </FieldDescription>
              <FieldGroup className="mt-3">
                <Field>
                  <FieldLabel htmlFor="checkout-card-name">
                    Name on Card
                  </FieldLabel>
                  <Input
                    id="checkout-card-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-card-number">
                    Card Number
                  </FieldLabel>
                  <Input
                    id="checkout-card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <FieldDescription>
                    Enter your 16-digit debit or credit card number
                  </FieldDescription>
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel htmlFor="checkout-exp-month">
                      Month
                    </FieldLabel>
                    <Select items={months} value={month} onValueChange={setMonth}>
                      <SelectTrigger id="checkout-exp-month">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {months.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="checkout-exp-year">
                      Year
                    </FieldLabel>
                    <Select items={years} value={year} onValueChange={setYear}>
                      <SelectTrigger id="checkout-exp-year">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {years.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="checkout-cvv">CVV</FieldLabel>
                    <Input
                      id="checkout-cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Billing Preferences</FieldLegend>
              <FieldGroup className="mt-2">
                <Field orientation="horizontal">
                  <Checkbox
                    id="checkout-save-card"
                    defaultChecked
                  />
                  <FieldLabel
                    htmlFor="checkout-save-card"
                    className="font-normal text-xs text-zinc-300"
                  >
                    Save card securely as per RBI tokenization guidelines
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="checkout-comments">
                    Note / Purpose
                  </FieldLabel>
                  <Textarea
                    id="checkout-comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add purpose (e.g. Monthly grocery & utility funds)"
                    className="resize-none h-16"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="rounded-xl border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                className="rounded-xl bg-[#00D632] px-6 font-semibold text-black hover:bg-[#00D632]/90 shadow-lg shadow-[#00D632]/20"
              >
                {success ? "Balance Added! ✓" : loading ? "Authorizing..." : `Deposit ₹${Number(amount || 0).toLocaleString("en-IN")}`}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
