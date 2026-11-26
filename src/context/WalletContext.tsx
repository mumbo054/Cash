import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { supabase, hasStoredAuthSession } from '@/lib/supabase';
import {
  clearAllCache,
  generateIdempotencyKey,
  getCachedValue,
  invalidateCachePrefix,
  runSingleFlight,
  setCachedValue,
  withMutationLock,
} from '@/lib/cache';
import {
  AppRole,
  Profile,
  DirectoryProfile,
  Wallet,
  Pocket,
  SavingsGoal,
  Budget,
  Transaction,
  TransactionCursor,
  SecurityStatus,
  LedgerEntryRecord,
  TransferQuote,
  SavedPayee,
  PaymentRequestRecord,
  ScheduledPaymentRecord,
  DisputeRecord,
  KycDocumentRecord,
  NotificationRecord,
  NotificationPreferences,
  UserSessionRecord,
  Json,
} from '@/types/database.types';

// Explicit column projections so queries only fetch fields actually rendered in the UI
export const PROFILE_COLUMNS = 'id, full_name, email, phone, upi_id, kyc_status, tier';
export const DIRECTORY_PROFILE_COLUMNS = 'id, full_name, email, phone, upi_id';
export const WALLET_COLUMNS = 'id, user_id, wallet_number, currency, balance, is_frozen, daily_limit';
export const POCKET_COLUMNS =
  'id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked, auto_save_pct, created_at';
export const GOAL_COLUMNS =
  'id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status, round_up_enabled, created_at';
export const BUDGET_COLUMNS =
  'id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, rollover_enabled, rollover_amount, last_alert_pct, is_active, start_date, end_date';
export const TRANSACTION_COLUMNS =
  'id, reference_id, utr_number, type, amount, currency, category, status, tx_kind, reversal_of, fee_amount, gst_amount, risk_score, counterparty_name, counterparty_upi_id, description, settled_at, created_at';

export const TRANSACTIONS_PAGE_SIZE = 25;
const USER_DATA_CACHE_TTL_MS = 15_000;
const DIRECTORY_CACHE_TTL_MS = 60_000;

