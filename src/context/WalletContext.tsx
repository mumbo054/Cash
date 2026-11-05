import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, Wallet, Pocket, SavingsGoal, Budget, Transaction } from '@/types/database.types';

interface WalletContextType {
  // Users
  profiles: Profile[];
  currentProfile: Profile | null;
  currentWallet: Wallet | null;
  pockets: Pocket[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  switchUser: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  sendMoney: (data: {
    recipientUpiOrPhone: string;
    recipientName: string;
    amount: number;
    category?: string;
    description?: string;
  }) => Promise<{ success: boolean; error?: string; isInternal?: boolean; recipientName?: string; referenceId?: string }>;
  addFunds: (amount: number, description?: string) => Promise<{ success: boolean; error?: string }>;
  toggleWalletFreeze: () => Promise<boolean>;
  allocateToPocket: (pocketId: string, amount: number) => Promise<boolean>;
  withdrawFromPocket: (pocketId: string, amount: number) => Promise<boolean>;
  contributeToGoal: (goalId: string, amount: number) => Promise<boolean>;
  withdrawFromGoal: (goalId: string, amount: number) => Promise<boolean>;
  createPocket: (data: { name: string; icon: string; color: string; targetAmount?: number }) => Promise<boolean>;
  createGoal: (data: { title: string; targetAmount: number; category: string; targetDate?: string }) => Promise<boolean>;
  signInWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpNewUser: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all user profile records for recipient autocomplete & contact directory
  const loadUsers = useCallback(async () => {
    try {
      // First try the search_cash_users RPC
      const { data: rpcProfiles, error: rpcErr } = await supabase.rpc('search_cash_users', { p_query: '' });
      if (!rpcErr && rpcProfiles && rpcProfiles.length > 0) {
        setProfiles(rpcProfiles as unknown as Profile[]);
        return;
      }

      // Fallback to direct profiles table query
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        setProfiles(data as unknown as Profile[]);
      }
    } catch (err: any) {
      console.warn('[Cash Directory] Could not load global directory:', err.message);
    }
  }, []);

