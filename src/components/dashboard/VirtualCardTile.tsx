"use client";

import { useState } from "react";
import { Eye, EyeOff, Wifi, Shield } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export function VirtualCardTile() {
  const { currentProfile, currentWallet } = useWallet();
  const [showDetails, setShowDetails] = useState(false);

  const fullName = currentProfile?.full_name || "Aarav Sharma";
  const isFrozen = currentWallet?.is_frozen ?? false;

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-2.5 sm:p-3 text-white select-none overflow-hidden rounded-2xl">
      {/* Background Glass Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
      <div className="absolute -right-8 -top-8 size-36 rounded-full bg-[#00D632]/10 blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-lg tracking-tight text-white">Cash</span>
          <span className="text-[10px] font-bold tracking-widest text-[#00D632] uppercase bg-[#00D632]/15 border border-[#00D632]/30 px-1.5 py-0.5 rounded">
            PLATINUM
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-zinc-400 rotate-90" />
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title={showDetails ? "Hide card details" : "Reveal card details"}
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#00D632]" />}
          </button>
        </div>
      </div>

      {/* EMV Chip & Contactless */}
      <div className="relative z-10 flex items-center gap-3 my-auto py-2">
        {/* Stylized Chip */}
        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center border border-amber-300/40">
          <div className="w-full h-full border border-amber-800/40 rounded flex flex-col justify-around px-0.5 py-1">
            <div className="h-0.5 bg-amber-900/40 w-full" />
            <div className="h-0.5 bg-amber-900/40 w-3/4 mx-auto" />
          </div>
        </div>

        {isFrozen && (
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" /> Card Frozen
          </span>
        )}
      </div>

      {/* Card Number & Expiry */}
      <div className="relative z-10 space-y-2">
        <p className="font-mono text-base md:text-lg font-bold tracking-widest text-zinc-100">
          {showDetails ? "4532 8910 2049 8291" : "•••• •••• •••• 8291"}
        </p>

        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest leading-none">Cardholder</p>
            <p className="font-semibold text-zinc-200 uppercase tracking-wider text-xs mt-0.5">{fullName}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest leading-none">Expires</p>
              <p className="font-mono text-zinc-200 text-xs mt-0.5">09/29</p>
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest leading-none">CVV</p>
              <p className="font-mono text-zinc-200 text-xs mt-0.5">{showDetails ? "482" : "•••"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Brand */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 mt-1">
        <span className="text-[9px] text-zinc-400 font-mono">Domestic & International</span>
        {/* RuPay Logo text representation */}
        <div className="flex items-center gap-1 font-extrabold italic text-sm">
          <span className="text-white">RuPay</span>
          <span className="text-[#00D632]">❯</span>
        </div>
      </div>
    </div>
  );
}
