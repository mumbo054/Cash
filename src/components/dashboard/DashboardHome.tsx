"use client";

import * as React from "react";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  History,
  FolderHeart,
  Bell,
  ArrowUpRight,
  Plus,
  Home,
  Send,
  Target,
  LogOut,
  Layers,
  X,
  Building2,
  Zap,
  Shield,
  ShieldAlert,
  CalendarClock,
  PieChart,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import WidgetGrid, { WidgetGridItem, WidgetLayoutItem } from "@/components/kokonutui/widget-grid";
import ProfileDropdown, { Account } from "@/components/kokonutui/profile-dropdown";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Core above-the-fold dashboard tiles
import { BalanceActionTile } from "@/components/dashboard/BalanceActionTile";
import { VirtualCardTile } from "@/components/dashboard/VirtualCardTile";
import { ExpenditureMetricTile } from "@/components/dashboard/ExpenditureMetricTile";
import { BankCardQuickTile } from "@/components/dashboard/BankCardQuickTile";
import { TransactionHistoryTile } from "@/components/dashboard/TransactionHistoryTile";
import { PocketsGoalsTile } from "@/components/dashboard/PocketsGoalsTile";

// Lazy-loaded modals & secondary panels (split into separate chunks)
const loadUPIModal = () => import("@/components/dashboard/UPIPaymentModal").then((m) => ({ default: m.UPIPaymentModal }));
const loadAddBalanceModal = () => import("@/components/dashboard/AddBalanceModal").then((m) => ({ default: m.AddBalanceModal }));
const loadBankCardModal = () => import("@/components/dashboard/BankCardTransferModal").then((m) => ({ default: m.BankCardTransferModal }));
const loadPassbookModal = () => import("@/components/dashboard/PassbookModal").then((m) => ({ default: m.PassbookModal }));
const loadPocketsModal = () => import("@/components/dashboard/PocketsManagerModal").then((m) => ({ default: m.PocketsManagerModal }));
const loadVaultModal = () => import("@/components/dashboard/SavingsVaultModal").then((m) => ({ default: m.SavingsVaultModal }));
const loadProfileQRCard = () => import("@/components/dashboard/ProfileQRCard").then((m) => ({ default: m.ProfileQRCard }));
const loadNotificationStack = () => import("@/components/kokonutui/notification-stack");
const loadSecurityModal = () => import("@/components/dashboard/SecurityPinModal").then((m) => ({ default: m.SecurityPinModal }));
const loadAdminModal = () => import("@/components/dashboard/AdminBackOfficeModal").then((m) => ({ default: m.AdminBackOfficeModal }));
const loadCashFlowModal = () => import("@/components/dashboard/CashFlowBudgetsModal").then((m) => ({ default: m.CashFlowBudgetsModal }));
const loadRequestsAutopayModal = () => import("@/components/dashboard/RequestsAutopayModal").then((m) => ({ default: m.RequestsAutopayModal }));
const loadComplianceDialog = () => import("@/components/dashboard/ComplianceDialog").then((m) => ({ default: m.ComplianceDialog }));

const UPIPaymentModal = React.lazy(loadUPIModal);
const AddBalanceModal = React.lazy(loadAddBalanceModal);
const BankCardTransferModal = React.lazy(loadBankCardModal);
const PassbookModal = React.lazy(loadPassbookModal);
const PocketsManagerModal = React.lazy(loadPocketsModal);
const SavingsVaultModal = React.lazy(loadVaultModal);
const ProfileQRCard = React.lazy(loadProfileQRCard);
const NotificationStack = React.lazy(loadNotificationStack);
const SecurityPinModal = React.lazy(loadSecurityModal);
const AdminBackOfficeModal = React.lazy(loadAdminModal);
const CashFlowBudgetsModal = React.lazy(loadCashFlowModal);
const RequestsAutopayModal = React.lazy(loadRequestsAutopayModal);
const ComplianceDialog = React.lazy(loadComplianceDialog);

function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950/95 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

const INITIAL_LAYOUT: WidgetLayoutItem[] = [
  { id: "balance", span: 4 },
  { id: "virtual-card", span: 2 },
  { id: "expenditure", span: 4 },
  { id: "bank-card-quick", span: 2 },
  { id: "passbook", span: 3 },
  { id: "pockets-goals", span: 3 },
];

