"use client";

import * as React from "react";
import {
  X,
  ShieldAlert,
  RefreshCw,
  Search,
  RotateCcw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Users,
  Activity,
  FileText,
  FileBadge,
  MessageSquareWarning,
  Sliders,
  Server,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatINR } from "@/utils/formatters";
import { AdminOverviewData, AdminQueueData, AdminUserRecord, UserTier } from "@/types/database.types";
import { useWallet } from "@/context/WalletContext";
import { useDebounce } from "@/hooks/use-debounce";
import { getTelemetrySnapshot, pingEdgeHealth, EdgeHealthResult } from "@/lib/telemetry";

interface AdminBackOfficeModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminBackOfficeModal({ open, onClose }: AdminBackOfficeModalProps) {
  const { refreshData } = useWallet();
  const [tab, setTab] = React.useState<
    "overview" | "users" | "kyc" | "disputes" | "transactions" | "limits" | "audits" | "ops"
  >("overview");
  const [overview, setOverview] = React.useState<AdminOverviewData | null>(null);
  const [queues, setQueues] = React.useState<AdminQueueData | null>(null);
  const [users, setUsers] = React.useState<AdminUserRecord[]>([]);
  const [userSearch, setUserSearch] = React.useState("");
  const debouncedSearch = useDebounce(userSearch, 250);
  const [loading, setLoading] = React.useState(false);
  const [reason, setReason] = React.useState("Compliance / Risk review verification");
  const [edgeHealth, setEdgeHealth] = React.useState<EdgeHealthResult | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editTier, setEditTier] = React.useState<UserTier>("standard");
  const [perTxnLim, setPerTxnLim] = React.useState("50000");
  const [dailyLim, setDailyLim] = React.useState("100000");
  const [monthlyLim, setMonthlyLim] = React.useState("500000");
  const [maxBalLim, setMaxBalLim] = React.useState("100000");

  const loadAllAdmin = React.useCallback(async (q = "") => {
    setLoading(true);
    try {
      const [ovRes, qRes, uRes] = await Promise.all([
        supabase.rpc("admin_get_overview"),
        supabase.rpc("admin_get_queues"),
        supabase.rpc("admin_search_users", { p_query: q }),
      ]);
      if (!ovRes.error && ovRes.data?.success) {
        const ov = ovRes.data as unknown as AdminOverviewData;
        setOverview(ov);
        const std = ov.limits_config?.find((l) => l.tier === "standard");
        if (std) {
          setEditTier(std.tier);
          setPerTxnLim(String(std.per_txn_limit));
          setDailyLim(String(std.daily_limit));
          setMonthlyLim(String(std.monthly_limit));
          setMaxBalLim(String(std.max_wallet_balance));
        }
      } else if (ovRes.data?.error || ovRes.error) {
        setFeedback({ type: "error", text: ovRes.data?.error || ovRes.error?.message || "Failed to load admin console" });
      }
      if (!qRes.error && qRes.data?.success) {
        setQueues(qRes.data as unknown as AdminQueueData);
      }
      if (!uRes.error && uRes.data?.success) {
        setUsers((uRes.data.users as AdminUserRecord[]) || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setFeedback(null);
      void loadAllAdmin("");
    }
  }, [open, loadAllAdmin]);

  React.useEffect(() => {
    if (!open) return;
    void supabase.rpc("admin_search_users", { p_query: debouncedSearch }).then(({ data, error }) => {
      if (!error && data?.success) {
        setUsers((data.users as AdminUserRecord[]) || []);
      }
    });
  }, [debouncedSearch, open]);

  if (!open) return null;

  const handleRunReconciliation = async () => {
    setFeedback(null);
    const { data, error } = await supabase.rpc("admin_run_reconciliation");
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "Reconciliation failed" });
      return;
    }
    setFeedback({
      type: "success",
      text: `Reconciled ${data.accounts_checked} accounts · Mismatches: ${data.mismatches_found} · System Net: ${formatINR(data.total_system_net)}`,
    });
    await loadAllAdmin(debouncedSearch);
  };

  const handleRunWorkerJobs = async () => {
    setFeedback(null);
    const { data, error } = await supabase.rpc("admin_run_worker_jobs");
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "Worker run failed" });
      return;
    }
    setFeedback({
      type: "success",
      text: `Worker swept pgmq & pg_cron tasks: ${data.processed_scheduled_payments} autopays, ${data.expired_requests} expired requests, ${data.archived_queue_jobs} queue jobs.`,
    });
    await Promise.all([loadAllAdmin(debouncedSearch), refreshData()]);
  };

  const handleEdgeHealthCheck = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await pingEdgeHealth(sessionData.session?.access_token);
    setEdgeHealth(res);
  };

  const handleUserControl = async (targetUserId: string, action: string, value?: string) => {
    setFeedback(null);
    if (reason.trim().length < 3) {
      setFeedback({ type: "error", text: "Please enter a reason (3+ chars) for the audit log." });
      return;
    }
    const { data, error } = await supabase.rpc("admin_update_user_control", {
      p_target_user_id: targetUserId,
      p_action: action,
      p_value: value || null,
      p_reason: reason.trim(),
    });
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "Admin action failed" });
      return;
    }
    setFeedback({ type: "success", text: `Updated (${action}) and recorded in audit log.` });
    await Promise.all([loadAllAdmin(debouncedSearch), refreshData()]);
  };

  const handleReviewKyc = async (kycId: string, decision: "verified" | "rejected") => {
    setFeedback(null);
    const { data, error } = await supabase.rpc("admin_review_kyc", {
      p_kyc_id: kycId,
      p_decision: decision,
      p_reason: reason.trim(),
    });
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "KYC decision failed" });
      return;
    }
    setFeedback({ type: "success", text: `KYC marked ${decision} & user notified.` });
    await Promise.all([loadAllAdmin(debouncedSearch), refreshData()]);
  };

  const handleResolveDispute = async (disputeId: string, action: "under_review" | "refund" | "reject") => {
    setFeedback(null);
    const { data, error } = await supabase.rpc("admin_resolve_dispute", {
      p_dispute_id: disputeId,
      p_action: action,
      p_resolution_note: reason.trim(),
    });
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "Dispute update failed" });
      return;
    }
    setFeedback({ type: "success", text: `Dispute updated (${action}).` });
    await Promise.all([loadAllAdmin(debouncedSearch), refreshData()]);
  };

  const handleReverseTransaction = async (txnId: string, refId: string) => {
    setFeedback(null);
    if (reason.trim().length < 3) {
      setFeedback({ type: "error", text: "Please enter a reversal reason (3+ chars)." });
      return;
    }
    const { data, error } = await supabase.rpc("admin_reverse_transaction", {
      p_transaction_id: txnId,
      p_reason: reason.trim(),
    });
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "Reversal failed" });
      return;
    }
    setFeedback({ type: "success", text: `Reversed ${refId} via compensating entry ${data.reversal_reference}` });
    await Promise.all([loadAllAdmin(debouncedSearch), refreshData()]);
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const { data, error } = await supabase.rpc("admin_update_limits_config", {
      p_tier: editTier,
      p_per_txn_limit: parseFloat(perTxnLim),
      p_daily_limit: parseFloat(dailyLim),
      p_monthly_limit: parseFloat(monthlyLim),
      p_max_wallet_balance: parseFloat(maxBalLim),
      p_reason: reason.trim(),
    });
    if (error || !data || data.success === false) {
      setFeedback({ type: "error", text: data?.error || error?.message || "Limits update failed" });
      return;
    }
    setFeedback({ type: "success", text: `Updated ${editTier} tier limits and recorded audit entry.` });
    await loadAllAdmin(debouncedSearch);
  };

  const clientTel = getTelemetrySnapshot();
  const vitals = typeof window !== "undefined" ? window.__CASH_PERF__?.vitals : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0" onClick={onClose} />

      <div className="relative z-50 flex flex-col w-full max-w-5xl max-h-[92vh] rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Admin Back Office, Risk & Reconciliation Console
              </h3>
              <p className="text-xs text-zinc-400">
                RBAC-enforced staff operations · Immutable audit trail · `pgmq` & Edge diagnostics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin console"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: "overview", label: "Overview", icon: Activity },
                { id: "users", label: "Users", icon: Users },
                { id: "kyc", label: `KYC Queue (${queues?.kyc_documents.filter((k) => k.status === "pending").length || 0})`, icon: FileBadge },
                { id: "disputes", label: `Disputes (${queues?.disputes.filter((d) => d.status === "open" || d.status === "under_review").length || 0})`, icon: MessageSquareWarning },
                { id: "transactions", label: "Transactions", icon: RotateCcw },
                { id: "limits", label: "Tier Limits", icon: Sliders },
                { id: "audits", label: "Audit Logs", icon: FileText },
                { id: "ops", label: "Health & Jobs", icon: Server },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  tab === id ? "bg-amber-400 text-black" : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono text-zinc-400 uppercase shrink-0">Reason:</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Required audit reason"
              className="w-full md:w-52 h-8 px-3 rounded-lg bg-zinc-900 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {feedback && (
          <div
            className={`mx-5 mt-4 flex items-center gap-2 p-3 rounded-2xl text-xs ${
              feedback.type === "success"
                ? "bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30"
                : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && !overview ? (
            <p className="text-xs text-zinc-400 text-center py-10">Loading back-office metrics...</p>
          ) : tab === "overview" && overview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[10px] font-semibold uppercase text-zinc-400">Total Users</p>
                  <p className="font-mono text-xl font-bold text-white mt-1">{overview.kpis.total_users}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[10px] font-semibold uppercase text-zinc-400">Total Wallet Float</p>
                  <p className="font-mono text-xl font-bold text-[#00D632] mt-1">{formatINR(overview.kpis.total_wallet_float)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[10px] font-semibold uppercase text-zinc-400">Frozen Wallets</p>
                  <p className="font-mono text-xl font-bold text-amber-400 mt-1">{overview.kpis.frozen_wallets}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[10px] font-semibold uppercase text-zinc-400">Reversed Txns</p>
                  <p className="font-mono text-xl font-bold text-rose-400 mt-1">{overview.kpis.reversed_transactions}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Double-Entry Ledger Reconciliation</h4>
                  {overview.latest_reconciliation ? (
                    <p className="text-xs text-zinc-400 mt-1">
                      Last run: {new Date(overview.latest_reconciliation.run_at).toLocaleString("en-IN")} · Checked{" "}
                      <strong className="text-white">{overview.latest_reconciliation.accounts_checked}</strong> accounts ·
                      Mismatches:{" "}
                      <strong className={overview.latest_reconciliation.mismatches_found === 0 ? "text-[#00D632]" : "text-rose-400"}>
                        {overview.latest_reconciliation.mismatches_found}
                      </strong>{" "}
                      · System Net: <strong className="text-white">{formatINR(overview.latest_reconciliation.total_system_net)}</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 mt-1">No reconciliation run recorded yet.</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRunReconciliation}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-bold cursor-pointer shrink-0"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Run Reconciliation</span>
                </button>
              </div>
            </div>
          ) : tab === "users" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Debounced search by name, email, UPI handle or wallet number..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{u.full_name}</span>
                        <span className="font-mono text-[10px] text-zinc-400">{u.email}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 uppercase">{u.tier}</span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase ${
                            u.kyc_status === "verified" ? "bg-[#00D632]/15 text-[#00D632]" : "bg-amber-400/15 text-amber-300"
                          }`}
                        >
                          KYC: {u.kyc_status}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-zinc-400 mt-1">
                        {u.wallet_number} · Balance: <strong className="text-white">{formatINR(u.balance)}</strong> ·{" "}
                        {u.is_frozen ? <span className="text-rose-400">FROZEN</span> : <span className="text-[#00D632]">ACTIVE</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => void handleUserControl(u.id, u.is_frozen ? "unfreeze" : "freeze")}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                          u.is_frozen
                            ? "bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {u.is_frozen ? <Unlock className="size-3" /> : <Lock className="size-3" />}
                        <span>{u.is_frozen ? "Unfreeze" : "Freeze"}</span>
                      </button>

                      <select
                        value={u.tier}
                        onChange={(e) => void handleUserControl(u.id, "tier", e.target.value)}
                        className="h-7 px-2 rounded-lg bg-zinc-900 border border-white/15 text-[11px] text-zinc-200 cursor-pointer"
                      >
                        <option value="basic">basic</option>
                        <option value="standard">standard</option>
                        <option value="premium">premium</option>
                        <option value="pro">pro</option>
                      </select>

                      <select
                        value={u.kyc_status}
                        onChange={(e) => void handleUserControl(u.id, "kyc_status", e.target.value)}
                        className="h-7 px-2 rounded-lg bg-zinc-900 border border-white/15 text-[11px] text-zinc-200 cursor-pointer"
                      >
                        <option value="verified">verified</option>
                        <option value="pending">pending</option>
                        <option value="unverified">unverified</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "kyc" ? (
            <div className="space-y-2.5">
              {(queues?.kyc_documents || []).length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">No KYC documents in queue.</p>
              ) : (
                queues!.kyc_documents.map((k) => (
                  <div key={k.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs">
                    <div>
                      <p className="font-bold text-white">
                        {k.user_name} ({k.user_email}) · <span className="uppercase text-amber-300">{k.doc_type}</span>
                      </p>
                      <p className="font-mono text-zinc-400 mt-0.5">
                        ID: {k.doc_number_masked} · Legal Name: {k.full_legal_name} · Status: {k.status}
                      </p>
                    </div>
                    {k.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleReviewKyc(k.id, "verified")}
                          className="px-3 py-1.5 rounded-lg bg-[#00D632] text-black font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleReviewKyc(k.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : tab === "disputes" ? (
            <div className="space-y-2.5">
              {(queues?.disputes || []).length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">No user disputes logged.</p>
              ) : (
                queues!.disputes.map((d) => (
                  <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs">
                    <div>
                      <p className="font-bold text-white">
                        {d.txn_reference_id} ({formatINR(Number(d.txn_amount || 0))}) · {d.user_email}
                      </p>
                      <p className="text-zinc-300 mt-0.5">Reason: {d.reason}</p>
                      <p className="font-mono text-[10px] text-amber-300 uppercase mt-0.5">Status: {d.status}</p>
                    </div>
                    {(d.status === "open" || d.status === "under_review") && (
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => void handleResolveDispute(d.id, "under_review")}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 text-zinc-200 cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleResolveDispute(d.id, "refund")}
                          className="px-2.5 py-1.5 rounded-lg bg-[#00D632] text-black font-bold cursor-pointer"
                        >
                          Refund via Ledger
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleResolveDispute(d.id, "reject")}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : tab === "transactions" && overview ? (
            <div className="space-y-2">
              {overview.recent_transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl border border-white/10 bg-white/5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-white font-semibold">{tx.reference_id}</span>
                      <span className="text-zinc-400">{tx.user_email}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          tx.status === "reversed" ? "bg-rose-500/20 text-rose-300" : "bg-[#00D632]/15 text-[#00D632]"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {tx.type.toUpperCase()} {formatINR(tx.amount)} · {tx.counterparty_name || tx.category}
                    </p>
                  </div>

                  {tx.status === "completed" && !tx.reversal_of && tx.tx_kind !== "pocket_transfer" && tx.tx_kind !== "goal_transfer" && (
                    <button
                      type="button"
                      onClick={() => void handleReverseTransaction(tx.id, tx.reference_id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold cursor-pointer shrink-0"
                    >
                      <RotateCcw className="size-3" />
                      <span>Reverse</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : tab === "limits" && overview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <form onSubmit={handleUpdateLimits} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Edit KYC Tier Caps (`limits_config`)</h4>
                <select
                  value={editTier}
                  onChange={(e) => {
                    const t = e.target.value as UserTier;
                    setEditTier(t);
                    const found = overview.limits_config.find((l) => l.tier === t);
                    if (found) {
                      setPerTxnLim(String(found.per_txn_limit));
                      setDailyLim(String(found.daily_limit));
                      setMonthlyLim(String(found.monthly_limit));
                      setMaxBalLim(String(found.max_wallet_balance));
                    }
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                >
                  <option value="basic">basic</option>
                  <option value="standard">standard</option>
                  <option value="premium">premium</option>
                  <option value="pro">pro</option>
                </select>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-zinc-400">Per-Txn Limit</label>
                    <input type="number" value={perTxnLim} onChange={(e) => setPerTxnLim(e.target.value)} className="w-full h-9 px-3 mt-1 rounded-xl bg-zinc-900 border border-white/15 font-mono text-white" />
                  </div>
                  <div>
                    <label className="text-zinc-400">Daily Limit</label>
                    <input type="number" value={dailyLim} onChange={(e) => setDailyLim(e.target.value)} className="w-full h-9 px-3 mt-1 rounded-xl bg-zinc-900 border border-white/15 font-mono text-white" />
                  </div>
                  <div>
                    <label className="text-zinc-400">Monthly Limit</label>
                    <input type="number" value={monthlyLim} onChange={(e) => setMonthlyLim(e.target.value)} className="w-full h-9 px-3 mt-1 rounded-xl bg-zinc-900 border border-white/15 font-mono text-white" />
                  </div>
                  <div>
                    <label className="text-zinc-400">Max Balance</label>
                    <input type="number" value={maxBalLim} onChange={(e) => setMaxBalLim(e.target.value)} className="w-full h-9 px-3 mt-1 rounded-xl bg-zinc-900 border border-white/15 font-mono text-white" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold cursor-pointer">
                  Save Limits Config
                </button>
              </form>

              <div className="space-y-2">
                {overview.limits_config.map((lc) => (
                  <div key={lc.tier} className="p-3 rounded-2xl border border-white/10 bg-white/5 text-xs">
                    <p className="font-bold text-amber-300 uppercase">{lc.tier} tier</p>
                    <p className="font-mono text-[11px] text-zinc-300 mt-1">
                      Txn: {formatINR(lc.per_txn_limit)} · Daily: {formatINR(lc.daily_limit)} · Monthly: {formatINR(lc.monthly_limit)} · Max Bal: {formatINR(lc.max_wallet_balance)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "ops" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">PostgreSQL Background Queue (`pgmq.cash_jobs`) & `pg_cron`</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Queue length: <strong className="text-white font-mono">{queues?.queue_metrics?.queue_length ?? 0}</strong> · Total processed:{" "}
                    <strong className="text-[#00D632] font-mono">{queues?.queue_metrics?.total_messages ?? 0}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRunWorkerJobs()}
                  className="px-4 py-2 rounded-xl bg-[#00D632] text-black text-xs font-bold cursor-pointer shrink-0"
                >
                  Run Worker Sweep Now
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Edge Function (`cash-ops`) & RUM Web Vitals</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Client API Requests: <strong className="text-white font-mono">{clientTel.totalRequests}</strong> · p95:{" "}
                    <strong className="text-[#00D632] font-mono">{clientTel.p95Ms}ms</strong> · LCP:{" "}
                    <strong className="text-white font-mono">{vitals?.lcpMs ?? "-"}ms</strong>
                  </p>
                  {edgeHealth && (
                    <p className="text-[11px] font-mono text-sky-300 mt-1">
                      Edge Status: {edgeHealth.status} · Latency: {edgeHealth.latency_ms ?? "-"}ms · Trace: {edgeHealth.traceparent}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleEdgeHealthCheck()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer shrink-0"
                >
                  Ping Edge Health
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {(overview?.recent_audits || []).map((log) => (
                <div key={log.id} className="p-3 rounded-2xl border border-white/10 bg-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300">{log.action}</span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1">
                    Actor: {log.actor_email || "system"} {log.target_email ? `→ Target: ${log.target_email}` : ""}
                  </p>
                  {log.reason && <p className="text-[11px] text-zinc-400 italic mt-0.5">Reason: "{log.reason}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
