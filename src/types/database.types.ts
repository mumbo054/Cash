export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type UserTier = 'basic' | 'standard' | 'premium' | 'pro';
export type AppRole = 'user' | 'support' | 'risk_analyst' | 'admin';
export type TransactionType = 'credit' | 'debit' | 'transfer_in' | 'transfer_out';
export type TransactionStatus = 'initiated' | 'pending' | 'completed' | 'failed' | 'reversed';
export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'refund'
  | 'food'
  | 'groceries'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'travel'
  | 'health'
  | 'education'
  | 'pocket_transfer'
  | 'goal_deposit'
  | 'peer_transfer'
  | 'reversal'
  | 'other';

export type GoalStatus = 'in_progress' | 'achieved' | 'paused' | 'cancelled';
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BudgetCategory =
  | 'food'
  | 'groceries'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'travel'
  | 'health'
  | 'education'
  | 'investments'
  | 'other';

export interface Profile {
  id: string; // matches auth.users UUID
  full_name: string;
  email: string;
  phone: string | null;
  upi_id?: string | null;
  avatar_url?: string | null;
  kyc_status: KycStatus;
  tier: UserTier;
  created_at?: string;
  updated_at?: string;
}

export interface DirectoryProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  upi_id?: string | null;
}

export interface Wallet {
  id: string;
  user_id: string;
  wallet_number: string;
  currency: 'INR';
  balance: number; // numeric(14,2)
  is_frozen: boolean;
  daily_limit: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pocket {
  id: string;
  user_id: string;
  wallet_id: string;
  name: string;
  icon: string;
  color: string;
  balance: number; // numeric(14,2)
  target_amount: number | null;
  is_locked: boolean;
  auto_save_pct?: number;
  created_at: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  wallet_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string;
  status: GoalStatus;
  round_up_enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: BudgetCategory;
  amount_limit: number;
  spent_amount: number;
  period: BudgetPeriod;
  alert_threshold_pct: number;
  rollover_enabled?: boolean;
  rollover_amount?: number;
  last_alert_pct?: number;
  is_active?: boolean;
  start_date: string;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  wallet_id?: string;
  pocket_id?: string | null;
  goal_id?: string | null;
  reference_id: string;
  utr_number?: string | null;
  type: TransactionType;
  amount: number; // numeric(14,2) in INR
  currency: 'INR';
  category: TransactionCategory;
  status: TransactionStatus;
  tx_kind?: string | null;
  reversal_of?: string | null;
  fee_amount?: number;
  gst_amount?: number;
  risk_score?: number;
  failure_reason?: string | null;
  counterparty_name: string | null;
  counterparty_upi_id: string | null;
  description: string | null;
  metadata?: Record<string, Json> | null;
  settled_at?: string | null;
  created_at: string;
}

export interface TransactionCursor {
  created_at: string;
  id: string;
}

export interface LedgerEntryRecord {
  id: string;
  journal_id: string;
  transaction_id: string | null;
  account_code: string;
  account_name: string;
  account_type: string;
  direction: 'debit' | 'credit';
  amount: number;
  running_balance: number;
  entry_type: string;
  reversal_of: string | null;
  description: string | null;
  created_at: string;
}

export interface SecurityStatus {
  has_pin: boolean;
  pin_threshold: number;
  failed_pin_attempts: number;
  pin_locked_until: string | null;
  is_locked: boolean;
  pin_updated_at: string | null;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  reason: string | null;
  metadata: Record<string, Json>;
  created_at: string;
  actor_email: string | null;
  target_email: string | null;
}

export interface AdminUserRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  upi_id: string | null;
  kyc_status: KycStatus;
  tier: UserTier;
  wallet_id: string | null;
  wallet_number: string | null;
  balance: number;
  is_frozen: boolean;
  daily_limit: number;
  roles: AppRole[];
}