  // Load all data for a specific user
  const loadUserData = useCallback(async (userId: string, profileObj?: Profile) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Profile
      let prof = profileObj;
      if (!prof) {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        prof = pData as unknown as Profile;
      }
      setCurrentProfile(prof || null);

      // 2. Wallet (auto-provision if not present)
      let { data: wData } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
      if (!wData) {
        const v_wallet_num = 'CSH-' + Math.floor(Math.random() * 9000000000 + 1000000000);
        const { data: newW } = await supabase.from('wallets').insert({
          user_id: userId,
          wallet_number: v_wallet_num,
          currency: 'INR',
          balance: 10000.00,
          daily_limit: 50000.00,
        }).select().maybeSingle();
        wData = newW;
      }
      if (wData) {
        setCurrentWallet(wData as Wallet);
      }

      // 3. Pockets
      const { data: pocData } = await supabase
        .from('pockets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setPockets((pocData as Pocket[]) || []);

      // 4. Savings Goals
      const { data: gData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setSavingsGoals((gData as SavingsGoal[]) || []);

      // 5. Budgets
      const { data: bData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true });
      setBudgets((bData as Budget[]) || []);

      // 6. Transactions
      const { data: tData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      setTransactions((tData as Transaction[]) || []);
    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchUser = async (userId: string) => {
    const target = profiles.find((p) => p.id === userId);
    await loadUserData(userId, target);
  };

  const refreshData = async () => {
    if (currentProfile) {
      await loadUserData(currentProfile.id, currentProfile);
    }
  };

  // Financial Transfer (Two-Way Database RPC for Peer-to-Peer & Merchant UPI)
  const sendMoney = async ({
    recipientUpiOrPhone,
    recipientName,
    amount,
    category = 'peer_transfer',
    description,
  }: {
    recipientUpiOrPhone: string;
    recipientName: string;
    amount: number;
    category?: string;
    description?: string;
  }) => {
    if (!currentProfile || !currentWallet) {
      return { success: false, error: 'No active wallet found' };
    }

    if (currentWallet.is_frozen) {
      return { success: false, error: 'Wallet is frozen. Unfreeze to make payments.' };
    }

    if (currentWallet.balance < amount) {
      return { success: false, error: `Insufficient funds. Available: ₹${currentWallet.balance}` };
    }

    try {
      const recipientTarget = recipientUpiOrPhone || recipientName;
      const transferDesc = description || `Paid ${recipientName || recipientUpiOrPhone} via Cash UPI`;

      // Call atomic two-way database RPC
      const { data, error: rpcErr } = await supabase.rpc('transfer_cash_funds', {
        p_recipient_identifier: recipientTarget,
        p_amount: amount,
        p_category: category,
        p_description: transferDesc,
      });

      if (rpcErr) {
        throw rpcErr;
      }

      if (data && data.success === false) {
        return { success: false, error: data.error || 'Transfer failed.' };
      }

      // Update sender balance locally
      const newSenderBalance = Number(data.sender_balance);
      setCurrentWallet((prev) => (prev ? { ...prev, balance: newSenderBalance } : null));

      // Append sender transaction record locally
      if (data.transaction) {
        setTransactions((prev) => [data.transaction as Transaction, ...prev]);
      }

      return {
        success: true,
        isInternal: data.is_internal,
        recipientName: data.recipient_name,
        referenceId: data.reference_id,
      };
    } catch (err: any) {
      console.error('Send money error:', err);
      let errorMsg = err?.message || 'Transaction failed';
      if (errorMsg.includes('check constraint') || errorMsg.includes('transactions_category_check')) {
        errorMsg = 'Transaction failed: Invalid category or limit restriction.';
      }
      return { success: false, error: errorMsg };
    }
  };

  // Add Funds (Atomic Deposit via Database RPC)
  const addFunds = async (amount: number, description = 'Deposit via Net Banking / Card') => {
    if (!currentProfile || !currentWallet) {
      return { success: false, error: 'No active wallet found' };
    }

    try {
      const { data, error: rpcErr } = await supabase.rpc('add_cash_funds', {
        p_amount: amount,
        p_description: description,
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
        setTransactions((prev) => [data.transaction as Transaction, ...prev]);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Add funds error:', err);
      return { success: false, error: err.message || 'Failed to add funds' };
    }
  };

  // Toggle Wallet Freeze (Panic Button)
  const toggleWalletFreeze = async (): Promise<boolean> => {
    if (!currentWallet) return false;
    const nextState = !currentWallet.is_frozen;

    try {
      const { error: fErr } = await supabase
        .from('wallets')
        .update({ is_frozen: nextState })
        .eq('id', currentWallet.id);

      if (fErr) throw fErr;
      setCurrentWallet({ ...currentWallet, is_frozen: nextState });
      return true;
    } catch {
      return false;
    }
  };

  // Move money into sub-wallet Pocket
  const allocateToPocket = async (pocketId: string, amount: number): Promise<boolean> => {
    if (!currentWallet || currentWallet.balance < amount) return false;
    const targetPocket = pockets.find((p) => p.id === pocketId);
    if (!targetPocket) return false;

    const newWalletBalance = Number((currentWallet.balance - amount).toFixed(2));
    const newPocketBalance = Number((targetPocket.balance + amount).toFixed(2));

    try {
      await supabase.from('wallets').update({ balance: newWalletBalance }).eq('id', currentWallet.id);
      await supabase.from('pockets').update({ balance: newPocketBalance }).eq('id', pocketId);

      setCurrentWallet({ ...currentWallet, balance: newWalletBalance });
      setPockets((prev) =>
        prev.map((p) => (p.id === pocketId ? { ...p, balance: newPocketBalance } : p))
      );
      return true;
    } catch {
      return false;
    }
  };

  // Withdraw money from sub-wallet Pocket back to main balance
  const withdrawFromPocket = async (pocketId: string, amount: number): Promise<boolean> => {
    if (!currentWallet) return false;
    const targetPocket = pockets.find((p) => p.id === pocketId);
    if (!targetPocket || targetPocket.balance < amount) return false;

    const newWalletBalance = Number((currentWallet.balance + amount).toFixed(2));
    const newPocketBalance = Number((targetPocket.balance - amount).toFixed(2));

    try {
      await supabase.from('wallets').update({ balance: newWalletBalance }).eq('id', currentWallet.id);
      await supabase.from('pockets').update({ balance: newPocketBalance }).eq('id', pocketId);

      setCurrentWallet({ ...currentWallet, balance: newWalletBalance });
      setPockets((prev) =>
        prev.map((p) => (p.id === pocketId ? { ...p, balance: newPocketBalance } : p))
      );
      return true;
    } catch {
      return false;
    }
  };

  // Contribute to Savings Goal
  const contributeToGoal = async (goalId: string, amount: number): Promise<boolean> => {
    if (!currentWallet || currentWallet.balance < amount) return false;
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return false;

    const newWalletBal = Number((currentWallet.balance - amount).toFixed(2));
    const newGoalAmount = Number((targetGoal.current_amount + amount).toFixed(2));
    const isCompleted = newGoalAmount >= targetGoal.target_amount;

    try {
      await supabase.from('wallets').update({ balance: newWalletBal }).eq('id', currentWallet.id);
      await supabase
        .from('savings_goals')
        .update({
          current_amount: newGoalAmount,
          status: isCompleted ? 'achieved' : 'in_progress',
        })
        .eq('id', goalId);

      setCurrentWallet({ ...currentWallet, balance: newWalletBal });
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, current_amount: newGoalAmount, status: isCompleted ? 'achieved' : 'in_progress' }
            : g
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // Withdraw from Savings Goal back to main balance
  const withdrawFromGoal = async (goalId: string, amount: number): Promise<boolean> => {
    if (!currentWallet) return false;
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal || targetGoal.current_amount < amount) return false;

    const newWalletBal = Number((currentWallet.balance + amount).toFixed(2));
    const newGoalAmount = Number((targetGoal.current_amount - amount).toFixed(2));

    try {
      await supabase.from('wallets').update({ balance: newWalletBal }).eq('id', currentWallet.id);
      await supabase
        .from('savings_goals')
        .update({
          current_amount: newGoalAmount,
          status: newGoalAmount >= targetGoal.target_amount ? 'achieved' : 'in_progress',
        })
        .eq('id', goalId);

      setCurrentWallet({ ...currentWallet, balance: newWalletBal });
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, current_amount: newGoalAmount, status: newGoalAmount >= targetGoal.target_amount ? 'achieved' : 'in_progress' }
            : g
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // Create new pocket
  const createPocket = async (data: { name: string; icon: string; color: string; targetAmount?: number }) => {
    if (!currentProfile || !currentWallet) return false;
    try {
      const { data: created, error: pErr } = await supabase
        .from('pockets')
        .insert({
          user_id: currentProfile.id,
          wallet_id: currentWallet.id,
          name: data.name,
          icon: data.icon,
          color: data.color,
          target_amount: data.targetAmount || null,
          balance: 0,
        })
        .select()
        .single();

      if (pErr) throw pErr;
      if (created) setPockets((prev) => [created as Pocket, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  // Create new savings goal
  const createGoal = async (data: { title: string; targetAmount: number; category: string; targetDate?: string }) => {
    if (!currentProfile || !currentWallet) return false;
    try {
      const { data: created, error: gErr } = await supabase
        .from('savings_goals')
        .insert({
          user_id: currentProfile.id,
          wallet_id: currentWallet.id,
          title: data.title,
          target_amount: data.targetAmount,
          current_amount: 0,
          category: data.category,
          target_date: data.targetDate || null,
          status: 'in_progress',
        })
        .select()
        .single();

      if (gErr) throw gErr;
      if (created) setSavingsGoals((prev) => [created as SavingsGoal, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  // Sign In with Supabase Auth credentials
  const signInWithCredentials = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Clear any prior auth session
      await supabase.auth.signOut();

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authErr || !data.user) {
        const msg = authErr?.message?.toLowerCase().includes('invalid')
          ? 'Incorrect login credentials. Please check your login ID and password.'
          : (authErr?.message || 'Incorrect login credentials.');
        setError(msg);
        return { success: false, error: msg };
      }

      await loadUserData(data.user.id);
      await loadUsers();
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Incorrect login credentials.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Create new account (Join Us) with full provisioned wallet and welcome balance
  const signUpNewUser = async ({
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
    setIsLoading(true);
    setError(null);
    try {
      // 1. Clear any prior active session
      await supabase.auth.signOut();

      // 2. Call secure DB RPC to create auth user, profile, wallet, and initial credit
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

      if (data && (data as any).success === false) {
        const msg = (data as any).error || 'Failed to create account.';
        setError(msg);
        return { success: false, error: msg };
      }

      // 3. Immediately sign in with the new credentials
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authErr || !authData?.user) {
        const msg = authErr?.message || 'Account created. Please log in with your credentials.';
        setError(msg);
        return { success: false, error: msg };
      }

      // 4. Load freshly provisioned user data
      await loadUserData(authData.user.id);
      await loadUsers();
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to create account.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out user
  const signOutUser = async () => {
    await supabase.auth.signOut();
    setCurrentProfile(null);
    setCurrentWallet(null);
    setPockets([]);
    setSavingsGoals([]);
    setBudgets([]);
    setTransactions([]);
  };

  // Session lifecycle: Restore session on initial mount & react to auth changes
  useEffect(() => {
    let isMounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
      loadUsers();
    });

    // Listen to live auth changes (e.g. login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentProfile(null);
        setCurrentWallet(null);
        setPockets([]);
        setSavingsGoals([]);
        setBudgets([]);
        setTransactions([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, loadUsers]);

  return (
    <WalletContext.Provider
      value={{
        profiles,
        currentProfile,
        currentWallet,
        pockets,
        savingsGoals,
        budgets,
        transactions,
        isLoading,
        error,
        switchUser,
        refreshData,
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
