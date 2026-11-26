"use client";

import * as React from "react";
import {
  X,
  Smartphone,
  Plus,
  Delete,
  RotateCcw,
  Store,
  CheckCircle2,
  Receipt,
  Search,
  ArrowLeft,
  QrCode,
  Wallet,
  Lock,
  Star,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatINR } from "@/utils/formatters";
import { SlideToConfirm } from "@/components/kokonutui/SlideToConfirm";
import { useDebounce } from "@/hooks/use-debounce";
import { generateIdempotencyKey } from "@/lib/cache";
import { DirectoryProfile, TransferQuote } from "@/types/database.types";
import { ContactsGridSkeleton } from "@/components/dashboard/DashboardSkeleton";

interface UPIPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export interface Recipient {
  name: string;
  handle: string;
  phone?: string;
  type: "store" | "person";
}

const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-cyan-400 to-sky-600",
  "from-indigo-400 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const ALL_SEED_CONTACTS: Recipient[] = [
  { name: "Chewang Lepcha", handle: "chewang@cash", phone: "+91 9811234001", type: "person" },
  { name: "Alif Sufee", handle: "alif@cash", phone: "+91 9811234002", type: "person" },
  { name: "Anand Kumar Singh", handle: "anand@cash", phone: "+91 9811234003", type: "person" },
  { name: "Dipankar Barai", handle: "dipankar@cash", phone: "+91 9811234004", type: "person" },
  { name: "Namita Barai", handle: "namita@cash", phone: "+91 9811234005", type: "person" },
  { name: "Barai Stores", handle: "baraistores@paytm", phone: "+91 9811234006", type: "store" },
  { name: "Padmarani Baidya", handle: "padmarani@cash", phone: "+91 9811234007", type: "person" },
  { name: "Padma Tea Stall", handle: "padmatea@okhdfc", phone: "+91 9811234008", type: "store" },
  { name: "Sunirmal Biswas", handle: "sunirmal@cash", phone: "+91 9811234009", type: "person" },
  { name: "Sabari Goswami", handle: "sabari@cash", phone: "+91 9811234010", type: "person" },
  { name: "Tarak Tea Stall", handle: "taraktea@paytm", phone: "+91 9811234011", type: "store" },
  { name: "Archana Store", handle: "archanastore@upi", phone: "+91 9811234012", type: "store" },
  { name: "Namita Traders", handle: "namitatraders@okaxis", phone: "+91 9811234013", type: "store" },
  { name: "Nirmal Mondal", handle: "nirmal@cash", phone: "+91 9811234014", type: "person" },
  { name: "Pema S Sherpa", handle: "pema@cash", phone: "+91 9811234015", type: "person" },
  { name: "Labela Stores", handle: "labelastores@paytm", phone: "+91 9811234016", type: "store" },
  { name: "Tapan Sarkar", handle: "tapan@cash", phone: "+91 9811234017", type: "person" },
  { name: "Jhumpa Store", handle: "jhumpa@upi", phone: "+91 9811234018", type: "store" },
  { name: "Govind Ray", handle: "govind@cash", phone: "+91 9811234019", type: "person" },
  { name: "Nabin Mondal", handle: "nabin@cash", phone: "+91 9811234020", type: "person" },
  { name: "Bibek Limbu", handle: "bibek@cash", phone: "+91 9811234021", type: "person" },
  { name: "Aarav Sharma", handle: "aarav@cash", phone: "+91 9786579303", type: "person" },
  { name: "Aditi Verma", handle: "aditi@cash", phone: "+91 9271432881", type: "person" },
  { name: "Akash Patel", handle: "akash@cash", phone: "+91 9185675980", type: "person" },
  { name: "Ananya Iyer", handle: "ananya@cash", phone: "+91 9171069472", type: "person" },
  { name: "Arjun Nair", handle: "arjun@cash", phone: "+91 9950488739", type: "person" },
  { name: "Charlie Chaplin", handle: "charlie@cash", phone: "+91 9888811111", type: "person" },
  { name: "Diana Prince", handle: "diana@cash", phone: "+91 9777722222", type: "person" },
  { name: "Alice Wonderland", handle: "alice@cash", phone: "+91 9111111111", type: "person" },
  { name: "Bob Builder", handle: "bob@cash", phone: "+91 9222222222", type: "person" },
  { name: "Deepak Reddy", handle: "deepak@cash", phone: "+91 9264109919", type: "person" },
  { name: "Devika Mehta", handle: "devika@cash", phone: "+91 9420571903", type: "person" },
  { name: "Divya Gupta", handle: "divya@cash", phone: "+91 9554340903", type: "person" },
  { name: "Gaurav Singh", handle: "gaurav@cash", phone: "+91 9399012686", type: "person" },
  { name: "Harsh Chopra", handle: "harsh@cash", phone: "+91 9139749508", type: "person" },
  { name: "Isha Mehta", handle: "isha@cash", phone: "+91 9399085574", type: "person" },
  { name: "Karan Chopra", handle: "karan@cash", phone: "+91 9943026227", type: "person" },
  { name: "Local Kirana & Supermarket", handle: "kirana.mart@okhdfc", phone: "+91 9800000001", type: "store" },
  { name: "Blue Tokai Coffee", handle: "bluetokai@paytm", phone: "+91 9800000002", type: "store" },
];

