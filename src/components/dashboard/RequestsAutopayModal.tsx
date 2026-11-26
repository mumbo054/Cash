"use client";

import * as React from "react";
import {
  X,
  Send,
  Users,
  CalendarClock,
  Star,
  Copy,
  Check,
  Play,
  Pause,
  Zap,
  ShieldAlert,
  Trash2,
  Receipt,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";

interface RequestsAutopayModalProps {
  open: boolean;
  onClose: () => void;
}

const SIMULATED_BILLERS = [
  { id: "bescom@bharatbill", name: "BESCOM Electricity Board", category: "utilities", defaultAmt: 1850 },
  { id: "jio@fiber", name: "JioFiber Broadband", category: "utilities", defaultAmt: 999 },
  { id: "airtel@postpaid", name: "Airtel Postpaid Mobile", category: "utilities", defaultAmt: 599 },
  { id: "netflix@autopay", name: "Netflix India", category: "entertainment", defaultAmt: 649 },
];

export function RequestsAutopayModal({ open, onClose }: RequestsAutopayModalProps) {
  const {
    currentProfile,
    securityStatus,
    payees,
    paymentRequests,
    scheduledPayments,
    createPaymentRequest,
    respondPaymentRequest,
    createScheduledPayment,
    updateScheduledPaymentStatus,
    runScheduledPaymentNow,
    upsertPayee,
    togglePayeeFavourite,
    deletePayee,
    sendMoney,
  } = useWallet();

  const [tab, setTab] = React.useState<"requests" | "split" | "autopay" | "payees">("requests");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedRef, setCopiedRef] = React.useState<string | null>(null);
  const [requestPin, setRequestPin] = React.useState("");

  // Request Money State
  const [payerIdent, setPayerIdent] = React.useState("akash@cash");
  const [reqAmount, setReqAmount] = React.useState("750");
  const [reqNote, setReqNote] = React.useState("Weekend dinner split");

  // Split Bill State
  const [splitTotal, setSplitTotal] = React.useState("1800");
  const [splitNote, setSplitNote] = React.useState("Cab & Lunch Split");
  const [splitMembers, setSplitMembers] = React.useState("akash@cash, aarav@cash");

  // Autopay State
  const [autoRecipient, setAutoRecipient] = React.useState("bescom@bharatbill");
  const [autoName, setAutoName] = React.useState("BESCOM Electricity");
  const [autoAmount, setAutoAmount] = React.useState("1500");
  const [autoFreq, setAutoFreq] = React.useState<"daily" | "weekly" | "monthly">("monthly");
  const [autoNote, setAutoNote] = React.useState("Monthly Power Bill");

  // Save Payee State
  const [payeeName, setPayeeName] = React.useState("");
  const [payeeHandle, setPayeeHandle] = React.useState("");
  const [payeeFav, setPayeeFav] = React.useState(true);

  if (!open) return null;

  const myId = currentProfile?.id;

  const handleCopyLink = (ref: string, amt: number) => {
    const upi = currentProfile?.upi_id || currentProfile?.email || "cash";
    const link = `${window.location.origin}/?payReq=${encodeURIComponent(ref)}&to=${encodeURIComponent(upi)}&amt=${amt}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(ref);
    window.setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await createPaymentRequest({
      payerIdentifier: payerIdent,
      amount: parseFloat(reqAmount),
      note: reqNote,
    });
    setFeedback(
      res.success
        ? { type: "success", text: `Created request ${res.referenceId}. Receiver notified in real time.` }
        : { type: "error", text: res.error || "Could not create request." }
    );
  };

  const handleSplitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const members = splitMembers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const total = parseFloat(splitTotal);
    if (members.length === 0 || isNaN(total) || total <= 0) {
      setFeedback({ type: "error", text: "Provide positive bill total and at least 1 friend's UPI handle." });
      return;
    }
    const share = Number((total / (members.length + 1)).toFixed(2));
    const results = await Promise.all(
      members.map((m) =>
        createPaymentRequest({
          payerIdentifier: m,
          amount: share,
          note: `Split (${members.length + 1} ways): ${splitNote}`,
        })
      )
    );
    const okCount = results.filter((r) => r.success).length;
    setFeedback(
      okCount === members.length
        ? { type: "success", text: `Sent ${okCount} split requests of ${formatINR(share)} each.` }
        : { type: "error", text: `Sent ${okCount}/${members.length} split requests.` }
    );
  };

  const handleCreateAutopay = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await createScheduledPayment({
      recipientIdentifier: autoRecipient,
      recipientName: autoName,
      amount: parseFloat(autoAmount),
      category: "utilities",
      description: autoNote,
      frequency: autoFreq,
    });
    setFeedback(
      res.success
        ? { type: "success", text: `Scheduled ${autoFreq} autopay mandate of ${formatINR(parseFloat(autoAmount))}.` }
        : { type: "error", text: res.error || "Failed to schedule mandate." }
    );
  };

  const handleSavePayee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await upsertPayee({
      payeeIdentifier: payeeHandle,
      payeeName,
      upiId: payeeHandle,
      isFavourite: payeeFav,
    });
    if (res.success) {
      setPayeeName("");
      setPayeeHandle("");
      setFeedback({ type: "success", text: "Payee saved. 24h cooling-off cap (₹5,000) armed automatically." });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to save payee." });
    }
  };

  const handleQuickPayBill = async (biller: (typeof SIMULATED_BILLERS)[number]) => {
    setFeedback(null);
    const res = await sendMoney({
      recipientUpiOrPhone: biller.id,
      recipientName: biller.name,
      amount: biller.defaultAmt,
      category: biller.category,
      description: `BBPS Instant Bill Payment: ${biller.name}`,
    });
    setFeedback(
      res.success
        ? { type: "success", text: `Paid ${formatINR(biller.defaultAmt)} to ${biller.name} (Ref: ${res.referenceId}).` }
        : { type: "error", text: res.error || "Bill payment failed." }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0" onClick={onClose} />

      <div className="relative z-50 flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Send className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Requests, Split Bills, Autopay & Saved Payees
              </h3>
              <p className="text-xs text-zinc-400">
                Collect links, recurring `pg_cron` mandates, BBPS billers & 24h cooling-off payee book
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payments hub"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/10 bg-black/40 flex-wrap">
          {(
            [
              { id: "requests", label: `Requests (${paymentRequests.length})`, icon: Receipt },
              { id: "split", label: "Split Bills", icon: Users },
              { id: "autopay", label: `Autopay (${scheduledPayments.length})`, icon: CalendarClock },
              { id: "payees", label: `Bills & Payees (${payees.length})`, icon: Star },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === id ? "bg-[#00D632] text-black" : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-2xl text-xs border ${
              feedback.type === "success"
                ? "bg-[#00D632]/15 text-[#00D632] border-[#00D632]/30"
                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {tab === "requests" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <form onSubmit={handleCreateRequest} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Request Money / Create Payment Link</h4>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Payer UPI Handle or Email</label>
                  <input
                    type="text"
                    required
                    value={payerIdent}
                    onChange={(e) => setPayerIdent(e.target.value)}
                    placeholder="akash@cash"
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Note</label>
                  <input
                    type="text"
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-bold cursor-pointer"
                >
                  Send Money Request
                </button>
              </form>

              <div className="space-y-2.5">
                {securityStatus?.has_pin && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-xs">
                    <span className="text-amber-200">PIN for paying requests ≥ {formatINR(securityStatus.pin_threshold)}:</span>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={requestPin}
                      onChange={(e) => setRequestPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="PIN"
                      className="w-24 h-7 px-2 rounded-lg bg-zinc-950 border border-amber-400/40 text-center font-mono text-white"
                    />
                  </div>
                )}

                {paymentRequests.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-4 rounded-2xl border border-white/10 bg-white/5">
                    No payment requests yet. Create a request or split a bill.
                  </p>
                ) : (
                  paymentRequests.map((req) => {
                    const isPayer = req.payer_id === myId;
                    const isRequester = req.requester_id === myId;
                    return (
                      <div key={req.id} className="p-3 rounded-2xl border border-white/10 bg-white/5 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-white">{req.reference_id}</span>
                          <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                            {req.status}
                          </span>
                        </div>
                        <p className="text-zinc-300">
                          <strong className="font-mono text-[#00D632]">{formatINR(req.amount)}</strong> ·{" "}
                          {isPayer ? "Incoming request to you" : `To ${req.payer_identifier}`}
                        </p>
                        {req.note && <p className="text-[11px] text-zinc-400 italic">"{req.note}"</p>}
                        <div className="flex items-center gap-2 pt-1">
                          {req.status === "pending" && isPayer && (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  const res = await respondPaymentRequest(req.id, "pay", requestPin || undefined);
                                  setFeedback(
                                    res.success
                                      ? { type: "success", text: `Settled ${req.reference_id} cleanly!` }
                                      : { type: "error", text: res.error || "Could not pay request." }
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#00D632] text-black font-bold cursor-pointer"
                              >
                                Approve & Pay
                              </button>
                              <button
                                type="button"
                                onClick={() => void respondPaymentRequest(req.id, "decline")}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {req.status === "pending" && isRequester && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(req.reference_id, req.amount)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-zinc-200 cursor-pointer"
                              >
                                {copiedRef === req.reference_id ? <Check className="size-3 text-[#00D632]" /> : <Copy className="size-3" />}
                                <span>Copy Link</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void respondPaymentRequest(req.id, "cancel")}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {tab === "split" && (
            <form onSubmit={handleSplitSubmit} className="max-w-lg rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3.5">
              <h4 className="text-sm font-bold text-white">Split Bill Equally Across Friends</h4>
              <p className="text-xs text-zinc-400">
                Includes you in the split and automatically sends individual payment requests to each participant.
              </p>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  min="2"
                  required
                  value={splitTotal}
                  onChange={(e) => setSplitTotal(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Friends' UPI Handles / Emails (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={splitMembers}
                  onChange={(e) => setSplitMembers(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bill Note</label>
                <input
                  type="text"
                  value={splitNote}
                  onChange={(e) => setSplitNote(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-bold cursor-pointer"
              >
                Send Split Requests
              </button>
            </form>
          )}

          {tab === "autopay" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <form onSubmit={handleCreateAutopay} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Schedule Recurring Payment (SIP / Rent / Bills)</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Biller / Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={autoName}
                      onChange={(e) => setAutoName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">UPI / Handle</label>
                    <input
                      type="text"
                      required
                      value={autoRecipient}
                      onChange={(e) => setAutoRecipient(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={autoAmount}
                      onChange={(e) => setAutoAmount(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Frequency</label>
                    <select
                      value={autoFreq}
                      onChange={(e) => setAutoFreq(e.target.value as "daily" | "weekly" | "monthly")}
                      className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Mandate Description</label>
                  <input
                    type="text"
                    value={autoNote}
                    onChange={(e) => setAutoNote(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-bold cursor-pointer"
                >
                  Activate Autopay Mandate
                </button>
              </form>

              <div className="space-y-2.5">
                {scheduledPayments.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-4 rounded-2xl border border-white/10 bg-white/5">
                    No active mandates yet. Scheduled mandates execute via `pg_cron` worker or on-demand trigger.
                  </p>
                ) : (
                  scheduledPayments.map((s) => (
                    <div key={s.id} className="p-3 rounded-2xl border border-white/10 bg-white/5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{s.recipient_name}</span>
                        <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#00D632]">
                          {s.frequency} · {s.status}
                        </span>
                      </div>
                      <p className="text-zinc-300 font-mono">{formatINR(s.amount)}</p>
                      <p className="text-[10px] text-zinc-500">
                        Next run: {new Date(s.next_run_at).toLocaleString("en-IN")}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {s.status === "active" && (
                          <button
                            type="button"
                            onClick={async () => {
                              const r = await runScheduledPaymentNow(s.id);
                              setFeedback(
                                r.success
                                  ? { type: "success", text: `Executed mandate to ${s.recipient_name} cleanly.` }
                                  : { type: "error", text: r.error || "Execution failed." }
                              );
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30 font-semibold cursor-pointer"
                          >
                            <Zap className="size-3" />
                            <span>Run Now</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void updateScheduledPaymentStatus(s.id, s.status === "active" ? "paused" : "active")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-zinc-200 cursor-pointer"
                        >
                          {s.status === "active" ? <Pause className="size-3" /> : <Play className="size-3" />}
                          <span>{s.status === "active" ? "Pause" : "Resume"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "payees" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Simulated BBPS Billers & Recharges</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SIMULATED_BILLERS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => void handleQuickPayBill(b)}
                      className="p-3 rounded-xl border border-white/10 bg-black/40 hover:border-[#00D632]/40 text-left cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-bold text-white">{b.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{b.id}</p>
                      <p className="text-xs font-mono font-bold text-[#00D632] mt-2">Pay {formatINR(b.defaultAmt)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form onSubmit={handleSavePayee} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <h4 className="text-sm font-bold text-white">Save Trusted Payee (24h Cooling-Off Protection)</h4>
                  <input
                    type="text"
                    required
                    placeholder="Payee Name"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="UPI Handle / Email (e.g. akash@cash)"
                    value={payeeHandle}
                    onChange={(e) => setPayeeHandle(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  />
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={payeeFav} onChange={(e) => setPayeeFav(e.target.checked)} className="accent-[#00D632]" />
                    <span>Mark as Favourite</span>
                  </label>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-[#00D632] text-black text-xs font-bold cursor-pointer"
                  >
                    Save Payee
                  </button>
                </form>

                <div className="space-y-2">
                  {payees.length === 0 ? (
                    <p className="text-xs text-zinc-500 p-4 rounded-2xl border border-white/10 bg-white/5">
                      No saved payees yet. Added payees carry an automatic 24h ₹5,000 cooling-off cap.
                    </p>
                  ) : (
                    payees.map((p) => {
                      const inCooling = !p.is_verified && new Date(p.cooling_until) > new Date();
                      return (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-white truncate">{p.payee_name}</p>
                            <p className="font-mono text-[11px] text-zinc-400 truncate">{p.payee_identifier}</p>
                            {inCooling && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-amber-300 font-mono mt-0.5">
                                <ShieldAlert className="size-3" /> 24h cooling-off cap ₹5,000
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => void togglePayeeFavourite(p.id)}
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                p.is_favourite ? "text-amber-400 bg-amber-500/15" : "text-zinc-500 bg-white/5"
                              }`}
                            >
                              <Star className="size-3.5" fill={p.is_favourite ? "currentColor" : "none"} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deletePayee(p.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 bg-white/5 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