interface CachedUserBundle {
  profile: Profile | null;
  wallet: Wallet | null;
  pockets: Pocket[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  transactions: Transaction[];
  hasMoreTransactions: boolean;
  roles: AppRole[];
  securityStatus: SecurityStatus | null;
  payees: SavedPayee[];
  paymentRequests: PaymentRequestRecord[];
  scheduledPayments: ScheduledPaymentRecord[];
  disputes: DisputeRecord[];
  kycDocuments: KycDocumentRecord[];
  notifications: NotificationRecord[];
  notificationPrefs: NotificationPreferences | null;
  deviceSessions: UserSessionRecord[];
}

/**
 * Builds deterministic PostgREST keyset filter expression for (created_at, id) DESC pagination.
 */
export function buildKeysetFilter(cursor: TransactionCursor): string {
  return `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`;
}

/**
 * Pure helper to merge and deduplicate newly paginated transactions by ID.
 */
export function appendUniqueTransactions(
  existing: Transaction[],
  incoming: Transaction[]
): Transaction[] {
  if (incoming.length === 0) return existing;
  const seen = new Set(existing.map((t) => t.id));
  const merged = [...existing];
  for (const tx of incoming) {
    if (!seen.has(tx.id)) {
      seen.add(tx.id);
      merged.push(tx);
    }
  }
  return merged;
}

interface WalletContextType {
  profiles: DirectoryProfile[];
  currentProfile: Profile | null;
  currentWallet: Wallet | null;
  pockets: Pocket[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  transactions: Transaction[];
  userRoles: AppRole[];
  isAdminOrStaff: boolean;
  securityStatus: SecurityStatus | null;
  payees: SavedPayee[];
  paymentRequests: PaymentRequestRecord[];
  scheduledPayments: ScheduledPaymentRecord[];
  disputes: DisputeRecord[];
  kycDocuments: KycDocumentRecord[];
  notifications: NotificationRecord[];
  unreadNotificationsCount: number;
  notificationPrefs: NotificationPreferences | null;
  deviceSessions: UserSessionRecord[];
  isLoading: boolean;
  isSessionRestoring: boolean;
  isLoadingMoreTransactions: boolean;
  hasMoreTransactions: boolean;
  error: string | null;

  switchUser: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  refreshSecurityStatus: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  searchDirectoryUsers: (query: string) => Promise<DirectoryProfile[]>;
  fetchLedgerEntries: (limit?: number) => Promise<LedgerEntryRecord[]>;
  previewTransferQuote: (recipientIdentifier: string, amount: number, rail?: 'upi' | 'card' | 'imps_payout') => Promise<TransferQuote | null>;
  upsertPayee: (data: {
    payeeIdentifier: string;
    payeeName: string;
    upiId?: string;
    nickname?: string;
    isFavourite?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  togglePayeeFavourite: (payeeId: string) => Promise<void>;
  deletePayee: (payeeId: string) => Promise<boolean>;
  createPaymentRequest: (data: {
    payerIdentifier: string;
    amount: number;
    note?: string;
    expiresHours?: number;
  }) => Promise<{ success: boolean; error?: string; referenceId?: string }>;
  respondPaymentRequest: (
    requestId: string,
    action: 'pay' | 'decline' | 'cancel',
    pin?: string
  ) => Promise<{ success: boolean; error?: string; pinRequired?: boolean }>;
  createScheduledPayment: (data: {
    recipientIdentifier: string;
    recipientName: string;
    amount: number;
    category?: string;
    description?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  }) => Promise<{ success: boolean; error?: string }>;
  updateScheduledPaymentStatus: (scheduledId: string, status: 'active' | 'paused' | 'completed') => Promise<boolean>;
  runScheduledPaymentNow: (scheduledId: string) => Promise<{ success: boolean; error?: string }>;
  claimCashback: (transactionId: string) => Promise<{ success: boolean; rewardAmount?: number; error?: string }>;
  updateTransactionCategory: (transactionId: string, newCategory: string, learnMerchant?: boolean) => Promise<boolean>;
  upsertBudget: (data: {
    category: string;
    amountLimit: number;
    period?: 'monthly' | 'weekly';
    alertThresholdPct?: number;
    rolloverEnabled?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteBudget: (budgetId: string) => Promise<boolean>;
  updatePocketAutomation: (pocketId: string, autoSavePct: number) => Promise<boolean>;
  updateGoalAutomation: (goalId: string, roundUpEnabled: boolean) => Promise<boolean>;
  submitKycDocument: (data: {
    docType: 'pan' | 'aadhaar_masked' | 'passport' | 'driving_license';
    docNumberMasked: string;
    fullLegalName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  submitDispute: (data: { transactionId: string; reason: string; details?: string }) => Promise<{ success: boolean; error?: string }>;
  markNotificationsRead: (ids?: string[]) => Promise<void>;
  updateNotificationPrefs: (prefs: Partial<Omit<NotificationPreferences, 'user_id' | 'updated_at'>>) => Promise<void>;
  revokeDeviceSessions: (sessionId?: string) => Promise<boolean>;
  exportAccountData: () => Promise<{ success: boolean; data?: Record<string, Json>; error?: string }>;
  requestAccountClosure: (reason: string) => Promise<{ success: boolean; error?: string }>;
  setTransactionPin: (data: {
    newPin: string;
    currentPin?: string;
    threshold?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  verifyTransactionPin: (pin: string) => Promise<{ success: boolean; error?: string; locked?: boolean }>;
  sendMoney: (data: {
    recipientUpiOrPhone: string;
    recipientName: string;
    amount: number;
    category?: string;
    description?: string;
    idempotencyKey?: string;
    pin?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
    isInternal?: boolean;
    recipientName?: string;
    referenceId?: string;
    utrNumber?: string;
    feeAmount?: number;
    gstAmount?: number;
    transactionId?: string;
    pinRequired?: boolean;
    pinLocked?: boolean;
  }>;
  addFunds: (
    amount: number,
    description?: string,
    idempotencyKey?: string
  ) => Promise<{ success: boolean; error?: string }>;
  toggleWalletFreeze: () => Promise<boolean>;
  allocateToPocket: (pocketId: string, amount: number) => Promise<boolean>;
  withdrawFromPocket: (pocketId: string, amount: number) => Promise<boolean>;
  contributeToGoal: (goalId: string, amount: number) => Promise<boolean>;
  withdrawFromGoal: (goalId: string, amount: number) => Promise<boolean>;
  createPocket: (data: {
    name: string;
    icon: string;
    color: string;
    targetAmount?: number;
  }) => Promise<boolean>;
  createGoal: (data: {
    title: string;
    targetAmount: number;
    category: string;
    targetDate?: string;
  }) => Promise<boolean>;
  signInWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpNewUser: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getFriendlyErrorMessage(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message || '');
  if (!msg) return fallback;
  if (msg.toLowerCase().includes('timed out') || msg.toLowerCase().includes('abort')) {
    return 'Network request timed out. Please check your connection and try again.';
  }
  return msg;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userRoles, setUserRoles] = useState<AppRole[]>(['user']);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [payees, setPayees] = useState<SavedPayee[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestRecord[]>([]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPaymentRecord[]>([]);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [kycDocuments, setKycDocuments] = useState<KycDocumentRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [deviceSessions, setDeviceSessions] = useState<UserSessionRecord[]>([]);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] = useState(false);
  const [isSessionRestoring, setIsSessionRestoring] = useState<boolean>(() => hasStoredAuthSession());
  const [isLoading, setIsLoading] = useState<boolean>(() => hasStoredAuthSession());
  const [error, setError] = useState<string | null>(null);

  const currentUserIdRef = useRef<string | null>(null);
  const walletRef = useRef<Wallet | null>(null);
  const pocketsRef = useRef<Pocket[]>([]);
  const goalsRef = useRef<SavingsGoal[]>([]);
  const transactionsRef = useRef<Transaction[]>([]);

  walletRef.current = currentWallet;
  pocketsRef.current = pockets;
  goalsRef.current = savingsGoals;
  transactionsRef.current = transactions;

  const isAdminOrStaff = useMemo(
    () => userRoles.some((r) => r === 'admin' || r === 'support' || r === 'risk_analyst'),
    [userRoles]
  );
  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read_at).length,
    [notifications]
  );

  // Load contact directory with SWR caching + single-flight deduplication
  const loadUsers = useCallback(async (force = false) => {
    const cacheKey = 'directory:profiles';
    if (!force) {
      const cached = getCachedValue<DirectoryProfile[]>(cacheKey, DIRECTORY_CACHE_TTL_MS);
      if (cached) {
        setProfiles(cached);
        return;
      }
    }

    try {
      const list = await runSingleFlight<DirectoryProfile[]>(cacheKey, async () => {
        const { data: rpcProfiles, error: rpcErr } = await supabase.rpc('search_cash_users', {
          p_query: '',
        });
        if (!rpcErr && rpcProfiles && rpcProfiles.length > 0) {
          return rpcProfiles as unknown as DirectoryProfile[];
        }

        const { data } = await supabase
          .from('profiles')
          .select(DIRECTORY_PROFILE_COLUMNS)
          .order('full_name', { ascending: true })
          .limit(50);

        return (data as unknown as DirectoryProfile[]) || [];
      });

      if (list.length > 0) {
        setCachedValue(cacheKey, list);
        setProfiles(list);
      }
    } catch (err) {
      console.warn('[Cash Directory] Could not load global directory:', getFriendlyErrorMessage(err, 'Unavailable'));
    }
  }, []);

  // Debounced server-side directory autocomplete search with SWR caching
  const searchDirectoryUsers = useCallback(async (query: string): Promise<DirectoryProfile[]> => {
    const trimmed = query.trim();
    const cacheKey = `directory:search:${trimmed.toLowerCase()}`;
    const cached = getCachedValue<DirectoryProfile[]>(cacheKey, DIRECTORY_CACHE_TTL_MS);
    if (cached) return cached;

    try {
      const results = await runSingleFlight<DirectoryProfile[]>(cacheKey, async () => {
        const { data: rpcProfiles, error: rpcErr } = await supabase.rpc('search_cash_users', {
          p_query: trimmed,
        });
        if (!rpcErr && rpcProfiles) {
          return rpcProfiles as unknown as DirectoryProfile[];
        }

        const { data } = await supabase
          .from('profiles')
          .select(DIRECTORY_PROFILE_COLUMNS)
          .ilike('full_name', `%${trimmed}%`)
          .order('full_name', { ascending: true })
          .limit(20);

        return (data as unknown as DirectoryProfile[]) || [];
      });

      setCachedValue(cacheKey, results);
      return results;
    } catch {
      return [];
    }
  }, []);

  const applyUserBundle = useCallback((bundle: CachedUserBundle) => {
    setCurrentProfile(bundle.profile);
    if (bundle.wallet) {
      setCurrentWallet(bundle.wallet);
    }
    setPockets(bundle.pockets);
    setSavingsGoals(bundle.savingsGoals);
    setBudgets(bundle.budgets);
    setTransactions(bundle.transactions);
    setHasMoreTransactions(bundle.hasMoreTransactions);
    setUserRoles(bundle.roles);
    setSecurityStatus(bundle.securityStatus);
    setPayees(bundle.payees);
    setPaymentRequests(bundle.paymentRequests);
    setScheduledPayments(bundle.scheduledPayments);
    setDisputes(bundle.disputes);
    setKycDocuments(bundle.kycDocuments);
    setNotifications(bundle.notifications);
    setNotificationPrefs(bundle.notificationPrefs);
    setDeviceSessions(bundle.deviceSessions);
  }, []);

  // Load all independent user queries in parallel with single-flight deduplication and SWR caching
  const loadUserData = useCallback(
    async (userId: string, profileObj?: Profile, options?: { force?: boolean }) => {
      const cacheKey = `userBundle:${userId}`;
      const force = options?.force ?? false;

      if (!force) {
        const cached = getCachedValue<CachedUserBundle>(cacheKey, USER_DATA_CACHE_TTL_MS);
        if (cached && currentUserIdRef.current === userId) {
          applyUserBundle(cached);
          setIsLoading(false);
          setIsSessionRestoring(false);
          return;
        }
      }

      currentUserIdRef.current = userId;
      setIsLoading(true);
      setError(null);

      try {
        const bundle = await runSingleFlight<CachedUserBundle>(cacheKey, async () => {
          const profilePromise = profileObj
            ? Promise.resolve({ data: profileObj, error: null })
            : supabase
                .from('profiles')
                .select(PROFILE_COLUMNS)
                .eq('id', userId)
                .maybeSingle();

          const walletPromise = supabase
            .from('wallets')
            .select(WALLET_COLUMNS)
            .eq('user_id', userId)
            .maybeSingle();

          const pocketsPromise = supabase
            .from('pockets')
            .select(POCKET_COLUMNS)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          const goalsPromise = supabase
            .from('savings_goals')
            .select(GOAL_COLUMNS)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          const budgetsPromise = supabase
            .from('budgets')
            .select(BUDGET_COLUMNS)
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('category', { ascending: true });

          const txPromise = supabase
            .from('transactions')
            .select(TRANSACTION_COLUMNS)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(TRANSACTIONS_PAGE_SIZE + 1);

          const rolesPromise = supabase.rpc('get_my_roles');
          const secPromise = supabase.rpc('get_my_security_status');

          const payeesPromise = supabase
            .from('payees')
            .select('id, user_id, payee_identifier, payee_name, upi_id, nickname, is_favourite, is_verified, is_active, cooling_until, created_at')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('is_favourite', { ascending: false })
            .order('created_at', { ascending: false });

          const reqPromise = supabase
            .from('payment_requests')
            .select('id, requester_id, payer_id, payer_identifier, amount, note, status, reference_id, settled_txn_id, expires_at, created_at')
            .or(`requester_id.eq.${userId},payer_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(30);

          const schedPromise = supabase
            .from('scheduled_payments')
            .select('id, user_id, recipient_identifier, recipient_name, amount, category, description, frequency, next_run_at, last_run_at, last_status, last_error, retry_count, status, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          const dispPromise = supabase
            .from('disputes')
            .select('id, user_id, transaction_id, reason, details, status, resolution_note, resolved_at, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          const kycPromise = supabase
            .from('kyc_documents')
            .select('id, user_id, doc_type, doc_number_masked, full_legal_name, status, rejection_reason, reviewed_at, submitted_at')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false });

          const notifPromise = supabase
            .from('notifications')
            .select('id, user_id, category, title, body, is_security_mandatory, metadata, read_at, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(40);

          const prefPromise = supabase
            .from('notification_preferences')
            .select('user_id, tx_alerts, budget_alerts, request_alerts, marketing_alerts, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

          const sessPromise = supabase
            .from('user_sessions')
            .select('id, user_id, device_fingerprint, device_label, user_agent, is_revoked, last_seen_at, created_at')
            .eq('user_id', userId)
            .eq('is_revoked', false)
            .order('last_seen_at', { ascending: false });

          const [
            pRes,
            wRes,
            pocRes,
            gRes,
            bRes,
            txRes,
            rRes,
            secRes,
            payeeRes,
            reqRes,
            schedRes,
            dispRes,
            kycRes,
            notifRes,
            prefRes,
            sessRes,
          ] = await Promise.all([
            profilePromise,
            walletPromise,
            pocketsPromise,
            goalsPromise,
            budgetsPromise,
            txPromise,
            rolesPromise,
            secPromise,
            payeesPromise,
            reqPromise,
            schedPromise,
            dispPromise,
            kycPromise,
            notifPromise,
            prefPromise,
            sessPromise,
          ]);

          const rawTx = (txRes.data as unknown as Transaction[]) || [];
          const hasMore = rawTx.length > TRANSACTIONS_PAGE_SIZE;
          const initialTx = hasMore ? rawTx.slice(0, TRANSACTIONS_PAGE_SIZE) : rawTx;

          const rolesList =
            !rRes.error && Array.isArray(rRes.data) && rRes.data.length > 0
              ? (rRes.data as AppRole[])
              : (['user'] as AppRole[]);

          const secData =
            !secRes.error && secRes.data && (secRes.data as { success?: boolean }).success
              ? (secRes.data as unknown as SecurityStatus)
              : null;

          return {
            profile: (pRes.data as unknown as Profile | null) || null,
            wallet: (wRes.data as unknown as Wallet | null) || null,
            pockets: (pocRes.data as unknown as Pocket[]) || [],
            savingsGoals: (gRes.data as unknown as SavingsGoal[]) || [],
            budgets: (bRes.data as unknown as Budget[]) || [],
            transactions: initialTx,
            hasMoreTransactions: hasMore,
            roles: rolesList,
            securityStatus: secData,
            payees: (payeeRes.data as unknown as SavedPayee[]) || [],
            paymentRequests: (reqRes.data as unknown as PaymentRequestRecord[]) || [],
            scheduledPayments: (schedRes.data as unknown as ScheduledPaymentRecord[]) || [],
            disputes: (dispRes.data as unknown as DisputeRecord[]) || [],
            kycDocuments: (kycRes.data as unknown as KycDocumentRecord[]) || [],
            notifications: (notifRes.data as unknown as NotificationRecord[]) || [],
            notificationPrefs: (prefRes.data as unknown as NotificationPreferences | null) || null,
            deviceSessions: (sessRes.data as unknown as UserSessionRecord[]) || [],
          };
        });

        setCachedValue(cacheKey, bundle);
        applyUserBundle(bundle);
      } catch (err) {
        console.error('Failed to load user data:', err);
        setError(getFriendlyErrorMessage(err, 'Failed to load wallet data.'));
      } finally {
        setIsLoading(false);
        setIsSessionRestoring(false);
      }
    },
    [applyUserBundle]
  );

  const refreshSecurityStatus = useCallback(async () => {
    try {
      const { data, error: secErr } = await supabase.rpc('get_my_security_status');
      if (!secErr && data && (data as { success?: boolean }).success) {
        setSecurityStatus(data as unknown as SecurityStatus);
      }
    } catch {
      // Ignore silent refresh error
    }
  }, []);

  const setTransactionPin = useCallback(
    async ({ newPin, currentPin, threshold = 2000 }: { newPin: string; currentPin?: string; threshold?: number }) => {
      const lockOutcome = await withMutationLock('security:setPin', async () => {
        try {
          const { data, error: rpcErr } = await supabase.rpc('set_transaction_pin', {
            p_new_pin: newPin,
            p_current_pin: currentPin || null,
            p_threshold: threshold,
          });
          if (rpcErr) throw rpcErr;
          if (!data || data.success === false) {
            return { success: false, error: data?.error || 'Failed to update Transaction PIN.' };
          }
          await refreshSecurityStatus();
          if (currentUserIdRef.current) {
            invalidateCachePrefix(`userBundle:${currentUserIdRef.current}`);
          }
          return { success: true };
        } catch (err) {
          return { success: false, error: getFriendlyErrorMessage(err, 'Failed to update Transaction PIN.') };
        }
      });

      if (lockOutcome.locked) {
        return { success: false, error: 'PIN update already in progress.' };
      }
      return lockOutcome.result;
    },
    [refreshSecurityStatus]
  );

  const verifyTransactionPin = useCallback(
    async (pin: string) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('verify_transaction_pin', { p_pin: pin });
        if (rpcErr) throw rpcErr;
        await refreshSecurityStatus();
        return {
          success: Boolean(data?.success),
          error: data?.error,
          locked: Boolean(data?.locked),
        };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'PIN verification failed.') };
      }
    },
    [refreshSecurityStatus]
  );

  const fetchLedgerEntries = useCallback(async (limit = 50): Promise<LedgerEntryRecord[]> => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_my_ledger_entries', { p_limit: limit });
      if (rpcErr || !data || data.success === false) return [];
      return (data.entries as LedgerEntryRecord[]) || [];
    } catch {
      return [];
    }
  }, []);

  const previewTransferQuote = useCallback(
    async (
      recipientIdentifier: string,
      amount: number,
      rail: 'upi' | 'card' | 'imps_payout' = 'upi'
    ): Promise<TransferQuote | null> => {
      if (!recipientIdentifier.trim() || !amount || amount <= 0) return null;
      try {
        const { data, error: rpcErr } = await supabase.rpc('preview_transfer_quote', {
          p_recipient_identifier: recipientIdentifier.trim(),
          p_amount: amount,
          p_rail: rail,
        });
        if (rpcErr || !data || data.success === false) return null;
        return data as unknown as TransferQuote;
      } catch {
        return null;
      }
    },
    []
  );

  const upsertPayee = useCallback(
    async ({
      payeeIdentifier,
      payeeName,
      upiId,
      nickname,
      isFavourite = false,
    }: {
      payeeIdentifier: string;
      payeeName: string;
      upiId?: string;
      nickname?: string;
      isFavourite?: boolean;
    }) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('upsert_saved_payee', {
          p_payee_identifier: payeeIdentifier,
          p_payee_name: payeeName,
          p_upi_id: upiId || null,
          p_nickname: nickname || null,
          p_is_favourite: isFavourite,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) return { success: false, error: data?.error || 'Could not save payee' };
        if (data.payee) {
          const saved = data.payee as SavedPayee;
          setPayees((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Failed to save payee.') };
      }
    },
    []
  );

  // Optimistic toggle (updates UI before server responds, rolls back cleanly on error)
  const togglePayeeFavourite = useCallback(async (payeeId: string) => {
    setPayees((prev) => prev.map((p) => (p.id === payeeId ? { ...p, is_favourite: !p.is_favourite } : p)));
    try {
      const { data, error: rpcErr } = await supabase.rpc('toggle_payee_favourite', { p_payee_id: payeeId });
      if (rpcErr || !data || data.success === false) {
        setPayees((prev) => prev.map((p) => (p.id === payeeId ? { ...p, is_favourite: !p.is_favourite } : p)));
      }
    } catch {
      setPayees((prev) => prev.map((p) => (p.id === payeeId ? { ...p, is_favourite: !p.is_favourite } : p)));
    }
  }, []);

  const deletePayee = useCallback(async (payeeId: string) => {
    const prevSnapshot = payees;
    setPayees((prev) => prev.filter((p) => p.id !== payeeId));
    try {
      const { data, error: rpcErr } = await supabase.rpc('delete_saved_payee', { p_payee_id: payeeId });
      if (rpcErr || !data || data.success === false) {
        setPayees(prevSnapshot);
        return false;
      }
      return true;
    } catch {
      setPayees(prevSnapshot);
      return false;
    }
  }, [payees]);

  const createPaymentRequest = useCallback(
    async ({
      payerIdentifier,
      amount,
      note,
      expiresHours = 48,
    }: {
      payerIdentifier: string;
      amount: number;
      note?: string;
      expiresHours?: number;
    }) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('create_payment_request', {
          p_payer_identifier: payerIdentifier,
          p_amount: amount,
          p_note: note || null,
          p_expires_hours: expiresHours,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) {
          return { success: false, error: data?.error || 'Could not create request' };
        }
        if (data.request) {
          setPaymentRequests((prev) => [data.request as PaymentRequestRecord, ...prev]);
        }
        return { success: true, referenceId: data.request?.reference_id };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Failed to create payment request.') };
      }
    },
    []
  );

  const respondPaymentRequest = useCallback(
    async (requestId: string, action: 'pay' | 'decline' | 'cancel', pin?: string) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('respond_payment_request', {
          p_request_id: requestId,
          p_action: action,
          p_pin: pin || null,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) {
          return { success: false, error: data?.error || 'Action failed', pinRequired: Boolean(data?.pin_required) };
        }
        if (currentUserIdRef.current) {
          invalidateCachePrefix(`userBundle:${currentUserIdRef.current}`);
          await loadUserData(currentUserIdRef.current, undefined, { force: true });
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Request action failed.') };
      }
    },
    []
  );

  const createScheduledPayment = useCallback(
    async ({
      recipientIdentifier,
      recipientName,
      amount,
      category = 'utilities',
      description,
      frequency,
    }: {
      recipientIdentifier: string;
      recipientName: string;
      amount: number;
      category?: string;
      description?: string;
      frequency: 'daily' | 'weekly' | 'monthly';
    }) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('create_scheduled_payment', {
          p_recipient_identifier: recipientIdentifier,
          p_recipient_name: recipientName,
          p_amount: amount,
          p_category: category,
          p_description: description || null,
          p_frequency: frequency,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) return { success: false, error: data?.error || 'Failed to schedule payment' };
        if (data.scheduled_payment) {
          setScheduledPayments((prev) => [data.scheduled_payment as ScheduledPaymentRecord, ...prev]);
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Failed to create autopay mandate.') };
      }
    },
    []
  );

  const updateScheduledPaymentStatus = useCallback(
    async (scheduledId: string, status: 'active' | 'paused' | 'completed') => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('update_scheduled_payment_status', {
          p_scheduled_id: scheduledId,
          p_status: status,
        });
        if (rpcErr || !data || data.success === false) return false;
        setScheduledPayments((prev) =>
          prev.map((s) => (s.id === scheduledId ? { ...s, status } : s))
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const runScheduledPaymentNow = useCallback(async (scheduledId: string) => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('run_my_scheduled_payment_now', {
        p_scheduled_id: scheduledId,
      });
      if (rpcErr) throw rpcErr;
      if (!data || data.success === false) return { success: false, error: data?.error || 'Autopay execution failed' };
      if (currentUserIdRef.current) {
        invalidateCachePrefix(`userBundle:${currentUserIdRef.current}`);
        await loadUserData(currentUserIdRef.current, undefined, { force: true });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err, 'Failed to execute autopay.') };
    }
  }, []);

  const claimCashback = useCallback(async (transactionId: string) => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('claim_transaction_cashback', {
        p_transaction_id: transactionId,
      });
      if (rpcErr) throw rpcErr;
      if (!data || data.success === false) return { success: false, error: data?.error || 'Not eligible for cashback' };
      if (data.new_balance !== undefined) {
        setCurrentWallet((prev) => (prev ? { ...prev, balance: Number(data.new_balance) } : null));
      }
      if (data.transaction) {
        setTransactions((prev) => appendUniqueTransactions([data.transaction as Transaction], prev));
      }
      return { success: true, rewardAmount: Number(data.reward_amount || 0) };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err, 'Cashback claim failed.') };
    }
  }, []);

  const updateTransactionCategory = useCallback(
    async (transactionId: string, newCategory: string, learnMerchant = true) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('update_transaction_category', {
          p_transaction_id: transactionId,
          p_new_category: newCategory,
          p_learn_merchant: learnMerchant,
        });
        if (rpcErr || !data || data.success === false) return false;
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? { ...t, category: newCategory as Transaction['category'] } : t))
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const upsertBudget = useCallback(
    async ({
      category,
      amountLimit,
      period = 'monthly',
      alertThresholdPct = 80,
      rolloverEnabled = false,
    }: {
      category: string;
      amountLimit: number;
      period?: 'monthly' | 'weekly';
      alertThresholdPct?: number;
      rolloverEnabled?: boolean;
    }) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('upsert_budget', {
          p_category: category,
          p_amount_limit: amountLimit,
          p_period: period,
          p_alert_threshold_pct: alertThresholdPct,
          p_rollover_enabled: rolloverEnabled,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) return { success: false, error: data?.error || 'Failed to save budget' };
        if (data.budget) {
          const b = data.budget as Budget;
          setBudgets((prev) => [b, ...prev.filter((x) => x.id !== b.id && x.category !== b.category)]);
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Failed to save budget.') };
      }
    },
    []
  );

  const deleteBudget = useCallback(async (budgetId: string) => {
    const prevSnapshot = budgets;
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    try {
      const { data, error: rpcErr } = await supabase.rpc('delete_budget', { p_budget_id: budgetId });
      if (rpcErr || !data || data.success === false) {
        setBudgets(prevSnapshot);
        return false;
      }
      return true;
    } catch {
      setBudgets(prevSnapshot);
      return false;
    }
  }, [budgets]);

  const updatePocketAutomation = useCallback(async (pocketId: string, autoSavePct: number) => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('update_pocket_automation', {
        p_pocket_id: pocketId,
        p_auto_save_pct: autoSavePct,
      });
      if (rpcErr || !data || data.success === false) return false;
      setPockets((prev) => prev.map((p) => (p.id === pocketId ? { ...p, auto_save_pct: autoSavePct } : p)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateGoalAutomation = useCallback(async (goalId: string, roundUpEnabled: boolean) => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('update_goal_automation', {
        p_goal_id: goalId,
        p_round_up_enabled: roundUpEnabled,
      });
      if (rpcErr || !data || data.success === false) return false;
      setSavingsGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, round_up_enabled: roundUpEnabled } : g)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const submitKycDocument = useCallback(
    async ({
      docType,
      docNumberMasked,
      fullLegalName,
    }: {
      docType: 'pan' | 'aadhaar_masked' | 'passport' | 'driving_license';
      docNumberMasked: string;
      fullLegalName: string;
    }) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('submit_kyc_document', {
          p_doc_type: docType,
          p_doc_number_masked: docNumberMasked,
          p_full_legal_name: fullLegalName,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) return { success: false, error: data?.error || 'Failed to submit KYC' };
        if (data.document) {
          setKycDocuments((prev) => [data.document as KycDocumentRecord, ...prev]);
        }
        setCurrentProfile((prev) => (prev ? { ...prev, kyc_status: 'pending' } : null));
        return { success: true };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Failed to submit KYC document.') };
      }
    },
    []
  );

  const submitDispute = useCallback(
    async ({ transactionId, reason, details }: { transactionId: string; reason: string; details?: string }) => {
      try {
        const { data, error: rpcErr } = await supabase.rpc('submit_dispute', {
          p_transaction_id: transactionId,
          p_reason: reason,
          p_details: details || null,
        });
        if (rpcErr) throw rpcErr;
        if (!data || data.success === false) return { success: false, error: data?.error || 'Failed to submit dispute' };
        if (data.dispute) {
          setDisputes((prev) => [data.dispute as DisputeRecord, ...prev]);
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: getFriendlyErrorMessage(err, 'Failed to file dispute.') };
      }
    },
    []
  );

  // Optimistic notification read acknowledgement (updates badge & read state immediately before DB round-trip)
  const markNotificationsRead = useCallback(async (ids?: string[]) => {
    const nowIso = new Date().toISOString();
    const targetSet = ids ? new Set(ids) : null;
    setNotifications((prev) =>
      prev.map((n) => (!targetSet || targetSet.has(n.id) ? { ...n, read_at: n.read_at || nowIso } : n))
    );
    try {
      await supabase.rpc('mark_notifications_read', { p_ids: ids || null });
    } catch {
      // keep non-fatal optimistic state
    }
  }, []);

  const updateNotificationPrefs = useCallback(
    async (prefs: Partial<Omit<NotificationPreferences, 'user_id' | 'updated_at'>>) => {
      const uid = currentUserIdRef.current;
      if (!uid) return;
      const merged: NotificationPreferences = {
        user_id: uid,
        tx_alerts: prefs.tx_alerts ?? notificationPrefs?.tx_alerts ?? true,
        budget_alerts: prefs.budget_alerts ?? notificationPrefs?.budget_alerts ?? true,
        request_alerts: prefs.request_alerts ?? notificationPrefs?.request_alerts ?? true,
        marketing_alerts: prefs.marketing_alerts ?? notificationPrefs?.marketing_alerts ?? true,
      };
      setNotificationPrefs(merged);
      try {
        await supabase.from('notification_preferences').upsert(merged, { onConflict: 'user_id' });
      } catch {
        // non-blocking
      }
    },
    [notificationPrefs]
  );

  const revokeDeviceSessions = useCallback(async (sessionId?: string) => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('revoke_device_sessions', {
        p_session_id: sessionId || null,
      });
      if (rpcErr || !data || data.success === false) return false;
      if (!sessionId) {
        setDeviceSessions([]);
        await supabase.auth.signOut({ scope: 'global' });
      } else {
        setDeviceSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportAccountData = useCallback(async () => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('export_my_account_data');
      if (rpcErr) throw rpcErr;
      if (!data || data.success === false) return { success: false, error: data?.error || 'Export failed' };
      return { success: true, data: data.export as Record<string, Json> };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err, 'Failed to export data.') };
    }
  }, []);

  const requestAccountClosure = useCallback(async (reason: string) => {
    try {
      const { data, error: rpcErr } = await supabase.rpc('request_account_closure', { p_reason: reason });
      if (rpcErr) throw rpcErr;
      if (!data || data.success === false) return { success: false, error: data?.error || 'Closure request failed' };
      setCurrentWallet((prev) => (prev ? { ...prev, is_frozen: true } : null));
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err, 'Closure request failed.') };
    }
  }, []);

  // Keyset cursor pagination for older transactions
  const loadMoreTransactions = useCallback(async () => {
    const userId = currentUserIdRef.current;
    const currentList = transactionsRef.current;
    if (!userId || isLoadingMoreTransactions || !hasMoreTransactions || currentList.length === 0) {
      return;
    }

    const lastTx = currentList[currentList.length - 1];
    const cursor: TransactionCursor = { created_at: lastTx.created_at, id: lastTx.id };

    setIsLoadingMoreTransactions(true);
    try {
      const page = await runSingleFlight(`txPage:${userId}:${cursor.created_at}:${cursor.id}`, async () => {
        const { data, error: txErr } = await supabase
          .from('transactions')
          .select(TRANSACTION_COLUMNS)
          .eq('user_id', userId)
          .or(buildKeysetFilter(cursor))
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(TRANSACTIONS_PAGE_SIZE + 1);

        if (txErr) throw txErr;
        return (data as unknown as Transaction[]) || [];
      });

      const hasMore = page.length > TRANSACTIONS_PAGE_SIZE;
      const nextSlice = hasMore ? page.slice(0, TRANSACTIONS_PAGE_SIZE) : page;
      setTransactions((prev) => appendUniqueTransactions(prev, nextSlice));
      setHasMoreTransactions(hasMore);
    } catch (err) {
      console.error('Failed to paginate transactions:', err);
    } finally {
      setIsLoadingMoreTransactions(false);
    }
  }, [hasMoreTransactions, isLoadingMoreTransactions]);

  const switchUser = useCallback(
    async (userId: string) => {
      const target = profiles.find((p) => p.id === userId) as Profile | undefined;
      await loadUserData(userId, target, { force: true });
    },
    [profiles, loadUserData]
  );

  const refreshData = useCallback(async () => {
    if (currentUserIdRef.current) {
      invalidateCachePrefix(`userBundle:${currentUserIdRef.current}`);
      await loadUserData(currentUserIdRef.current, currentProfile || undefined, { force: true });
    }
  }, [currentProfile, loadUserData]);

  // Financial Transfer via atomic double-entry server RPC (with idempotency + PIN check)
  const sendMoney = useCallback(
    async ({
      recipientUpiOrPhone,
      recipientName,
      amount,
      category = 'peer_transfer',
      description,
      idempotencyKey,
      pin,
    }: {
      recipientUpiOrPhone: string;
      recipientName: string;
      amount: number;
      category?: string;
      description?: string;
      idempotencyKey?: string;
      pin?: string;
    }) => {
      const activeWallet = walletRef.current;
      if (!currentUserIdRef.current || !activeWallet) {
        return { success: false, error: 'No active wallet found' };
      }

      if (activeWallet.is_frozen) {
        return { success: false, error: 'Wallet is frozen. Unfreeze to make payments.' };
      }

      if (activeWallet.balance < amount) {
        return { success: false, error: `Insufficient funds. Available: ₹${activeWallet.balance}` };
      }

      const key = idempotencyKey || generateIdempotencyKey();
      const lockOutcome = await withMutationLock('sendMoney', async () => {
        try {
          const recipientTarget = recipientUpiOrPhone || recipientName;
          const transferDesc = description || `Paid ${recipientName || recipientUpiOrPhone} via Cash UPI`;

          const { data, error: rpcErr } = await supabase.rpc('execute_verified_transfer', {
            p_recipient_identifier: recipientTarget,
            p_amount: amount,
            p_category: category,
            p_description: transferDesc,
            p_idempotency_key: key,
            p_pin: pin || null,
          });

          if (rpcErr) {
            throw rpcErr;
          }

          if (data && data.success === false) {
            if (data.pin_required) {
              void refreshSecurityStatus();
            }
            return {
              success: false,
              error: data.error || 'Transfer failed.',
              pinRequired: Boolean(data.pin_required),
              pinLocked: Boolean(data.pin_locked),
            };
          }

          const newSenderBalance = Number(data.sender_balance);
          setCurrentWallet((prev) => (prev ? { ...prev, balance: newSenderBalance } : null));

          if (data.transaction) {
            setTransactions((prev) => appendUniqueTransactions([data.transaction as Transaction], prev));
          }

          invalidateCachePrefix(`userBundle:${currentUserIdRef.current}`);

          return {
            success: true,
            isInternal: data.is_internal,
            recipientName: data.recipient_name,
            referenceId: data.reference_id || key,
            utrNumber: data.utr_number,
            feeAmount: Number(data.fee_amount || 0),
            gstAmount: Number(data.gst_amount || 0),
            transactionId: data.transaction?.id,
          };
        } catch (err) {
          console.error('Send money error:', err);
          let errorMsg = getFriendlyErrorMessage(err, 'Transaction failed');
          if (errorMsg.includes('check constraint') || errorMsg.includes('transactions_category_check')) {
            errorMsg = 'Transaction failed: Invalid category or limit restriction.';
          }
          return { success: false, error: errorMsg };
        }
      });

      if (lockOutcome.locked) {
        return { success: false, error: 'Transfer already in progress. Please wait.' };
      }
      return lockOutcome.result;
    },
    [refreshSecurityStatus]
  );

  // Add Funds via atomic double-entry server RPC (with idempotency)
  const addFunds = useCallback(
    async (amount: number, description = 'Deposit via Net Banking / Card', idempotencyKey?: string) => {
      if (!currentUserIdRef.current || !walletRef.current) {
        return { success: false, error: 'No active wallet found' };
      }

      const requestKey = idempotencyKey || generateIdempotencyKey();

      const lockOutcome = await withMutationLock('addFunds', async () => {
        try {
          const { data, error: rpcErr } = await supabase.rpc('execute_wallet_topup', {
            p_amount: amount,
            p_description: description,
            p_idempotency_key: requestKey,
          });

          if (rpcErr) {
            throw rpcErr;
          }

          if (data && data.success === false) {
            return { success: false, error: data.error || 'Deposit failed.' };
          }

          const newBalance = Number(data.new_balance);
          setCurrentWallet((prev) => (prev ? { ...prev, balance: newBalance } : null));

          if (data.transaction) {
            setTransactions((prev) => appendUniqueTransactions([data.transaction as Transaction], prev));
          }

          invalidateCachePrefix(`userBundle:${currentUserIdRef.current}`);
          return { success: true };
        } catch (err) {
          console.error('Add funds error:', err);
          return { success: false, error: getFriendlyErrorMessage(err, 'Failed to add funds') };
        }
      });

      if (lockOutcome.locked) {
        return { success: false, error: 'Deposit already in progress. Please wait.' };
      }
      return lockOutcome.result;
    },
    []
  );

  // Toggle Wallet Freeze via secure server RPC (Optimistic UI with safe rollback)
  const toggleWalletFreeze = useCallback(async (): Promise<boolean> => {
    const activeWallet = walletRef.current;
    if (!activeWallet) return false;

    const prevFrozen = activeWallet.is_frozen;
    const nextState = !prevFrozen;

    const lockOutcome = await withMutationLock(`freeze:${activeWallet.id}`, async () => {
      setCurrentWallet((prev) => (prev ? { ...prev, is_frozen: nextState } : null));

      try {
        const { data, error: fErr } = await supabase.rpc('toggle_wallet_freeze');
        if (fErr || !data || data.success === false) {
          throw fErr || new Error(data?.error || 'Failed to update wallet lock');
        }
        setCurrentWallet((prev) => (prev ? { ...prev, is_frozen: Boolean(data.is_frozen) } : null));
        invalidateCachePrefix(`userBundle:${activeWallet.user_id}`);
        return true;
      } catch {
        setCurrentWallet((prev) => (prev ? { ...prev, is_frozen: prevFrozen } : null));
        return false;
      }
    });

    return lockOutcome.locked ? false : lockOutcome.result;
  }, []);

  // Move money into sub-wallet Pocket via atomic double-entry RPC (Optimistic UI with rollback)
  const allocateToPocket = useCallback(async (pocketId: string, amount: number): Promise<boolean> => {
    const activeWallet = walletRef.current;
    const targetPocket = pocketsRef.current.find((p) => p.id === pocketId);
    if (!activeWallet || !targetPocket || activeWallet.balance < amount || amount <= 0) return false;

    const prevWalletBal = activeWallet.balance;
    const prevPocketBal = targetPocket.balance;
    const newWalletBalance = Number((prevWalletBal - amount).toFixed(2));
    const newPocketBalance = Number((prevPocketBal + amount).toFixed(2));

    const lockOutcome = await withMutationLock(`pocket:${pocketId}`, async () => {
      setCurrentWallet((prev) => (prev ? { ...prev, balance: newWalletBalance } : null));
      setPockets((prev) =>
        prev.map((p) => (p.id === pocketId ? { ...p, balance: newPocketBalance } : p))
      );

      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('move_pocket_funds', {
          p_pocket_id: pocketId,
          p_amount: amount,
          p_direction: 'allocate',
        });

        if (rpcErr || !rpcRes || rpcRes.success === false) {
          throw rpcErr || new Error(rpcRes?.error || 'Failed to allocate');
        }

        invalidateCachePrefix(`userBundle:${activeWallet.user_id}`);
        return true;
      } catch {
        setCurrentWallet((prev) => (prev ? { ...prev, balance: prevWalletBal } : null));
        setPockets((prev) =>
          prev.map((p) => (p.id === pocketId ? { ...p, balance: prevPocketBal } : p))
        );
        return false;
      }
    });

    return lockOutcome.locked ? false : lockOutcome.result;
  }, []);

  // Withdraw money from sub-wallet Pocket via atomic double-entry RPC (Optimistic UI with rollback)
  const withdrawFromPocket = useCallback(async (pocketId: string, amount: number): Promise<boolean> => {
    const activeWallet = walletRef.current;
    const targetPocket = pocketsRef.current.find((p) => p.id === pocketId);
    if (!activeWallet || !targetPocket || targetPocket.balance < amount || amount <= 0) return false;

    const prevWalletBal = activeWallet.balance;
    const prevPocketBal = targetPocket.balance;
    const newWalletBalance = Number((prevWalletBal + amount).toFixed(2));
    const newPocketBalance = Number((prevPocketBal - amount).toFixed(2));

    const lockOutcome = await withMutationLock(`pocket:${pocketId}`, async () => {
      setCurrentWallet((prev) => (prev ? { ...prev, balance: newWalletBalance } : null));
      setPockets((prev) =>
        prev.map((p) => (p.id === pocketId ? { ...p, balance: newPocketBalance } : p))
      );

      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('move_pocket_funds', {
          p_pocket_id: pocketId,
          p_amount: amount,
          p_direction: 'withdraw',
        });

        if (rpcErr || !rpcRes || rpcRes.success === false) {
          throw rpcErr || new Error(rpcRes?.error || 'Failed to withdraw');
        }

        invalidateCachePrefix(`userBundle:${activeWallet.user_id}`);
        return true;
      } catch {
        setCurrentWallet((prev) => (prev ? { ...prev, balance: prevWalletBal } : null));
        setPockets((prev) =>
          prev.map((p) => (p.id === pocketId ? { ...p, balance: prevPocketBal } : p))
        );
        return false;
      }
    });

    return lockOutcome.locked ? false : lockOutcome.result;
  }, []);

  // Contribute to Savings Goal via atomic double-entry RPC (Optimistic UI with rollback)
  const contributeToGoal = useCallback(async (goalId: string, amount: number): Promise<boolean> => {
    const activeWallet = walletRef.current;
    const targetGoal = goalsRef.current.find((g) => g.id === goalId);
    if (!activeWallet || !targetGoal || activeWallet.balance < amount || amount <= 0) return false;

    const prevWalletBal = activeWallet.balance;
    const prevGoalAmount = targetGoal.current_amount;
    const prevStatus = targetGoal.status;
    const newWalletBal = Number((prevWalletBal - amount).toFixed(2));
    const newGoalAmount = Number((prevGoalAmount + amount).toFixed(2));
    const nextStatus = newGoalAmount >= targetGoal.target_amount ? 'achieved' : 'in_progress';

    const lockOutcome = await withMutationLock(`goal:${goalId}`, async () => {
      setCurrentWallet((prev) => (prev ? { ...prev, balance: newWalletBal } : null));
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.id === goalId ? { ...g, current_amount: newGoalAmount, status: nextStatus } : g
        )
      );

      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('move_goal_funds', {
          p_goal_id: goalId,
          p_amount: amount,
          p_direction: 'contribute',
        });

        if (rpcErr || !rpcRes || rpcRes.success === false) {
          throw rpcErr || new Error(rpcRes?.error || 'Failed to contribute');
        }

        invalidateCachePrefix(`userBundle:${activeWallet.user_id}`);
        return true;
      } catch {
        setCurrentWallet((prev) => (prev ? { ...prev, balance: prevWalletBal } : null));
        setSavingsGoals((prev) =>
          prev.map((g) =>
            g.id === goalId ? { ...g, current_amount: prevGoalAmount, status: prevStatus } : g
          )
        );
        return false;
      }
    });

    return lockOutcome.locked ? false : lockOutcome.result;
  }, []);

  // Withdraw from Savings Goal via atomic double-entry RPC (Optimistic UI with rollback)
  const withdrawFromGoal = useCallback(async (goalId: string, amount: number): Promise<boolean> => {
    const activeWallet = walletRef.current;
    const targetGoal = goalsRef.current.find((g) => g.id === goalId);
    if (!activeWallet || !targetGoal || targetGoal.current_amount < amount || amount <= 0) return false;

    const prevWalletBal = activeWallet.balance;
    const prevGoalAmount = targetGoal.current_amount;
    const prevStatus = targetGoal.status;
    const newWalletBal = Number((prevWalletBal + amount).toFixed(2));
    const newGoalAmount = Number((prevGoalAmount - amount).toFixed(2));
    const nextStatus = newGoalAmount >= targetGoal.target_amount ? 'achieved' : 'in_progress';

    const lockOutcome = await withMutationLock(`goal:${goalId}`, async () => {
      setCurrentWallet((prev) => (prev ? { ...prev, balance: newWalletBal } : null));
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.id === goalId ? { ...g, current_amount: newGoalAmount, status: nextStatus } : g
        )
      );

      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('move_goal_funds', {
          p_goal_id: goalId,
          p_amount: amount,
          p_direction: 'withdraw',
        });

        if (rpcErr || !rpcRes || rpcRes.success === false) {
          throw rpcErr || new Error(rpcRes?.error || 'Failed to withdraw');
        }

        invalidateCachePrefix(`userBundle:${activeWallet.user_id}`);
        return true;
      } catch {
        setCurrentWallet((prev) => (prev ? { ...prev, balance: prevWalletBal } : null));
        setSavingsGoals((prev) =>
          prev.map((g) =>
            g.id === goalId ? { ...g, current_amount: prevGoalAmount, status: prevStatus } : g
          )
        );
        return false;
      }
    });

    return lockOutcome.locked ? false : lockOutcome.result;
  }, []);

  // Create new pocket via server RPC
  const createPocket = useCallback(
    async (data: { name: string; icon: string; color: string; targetAmount?: number }) => {
      const activeWallet = walletRef.current;
      const userId = currentUserIdRef.current;
      if (!userId || !activeWallet) return false;

      const lockOutcome = await withMutationLock('createPocket', async () => {
        try {
          const { data: res, error: pErr } = await supabase.rpc('create_pocket', {
            p_name: data.name,
            p_icon: data.icon,
            p_color: data.color,
            p_target_amount: data.targetAmount || null,
          });

          if (pErr || !res || res.success === false) throw pErr || new Error(res?.error || 'Failed');
          if (res.pocket) {
            setPockets((prev) => [res.pocket as Pocket, ...prev]);
            invalidateCachePrefix(`userBundle:${userId}`);
          }
          return true;
        } catch {
          return false;
        }
      });

      return lockOutcome.locked ? false : lockOutcome.result;
    },
    []
  );

  // Create new savings goal via server RPC
  const createGoal = useCallback(
    async (data: { title: string; targetAmount: number; category: string; targetDate?: string }) => {
      const activeWallet = walletRef.current;
      const userId = currentUserIdRef.current;
      if (!userId || !activeWallet) return false;

      const lockOutcome = await withMutationLock('createGoal', async () => {
        try {
          const { data: res, error: gErr } = await supabase.rpc('create_savings_goal', {
            p_title: data.title,
            p_target_amount: data.targetAmount,
            p_category: data.category,
            p_target_date: data.targetDate || null,
          });

          if (gErr || !res || res.success === false) throw gErr || new Error(res?.error || 'Failed');
          if (res.goal) {
            setSavingsGoals((prev) => [res.goal as SavingsGoal, ...prev]);
            invalidateCachePrefix(`userBundle:${userId}`);
          }
          return true;
        } catch {
          return false;
        }
      });

      return lockOutcome.locked ? false : lockOutcome.result;
    },
    []
  );

  const signInWithCredentials = useCallback(
    async (email: string, password: string) => {
      const lockOutcome = await withMutationLock('auth:login', async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { data, error: authErr } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (authErr || !data.user) {
            const msg = authErr?.message?.toLowerCase().includes('invalid')
              ? 'Incorrect login credentials. Please check your login ID and password.'
              : authErr?.message || 'Incorrect login credentials.';
            setError(msg);
            return { success: false, error: msg };
          }

          await Promise.all([
            loadUserData(data.user.id, undefined, { force: true }),
            loadUsers(),
          ]);
          return { success: true };
        } catch (err) {
          const msg = getFriendlyErrorMessage(err, 'Incorrect login credentials.');
          setError(msg);
          return { success: false, error: msg };
        } finally {
          setIsLoading(false);
        }
      });

      if (lockOutcome.locked) {
        return { success: false, error: 'Login already in progress.' };
      }
      return lockOutcome.result;
    },
    [loadUserData, loadUsers]
  );

  const signUpNewUser = useCallback(
    async ({
      email,
      password,
      fullName,
      phone,
    }: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
    }) => {
      const lockOutcome = await withMutationLock('auth:signup', async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { data, error: rpcErr } = await supabase.rpc('create_cash_account', {
            p_email: email.trim().toLowerCase(),
            p_password: password,
            p_full_name: fullName.trim(),
            p_phone: phone?.trim() || null,
          });

          if (rpcErr) {
            setError(rpcErr.message);
            return { success: false, error: rpcErr.message };
          }

          if (data && (data as { success?: boolean; error?: string }).success === false) {
            const msg = (data as { error?: string }).error || 'Failed to create account.';
            setError(msg);
            return { success: false, error: msg };
          }

          const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (authErr || !authData?.user) {
            const msg = authErr?.message || 'Account created. Please log in with your credentials.';
            setError(msg);
            return { success: false, error: msg };
          }

          await Promise.all([
            loadUserData(authData.user.id, undefined, { force: true }),
            loadUsers(true),
          ]);
          return { success: true };
        } catch (err) {
          const msg = getFriendlyErrorMessage(err, 'Failed to create account.');
          setError(msg);
          return { success: false, error: msg };
        } finally {
          setIsLoading(false);
        }
      });

      if (lockOutcome.locked) {
        return { success: false, error: 'Account creation already in progress.' };
      }
      return lockOutcome.result;
    },
    [loadUserData, loadUsers]
  );

  const resetSessionState = useCallback(() => {
    currentUserIdRef.current = null;
    clearAllCache();
    setCurrentProfile(null);
    setCurrentWallet(null);
    setPockets([]);
    setSavingsGoals([]);
    setBudgets([]);
    setTransactions([]);
    setUserRoles(['user']);
    setSecurityStatus(null);
    setPayees([]);
    setPaymentRequests([]);
    setScheduledPayments([]);
    setDisputes([]);
    setKycDocuments([]);
    setNotifications([]);
    setNotificationPrefs(null);
    setDeviceSessions([]);
    setHasMoreTransactions(false);
    setIsLoading(false);
    setIsSessionRestoring(false);
  }, []);

  const signOutUser = useCallback(async () => {
    await supabase.auth.signOut();
    resetSessionState();
  }, [resetSessionState]);

  const registerCurrentDeviceSession = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      let fp = window.localStorage.getItem('cash_device_fp');
      if (!fp) {
        fp = generateIdempotencyKey();
        window.localStorage.setItem('cash_device_fp', fp);
      }
      const ua = navigator.userAgent || '';
      const label = ua.includes('Mobile') ? 'Mobile Browser' : ua.includes('Mac') ? 'macOS Web' : ua.includes('Windows') ? 'Windows Web' : 'Web Browser';
      await supabase.rpc('register_device_session', {
        p_device_fingerprint: fp,
        p_device_label: label,
        p_user_agent: ua.slice(0, 200),
      });
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const attachRealtime = (uid: string) => {
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
      }
      realtimeChannel = supabase
        .channel(`cash-user-${uid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
          (payload) => {
            const row = payload.new as NotificationRecord;
            setNotifications((prev) => [row, ...prev.filter((n) => n.id !== row.id)]);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${uid}` },
          (payload) => {
            const w = payload.new as Wallet;
            setCurrentWallet((prev) => (prev ? { ...prev, ...w } : w));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'payment_requests', filter: `payer_id=eq.${uid}` },
          (payload) => {
            const req = payload.new as PaymentRequestRecord;
            if (req?.id) {
              setPaymentRequests((prev) => [req, ...prev.filter((r) => r.id !== req.id)]);
            }
          }
        )
        .subscribe();
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          Promise.all([loadUserData(session.user.id), loadUsers(), registerCurrentDeviceSession()]);
          attachRealtime(session.user.id);
        } else {
          setIsLoading(false);
          setIsSessionRestoring(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
        setIsSessionRestoring(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        await Promise.all([loadUserData(session.user.id), registerCurrentDeviceSession()]);
        attachRealtime(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        if (realtimeChannel) {
          void supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
        resetSessionState();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
      }
    };
  }, [loadUserData, loadUsers, resetSessionState, registerCurrentDeviceSession]);

  const contextValue = useMemo<WalletContextType>(
    () => ({
      profiles,
      currentProfile,
      currentWallet,
      pockets,
      savingsGoals,
      budgets,
      transactions,
      userRoles,
      isAdminOrStaff,
      securityStatus,
      payees,
      paymentRequests,
      scheduledPayments,
      disputes,
      kycDocuments,
      notifications,
      unreadNotificationsCount,
      notificationPrefs,
      deviceSessions,
      isLoading,
      isSessionRestoring,
      isLoadingMoreTransactions,
      hasMoreTransactions,
      error,
      switchUser,
      refreshData,
      refreshSecurityStatus,
      loadMoreTransactions,
      searchDirectoryUsers,
      fetchLedgerEntries,
      previewTransferQuote,
      upsertPayee,
      togglePayeeFavourite,
      deletePayee,
      createPaymentRequest,
      respondPaymentRequest,
      createScheduledPayment,
      updateScheduledPaymentStatus,
      runScheduledPaymentNow,
      claimCashback,
      updateTransactionCategory,
      upsertBudget,
      deleteBudget,
      updatePocketAutomation,
      updateGoalAutomation,
      submitKycDocument,
      submitDispute,
      markNotificationsRead,
      updateNotificationPrefs,
      revokeDeviceSessions,
      exportAccountData,
      requestAccountClosure,
      setTransactionPin,
      verifyTransactionPin,
      sendMoney,
      addFunds,
      toggleWalletFreeze,
      allocateToPocket,
      withdrawFromPocket,
      contributeToGoal,
      withdrawFromGoal,
      createPocket,
      createGoal,
      signInWithCredentials,
      signUpNewUser,
      signOutUser,
    }),
    [
      profiles,
      currentProfile,
      currentWallet,
      pockets,
      savingsGoals,
      budgets,
      transactions,
      userRoles,
      isAdminOrStaff,
      securityStatus,
      payees,
      paymentRequests,
      scheduledPayments,
      disputes,
      kycDocuments,
      notifications,
      unreadNotificationsCount,
      notificationPrefs,
      deviceSessions,
      isLoading,
      isSessionRestoring,
      isLoadingMoreTransactions,
      hasMoreTransactions,
      error,
      switchUser,
      refreshData,
      refreshSecurityStatus,
      loadMoreTransactions,
      searchDirectoryUsers,
      fetchLedgerEntries,
      previewTransferQuote,
      upsertPayee,
      togglePayeeFavourite,
      deletePayee,
      createPaymentRequest,
      respondPaymentRequest,
      createScheduledPayment,
      updateScheduledPaymentStatus,
      runScheduledPaymentNow,
      claimCashback,
      updateTransactionCategory,
      upsertBudget,
      deleteBudget,
      updatePocketAutomation,
      updateGoalAutomation,
      submitKycDocument,
      submitDispute,
      markNotificationsRead,
      updateNotificationPrefs,
      revokeDeviceSessions,
      exportAccountData,
      requestAccountClosure,
      setTransactionPin,
      verifyTransactionPin,
      sendMoney,
      addFunds,
      toggleWalletFreeze,
      allocateToPocket,
      withdrawFromPocket,
      contributeToGoal,
      withdrawFromGoal,
      createPocket,
      createGoal,
      signInWithCredentials,
      signUpNewUser,
      signOutUser,
    ]
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
