"use client";

import * as React from "react";
import {
  X,
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Smartphone,
  FileBadge,
  Download,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { supabase } from "@/lib/supabase";
import { formatINR } from "@/utils/formatters";
import { LedgerEntryRecord } from "@/types/database.types";

interface SecurityPinModalProps {
  open: boolean;
  onClose: () => void;
}

export function SecurityPinModal({ open, onClose }: SecurityPinModalProps) {
  const {
    currentProfile,
    securityStatus,
    kycDocuments,
    disputes,
    deviceSessions,
    setTransactionPin,
    fetchLedgerEntries,
    submitKycDocument,
    revokeDeviceSessions,
    exportAccountData,
    requestAccountClosure,
  } = useWallet();

  const [tab, setTab] = React.useState<"pin" | "mfa" | "kyc" | "devices" | "ledger">("pin");
  const [currentPin, setCurrentPin] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");
  const [threshold, setThreshold] = React.useState<string>("2000");
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [ledgerEntries, setLedgerEntries] = React.useState<LedgerEntryRecord[]>([]);
  const [loadingLedger, setLoadingLedger] = React.useState(false);

  // MFA State
  const [mfaFactors, setMfaFactors] = React.useState<Array<{ id: string; status: string; friendly_name?: string }>>([]);
  const [enrollQr, setEnrollQr] = React.useState<{ factorId: string; qrSvg: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = React.useState("");

  // KYC State
  const [docType, setDocType] = React.useState<"pan" | "aadhaar_masked" | "passport" | "driving_license">("pan");
  const [docNumber, setDocNumber] = React.useState("");
  const [legalName, setLegalName] = React.useState(currentProfile?.full_name || "");

  // Closure State
  const [closureReason, setClosureReason] = React.useState("");

  const loadMfaFactors = React.useCallback(async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setMfaFactors((data?.totp || []) as Array<{ id: string; status: string; friendly_name?: string }>);
    } catch {
      setMfaFactors([]);
    }
  }, []);

  React.useEffect(() => {
    if (open && securityStatus) {
      setThreshold(String(securityStatus.pin_threshold ?? 2000));
      setMessage(null);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setLegalName(currentProfile?.full_name || "");
    }
  }, [open, securityStatus, currentProfile?.full_name]);

  React.useEffect(() => {
    if (open && tab === "ledger") {
      setLoadingLedger(true);
      fetchLedgerEntries(50)
        .then(setLedgerEntries)
        .finally(() => setLoadingLedger(false));
    }
    if (open && tab === "mfa") {
      void loadMfaFactors();
    }
  }, [open, tab, fetchLedgerEntries, loadMfaFactors]);

  if (!open) return null;

  const hasPin = securityStatus?.has_pin ?? false;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!/^\d{4}(\d{2})?$/.test(newPin)) {
      setMessage({ type: "error", text: "Transaction PIN must be exactly 4 or 6 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      setMessage({ type: "error", text: "New PIN and confirmation do not match." });
      return;
    }

    setIsSaving(true);
    const res = await setTransactionPin({
      newPin,
      currentPin: hasPin ? currentPin : undefined,
      threshold: Number(threshold) || 0,
    });
    setIsSaving(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: hasPin ? "Transaction PIN updated & logged." : "Transaction PIN enabled & hashed server-side.",
      });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save Transaction PIN." });
    }
  };

  const handleStartMfaEnroll = async () => {
    setMessage(null);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Cash Authenticator (${currentProfile?.email || "user"})`,
    });
    if (error || !data) {
      setMessage({ type: "error", text: error?.message || "Could not start MFA enrollment." });
      return;
    }
    setEnrollQr({
      factorId: data.id,
      qrSvg: data.totp.qr_code,
      secret: data.totp.secret,
    });
  };

  const handleVerifyMfaEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollQr) return;
    setMessage(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollQr.factorId,
      code: mfaCode.trim(),
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setEnrollQr(null);
    setMfaCode("");
    setMessage({ type: "success", text: "TOTP 2FA Factor verified & activated!" });
    await loadMfaFactors();
  };

  const handleRemoveFactor = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "MFA factor removed." });
    await loadMfaFactors();
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await submitKycDocument({
      docType,
      docNumberMasked: docNumber,
      fullLegalName: legalName,
    });
    if (res.success) {
      setDocNumber("");
      setMessage({ type: "success", text: "KYC document submitted and queued for Admin Review." });
    } else {
      setMessage({ type: "error", text: res.error || "KYC submission failed." });
    }
  };

  const handleExportData = async () => {
    setMessage(null);
    const res = await exportAccountData();
    if (!res.success || !res.data) {
      setMessage({ type: "error", text: res.error || "Data export failed." });
      return;
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cash_account_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ type: "success", text: "Account data JSON downloaded and recorded in audit log." });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in-0" onClick={onClose} />

      <div className="relative z-50 flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#00D632]/15 border border-[#00D632]/30 text-[#00D632]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Security, KYC, MFA & Double-Entry Ledger
              </h3>
              <p className="text-xs text-zinc-400">
                Tier: <span className="text-[#00D632] uppercase font-mono">{currentProfile?.tier || "standard"}</span> · KYC:{" "}
                <span className="text-zinc-200 uppercase font-mono">{currentProfile?.kyc_status || "verified"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close security modal"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/15 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/10 bg-black/40 flex-wrap">
          {(
            [
              { id: "pin", label: "Transaction PIN", icon: KeyRound },
              { id: "mfa", label: "2FA / TOTP MFA", icon: Lock },
              { id: "kyc", label: "KYC Verification", icon: FileBadge },
              { id: "devices", label: "Devices & Privacy", icon: Smartphone },
              { id: "ledger", label: "Ledger & Disputes", icon: BookOpen },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === id ? "bg-[#00D632] text-black" : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {message && (
          <div
            className={`mx-5 mt-4 flex items-center gap-2 p-3 rounded-2xl text-xs ${
              message.type === "success"
                ? "bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30"
                : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === "pin" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className={`size-5 ${hasPin ? "text-[#00D632]" : "text-amber-400"}`} />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {hasPin ? "Transaction PIN Active" : "Transaction PIN Not Configured"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {hasPin
                        ? `Required server-side for transfers ≥ ${formatINR(securityStatus?.pin_threshold ?? 2000)} (5-attempt lockout)`
                        : "Set a 4 or 6 digit PIN stored as a salted bcrypt hash in PostgreSQL."}
                    </p>
                  </div>
                </div>
                {securityStatus?.is_locked && (
                  <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    PIN LOCKED
                  </span>
                )}
              </div>

              <form onSubmit={handleSavePin} className="space-y-3.5">
                {hasPin && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Current PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      className="w-full h-10 px-3.5 rounded-xl bg-zinc-900 border border-white/15 text-sm font-mono text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">New 4 or 6 Digit PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="4 or 6 digits"
                      className="w-full h-10 px-3.5 rounded-xl bg-zinc-900 border border-white/15 text-sm font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="Re-enter PIN"
                      className="w-full h-10 px-3.5 rounded-xl bg-zinc-900 border border-white/15 text-sm font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Require PIN on transfers ≥ (₹ INR)</label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                  >
                    <option value="0">Every transfer (₹0+)</option>
                    <option value="500">₹500 and above</option>
                    <option value="2000">₹2,000 and above (Recommended)</option>
                    <option value="5000">₹5,000 and above</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-[#00D632] hover:bg-[#00D632]/90 disabled:opacity-50 text-black text-xs font-bold cursor-pointer"
                >
                  {isSaving ? "Saving..." : hasPin ? "Update Transaction PIN" : "Enable Transaction PIN"}
                </button>
              </form>
            </div>
          )}

          {tab === "mfa" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Authenticator App (TOTP 2FA)</h4>
                  <p className="text-xs text-zinc-400">
                    Enroll Google Authenticator / 1Password via Supabase Auth MFA factors.
                  </p>
                </div>
                {!enrollQr && (
                  <button
                    type="button"
                    onClick={() => void handleStartMfaEnroll()}
                    className="px-3.5 py-2 rounded-xl bg-[#00D632] text-black text-xs font-bold cursor-pointer shrink-0"
                  >
                    Enroll Authenticator
                  </button>
                )}
              </div>

              {enrollQr && (
                <form onSubmit={handleVerifyMfaEnroll} className="rounded-2xl border border-[#00D632]/30 bg-[#00D632]/5 p-4 space-y-3">
                  <p className="text-xs font-semibold text-white">1. Scan QR in Authenticator app or copy secret:</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img src={enrollQr.qrSvg} alt="TOTP MFA QR code" className="size-32 rounded-xl bg-white p-1.5" />
                    <div className="space-y-2 text-xs">
                      <p className="font-mono text-zinc-300 break-all">Secret: {enrollQr.secret}</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="Enter 6-digit TOTP code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 font-mono text-white"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl bg-[#00D632] text-black font-bold cursor-pointer">
                        Verify & Enable 2FA
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {mfaFactors.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 text-xs">
                    <div>
                      <p className="font-bold text-white">{f.friendly_name || "TOTP Authenticator"}</p>
                      <p className="font-mono text-[11px] text-[#00D632] uppercase">Status: {f.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemoveFactor(f.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "kyc" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <form onSubmit={handleSubmitKyc} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Submit Simulated KYC Document</h4>
                <p className="text-[11px] text-zinc-400">
                  Sets status to <code className="text-amber-300">pending</code> until reviewed in Admin Back Office.
                </p>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as typeof docType)}
                  className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                >
                  <option value="pan">PAN Card (e.g. ABCDE••••F)</option>
                  <option value="aadhaar_masked">Masked Aadhaar (XXXX-XXXX-1234)</option>
                  <option value="passport">Indian Passport (Z••••12)</option>
                  <option value="driving_license">Driving License</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="Masked ID Number (last 4 visible)"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs font-mono text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
                />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-[#00D632] text-black text-xs font-bold cursor-pointer">
                  Submit KYC for Review
                </button>
              </form>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">KYC Submission History</h4>
                {kycDocuments.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-4 rounded-2xl border border-white/10 bg-white/5">
                    No KYC documents uploaded yet.
                  </p>
                ) : (
                  kycDocuments.map((k) => (
                    <div key={k.id} className="p-3 rounded-2xl border border-white/10 bg-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase">{k.doc_type.replace("_", " ")}</span>
                        <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                          {k.status}
                        </span>
                      </div>
                      <p className="font-mono text-zinc-300">{k.doc_number_masked} · {k.full_legal_name}</p>
                      {k.rejection_reason && <p className="text-rose-300 text-[11px]">Note: {k.rejection_reason}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "devices" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Active Devices & Sessions</h4>
                    <p className="text-xs text-zinc-400">New device logins emit mandatory security alerts.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void revokeDeviceSessions()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out Everywhere</span>
                  </button>
                </div>

                {deviceSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <div>
                      <p className="font-semibold text-white">{s.device_label}</p>
                      <p className="text-[10px] font-mono text-zinc-400">
                        Last seen {new Date(s.last_seen_at).toLocaleString("en-IN")} · {s.device_fingerprint.slice(0, 8)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void revokeDeviceSessions(s.id)}
                      className="px-2 py-1 rounded-lg bg-white/10 text-zinc-300 hover:text-rose-300 cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5">
                  <h4 className="text-sm font-bold text-white">DPDP Data Export (JSON)</h4>
                  <p className="text-xs text-zinc-400">
                    Download your masked wallet, pockets, budgets, payees, disputes & transaction history.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleExportData()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D632] text-black text-xs font-bold cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>Download Account Archive</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2.5">
                  <h4 className="text-sm font-bold text-rose-200 flex items-center gap-1.5">
                    <ShieldAlert className="size-4 text-rose-400" />
                    <span>Request Account Closure</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Freezes your wallet, pauses recurring autopays & retains immutable ledger records for audit.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reason (3+ chars)"
                      value={closureReason}
                      onChange={(e) => setClosureReason(e.target.value)}
                      className="flex-1 h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/15 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const r = await requestAccountClosure(closureReason);
                        setMessage(
                          r.success
                            ? { type: "success", text: "Wallet frozen & closure request recorded in audit logs." }
                            : { type: "error", text: r.error || "Closure failed." }
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      Freeze & Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "ledger" && (
            <div className="space-y-5">
              {disputes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">My Reported Disputes ({disputes.length})</h4>
                  {disputes.map((d) => (
                    <div key={d.id} className="p-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{d.reason}</span>
                        <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                          {d.status}
                        </span>
                      </div>
                      {d.resolution_note && <p className="text-[11px] text-[#00D632]">Resolution: {d.resolution_note}</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Immutable Double-Entry Ledger Lines</h4>
                {loadingLedger ? (
                  <p className="text-xs text-zinc-400 text-center py-8">Loading immutable double-entry journal...</p>
                ) : ledgerEntries.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-8">No ledger entries found for your accounts.</p>
                ) : (
                  ledgerEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono uppercase text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              entry.direction === "credit"
                                ? "bg-[#00D632]/15 text-[#00D632]"
                                : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {entry.direction}
                          </span>
                          <span className="font-semibold text-white truncate">{entry.account_name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{entry.entry_type}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-1">
                          {entry.description || entry.account_code}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          Journal: {entry.journal_id.slice(0, 8)} • {new Date(entry.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`font-mono font-bold ${entry.direction === "credit" ? "text-[#00D632]" : "text-white"}`}>
                          {entry.direction === "credit" ? "+" : "-"}
                          {formatINR(entry.amount)}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400">Bal: {formatINR(entry.running_balance)}</p>
                      </div>
                    </div>
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
