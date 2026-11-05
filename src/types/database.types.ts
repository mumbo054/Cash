export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type UserTier = 'basic' | 'standard' | 'premium' | 'pro';
export type TransactionType = 'credit' | 'debit' | 'transfer_in' | 'transfer_out';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
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
  avatar_url: string | null;
  kyc_status: KycStatus;
  tier: UserTier;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  wallet_number: string;
  currency: 'INR';
  balance: number; // numeric(14,2)
  is_frozen: boolean;
  daily_limit: number;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: BudgetCategory;
  amount_limit: number;
  spent_amount: number;
  period: BudgetPeriod;
  alert_threshold_pct: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  pocket_id: string | null;
  goal_id: string | null;
  reference_id: string;
  type: TransactionType;
  amount: number; // numeric(14,2) in INR
  currency: 'INR';
  category: TransactionCategory;
  status: TransactionStatus;
  counterparty_name: string | null;
  counterparty_upi_id: string | null;
  description: string | null;
  metadata: Record<string, Json> | null;
  created_at: string;
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
