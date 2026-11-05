"use client";

import { useState } from "react";
import { FolderHeart, Target, ChevronRight, Plus } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";

interface PocketsGoalsTileProps {
  onOpenPockets?: (mode?: "view" | "create") => void;
  onOpenGoals?: (mode?: "view" | "create") => void;
}

export function PocketsGoalsTile({ onOpenPockets, onOpenGoals }: PocketsGoalsTileProps) {
  const { pockets, savingsGoals, allocateToPocket, contributeToGoal } = useWallet();
  const [activeTab, setActiveTab] = useState<"pockets" | "goals">("pockets");

  const handleQuickAddPocket = async (id: string) => {
    await allocateToPocket(id, 500);
  };

  const handleQuickAddGoal = async (id: string) => {
    await contributeToGoal(id, 1000);
  };

  const handleManageClick = () => {
    if (activeTab === "pockets") {
      onOpenPockets?.("view");
    } else {
      onOpenGoals?.("view");
    }
  };

  const handleCreateClick = () => {
    if (activeTab === "pockets") {
      onOpenPockets?.("create");
    } else {
      onOpenGoals?.("create");
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between p-2 select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("pockets")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "pockets"
                ? "bg-[#00D632] text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Pockets ({pockets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("goals")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "goals"
                ? "bg-[#00D632] text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Goals ({savingsGoals.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-[#00D632] text-zinc-300 hover:text-black text-[10px] font-semibold transition-all cursor-pointer"
            title={activeTab === "pockets" ? "Create New Pocket" : "Create New Goal"}
          >
            <Plus className="size-3 stroke-[2.5]" />
            <span>New</span>
          </button>

          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            Vault 3.2% p.a.
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="my-auto py-2 space-y-2 overflow-y-auto max-h-[160px] scrollbar-none">
        {activeTab === "pockets" ? (
          pockets.length === 0 ? (
            <div
              onClick={() => onOpenPockets?.("create")}
              className="py-6 text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              No pockets created yet. Tap here to create your first pocket.
            </div>
          ) : (
            pockets.map((p) => {
              const bal = Number(p.balance || 0);
              const target = Number(p.target_amount || 10000);
              const pct = Math.min(100, Math.round((bal / target) * 100));

              return (
                <div
                  key={p.id}
                  onClick={() => onOpenPockets?.("view")}
                  className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <FolderHeart className="w-3.5 h-3.5 text-[#00D632]" />
                      <span className="text-xs font-semibold text-white group-hover:text-[#00D632] transition-colors">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{formatINR(bal)}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAddPocket(p.id);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#00D632]/15 text-[#00D632] hover:bg-[#00D632]/25 font-semibold transition-colors cursor-pointer"
                        title="Add ₹500 from main balance"
                      >
                        +₹500
                      </button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#00D632] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )
        ) : savingsGoals.length === 0 ? (
          <div
            onClick={() => onOpenGoals?.("create")}
            className="py-6 text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            No savings goals set yet. Tap here to start a savings vault.
          </div>
        ) : (
          savingsGoals.map((g) => {
            const current = Number(g.current_amount || 0);
            const target = Number(g.target_amount || 50000);
            const pct = Math.min(100, Math.round((current / target) * 100));

            return (
              <div
                key={g.id}
                onClick={() => onOpenGoals?.("view")}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight group-hover:text-amber-400 transition-colors">
                        {g.title}
                      </p>
                      <p className="text-[10px] text-zinc-400">{pct}% completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-white">{formatINR(current)}</p>
                      <p className="font-mono text-[9px] text-zinc-500">of {formatINR(target)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAddGoal(g.id);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 font-semibold transition-colors cursor-pointer"
                      title="Add ₹1,000 from main balance"
                    >
                      +₹1k
                    </button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with Manage Button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-zinc-400">
        <span>Protected by DICGC ₹5 Lakh Insurance</span>
        <button
          type="button"
          onClick={handleManageClick}
          className="text-white hover:text-[#00D632] flex items-center gap-0.5 font-semibold transition-colors cursor-pointer"
        >
          <span>Manage</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
