"use client";

import * as React from "react";
import {
  TrendingDown,
  TrendingUp,
  Coffee,
  ShoppingBag,
  Zap,
  Car,
  Film,
  HeartPulse,
  Briefcase,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface DataPoint {
  date: string;
  dayLabel: string;
  amount: number;
  category: string;
}

const CATEGORY_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  food: { label: "Food", color: "bg-amber-400", icon: <Coffee className="size-3 text-amber-400" /> },
  groceries: { label: "Groceries", color: "bg-lime-400", icon: <ShoppingBag className="size-3 text-lime-400" /> },
  shopping: { label: "Shopping", color: "bg-purple-400", icon: <ShoppingBag className="size-3 text-purple-400" /> },
  utilities: { label: "Utilities", color: "bg-[#00D632]", icon: <Zap className="size-3 text-[#00D632]" /> },
  travel: { label: "Travel", color: "bg-sky-400", icon: <Car className="size-3 text-sky-400" /> },
  entertainment: { label: "Media", color: "bg-rose-400", icon: <Film className="size-3 text-rose-400" /> },
  health: { label: "Health", color: "bg-pink-400", icon: <HeartPulse className="size-3 text-pink-400" /> },
  peer_transfer: { label: "Transfers", color: "bg-emerald-400", icon: <ArrowUpRight className="size-3 text-emerald-400" /> },
  other: { label: "Other", color: "bg-zinc-400", icon: <Briefcase className="size-3 text-zinc-400" /> },
};

interface ExpenditureMetricTileProps {
  onOpenCashFlow?: () => void;
}