function mapProfilesToRecipients(
  profiles: DirectoryProfile[],
  currentUserId?: string
): Recipient[] {
  return [...profiles]
    .filter(
      (p) =>
        p.id !== currentUserId &&
        !p.full_name?.toLowerCase().includes("legacy") &&
        !p.email?.toLowerCase().includes("legacy")
    )
    .sort((a, b) => {
      const aPriority = a.email?.endsWith("@cash.me") ? 1 : 2;
      const bPriority = b.email?.endsWith("@cash.me") ? 1 : 2;
      return aPriority - bPriority;
    })
    .map((p) => {
      const key = p.full_name.toLowerCase().trim();
      const handle = p.email
        ? p.email.endsWith("@cash.me") || p.email.endsWith("@cash.test")
          ? `${p.email.split("@")[0]}@cash`
          : p.email
        : p.phone || `${key.replace(/\s+/g, "")}@cash`;

      return {
        name: p.full_name,
        handle,
        phone: p.phone || undefined,
        type: "person" as const,
      };
    });
}

const DesktopContactButton = React.memo(function DesktopContactButton({
  contact,
  isSelected,
  onSelect,
}: {
  contact: Recipient;
  isSelected: boolean;
  onSelect: (c: Recipient) => void;
}) {
  const gradient = getAvatarColor(contact.name);

  return (
    <button
      type="button"
      onClick={() => onSelect(contact)}
      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
        isSelected
          ? "bg-[#00D632]/15 border border-[#00D632]/35 text-white shadow-sm"
          : "hover:bg-white/5 border border-transparent text-zinc-300"
      }`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xs font-bold text-white shadow-sm border border-white/15`}
      >
        {contact.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate leading-tight text-zinc-100">{contact.name}</p>
        <p className="text-[10px] text-zinc-400 font-mono truncate">{contact.handle}</p>
      </div>
    </button>
  );
});

