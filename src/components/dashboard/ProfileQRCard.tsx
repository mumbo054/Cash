"use client";

import { useState } from "react";
import { ShieldCheck, QrCode, UserCheck, Copy, Check } from "lucide-react";
import CardFlip from "@/components/kokonutui/card-flip";
import { useWallet } from "@/context/WalletContext";

interface ProfileQRCardProps {
  className?: string;
  isModal?: boolean;
}

export function ProfileQRCard({ className, isModal = false }: ProfileQRCardProps) {
  const { currentProfile, currentWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const fullName = currentProfile?.full_name || "Aarav Sharma";
  const cashtag = currentProfile?.full_name
    ? currentProfile.full_name.toLowerCase().replace(/\s+/g, "")
    : "aarav";
  const upiId = `${cashtag}@cash`;
  const phone = currentProfile?.phone || "+91 98765 43210";
  const dailyLimit = currentWallet?.daily_limit ?? 100000;
  const isKycVerified = currentProfile?.kyc_status === "verified";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const frontFace = (
    <div className="flex h-full w-full flex-col justify-between p-5 text-zinc-100 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#00D632]/15 text-[#00D632] font-bold text-sm border border-[#00D632]/30 shadow-inner">
            {fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white tracking-tight leading-none">{fullName}</h3>
              <UserCheck className="w-3.5 h-3.5 text-[#00D632]" />
            </div>
            <p className="text-[11px] text-[#00D632] font-mono mt-0.5">₹{cashtag}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <ShieldCheck className="w-3 h-3" />
          {isKycVerified ? "KYC Verified" : "KYC Pending"}
        </span>
      </div>

      {/* Middle Details Grid */}
      <div className="grid grid-cols-2 gap-2.5 my-auto text-xs py-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">UPI ID / VPA</p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs text-white truncate max-w-[100px]">{upiId}</span>
            <button
              type="button"
              data-no-flip
              onClick={handleCopy}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copy UPI ID"
            >
              {copied ? <Check className="w-3 h-3 text-[#00D632]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Registered Phone</p>
          <p className="font-mono text-xs text-white mt-1">{phone}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Daily UPI Limit</p>
          <p className="font-mono text-xs text-[#00D632] font-semibold mt-1">₹{dailyLimit.toLocaleString("en-IN")}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Wallet Status</p>
          <p className="font-mono text-xs text-white mt-1 flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${currentWallet?.is_frozen ? "bg-amber-400" : "bg-[#00D632]"}`} />
            {currentWallet?.is_frozen ? "Frozen" : "Active"}
          </p>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-zinc-400">
        <span className="flex items-center gap-1">
          <QrCode className="w-3 h-3 text-[#00D632]" />
          Flip for UPI QR Code
        </span>
        <span className="text-zinc-500 font-mono">Tap or drag ↺</span>
      </div>
    </div>
  );

  const backFace = (
    <div className="flex h-full w-full flex-col items-center justify-between p-5 text-zinc-100 select-none">
      <div className="w-full flex items-center justify-between text-xs">
        <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-[#00D632]" />
          Receive via UPI QR
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">₹{cashtag}</span>
      </div>

      {/* Simulated Stylized QR Code */}
      <div className="my-auto flex flex-col items-center">
        <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-[#00D632]/40 relative group">
          <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
            {/* Corner squares */}
            <rect x="5" y="5" width="28" height="28" rx="6" fill="#000" />
            <rect x="11" y="11" width="16" height="16" rx="3" fill="#fff" />
            <rect x="15" y="15" width="8" height="8" rx="1.5" fill="#00D632" />

            <rect x="67" y="5" width="28" height="28" rx="6" fill="#000" />
            <rect x="73" y="11" width="16" height="16" rx="3" fill="#fff" />
            <rect x="77" y="15" width="8" height="8" rx="1.5" fill="#00D632" />

            <rect x="5" y="67" width="28" height="28" rx="6" fill="#000" />
            <rect x="11" y="73" width="16" height="16" rx="3" fill="#fff" />
            <rect x="15" y="77" width="8" height="8" rx="1.5" fill="#00D632" />

            {/* Pattern Dots */}
            <rect x="40" y="8" width="8" height="8" rx="2" fill="#000" />
            <rect x="52" y="8" width="6" height="6" rx="1.5" fill="#000" />
            <rect x="40" y="22" width="6" height="6" rx="1.5" fill="#000" />
            <rect x="50" y="20" width="8" height="8" rx="2" fill="#00D632" />

            <rect x="8" y="42" width="8" height="6" rx="1.5" fill="#000" />
            <rect x="22" y="40" width="6" height="8" rx="1.5" fill="#000" />
            <rect x="40" y="40" width="20" height="20" rx="4" fill="#00D632" />
            <rect x="45" y="45" width="10" height="10" rx="2" fill="#fff" />

            <rect x="72" y="40" width="8" height="6" rx="1.5" fill="#000" />
            <rect x="84" y="42" width="8" height="8" rx="2" fill="#000" />
            <rect x="70" y="52" width="6" height="6" rx="1.5" fill="#000" />

            <rect x="40" y="68" width="8" height="8" rx="2" fill="#000" />
            <rect x="52" y="72" width="6" height="6" rx="1.5" fill="#000" />
            <rect x="42" y="82" width="16" height="8" rx="2" fill="#000" />
            <rect x="70" y="72" width="8" height="8" rx="2" fill="#000" />
            <rect x="82" y="82" width="10" height="10" rx="2" fill="#00D632" />
          </svg>
        </div>
        <p className="mt-2 text-[10px] text-zinc-400 font-mono text-center">{upiId}</p>
      </div>

      <div className="w-full flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-zinc-400">
        <span>GPay · PhonePe · Paytm · BHIM</span>
        <span className="text-zinc-500 font-mono">Flip ↺</span>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <CardFlip
        front={frontFace}
        back={backFace}
        label={`${fullName} Profile & QR Card`}
        faceClassName="rounded-3xl border border-white/15 bg-zinc-950/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)]"
        className={isModal ? "w-80 h-96" : "w-full h-full min-h-[220px]"}
      />
    </div>
  );
}
