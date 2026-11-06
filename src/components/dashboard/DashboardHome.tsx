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
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import WidgetGrid, { WidgetGridItem, WidgetLayoutItem } from "@/components/kokonutui/widget-grid";
import NotificationStack from "@/components/kokonutui/notification-stack";
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

// Dashboard tiles
import { BalanceActionTile } from "@/components/dashboard/BalanceActionTile";
import { VirtualCardTile } from "@/components/dashboard/VirtualCardTile";
import { ExpenditureMetricTile } from "@/components/dashboard/ExpenditureMetricTile";
import { BankCardQuickTile } from "@/components/dashboard/BankCardQuickTile";
import { TransactionHistoryTile } from "@/components/dashboard/TransactionHistoryTile";
import { PocketsGoalsTile } from "@/components/dashboard/PocketsGoalsTile";
import { ProfileQRCard } from "@/components/dashboard/ProfileQRCard";

// Modals
import { UPIPaymentModal } from "@/components/dashboard/UPIPaymentModal";
import { AddBalanceModal } from "@/components/dashboard/AddBalanceModal";
import { BankCardTransferModal } from "@/components/dashboard/BankCardTransferModal";
import { PassbookModal } from "@/components/dashboard/PassbookModal";
import { PocketsManagerModal } from "@/components/dashboard/PocketsManagerModal";
import { SavingsVaultModal } from "@/components/dashboard/SavingsVaultModal";