export const ExpenditureMetricTile = React.memo(function ExpenditureMetricTile({
  onOpenCashFlow,
}: ExpenditureMetricTileProps) {
  const { transactions, budgets, isLoading } = useWallet();
  const [period, setPeriod] = React.useState<7 | 30 | 90>(30);
  const [hoveredPoint, setHoveredPoint] = React.useState<DataPoint | null>(null);

  const { points, totalSpend, totalInflow, avgDaily, peakDay, categoryBreakdown } = React.useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (period - 1));
    cutoff.setHours(0, 0, 0, 0);

    const dayMap = new Map<string, { amount: number; topCat: string; topAmt: number }>();
    const catTotals = new Map<string, number>();
    let spend = 0;
    let inflow = 0;

    for (const tx of transactions) {
      if (tx.status === "reversed" || tx.status === "failed") continue;
      const dt = new Date(tx.created_at);
      if (dt < cutoff) continue;
      const amt = Number(tx.amount || 0);

      if (tx.type === "credit" || tx.type === "transfer_in") {
        if (tx.tx_kind !== "pocket_transfer" && tx.tx_kind !== "goal_transfer") {
          inflow += amt;
        }
        continue;
      }

      if (tx.type === "debit" || tx.type === "transfer_out") {
        if (tx.tx_kind === "pocket_transfer" || tx.tx_kind === "goal_transfer") continue;
        spend += amt;
        const catKey = (tx.category || "other").toLowerCase();
        catTotals.set(catKey, (catTotals.get(catKey) || 0) + amt);

        const isoDay = dt.toISOString().slice(0, 10);
        const cur = dayMap.get(isoDay) || { amount: 0, topCat: catKey, topAmt: 0 };
        cur.amount += amt;
        if (amt >= cur.topAmt) {
          cur.topAmt = amt;
          cur.topCat = catKey;
        }
        dayMap.set(isoDay, cur);
      }
    }

    const pts: DataPoint[] = [];
    let peak: DataPoint = { date: "-", dayLabel: "-", amount: 0, category: "none" };
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDay = d.toISOString().slice(0, 10);
      const bucket = dayMap.get(isoDay);
      const amt = Math.round(bucket?.amount || 0);
      const pt: DataPoint = {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        dayLabel: d.toLocaleDateString("en-IN", { weekday: "short" }),
        amount: amt,
        category: CATEGORY_META[bucket?.topCat || "other"]?.label || bucket?.topCat || "None",
      };
      pts.push(pt);
      if (pt.amount >= peak.amount) {
        peak = pt;
      }
    }

    const sortedCats = Array.from(catTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([catKey, amt]) => {
        const meta = CATEGORY_META[catKey] || {
          label: catKey.replace("_", " "),
          color: "bg-zinc-400",
          icon: <Briefcase className="size-3 text-zinc-400" />,
        };
        const pct = spend > 0 ? Math.max(1, Math.round((amt / spend) * 100)) : 0;
        return { key: catKey, ...meta, amount: amt, pct };
      });

    return {
      points: pts,
      totalSpend: spend,
      totalInflow: inflow,
      avgDaily: Math.round(spend / period),
      peakDay: peak,
      categoryBreakdown: sortedCats,
    };
  }, [transactions, period]);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-full w-full flex-col justify-between p-2 space-y-3" aria-busy="true">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  const netFlow = totalInflow - totalSpend;
  const svgWidth = 600;
  const svgHeight = 65;
  const maxVal = Math.max(...points.map((p) => p.amount), 100);

  const getX = (index: number) => (points.length > 1 ? (index / (points.length - 1)) * (svgWidth - 20) + 10 : svgWidth / 2);
  const getY = (amount: number) => svgHeight - (amount / maxVal) * (svgHeight - 20) - 10;

  const linePath = points.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.amount);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");
  const areaPath = points.length > 0 ? `${linePath} L ${getX(points.length - 1)} ${svgHeight} L ${getX(0)} ${svgHeight} Z` : "";

  return (
    <div className="flex h-full w-full flex-col justify-between p-2 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Live Outflow ({period}D)
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                netFlow >= 0
                  ? "text-[#00D632] bg-[#00D632]/10 border-[#00D632]/25"
                  : "text-amber-300 bg-amber-500/10 border-amber-500/25"
              }`}
            >
              {netFlow >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              Net {netFlow >= 0 ? "+" : ""}
              {formatINR(netFlow)}
            </span>
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            {formatINR(totalSpend)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCashFlow && (
            <button
              type="button"
              onClick={onOpenCashFlow}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-[#00D632] transition-colors cursor-pointer"
            >
              <span>Budgets ({budgets.length})</span>
              <ArrowUpRight className="size-3" />
            </button>
          )}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-0.5 rounded-xl">
            {([7, 30, 90] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setPeriod(days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  period === days ? "bg-[#00D632] text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative py-1 my-auto">
        <div className="min-h-[22px] flex items-center justify-between text-[11px] font-mono px-1">
          {hoveredPoint ? (
            <div className="flex items-center gap-2 text-white">
              <span className="text-[#00D632] font-bold">{formatINR(hoveredPoint.amount)}</span>
              <span className="text-zinc-400">on {hoveredPoint.date}</span>
              <span className="text-[10px] text-zinc-500">({hoveredPoint.category})</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-[#00D632]" />
                Avg: <strong className="text-white font-mono">{formatINR(avgDaily)}/day</strong>
              </span>
              <span>
                Inflow: <strong className="text-[#00D632] font-mono">+{formatINR(totalInflow)}</strong> · Peak:{" "}
                <strong className="text-white font-mono">{formatINR(peakDay.amount)}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="relative w-full h-[60px] overflow-hidden mt-0.5">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D632" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00D632" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1={svgHeight - 1} x2={svgWidth} y2={svgHeight - 1} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            {areaPath && <path d={areaPath} fill="url(#spendGradient)" />}
            {linePath && (
              <path d={linePath} fill="none" stroke="#00D632" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {points.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.amount);
              const isHovered = hoveredPoint?.date === pt.date;
              return (
                <g key={idx}>
                  {isHovered && (
                    <>
                      <line x1={cx} y1="0" x2={cx} y2={svgHeight} stroke="rgba(0, 214, 50, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx={cx} cy={cy} r="5" fill="#00D632" stroke="#fff" strokeWidth="2" />
                    </>
                  )}
                  <rect
                    x={cx - 10}
                    y="0"
                    width="20"
                    height={svgHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="pt-1.5 border-t border-white/10 shrink-0">
        {categoryBreakdown.length === 0 ? (
          <div className="flex items-center justify-between text-[11px] text-zinc-500 py-1">
            <span>No debits in this period yet — send a UPI payment to populate category spend analytics.</span>
            {onOpenCashFlow && (
              <button type="button" onClick={onOpenCashFlow} className="text-[#00D632] font-semibold hover:underline cursor-pointer shrink-0 ml-2">
                Set Budgets →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {categoryBreakdown.map((c) => (
              <div key={c.key} className="p-1 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-0.5">
                  <span className="flex items-center gap-1 font-medium text-zinc-300 truncate">
                    {c.icon} {c.label}
                  </span>
                  <span className="font-mono text-white font-bold">{c.pct}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
                <p className="font-mono text-[9px] text-zinc-400 mt-0.5 truncate">{formatINR(c.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
