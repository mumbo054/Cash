export type NavTab = 
  | 'dashboard'
  | 'transfers'
  | 'pockets'
  | 'bills'
  | 'goals'
  | 'budgets'
  | 'passbook'
  | 'admin';

export interface BillerItem {
  id: string;
  name: string;
  category: 'mobile' | 'electricity' | 'dth' | 'broadband' | 'subscription' | 'water';
  icon: string;
  accountNumberSample: string;
  typicalAmount: number;
  provider: string;
}

export interface SubscriptionItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  isDormant?: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'failed_transaction' | 'refund' | 'kyc' | 'wallet_freeze' | 'general';
  amount?: number;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}