export interface AdminOverviewData {
  kpis: {
    total_users: number;
    total_wallet_float: number;
    total_pocket_float: number;
    total_goal_float: number;
    treasury_balance: number;
    external_clearing_balance: number;
    total_transactions: number;
    frozen_wallets: number;
    reversed_transactions: number;
  };
  latest_reconciliation: {
    id: string;
    run_at: string;
    accounts_checked: number;
    mismatches_found: number;
    total_system_net: number;
  } | null;
  recent_transactions: Array<{
    id: string;
    reference_id: string;
    type: TransactionType;
    amount: number;
    category: string;
    status: TransactionStatus;
    tx_kind: string | null;
    counterparty_name: string | null;
    counterparty_upi_id: string | null;
    reversal_of: string | null;
    created_at: string;
    user_name: string;
    user_email: string;
  }>;
  recent_audits: AuditLogRecord[];
  limits_config: Array<{
    tier: UserTier;
    per_txn_limit: number;
    daily_limit: number;
    monthly_limit: number;
    max_wallet_balance: number;
    updated_at: string;
  }>;
}

export interface TransferQuote {
  amount: number;
  fee_amount: number;
  gst_amount: number;
  total_payable: number;
  tier: UserTier;
  per_txn_limit: number;
  daily_limit: number;
  daily_spent: number;
  monthly_limit: number;
  monthly_spent: number;
  cooling_off_active: boolean;
  cooling_until: string | null;
  cooling_cap: number;
  duplicate_recent: boolean;
  predicted_category: string;
  cashback_rate: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  risk_reasons: string[];
}

export interface SavedPayee {
  id: string;
  user_id: string;
  payee_identifier: string;
  payee_name: string;
  upi_id: string | null;
  nickname: string | null;
  is_favourite: boolean;
  is_verified: boolean;
  is_active: boolean;
  cooling_until: string;
  created_at: string;
}

export interface PaymentRequestRecord {
  id: string;
  requester_id: string;
  payer_id: string | null;
  payer_identifier: string;
  amount: number;
  note: string | null;
  status: 'pending' | 'paid' | 'declined' | 'expired' | 'cancelled';
  reference_id: string;
  settled_txn_id: string | null;
  expires_at: string;
  created_at: string;
}

export interface ScheduledPaymentRecord {
  id: string;
  user_id: string;
  recipient_identifier: string;
  recipient_name: string;
  amount: number;
  category: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  next_run_at: string;
  last_run_at: string | null;
  last_status: string | null;
  last_error: string | null;
  retry_count: number;
  status: 'active' | 'paused' | 'completed' | 'failed';
  created_at: string;
}

export interface DisputeRecord {
  id: string;
  user_id: string;
  transaction_id: string;
  reason: string;
  details: string | null;
  status: 'open' | 'under_review' | 'resolved_refunded' | 'rejected';
  resolution_note: string | null;
  resolved_at: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  txn_reference_id?: string;
  txn_amount?: number;
  txn_counterparty?: string | null;
}

export interface KycDocumentRecord {
  id: string;
  user_id: string;
  doc_type: 'pan' | 'aadhaar_masked' | 'passport' | 'driving_license';
  doc_number_masked: string;
  full_legal_name: string;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  user_name?: string;
  user_email?: string;
  current_tier?: UserTier;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  category: 'transaction' | 'security' | 'budget' | 'request' | 'kyc' | 'system' | 'reward';
  title: string;
  body: string;
  is_security_mandatory: boolean;
  metadata: Record<string, Json>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  tx_alerts: boolean;
  budget_alerts: boolean;
  request_alerts: boolean;
  marketing_alerts: boolean;
  updated_at?: string;
}

export interface UserSessionRecord {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_label: string;
  user_agent: string | null;
  is_revoked: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface AdminQueueData {
  kyc_documents: KycDocumentRecord[];
  disputes: DisputeRecord[];
  queue_metrics: {
    queue_name?: string;
    queue_length?: number;
    newest_msg_age_sec?: number;
    total_messages?: number;
  } | null;
}

// Database schema definition for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Wallet, 'id' | 'user_id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      pockets: {
        Row: Pocket;
        Insert: Omit<Pocket, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Pocket, 'id' | 'user_id' | 'wallet_id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SavingsGoal, 'id' | 'user_id' | 'wallet_id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'wallet_id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      kyc_status: KycStatus;
      user_tier: UserTier;
      transaction_type: TransactionType;
      transaction_status: TransactionStatus;
      goal_status: GoalStatus;
      budget_period: BudgetPeriod;
    };
  };
}