export function DashboardHome() {
  const { currentProfile, signOutUser } = useWallet();

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

  // Active navigation tab
  const [activeNav, setActiveNav] = React.useState("home");

  const fullName = currentProfile?.full_name || "Aarav Sharma";
  const userEmail = currentProfile?.email || "aarav.sharma@example.com";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userAccount: Account = {
    id: currentProfile?.id || "user-active",
    name: fullName,
    email: userEmail,
    initials: initials,
    plan: "KYC Verified",
  };

  // Layout configuration for the 6-column WidgetGrid (QR card removed as requested)
  const initialLayout: WidgetLayoutItem[] = [
    { id: "balance", span: 4 },
    { id: "virtual-card", span: 2 },
    { id: "expenditure", span: 4 },
    { id: "bank-card-quick", span: 2 },
    { id: "passbook", span: 3 },
    { id: "pockets-goals", span: 3 },
  ];

  // Definition of the 6 dashboard tiles
  const dashboardWidgets: WidgetGridItem[] = [
    {
      id: "balance",
      title: "Available Balance",
      icon: <Wallet className="size-4 text-[#00D632]" />,
      defaultSpan: 4,
      render: () => (
        <BalanceActionTile
          onOpenUPI={() => setUpiModalOpen(true)}
          onOpenBankCard={() => {
            setBankModalTab("card");
            setBankModalOpen(true);
          }}
          onOpenAddFunds={() => setAddFundsModalOpen(true)}
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
      render: () => <ExpenditureMetricTile />,
    },
    {
      id: "bank-card-quick",
      title: "Direct Clearing: Bank & Card",
      icon: <Building2 className="size-4 text-sky-400" />,
      defaultSpan: 2,
      render: () => (
        <BankCardQuickTile
          onOpenCardTransfer={() => {
            setBankModalTab("card");
            setBankModalOpen(true);
          }}
          onOpenBankTransfer={() => {
            setBankModalTab("bank");
            setBankModalOpen(true);
          }}
        />
      ),
    },
    {
      id: "passbook",
      title: "Passbook & Transaction Stream",
      icon: <History className="size-4 text-amber-400" />,
      defaultSpan: 3,
      render: () => (
        <TransactionHistoryTile
          onOpenPassbook={(txId) => {
            setPassbookInitialTxnId(txId || null);
            setPassbookModalOpen(true);
          }}
        />
      ),
    },
    {
      id: "pockets-goals",
      title: "Smart Pockets & Savings Vault",
      icon: <FolderHeart className="size-4 text-rose-400" />,
      defaultSpan: 3,
      render: () => (
        <PocketsGoalsTile
          onOpenPockets={(mode = "view") => {
            setPocketsModalMode(mode);
            setPocketsModalOpen(true);
          }}
          onOpenGoals={(mode = "view") => {
            setVaultModalMode(mode);
            setVaultModalOpen(true);
          }}
        />
      ),
    },
  ];

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    if (key === "transfers") {
      setUpiModalOpen(true);
    } else if (key === "bank-card") {
      setBankModalTab("card");
      setBankModalOpen(true);
    } else if (key === "add-balance") {
      setAddFundsModalOpen(true);
    } else if (key === "passbook") {
      setPassbookInitialTxnId(null);
      setPassbookModalOpen(true);
    } else if (key === "pockets") {
      setPocketsModalMode("view");
      setPocketsModalOpen(true);
    } else if (key === "goals") {
      setVaultModalMode("view");
      setVaultModalOpen(true);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-black text-white font-sans antialiased selection:bg-[#00D632] selection:text-black">
        {/* Sidebar Navigation */}
        <Sidebar
          collapsible="icon"
          className="border-r border-white/10 bg-zinc-950/85 backdrop-blur-2xl transition-all"
        >
          {/* Sidebar Header Brand */}
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

          {/* Sidebar Navigation Links */}
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
                    tooltip="Savings Vault"
                    className="cursor-pointer"
                  >
                    <Target className="size-[18px] shrink-0 text-rose-400" />
                    <span>Savings Vault</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* Sidebar Footer with Sign Out */}
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
          {/* Header Bar */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/85 px-3 sm:px-4 md:px-8 backdrop-blur-2xl">
            {/* Left section: Toggle & Greeting */}
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

            {/* Right section: Quick actions, notifications, and Kokonut UI AccountMenu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick UPI Pay Button */}
              <button
                type="button"
                onClick={() => setUpiModalOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D632] hover:bg-[#00D632]/90 text-black text-xs font-semibold shadow-md shadow-[#00D632]/20 transition-all cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                <span>Pay via UPI</span>
              </button>

              {/* Quick Bank/Card Transfer Button */}
              <button
                type="button"
                onClick={() => {
                  setBankModalTab("card");
                  setBankModalOpen(true);
                }}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-medium transition-all cursor-pointer active:scale-95"
              >
                <CreditCard className="size-3.5 text-purple-400" />
                <span>Bank / Card Pay</span>
              </button>

              {/* Notification Bell with unread dot & dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="View notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative flex size-9 items-center justify-center rounded-full border border-white/15 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer shadow-sm"
                >
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#00D632] ring-2 ring-black" />
                </button>

                {/* Notifications Dropdown Panel (Responsive: fixed full-width ribbon on mobile, anchored on desktop) */}
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

                      <NotificationStack />
                    </div>
                  </>
                )}
              </div>

              {/* Kokonut UI AccountMenu: Combined with 3D CardFlip QR modal */}
              <ProfileDropdown
                accounts={[userAccount]}
                defaultAccountId={userAccount.id}
                onOpenQR={() => setProfileModalOpen(true)}
                onSignOut={() => signOutUser()}
                holdDuration={900}
                items={[
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
                    onSelect: () => {
                      setBankModalTab("card");
                      setBankModalOpen(true);
                    },
                  },
                  {
                    label: "Add Wallet Balance",
                    icon: <Plus className="size-4 text-[#00D632]" />,
                    value: "Cards/UPI",
                    onSelect: () => setAddFundsModalOpen(true),
                  },
                  {
                    label: "Passbook & Ledger",
                    icon: <History className="size-4 text-amber-400" />,
                    value: "Statement",
                    onSelect: () => {
                      setPassbookInitialTxnId(null);
                      setPassbookModalOpen(true);
                    },
                  },
                  {
                    label: "Smart Pockets",
                    icon: <FolderHeart className="size-4 text-rose-400" />,
                    value: "Buckets",
                    onSelect: () => {
                      setPocketsModalMode("view");
                      setPocketsModalOpen(true);
                    },
                  },
                  {
                    label: "Savings Vault",
                    icon: <Target className="size-4 text-amber-400" />,
                    value: "3.2% p.a.",
                    onSelect: () => {
                      setVaultModalMode("view");
                      setVaultModalOpen(true);
                    },
                  },
                ]}
              />
            </div>
          </header>

          {/* Main Content: Kokonut UI WidgetGrid */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
            {/* Page Sub-header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  Financial Overview
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="flex size-2 rounded-full bg-[#00D632]" />
                <span className="font-mono text-[11px]">NPCI 24x7 FastUPI Live</span>
              </div>
            </div>

            {/* Widget Grid Container */}
            <div className="w-full">
              <WidgetGrid
                items={dashboardWidgets}
                defaultLayout={initialLayout}
                rowHeight={260}
                className="max-w-none"
              />
            </div>
          </main>
        </SidebarInset>

        {/* Modal: Pay via UPI with AmountPad */}
        <UPIPaymentModal
          open={upiModalOpen}
          onClose={() => setUpiModalOpen(false)}
        />

        {/* Modal: Direct Bank Account & Card Number Transfer with Swipe to Confirm */}
        <BankCardTransferModal
          open={bankModalOpen}
          onClose={() => setBankModalOpen(false)}
          defaultTab={bankModalTab}
        />

        {/* Modal: Add Balance with FieldDemo Form */}
        <AddBalanceModal
          open={addFundsModalOpen}
          onClose={() => setAddFundsModalOpen(false)}
        />

        {/* Modal: Interactive Passbook Ledger */}
        <PassbookModal
          open={passbookModalOpen}
          onClose={() => setPassbookModalOpen(false)}
          initialTransactionId={passbookInitialTxnId}
        />

        {/* Modal: Smart Pockets Manager */}
        <PocketsManagerModal
          open={pocketsModalOpen}
          onClose={() => setPocketsModalOpen(false)}
          defaultMode={pocketsModalMode}
        />

        {/* Modal: Savings Vault & Goals Manager */}
        <SavingsVaultModal
          open={vaultModalOpen}
          onClose={() => setVaultModalOpen(false)}
          defaultMode={vaultModalMode}
        />

        {/* Modal: Personal Profile & QR 3D CardFlip (triggered from Account Menu) */}
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
              <ProfileQRCard isModal={true} />
            </div>
          </div>
        )}

        {/* Sign Out Confirmation Dialog */}
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
