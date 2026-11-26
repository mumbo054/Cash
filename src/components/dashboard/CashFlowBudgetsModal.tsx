"use client";

import * as React from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  PieChart,
  Sparkles,
  Trash2,
  AlertTriangle,
  Repeat,
  SlidersHorizontal,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { BudgetCategory } from "@/types/database.types";

interface CashFlowBudgetsModalProps {
  open: boolean;
  onClose: () => void;
}

const BUDGET_CATEGORIES: Array<{ value: BudgetCategory; label: string }> = [
  { value: "food", label: "Food & Dining" },
  { value: "groceries", label: "Groceries & Mart" },
  { value: "utilities", label: "Bills & Utilities" },
  { value: "shopping", label: "Shopping" },
  { value: "travel", label: "Travel & Commute" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health & Pharmacy" },
  { value: "education", label: "Education" },
  { value: "investments", label: "Investments" },
  { value: "other", label: "Other" },
];

export function CashFlowBudgetsModal({ open, onClose }: CashFlowBudgetsModalProps) {
  const {
    currentWallet,
    transactions,
    budgets,
    pockets,
    savingsGoals,
    scheduledPayments,
    upsertBudget,
    deleteBudget,
    updatePocketAutomation,
    updateGoalAutomation,
  } = useWallet();

  const [tab, setTab] = React.useState<"cashflow" | "budgets" | "automation">("cashflow");
  const [category, setCategory] = React.useState<BudgetCategory>("food");
  const [amountLimit, setAmountLimit] = React.useState("5000");
  const [alertPct, setAlertPct] = React.useState("80");
  const [rolloverEnabled, setRolloverEnabled] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const analytics = React.useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let inflow = 0;
    let outflow = 0;
    const catSpend = new Map<string, number>();
    const merchantCounts = new Map<string, { name: string; count: number; total: number }>();

    for (const tx of transactions) {
      if (tx.status === "reversed" || tx.status === "failed") continue;
      if (tx.tx_kind === "pocket_transfer" || tx.tx_kind === "goal_transfer") continue;
      const dt = new Date(tx.created_at);
      if (dt < startOfMonth) continue;
      const amt = Number(tx.amount || 0);
      if (tx.type === "credit" || tx.type === "transfer_in") {
        inflow += amt;
      } else {
        outflow += amt;
        const c = (tx.category === "investment" ? "investments" : tx.category) || "other";
        catSpend.set(c, (catSpend.get(c) || 0) + amt);
        const key = (tx.counterparty_name || tx.counterparty_upi_id || "Merchant").trim();
        const cur = merchantCounts.get(key.toLowerCase()) || { name: key, count: 0, total: 0 };
        cur.count += 1;
        cur.total += amt;
        merchantCounts.set(key.toLowerCase(), cur);
      }
    }

    const recurringDetected = Array.from(merchantCounts.values())
      .filter((m) => m.count >= 2)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const activeAutopayMonthly = scheduledPayments
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const mult = s.frequency === "daily" ? 30 : s.frequency === "weekly" ? 4 : 1;
        return sum + Number(s.amount || 0) * mult;
      }, 0);

    const projectedBalance30d = Number(currentWallet?.balance || 0) + inflow - outflow - activeAutopayMonthly;
    return { inflow, outflow, catSpend, recurringDetected, activeAutopayMonthly, projectedBalance30d };
  }, [transactions, scheduledPayments, currentWallet?.balance]);

  if (!open) return null;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const limitNum = parseFloat(amountLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setFeedback({ type: "error", text: "Enter a positive monthly budget amount." });
      return;
    }
    setSaving(true);
    const res = await upsertBudget({
      category,
      amountLimit: limitNum,
      period: "monthly",
      alertThresholdPct: Number(alertPct) || 80,
      rolloverEnabled,
    });
    setSaving(false);
    setFeedback(
      res.success
        ? { type: "success", text: `Saved ${category} budget (${formatINR(limitNum)}/mo). Alerts armed at ${alertPct}%.` }
        : { type: "error", text: res.error || "Could not save budget." }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0" onClick={onClose} />

      <div className="relative z-50 flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#00D632]/15 border border-[#00D632]/30 text-[#00D632]">
              <PieChart className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Cash-Flow Intelligence & Smart Budgets
              </h3>
              <p className="text-xs text-zinc-400">
                Real-time ledger inflow/outflow, recurring detection, budget threshold alerts & auto-save rules
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cash-flow modal"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/15 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-black/40 flex-wrap">
          {(
            [
              { id: "cashflow", label: "Cash Flow & 30D Forecast", icon: TrendingUp },
              { id: "budgets", label: `Budgets (${budgets.length})`, icon: AlertTriangle },
              { id: "automation", label: "Auto-Save & Round-Ups", icon: SlidersHorizontal },
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
          {tab === "cashflow" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>This Month Inflow</span>
                    <TrendingUp className="size-4 text-[#00D632]" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-[#00D632] mt-1">+{formatINR(analytics.inflow)}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>This Month Outflow</span>
                    <TrendingDown className="size-4 text-rose-400" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-white mt-1">-{formatINR(analytics.outflow)}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>30-Day Projected Balance</span>
                    <Sparkles className="size-4 text-sky-400" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-sky-300 mt-1">
                    {formatINR(analytics.projectedBalance30d)}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Includes {formatINR(analytics.activeAutopayMonthly)} active monthly autopay obligations
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
                  <Repeat className="size-3.5 text-[#00D632]" />
                  <span>Recurring Counterparties & Subscriptions Detected</span>
                </h4>
                {analytics.recurringDetected.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No repeat merchants detected in the current month yet. Repeated debits appear here automatically.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.recurringDetected.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <div>
                          <span className="font-semibold text-white">{item.name}</span>
                          <span className="ml-2 text-[10px] font-mono text-zinc-400">{item.count} charges this month</span>
                        </div>
                        <span className="font-mono font-bold text-amber-300">{formatINR(item.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : tab === "budgets" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <form onSubmit={handleSaveBudget} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Create or Update Category Budget</h4>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Spending Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  >
                    {BUDGET_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Monthly Limit (₹)</label>
                    <input
                      type="number"
                      min="100"
                      required
                      value={amountLimit}
                      onChange={(e) => setAmountLimit(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Alert Threshold</label>
                    <select
                      value={alertPct}
                      onChange={(e) => setAlertPct(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                    >
                      <option value="70">70% warning</option>
                      <option value="80">80% warning</option>
                      <option value="90">90% warning</option>
                      <option value="100">100% cap only</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={rolloverEnabled}
                    onChange={(e) => setRolloverEnabled(e.target.checked)}
                    className="accent-[#00D632]"
                  />
                  <span>Enable unused monthly budget rollover</span>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving Budget..." : "Save Budget & Arm Alert"}
                </button>
              </form>

              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-white">Active Category Budgets</h4>
                {budgets.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-4 rounded-2xl border border-white/10 bg-white/5">
                    No active budgets configured yet. Add one on the left to trigger automated server notifications at your alert threshold.
                  </p>
                ) : (
                  budgets.map((b) => {
                    const liveSpent = Math.max(Number(b.spent_amount || 0), analytics.catSpend.get(b.category) || 0);
                    const cap = Number(b.amount_limit) + Number(b.rollover_amount || 0);
                    const pct = cap > 0 ? Math.min(100, Math.round((liveSpent / cap) * 100)) : 0;
                    const over = liveSpent >= cap;
                    const near = !over && pct >= b.alert_threshold_pct;
                    return (
                      <div key={b.id} className="p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white capitalize">{b.category}</span>
                            {b.rollover_enabled && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300">ROLLOVER</span>
                            )}
                            {over ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">EXCEEDED</span>
                            ) : near ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">ALERT ≥{b.alert_threshold_pct}%</span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => void deleteBudget(b.id)}
                            aria-label={`Archive ${b.category} budget`}
                            className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-300">
                          <span>{formatINR(liveSpent)} spent</span>
                          <span>of {formatINR(cap)}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${over ? "bg-rose-500" : near ? "bg-amber-400" : "bg-[#00D632]"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Pocket Auto-Save on Wallet Top-Ups</h4>
                <p className="text-xs text-zinc-400">
                  Automatically transfer a percentage of every wallet top-up into a chosen Smart Pocket on the double-entry ledger.
                </p>
                {pockets.length === 0 ? (
                  <p className="text-xs text-zinc-500">Create a Smart Pocket first to configure auto-save.</p>
                ) : (
                  pockets.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                      <span className="font-semibold text-white">{p.name}</span>
                      <select
                        value={String(Number(p.auto_save_pct || 0))}
                        onChange={(e) => void updatePocketAutomation(p.id, Number(e.target.value))}
                        className="h-8 px-2 rounded-lg bg-zinc-900 border border-white/15 text-xs font-mono text-[#00D632]"
                      >
                        <option value="0">Off (0%)</option>
                        <option value="5">5% of top-ups</option>
                        <option value="10">10% of top-ups</option>
                        <option value="20">20% of top-ups</option>
                      </select>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Savings Goal Round-Up Flag</h4>
                <p className="text-xs text-zinc-400">
                  Mark active Savings Vault goals for automatic spare-change round-ups.
                </p>
                {savingsGoals.length === 0 ? (
                  <p className="text-xs text-zinc-500">Create a Savings Goal first to enable round-ups.</p>
                ) : (
                  savingsGoals.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-white">{g.title}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(g.round_up_enabled)}
                        onChange={(e) => void updateGoalAutomation(g.id, e.target.checked)}
                        className="accent-[#00D632] size-4"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
