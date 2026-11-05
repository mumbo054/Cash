"use client";

import * as React from "react";
import {
  TrendingDown,
  Coffee,
  ShoppingBag,
  Zap,
  Car,
  Film,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/utils/formatters";

interface DataPoint {
  date: string;
  dayLabel: string;
  amount: number;
  category: string;
}

const CATEGORY_STATS = [
  { label: "Food & Dining", icon: <Coffee className="size-3 text-amber-400" />, amount: 14200, pct: 37, color: "bg-amber-400" },
  { label: "Shopping & Tech", icon: <ShoppingBag className="size-3 text-purple-400" />, amount: 9950, pct: 26, color: "bg-purple-400" },
  { label: "Utilities & Bills", icon: <Zap className="size-3 text-[#00D632]" />, amount: 7800, pct: 20, color: "bg-[#00D632]" },
  { label: "Travel & Fuel", icon: <Car className="size-3 text-sky-400" />, amount: 4200, pct: 11, color: "bg-sky-400" },
  { label: "Entertainment", icon: <Film className="size-3 text-rose-400" />, amount: 2300, pct: 6, color: "bg-rose-400" },
];

export function ExpenditureMetricTile() {
  const [period, setPeriod] = React.useState<7 | 30 | 90>(30);
  const [hoveredPoint, setHoveredPoint] = React.useState<DataPoint | null>(null);

  // Generate realistic data points based on selected period
  const { points, totalSpend, avgDaily, peakDay } = React.useMemo(() => {
    const pts: DataPoint[] = [];
    const count = period;
    const now = new Date();
    let sum = 0;
    let peak: DataPoint = { date: "", dayLabel: "", amount: 0, category: "" };

    const categories = ["Food & Dining", "Shopping & Tech", "Utilities & Bills", "Travel & Fuel", "Entertainment"];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      // High spend peaks on weekends or mid-month bills
      const base = isWeekend ? 2100 : 950;
      const variation = Math.sin(i * 0.7) * 450 + (i % 7 === 0 ? 1200 : 0);
      const amt = Math.max(250, Math.round(base + variation));

      const cat = categories[i % categories.length];
      sum += amt;

      const pt = {
        date: dateStr,
        dayLabel: dayName,
        amount: amt,
        category: cat,
      };

      pts.push(pt);
      if (amt > peak.amount) {
        peak = pt;
      }
    }

    return {
      points: pts,
      totalSpend: sum,
      avgDaily: Math.round(sum / count),
      peakDay: peak,
    };
  }, [period]);

  // Chart SVG dimensions
  const svgWidth = 600;
  const svgHeight = 65;
  const maxVal = Math.max(...points.map((p) => p.amount), 3500);

  const getX = (index: number) => {
    return (index / (points.length - 1)) * (svgWidth - 20) + 10;
  };

  const getY = (amount: number) => {
    return svgHeight - (amount / maxVal) * (svgHeight - 20) - 10;
  };

  // Build SVG Path string
  const linePath = points.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.amount);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${svgHeight} L ${getX(0)} ${svgHeight} Z`;

  return (
    <div className="flex h-full w-full flex-col justify-between p-2 select-none overflow-hidden">
      {/* Top Header: Total & Period Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Total Expenditure
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-[#00D632] font-semibold bg-[#00D632]/10 border border-[#00D632]/25 px-1.5 py-0.5 rounded-full">
                <TrendingDown className="size-3" />
                -8.4% vs last period
              </span>
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              {formatINR(totalSpend)}
            </p>
          </div>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-0.5 rounded-xl">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriod(days as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                period === days
                  ? "bg-[#00D632] text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Interactive Sparkline Area Chart */}
      <div className="relative py-1 my-auto">
        {/* Hover inspection pill */}
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
                Daily Average: <strong className="text-white font-mono">{formatINR(avgDaily)}/day</strong>
              </span>
              <span>
                Peak: <strong className="text-white font-mono">{formatINR(peakDay.amount)}</strong> ({peakDay.date})
              </span>
            </div>
          )}
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full h-[60px] overflow-hidden mt-0.5">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D632" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00D632" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Line */}
            <line
              x1="0"
              y1={svgHeight - 1}
              x2={svgWidth}
              y2={svgHeight - 1}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4 4"
            />

            {/* Area Fill */}
            <path d={areaPath} fill="url(#spendGradient)" />

            {/* Glowing Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#00D632"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover Circles & Touch Targets */}
            {points.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.amount);
              const isHovered = hoveredPoint?.date === pt.date;

              return (
                <g key={idx}>
                  {isHovered && (
                    <>
                      <line
                        x1={cx}
                        y1="0"
                        x2={cx}
                        y2={svgHeight}
                        stroke="rgba(0, 214, 50, 0.4)"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle cx={cx} cy={cy} r="5" fill="#00D632" stroke="#fff" strokeWidth="2" />
                    </>
                  )}
                  {/* Invisible wide hover target */}
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

      {/* Bottom: Category Breakdown Progress Bars */}
      <div className="pt-1.5 border-t border-white/10 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {CATEGORY_STATS.map((c) => (
            <div key={c.label} className="p-1 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-0.5">
                <span className="flex items-center gap-1 font-medium text-zinc-300 truncate">
                  {c.icon} {c.label.split(" ")[0]}
                </span>
                <span className="font-mono text-white font-bold">{c.pct}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.color}`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
              <p className="font-mono text-[9px] text-zinc-400 mt-0.5 truncate">
                {formatINR(Math.round((totalSpend * c.pct) / 100))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