export function DashboardHome() {
  const { currentProfile, signOutUser, isAdminOrStaff, unreadNotificationsCount } = useWallet();

  // Modals state
  const [upiModalOpen, setUpiModalOpen] = React.useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = React.useState(false);
  const [bankModalOpen, setBankModalOpen] = React.useState(false);
  const [bankModalTab, setBankModalTab] = React.useState<"card" | "bank">("card");
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false);
  const [passbookModalOpen, setPassbookModalOpen] = React.useState(false);
  const [passbookInitialTxnId, setPassbookInitialTxnId] = React.useState<string | null>(null);
  const [pocketsModalOpen, setPocketsModalOpen] = React.useState(false);
  const [pocketsModalMode, setPocketsModalMode] = React.useState<"view" | "create">("view");
  const [vaultModalOpen, setVaultModalOpen] = React.useState(false);
  const [vaultModalMode, setVaultModalMode] = React.useState<"view" | "create">("view");
  const [securityModalOpen, setSecurityModalOpen] = React.useState(false);
  const [adminModalOpen, setAdminModalOpen] = React.useState(false);
  const [cashFlowModalOpen, setCashFlowModalOpen] = React.useState(false);
  const [requestsModalOpen, setRequestsModalOpen] = React.useState(false);
  const [complianceModalOpen, setComplianceModalOpen] = React.useState(false);

  const [activeNav, setActiveNav] = React.useState("home");

  const fullName = currentProfile?.full_name || "Aarav Sharma";
  const userEmail = currentProfile?.email || "aarav.sharma@example.com";

  const userAccount = React.useMemo<Account>(() => {
    const initials = fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      id: currentProfile?.id || "user-active",
      name: fullName,
      email: userEmail,
      initials,
      plan: "KYC Verified",
    };
  }, [currentProfile?.id, fullName, userEmail]);

  const openUpi = React.useCallback(() => setUpiModalOpen(true), []);
  const openAddFunds = React.useCallback(() => setAddFundsModalOpen(true), []);
  const openBankCard = React.useCallback((tab: "card" | "bank" = "card") => {
    setBankModalTab(tab);
    setBankModalOpen(true);
  }, []);
  const openPassbook = React.useCallback((txId?: string) => {
    setPassbookInitialTxnId(txId || null);
    setPassbookModalOpen(true);
  }, []);
  const openPockets = React.useCallback((mode: "view" | "create" = "view") => {
    setPocketsModalMode(mode);
    setPocketsModalOpen(true);
  }, []);
  const openGoals = React.useCallback((mode: "view" | "create" = "view") => {
    setVaultModalMode(mode);
    setVaultModalOpen(true);
  }, []);
  const openSecurity = React.useCallback(() => setSecurityModalOpen(true), []);
  const openAdmin = React.useCallback(() => setAdminModalOpen(true), []);
  const openCashFlow = React.useCallback(() => setCashFlowModalOpen(true), []);
  const openRequests = React.useCallback(() => setRequestsModalOpen(true), []);

  // Memoize widget definitions so modal toggles never reconstruct the WidgetGrid schema
  const dashboardWidgets = React.useMemo<WidgetGridItem[]>(
    () => [
      {
        id: "balance",
        title: "Available Balance",
        icon: <Wallet className="size-4 text-[#00D632]" />,
        defaultSpan: 4,
        render: () => (
          <BalanceActionTile
            onOpenUPI={openUpi}
            onOpenBankCard={() => openBankCard("card")}
            onOpenAddFunds={openAddFunds}
          />
        ),
      },
      {
        id: "virtual-card",
        title: "RuPay Platinum Card",
        icon: <CreditCard className="size-4 text-purple-400" />,
        defaultSpan: 2,
        render: () => <VirtualCardTile />,
      },
      {
        id: "expenditure",
        title: "Money Usage & Expenditure Analysis",
        icon: <TrendingUp className="size-4 text-[#00D632]" />,
        defaultSpan: 4,
        render: () => <ExpenditureMetricTile onOpenCashFlow={openCashFlow} />,
      },
      {
        id: "bank-card-quick",
        title: "Direct Clearing: Bank & Card",
        icon: <Building2 className="size-4 text-sky-400" />,
        defaultSpan: 2,
        render: () => (
          <BankCardQuickTile
            onOpenCardTransfer={() => openBankCard("card")}
            onOpenBankTransfer={() => openBankCard("bank")}
          />
        ),
      },
      {
        id: "passbook",
        title: "Passbook & Transaction Stream",
        icon: <History className="size-4 text-amber-400" />,
        defaultSpan: 3,
        render: () => <TransactionHistoryTile onOpenPassbook={openPassbook} />,
      },
      {
        id: "pockets-goals",
        title: "Smart Pockets & Savings Vault",
        icon: <FolderHeart className="size-4 text-rose-400" />,
        defaultSpan: 3,
        render: () => <PocketsGoalsTile onOpenPockets={openPockets} onOpenGoals={openGoals} />,
      },
    ],
    [openUpi, openBankCard, openAddFunds, openCashFlow, openPassbook, openPockets, openGoals]
  );

  const profileMenuItems = React.useMemo(
    () => [
      {
        label: "My UPI QR & ID Card",
        icon: <Zap className="size-4 text-[#00D632]" />,
        value: "3D Flip",
        onSelect: () => setProfileModalOpen(true),
      },
      {
        label: "Bank & Card Transfers",
        icon: <CreditCard className="size-4 text-purple-400" />,
        value: "IMPS/NEFT",
        onSelect: () => openBankCard("card"),
      },
      {
        label: "Add Wallet Balance",
        icon: <Plus className="size-4 text-[#00D632]" />,
        value: "Cards/UPI",
        onSelect: openAddFunds,
      },
      {
        label: "Passbook & Ledger",
        icon: <History className="size-4 text-amber-400" />,
        value: "Statement",
        onSelect: () => openPassbook(),
      },
      {
        label: "Smart Pockets",
        icon: <FolderHeart className="size-4 text-rose-400" />,
        value: "Buckets",
        onSelect: () => openPockets("view"),
      },
      {
        label: "Savings Vault",
        icon: <Target className="size-4 text-amber-400" />,
        value: "3.2% p.a.",
        onSelect: () => openGoals("view"),
      },
      {
        label: "Requests, Split & Autopay",
        icon: <CalendarClock className="size-4 text-purple-400" />,
        value: "Bills/Links",
        onSelect: openRequests,
      },
      {
        label: "Cash Flow & Budgets",
        icon: <PieChart className="size-4 text-[#00D632]" />,
        value: "Forecast",
        onSelect: openCashFlow,
      },
      {
        label: "Security PIN & KYC",
        icon: <Shield className="size-4 text-sky-400" />,
        value: "PIN / MFA",
        onSelect: openSecurity,
      },
      ...(isAdminOrStaff
        ? [
            {
              label: "Admin Back Office",
              icon: <ShieldAlert className="size-4 text-rose-400" />,
              value: "Ops Console",
              onSelect: openAdmin,
            },
          ]
        : []),
    ],
    [openBankCard, openAddFunds, openPassbook, openPockets, openGoals, openRequests, openCashFlow, openSecurity, openAdmin, isAdminOrStaff]
  );

  const handleNavClick = React.useCallback(
    (key: string) => {
      setActiveNav(key);
      if (key === "transfers") {
        openUpi();
      } else if (key === "bank-card") {
        openBankCard("card");
      } else if (key === "add-balance") {
        openAddFunds();
      } else if (key === "passbook") {
        openPassbook();
      } else if (key === "pockets") {
        openPockets("view");
      } else if (key === "goals") {
        openGoals("view");
      } else if (key === "requests") {
        openRequests();
      } else if (key === "cashflow") {
        openCashFlow();
      } else if (key === "security") {
        openSecurity();
      } else if (key === "admin") {
        openAdmin();
      }
    },
    [openUpi, openBankCard, openAddFunds, openPassbook, openPockets, openGoals, openRequests, openCashFlow, openSecurity, openAdmin]
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-black text-white font-sans antialiased selection:bg-[#00D632] selection:text-black">
        {/* Sidebar Navigation */}
        <Sidebar
          collapsible="icon"
          className="border-r border-white/10 bg-zinc-950/85 backdrop-blur-2xl transition-all"
        >
          <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:py-3.5 border-b border-white/10">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#00D632] text-black font-extrabold text-lg shadow-lg shadow-[#00D632]/25">
                ₹
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-display font-extrabold text-base tracking-tight text-white leading-tight">
                  Cash
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Fintech India</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase px-2 mb-2 group-data-[collapsible=icon]:hidden">
                Payments & Services
              </SidebarGroupLabel>
              <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "home"}
                    onClick={() => handleNavClick("home")}
                    tooltip="Homepage"
                    className="cursor-pointer"
                  >
                    <Home className="size-[18px] shrink-0" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "transfers"}
                    onClick={() => handleNavClick("transfers")}
                    onMouseEnter={() => void loadUPIModal()}
                    tooltip="Pay via UPI"
                    className="cursor-pointer"
                  >
                    <Send className="size-[18px] shrink-0 text-[#00D632]" />
                    <span>Pay via UPI</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "bank-card"}
                    onClick={() => handleNavClick("bank-card")}
                    onMouseEnter={() => void loadBankCardModal()}
                    tooltip="Bank & Card Pay"
                    className="cursor-pointer"
                  >
                    <CreditCard className="size-[18px] shrink-0 text-purple-400" />
                    <span>Bank & Card Pay</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "add-balance"}
                    onClick={() => handleNavClick("add-balance")}
                    onMouseEnter={() => void loadAddBalanceModal()}
                    tooltip="Add Balance"
                    className="cursor-pointer"
                  >
                    <Plus className="size-[18px] shrink-0 text-[#00D632]" />
                    <span>Add Balance</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "passbook"}
                    onClick={() => handleNavClick("passbook")}
                    onMouseEnter={() => void loadPassbookModal()}
                    tooltip="Passbook"
                    className="cursor-pointer"
                  >
                    <History className="size-[18px] shrink-0 text-amber-400" />
                    <span>Passbook</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "pockets"}
                    onClick={() => handleNavClick("pockets")}
                    onMouseEnter={() => void loadPocketsModal()}
                    tooltip="Smart Pockets"
                    className="cursor-pointer"
                  >
                    <Layers className="size-[18px] shrink-0 text-emerald-400" />
                    <span>Smart Pockets</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "goals"}
                    onClick={() => handleNavClick("goals")}
                    onMouseEnter={() => void loadVaultModal()}
                    tooltip="Savings Vault"
                    className="cursor-pointer"
                  >
                    <Target className="size-[18px] shrink-0 text-rose-400" />
                    <span>Savings Vault</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "requests"}
                    onClick={() => handleNavClick("requests")}
                    onMouseEnter={() => void loadRequestsAutopayModal()}
                    tooltip="Requests, Split & Autopay"
                    className="cursor-pointer"
                  >
                    <CalendarClock className="size-[18px] shrink-0 text-purple-400" />
                    <span>Requests & Autopay</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "cashflow"}
                    onClick={() => handleNavClick("cashflow")}
                    onMouseEnter={() => void loadCashFlowModal()}
                    tooltip="Cash Flow & Budgets"
                    className="cursor-pointer"
                  >
                    <PieChart className="size-[18px] shrink-0 text-[#00D632]" />
                    <span>Cash Flow & Budgets</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeNav === "security"}
                    onClick={() => handleNavClick("security")}
                    onMouseEnter={() => void loadSecurityModal()}
                    tooltip="Security PIN & Ledger"
                    className="cursor-pointer"
                  >
                    <Shield className="size-[18px] shrink-0 text-sky-400" />
                    <span>Security & PIN</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isAdminOrStaff && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeNav === "admin"}
                      onClick={() => handleNavClick("admin")}
                      onMouseEnter={() => void loadAdminModal()}
                      tooltip="Admin Back Office"
                      className="cursor-pointer"
                    >
                      <ShieldAlert className="size-[18px] shrink-0 text-amber-400" />
                      <span>Back Office</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:py-3 border-t border-white/10">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSignOutDialogOpen(true)}
                  tooltip="Log Out"
                  className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="size-[18px] shrink-0" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-1 flex-col bg-black overflow-y-auto overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/85 px-3 sm:px-4 md:px-8 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer" />
              <div className="hidden sm:block">
                <h1 className="font-display text-sm font-semibold text-white tracking-tight">
                  Dashboard
                </h1>
                <p className="text-[11px] text-zinc-400">
                  Welcome back, <span className="text-zinc-200 font-medium">{fullName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={openUpi}
                onMouseEnter={() => void loadUPIModal()}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-semibold shadow-md shadow-[#00D632]/20 transition-all cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                <span>Pay via UPI</span>
              </button>

              <button
                type="button"
                onClick={() => openBankCard("card")}
                onMouseEnter={() => void loadBankCardModal()}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-medium transition-all cursor-pointer active:scale-95"
              >
                <CreditCard className="size-3.5 text-purple-400" />
                <span>Bank / Card Pay</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label="View notifications"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  onMouseEnter={() => void loadNotificationStack()}
                  className="relative flex size-9 items-center justify-center rounded-full border border-white/15 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer shadow-sm"
                >
                  <Bell className="size-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#00D632] text-[10px] font-mono font-extrabold text-black flex items-center justify-center ring-2 ring-black">
                      {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] sm:hidden"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 w-auto sm:w-96 rounded-3xl border border-white/20 bg-zinc-950/95 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl animate-in fade-in-0 zoom-in-95">
                      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-tight">Notifications</h4>
                          <p className="text-[10px] text-zinc-400">Bills, autopay & money requests</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotificationsOpen(false)}
                          className="rounded-full p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <React.Suspense
                        fallback={
                          <div className="space-y-2 py-2">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-16 w-full rounded-2xl" />
                          </div>
                        }
                      >
                        <NotificationStack />
                      </React.Suspense>
                    </div>
                  </>
                )}
              </div>

              <ProfileDropdown
                accounts={[userAccount]}
                defaultAccountId={userAccount.id}
                onOpenQR={() => setProfileModalOpen(true)}
                onSignOut={signOutUser}
                holdDuration={900}
                items={profileMenuItems}
              />
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  Financial Overview
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setComplianceModalOpen(true)}
                onMouseEnter={() => void loadComplianceDialog()}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex size-2 rounded-full bg-[#00D632]" />
                <span className="font-mono text-[11px] underline underline-offset-2 decoration-white/20">
                  Simulation · No Real Money · Disclosure
                </span>
              </button>
            </div>

            <div className="w-full">
              <WidgetGrid
                items={dashboardWidgets}
                defaultLayout={INITIAL_LAYOUT}
                rowHeight={260}
                className="max-w-none"
              />
            </div>
          </main>
        </SidebarInset>

        {/* Lazy-loaded Modals (only loaded when opened) */}
        {upiModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <UPIPaymentModal open={upiModalOpen} onClose={() => setUpiModalOpen(false)} />
          </React.Suspense>
        )}

        {bankModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <BankCardTransferModal
              open={bankModalOpen}
              onClose={() => setBankModalOpen(false)}
              defaultTab={bankModalTab}
            />
          </React.Suspense>
        )}

        {addFundsModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <AddBalanceModal open={addFundsModalOpen} onClose={() => setAddFundsModalOpen(false)} />
          </React.Suspense>
        )}

        {passbookModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <PassbookModal
              open={passbookModalOpen}
              onClose={() => setPassbookModalOpen(false)}
              initialTransactionId={passbookInitialTxnId}
            />
          </React.Suspense>
        )}

        {pocketsModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <PocketsManagerModal
              open={pocketsModalOpen}
              onClose={() => setPocketsModalOpen(false)}
              defaultMode={pocketsModalMode}
            />
          </React.Suspense>
        )}

        {vaultModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <SavingsVaultModal
              open={vaultModalOpen}
              onClose={() => setVaultModalOpen(false)}
              defaultMode={vaultModalMode}
            />
          </React.Suspense>
        )}

        {securityModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <SecurityPinModal
              open={securityModalOpen}
              onClose={() => setSecurityModalOpen(false)}
            />
          </React.Suspense>
        )}

        {isAdminOrStaff && adminModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <AdminBackOfficeModal
              open={adminModalOpen}
              onClose={() => setAdminModalOpen(false)}
            />
          </React.Suspense>
        )}

        {cashFlowModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <CashFlowBudgetsModal
              open={cashFlowModalOpen}
              onClose={() => setCashFlowModalOpen(false)}
            />
          </React.Suspense>
        )}

        {requestsModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <RequestsAutopayModal
              open={requestsModalOpen}
              onClose={() => setRequestsModalOpen(false)}
            />
          </React.Suspense>
        )}

        {complianceModalOpen && (
          <React.Suspense fallback={<ModalLoadingFallback />}>
            <ComplianceDialog
              open={complianceModalOpen}
              onClose={() => setComplianceModalOpen(false)}
            />
          </React.Suspense>
        )}

        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-[4px] animate-in fade-in-0"
              onClick={() => setProfileModalOpen(false)}
            />
            <div className="relative z-50 animate-in zoom-in-95 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="absolute -top-10 right-0 rounded-full p-2 text-zinc-400 hover:text-white bg-zinc-900/80 border border-white/10 cursor-pointer"
              >
                <X className="size-4" />
              </button>
              <React.Suspense fallback={<Skeleton className="w-80 h-96 rounded-3xl" />}>
                <ProfileQRCard isModal={true} />
              </React.Suspense>
            </div>
          </div>
        )}

        <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out of Cash?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be securely signed out of your session. Your encrypted wallet keys and session tokens will be cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => signOutUser()}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
              >
                Confirm Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
}
export default DashboardHome;