export function UPIPaymentModal({ open, onClose }: UPIPaymentModalProps) {
  const {
    currentWallet,
    sendMoney,
    profiles,
    searchDirectoryUsers,
    securityStatus,
    payees,
    previewTransferQuote,
    upsertPayee,
    claimCashback,
  } = useWallet();

  const [mobileView, setMobileView] = React.useState<"contacts" | "amount">("contacts");
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [remoteMatches, setRemoteMatches] = React.useState<DirectoryProfile[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = React.useState(false);

  // Trigger debounced server-side directory autocomplete when user types 2+ characters
  React.useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (!open || trimmed.length < 2) {
      setRemoteMatches([]);
      setIsSearchingRemote(false);
      return;
    }

    let cancelled = false;
    setIsSearchingRemote(true);

    searchDirectoryUsers(trimmed)
      .then((res) => {
        if (!cancelled) {
          setRemoteMatches(res);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearchingRemote(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, open, searchDirectoryUsers]);

  const allContacts = React.useMemo<Recipient[]>(() => {
    const list: Recipient[] = [];
    const seen = new Set<string>();

    const addUnique = (items: Recipient[]) => {
      for (const item of items) {
        const key = item.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(item);
        }
      }
    };

    if (remoteMatches.length > 0) {
      addUnique(mapProfilesToRecipients(remoteMatches, currentWallet?.user_id));
    }
    if (profiles.length > 0) {
      addUnique(mapProfilesToRecipients(profiles, currentWallet?.user_id));
    }
    addUnique(ALL_SEED_CONTACTS);

    return list;
  }, [remoteMatches, profiles, currentWallet?.user_id]);

  const filteredContacts = React.useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return allContacts;
    const digitsOnly = q.replace(/\D/g, "");
    return allContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        (digitsOnly.length > 0 && c.phone && c.phone.replace(/\D/g, "").includes(digitsOnly))
    );
  }, [allContacts, debouncedSearch]);

  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient>(ALL_SEED_CONTACTS[0]);
  const [customVpa, setCustomVpa] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);

  const [tallyItems, setTallyItems] = React.useState<number[]>([]);
  const [currentBuffer, setCurrentBuffer] = React.useState<string>("");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [transactionPin, setTransactionPin] = React.useState("");
  const [pinPromptRequested, setPinPromptRequested] = React.useState(false);
  const [quote, setQuote] = React.useState<TransferQuote | null>(null);
  const [lastTxnId, setLastTxnId] = React.useState<string | null>(null);
  const [cashbackClaimed, setCashbackClaimed] = React.useState(false);
  const [payeeSavedMsg, setPayeeSavedMsg] = React.useState(false);
  const paymentAttemptKeyRef = React.useRef<string>(generateIdempotencyKey());

  // Reset modal only when opening (never reset mid-search when allContacts updates)
  const wasOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setMobileView("contacts");
      setSearchQuery("");
      setRemoteMatches([]);
      setTallyItems([]);
      setCurrentBuffer("");
      setStatusMessage(null);
      setIsSuccess(false);
      setIsCustom(false);
      setTransactionPin("");
      setPinPromptRequested(false);
      setQuote(null);
      setLastTxnId(null);
      setCashbackClaimed(false);
      setPayeeSavedMsg(false);
      paymentAttemptKeyRef.current = generateIdempotencyKey();
      if (allContacts.length > 0) {
        setSelectedRecipient(allContacts[0]);
      }
    }
    wasOpenRef.current = open;
  }, [open, allContacts]);

  const handleSelectDesktopRecipient = React.useCallback((c: Recipient) => {
    setSelectedRecipient(c);
    setIsCustom(false);
    setTransactionPin("");
    setPinPromptRequested(false);
    setPayeeSavedMsg(false);
    paymentAttemptKeyRef.current = generateIdempotencyKey();
  }, []);

  const committedSum = tallyItems.reduce((acc, curr) => acc + curr, 0);
  const currentNum = parseFloat(currentBuffer) || 0;
  const totalAmount = committedSum + currentNum;
  const activeRecipientHandle =
    isCustom && customVpa.trim() ? customVpa.trim() : selectedRecipient.handle;

  React.useEffect(() => {
    if (!open || totalAmount <= 0 || !activeRecipientHandle) {
      setQuote(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void previewTransferQuote(activeRecipientHandle, totalAmount, "upi").then(setQuote);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, totalAmount, activeRecipientHandle, previewTransferQuote]);

  if (!open) return null;
  const pinThreshold = securityStatus?.pin_threshold ?? 2000;
  const needsPinInput =
    Boolean(securityStatus?.has_pin) && (pinPromptRequested || totalAmount >= pinThreshold);

  const activeRecipient =
    isCustom && customVpa.trim()
      ? { name: customVpa.trim(), handle: customVpa.trim(), type: "person" as const }
      : selectedRecipient;

  const handleDigit = (digit: string) => {
    if (digit === "." && currentBuffer.includes(".")) return;
    if (currentBuffer.length >= 7) return;
    setCurrentBuffer((prev) => (prev === "0" && digit !== "." ? digit : prev + digit));
  };

  const handleBackspace = () => {
    if (currentBuffer.length > 0) {
      setCurrentBuffer((prev) => prev.slice(0, -1));
    } else if (tallyItems.length > 0) {
      const last = tallyItems[tallyItems.length - 1];
      setTallyItems((prev) => prev.slice(0, -1));
      setCurrentBuffer(last.toString());
    }
  };

  const handleAddPlus = () => {
    if (currentNum > 0) {
      setTallyItems((prev) => [...prev, currentNum]);
      setCurrentBuffer("");
    }
  };

  const handleResetAll = () => {
    setTallyItems([]);
    setCurrentBuffer("");
  };

  const handleAddQuickPreset = (val: number) => {
    setTallyItems((prev) => [...prev, val]);
  };

  const handleSelectContact = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsCustom(false);
    setTransactionPin("");
    setPinPromptRequested(false);
    setMobileView("amount");
    paymentAttemptKeyRef.current = generateIdempotencyKey();
  };

  const handlePayCustomSearch = () => {
    if (!searchQuery.trim()) return;
    setCustomVpa(searchQuery.trim());
    setIsCustom(true);
    setTransactionPin("");
    setPinPromptRequested(false);
    setMobileView("amount");
    paymentAttemptKeyRef.current = generateIdempotencyKey();
  };

  const handleExecutePayment = async () => {
    if (totalAmount <= 0) {
      setStatusMessage("Please enter an amount to pay");
      return;
    }

    if (currentWallet && currentWallet.balance < totalAmount) {
      setStatusMessage(`Insufficient wallet balance (${formatINR(currentWallet.balance)})`);
      return;
    }

    const itemsSummary =
      tallyItems.length > 0 ? ` (${tallyItems.length + (currentNum > 0 ? 1 : 0)} items shop tally)` : "";

    const res = await sendMoney({
      recipientUpiOrPhone: activeRecipient.handle,
      recipientName: activeRecipient.name,
      amount: Number(totalAmount.toFixed(2)),
      category: "peer_transfer",
      description: `Payment to ${activeRecipient.name}${itemsSummary}`,
      pin: transactionPin || undefined,
      idempotencyKey: paymentAttemptKeyRef.current,
    });

    if (res.success) {
      setIsSuccess(true);
      setLastTxnId(res.transactionId || null);
      setTransactionPin("");
      setPinPromptRequested(false);
      paymentAttemptKeyRef.current = generateIdempotencyKey();
      const recipientLabel = res.recipientName || activeRecipient.name;
      const internalText = res.isInternal ? " · Receiver Credited ✓" : "";
      setStatusMessage(`Paid ${formatINR(totalAmount)} to ${recipientLabel}${internalText}`);
      if (!quote || quote.cashback_rate <= 0) {
        window.setTimeout(() => {
          onClose();
        }, 1800);
      }
    } else {
      if (res.pinRequired) {
        setPinPromptRequested(true);
      }
      const errText = res.error || "Payment failed";
      if (errText.toLowerCase().includes("timed out")) {
        setStatusMessage(
          `Network timeout (Ref key ${paymentAttemptKeyRef.current.slice(0, 8)} preserved). Retry safely — idempotency prevents double debit.`
        );
      } else {
        setStatusMessage(errText);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="relative z-50 flex flex-col md:flex-row gap-4 items-stretch max-w-3xl w-full max-h-[92vh] overflow-hidden rounded-3xl border border-white/20 bg-zinc-950/95 p-4 sm:p-6 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 hidden md:flex rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {/* MOBILE VIEW: Contacts Selection */}
        <div className={`flex-1 flex flex-col md:hidden overflow-hidden ${mobileView === "contacts" ? "flex" : "hidden"}`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Send Money"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display font-bold text-base text-white tracking-tight">Send Money</h3>

            <button
              type="button"
              onClick={() => handleSelectContact(allContacts[0])}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-200 cursor-pointer active:scale-95 transition-all"
            >
              <QrCode className="size-3.5 text-[#00D632]" />
              <span>Scan QR</span>
            </button>
          </div>

          <div className="mt-3 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter Name, UPI ID or Mobile Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 rounded-2xl bg-zinc-900/80 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00D632] font-medium transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {searchQuery.trim().length > 2 && (
              <button
                type="button"
                onClick={handlePayCustomSearch}
                className="w-full mt-2 flex items-center justify-between p-2.5 rounded-xl border border-[#00D632]/30 bg-[#00D632]/10 hover:bg-[#00D632]/20 text-[#00D632] text-xs font-semibold cursor-pointer transition-all"
              >
                <span>Pay to "{searchQuery.trim()}"</span>
                <span className="font-mono text-[11px]">Direct UPI Pay ❯</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-thin">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase font-mono">
                {debouncedSearch ? `Search Results (${filteredContacts.length})` : "Recent Contacts"}
              </p>
              <span className="text-[10px] text-zinc-500 font-mono">
                {isSearchingRemote ? "Searching..." : `${allContacts.length} verified accounts`}
              </span>
            </div>

            {isSearchingRemote && filteredContacts.length === 0 ? (
              <ContactsGridSkeleton count={8} />
            ) : filteredContacts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-zinc-400">No contact matched "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={handlePayCustomSearch}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#00D632] text-black text-xs font-bold shadow cursor-pointer"
                >
                  Pay to {searchQuery}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-y-4 gap-x-2 pb-6">
                {filteredContacts.map((c) => {
                  const initial = c.name.charAt(0).toUpperCase();
                  const gradient = getAvatarColor(c.name);

                  return (
                    <button
                      key={c.handle}
                      type="button"
                      onClick={() => handleSelectContact(c)}
                      className="group flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform"
                    >
                      <div className="relative">
                        <div
                          className={`size-14 sm:size-16 rounded-[18px] bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-white/20 group-hover:scale-105 transition-transform`}
                        >
                          {initial}
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-zinc-950 border border-white/20 shadow">
                          {c.type === "store" ? (
                            <Store className="size-2.5 text-[#00D632]" />
                          ) : (
                            <Wallet className="size-2.5 text-sky-400" />
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-zinc-200 line-clamp-2 max-w-[70px] leading-tight mt-1.5 group-hover:text-white transition-colors">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP VIEW: Contacts Directory Sidebar */}
        <div className="hidden md:flex flex-col w-72 border-r border-white/10 pr-5 justify-between shrink-0">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-white">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-[#00D632]" />
                <span className="font-bold text-sm tracking-tight">Send Money</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {isSearchingRemote ? "Searching..." : `${allContacts.length} Contacts`}
              </span>
            </div>

            <div className="relative flex items-center mb-3">
              <Search className="absolute left-3 size-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, UPI ID or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-zinc-900/80 border border-white/15 rounded-xl pl-8 pr-7 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00D632] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {payees.length > 0 && !debouncedSearch && (
                <div className="mb-2 pb-2 border-b border-white/10">
                  <p className="text-[10px] font-mono uppercase text-amber-300 px-1 mb-1">Saved Payees</p>
                  {payees.slice(0, 4).map((py) => (
                    <button
                      key={py.id}
                      type="button"
                      onClick={() =>
                        handleSelectDesktopRecipient({
                          name: py.payee_name,
                          handle: py.upi_id || py.payee_identifier,
                          type: "person",
                        })
                      }
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/10 text-left text-xs cursor-pointer"
                    >
                      <span className="truncate text-zinc-200 font-medium">{py.payee_name}</span>
                      {py.is_favourite && <Star className="size-3 text-amber-400 shrink-0" fill="currentColor" />}
                    </button>
                  ))}
                </div>
              )}
              {filteredContacts.map((c) => (
                <DesktopContactButton
                  key={c.handle}
                  contact={c}
                  isSelected={!isCustom && selectedRecipient.handle === c.handle}
                  onSelect={handleSelectDesktopRecipient}
                />
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <label className="text-[10px] text-zinc-400 block mb-1 font-mono uppercase">
                Or Enter Custom UPI ID / Phone
              </label>
              <input
                type="text"
                placeholder="friend@okhdfc / 9876543210"
                value={customVpa}
                onChange={(e) => {
                  setCustomVpa(e.target.value);
                  setIsCustom(true);
                }}
                className="w-full text-xs bg-zinc-900/80 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632] font-mono"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT PAD VIEW */}
        <div
          className={`flex-1 flex flex-col justify-between overflow-y-auto ${
            mobileView === "amount" ? "flex" : "hidden md:flex"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 pr-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileView("contacts")}
                  className="md:hidden flex items-center justify-center p-1.5 -ml-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Back to contacts"
                >
                  <ArrowLeft className="size-4" />
                </button>

                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarColor(
                    activeRecipient.name
                  )} text-white font-extrabold text-xs shadow border border-white/20`}
                >
                  {activeRecipient.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{activeRecipient.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">{activeRecipient.handle}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-right">
                <button
                  type="button"
                  onClick={async () => {
                    const r = await upsertPayee({
                      payeeIdentifier: activeRecipient.handle,
                      payeeName: activeRecipient.name,
                      upiId: activeRecipient.handle,
                      isFavourite: true,
                    });
                    if (r.success) setPayeeSavedMsg(true);
                  }}
                  className="text-[10px] text-amber-300 font-mono bg-amber-500/10 border border-amber-400/25 px-2 py-0.5 rounded-full hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                  title="Save to favourites (24h cooling-off applies)"
                >
                  <Star className="size-2.5" fill={payeeSavedMsg ? "currentColor" : "none"} />
                  <span>{payeeSavedMsg ? "Saved" : "Save"}</span>
                </button>
                <span className="text-[10px] text-zinc-400 font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  Bal: {formatINR(currentWallet?.balance ?? 0)}
                </span>
              </div>
            </div>

            <div className="mt-2.5 min-h-[32px] flex items-center justify-between bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-white/10">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono text-zinc-300 flex-1">
                <Receipt className="size-3.5 text-[#00D632] shrink-0" />
                {tallyItems.length > 0 || currentBuffer ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tallyItems.map((amt, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-white"
                      >
                        <span>₹{amt}</span>
                        <span className="text-[#00D632]">+</span>
                      </span>
                    ))}
                    {currentBuffer && (
                      <span className="bg-[#00D632]/20 text-[#00D632] px-2 py-0.5 rounded font-bold">
                        ₹{currentBuffer}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-zinc-600 font-mono text-[11px]">₹0.00</span>
                )}
              </div>

              {(tallyItems.length > 0 || currentBuffer) && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[10px] text-zinc-400 hover:text-white ml-2 flex items-center gap-0.5 cursor-pointer shrink-0"
                  title="Clear all items"
                >
                  <RotateCcw className="size-3" /> Clear
                </button>
              )}
            </div>

            <div className="my-2.5 text-center py-2 bg-zinc-900/40 rounded-2xl border border-white/10">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
                Total Transfer Amount
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-2xl font-bold text-[#00D632]">₹</span>
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: totalAmount % 1 === 0 ? 0 : 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {tallyItems.length > 0 && (
                <p className="text-[11px] text-[#00D632] font-mono mt-1">
                  ✓ {tallyItems.length + (currentNum > 0 ? 1 : 0)} items tallied
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-2.5 flex-wrap">
              {[50, 100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddQuickPreset(preset)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-zinc-900/80 hover:bg-[#00D632]/10 hover:border-[#00D632]/30 hover:text-[#00D632] text-[11px] font-mono text-zinc-300 transition-all cursor-pointer active:scale-95"
                >
                  +₹{preset}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1.5 max-w-sm mx-auto">
              {["1", "2", "3"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddPlus}
                className="h-10 sm:h-11 rounded-xl border border-[#00D632]/30 bg-[#00D632]/15 hover:bg-[#00D632]/25 text-[#00D632] font-bold text-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                title="Add current item cost"
              >
                <Plus className="size-5 stroke-[3]" />
              </button>

              {["4", "5", "6"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="size-4" />
              </button>

              {["7", "8", "9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleDigit(".")}
                className="h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                .
              </button>

              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="col-span-2 h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-base font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDigit("0");
                  handleDigit("0");
                }}
                className="h-10 sm:h-11 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                00
              </button>
              <button
                type="button"
                onClick={handleAddPlus}
                className="h-10 sm:h-11 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                Tally
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            {quote && totalAmount > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-zinc-300 font-mono">
                  <span>
                    Fee: <strong className="text-[#00D632]">{formatINR(quote.fee_amount + quote.gst_amount)}</strong> ·{" "}
                    Cat: <strong className="capitalize text-white">{quote.predicted_category}</strong>
                  </span>
                  <span
                    className={`uppercase px-1.5 py-0.5 rounded ${
                      quote.risk_level === "high"
                        ? "bg-rose-500/20 text-rose-300"
                        : quote.risk_level === "medium"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-[#00D632]/15 text-[#00D632]"
                    }`}
                  >
                    {quote.risk_level} risk
                  </span>
                </div>
                {quote.cashback_rate > 0 && (
                  <p className="text-[#00D632] flex items-center gap-1">
                    <Sparkles className="size-3" /> Eligible for {Math.round(quote.cashback_rate * 1000) / 10}% Rewards Cashback!
                  </p>
                )}
                {quote.duplicate_recent && (
                  <p className="text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Warning: Same amount paid to this recipient within 5 minutes.
                  </p>
                )}
                {quote.cooling_off_active && (
                  <p className="text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="size-3" /> New payee 24h cooling-off cap: max {formatINR(quote.cooling_cap)}.
                  </p>
                )}
              </div>
            )}

            {needsPinInput && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-200 min-w-0">
                  <Lock className="size-3.5 shrink-0 text-amber-400" />
                  <span className="text-[11px] font-medium truncate">
                    PIN required ≥ {formatINR(pinThreshold)}
                  </span>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => {
                    setTransactionPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (statusMessage && !isSuccess) setStatusMessage(null);
                  }}
                  placeholder="4-6 digit PIN"
                  aria-label="Transaction PIN"
                  className="w-28 h-8 px-2.5 rounded-lg bg-zinc-950 border border-amber-400/40 text-center font-mono text-xs tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00D632]"
                />
              </div>
            )}

            <SlideToConfirm
              onConfirm={handleExecutePayment}
              label={
                totalAmount > 0 ? `Slide to Pay ${formatINR(totalAmount)} via UPI` : "Enter amount to Slide & Pay"
              }
              confirmedLabel={`Paid ${formatINR(totalAmount)}! ✓`}
              disabled={totalAmount <= 0 || (needsPinInput && transactionPin.length < 4)}
            />

            {statusMessage && (
              <div
                className={`text-xs text-center font-medium p-2 rounded-xl transition-all ${
                  isSuccess
                    ? "bg-[#00D632]/15 text-[#00D632] border border-[#00D632]/30 flex flex-col items-center justify-center gap-1.5"
                    : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isSuccess && <CheckCircle2 className="size-3.5" />}
                  <span>{statusMessage}</span>
                </div>
                {isSuccess && lastTxnId && quote && quote.cashback_rate > 0 && !cashbackClaimed && (
                  <button
                    type="button"
                    onClick={async () => {
                      const cb = await claimCashback(lastTxnId);
                      if (cb.success) {
                        setCashbackClaimed(true);
                        setStatusMessage(`Paid ${formatINR(totalAmount)} + Claimed ${formatINR(cb.rewardAmount || 0)} Cashback ✓`);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-[#00D632] text-black text-[11px] font-bold cursor-pointer"
                  >
                    Claim Cashback Reward
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
