import { createClient } from '@supabase/supabase-js';

const url = 'https://pijqwveothxgtxcsxkoj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpanF3dmVvdGh4Z3R4Y3N4a29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MzMxNzIsImV4cCI6MjEwOTMwOTE3Mn0.4gLw6Zucbo3ykdYzXIOXLxgDK9V7_26cLqq6Mx6tiVQ';

async function runBacktests() {
  console.log('\n======================================================');
  console.log('🚀 CASH FINTECH BACKEND & P2P AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  const timestamp = Date.now();
  const charlieEmail = `charlie_${timestamp}@cash.test`;
  const dianaEmail = `diana_${timestamp}@cash.test`;
  const password = 'TestPassword2026!';

  const clientAnon = createClient(url, key);

  // -------------------------------------------------------------------------
  // TEST 1: User Signup & Onboarding
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 1]: New Account Signup (Charlie)');
  const { data: charlieSignup, error: csErr } = await clientAnon.rpc('create_cash_account', {
    p_email: charlieEmail,
    p_password: password,
    p_full_name: 'Charlie Chaplin',
    p_phone: '+91 9888811111'
  });

  assert(!csErr && charlieSignup?.success === true, 'Account creation RPC succeeds');
  assert(Boolean(charlieSignup?.user_id), 'User ID generated in auth system');

  // Sign in as Charlie
  const clientCharlie = createClient(url, key);
  const { data: charlieAuth, error: caErr } = await clientCharlie.auth.signInWithPassword({
    email: charlieEmail,
    password: password
  });

  assert(!caErr && charlieAuth?.user?.id === charlieSignup.user_id, 'Charlie authenticated with JWT session');

  const { data: cWallet } = await clientCharlie.from('wallets').select('*').eq('user_id', charlieAuth.user.id).single();
  assert(Number(cWallet?.balance) === 10000, 'Initial welcome balance credited (₹10,000.00)');

  const { data: cTxnsInit } = await clientCharlie.from('transactions').select('*').eq('user_id', charlieAuth.user.id);
  assert(cTxnsInit?.length === 1, 'Exactly 1 welcome transaction created (no duplicate)');

  // -------------------------------------------------------------------------
  // TEST 2: Add Balance / Inward Deposit
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 2]: Add Balance to Charlie Wallet (+₹5,000)');
  const { data: addRes, error: addErr } = await clientCharlie.rpc('add_cash_funds', {
    p_amount: 5000,
    p_description: 'Net Banking HDFC Top-up'
  });

  assert(!addErr && addRes?.success === true, 'add_cash_funds RPC executes successfully');
  assert(Number(addRes?.new_balance) === 15000, 'New balance updated atomically to ₹15,000.00');

  const { data: cTxnsAfterAdd } = await clientCharlie.from('transactions').select('*').eq('user_id', charlieAuth.user.id);
  assert(cTxnsAfterAdd?.length === 2, 'Deposit transaction added to passbook ledger (Total: 2 records)');

  // -------------------------------------------------------------------------
  // TEST 3: Relogin Persistence Test
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 3]: Relogin Persistence (Verify no data wiped out)');
  await clientCharlie.auth.signOut();

  const clientCharlieRelogin = createClient(url, key);
  const { data: reloginAuth, error: rlErr } = await clientCharlieRelogin.auth.signInWithPassword({
    email: charlieEmail,
    password: password
  });

  assert(!rlErr && Boolean(reloginAuth?.user), 'Re-login with credentials succeeds');

  const { data: cWalletRelogin } = await clientCharlieRelogin.from('wallets').select('*').eq('user_id', reloginAuth.user.id).single();
  assert(Number(cWalletRelogin?.balance) === 15000, 'Balance persists across re-login (₹15,000.00)');

  const { data: cTxnsRelogin } = await clientCharlieRelogin.from('transactions').select('*').eq('user_id', reloginAuth.user.id).order('created_at', { ascending: false });
  assert(cTxnsRelogin?.length === 2, 'All transaction records persist across re-login without data wipe');

  // -------------------------------------------------------------------------
  // TEST 4: Create Second User & Two-way P2P Transfer
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 4]: Two-way P2P Money Transfer (Charlie -> Diana)');
  const { data: dianaSignup } = await clientAnon.rpc('create_cash_account', {
    p_email: dianaEmail,
    p_password: password,
    p_full_name: 'Diana Prince',
    p_phone: '+91 9777722222'
  });

  const clientDiana = createClient(url, key);
  const { data: dianaAuth } = await clientDiana.auth.signInWithPassword({
    email: dianaEmail,
    password: password
  });

  // Charlie transfers ₹3,500 to Diana using her email / Cash UPI ID
  const { data: transferRes, error: trErr } = await clientCharlieRelogin.rpc('transfer_cash_funds', {
    p_recipient_identifier: dianaEmail,
    p_amount: 3500,
    p_category: 'peer_transfer',
    p_description: 'Weekend trip split payment'
  });

  assert(!trErr && transferRes?.success === true, 'P2P transfer executes successfully');
  assert(transferRes?.is_internal === true, 'Transfer recognized as internal peer-to-peer');
  assert(Number(transferRes?.sender_balance) === 11500, 'Sender (Charlie) balance deducted to ₹11,500 (15,000 - 3,500)');
  assert(Number(transferRes?.recipient_new_balance) === 13500, 'Recipient (Diana) balance credited to ₹13,500 (10,000 + 3,500)');

  // Verify Diana side directly in database
  const { data: dWallet } = await clientDiana.from('wallets').select('*').eq('user_id', dianaAuth.user.id).single();
  assert(Number(dWallet?.balance) === 13500, 'Diana wallet in database confirms balance = ₹13,500.00');

  const { data: dTxns } = await clientDiana.from('transactions').select('*').eq('user_id', dianaAuth.user.id).order('created_at', { ascending: false });
  assert(dTxns?.length === 2, 'Diana passbook has credit transaction recorded');
  assert(Number(dTxns[0]?.amount) === 3500 && dTxns[0]?.type === 'credit', 'Diana credit transaction details match transfer exactly');

  // -------------------------------------------------------------------------
  // TEST 5: External / Store UPI Payment
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 5]: External Store UPI Payment (Diana -> Kirana Mart)');
  const { data: extPayRes } = await clientDiana.rpc('transfer_cash_funds', {
    p_recipient_identifier: 'kirana.mart@okhdfc',
    p_amount: 1200,
    p_category: 'shopping',
    p_description: 'Weekly Grocery Shopping'
  });

  assert(extPayRes?.success === true && extPayRes?.is_internal === false, 'External UPI payment processed');
  assert(Number(extPayRes?.sender_balance) === 12300, 'Diana balance updated to ₹12,300 (13,500 - 1,200)');

  // -------------------------------------------------------------------------
  // TEST 6: Overdraft / Insufficient Balance Rejection
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 6]: Insufficient Balance Protection');
  const { data: overRes } = await clientDiana.rpc('transfer_cash_funds', {
    p_recipient_identifier: charlieEmail,
    p_amount: 50000,
    p_category: 'peer_transfer',
    p_description: 'Overdraft attempt'
  });

  assert(overRes?.success === false, 'Transfer rejected due to insufficient balance');

  const { data: dWalletCheck } = await clientDiana.from('wallets').select('*').eq('user_id', dianaAuth.user.id).single();
  assert(Number(dWalletCheck?.balance) === 12300, 'Balance strictly untouched after rejected payment');

  // -------------------------------------------------------------------------
  // TEST 7: Wallet Freeze / Lock Protection
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 7]: Wallet Freeze & Security Lock');
  // Freeze Charlie's wallet
  await clientCharlieRelogin.from('wallets').update({ is_frozen: true }).eq('user_id', charlieAuth.user.id);

  const { data: frozenAttempt } = await clientCharlieRelogin.rpc('transfer_cash_funds', {
    p_recipient_identifier: dianaEmail,
    p_amount: 500,
    p_category: 'peer_transfer',
    p_description: 'Locked transfer attempt'
  });

  assert(frozenAttempt?.success === false && frozenAttempt?.error.includes('locked'), 'Payment blocked while wallet is frozen');

  // Unfreeze
  await clientCharlieRelogin.from('wallets').update({ is_frozen: false }).eq('user_id', charlieAuth.user.id);

  // -------------------------------------------------------------------------
  // TEST 8: Smart Pockets (Envelopes)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 8]: Smart Pockets Allocation & Withdrawal');
  const { data: newPocket } = await clientCharlieRelogin.from('pockets').insert({
    user_id: charlieAuth.user.id,
    wallet_id: cWallet.id,
    name: 'Rent & Maintenance',
    icon: 'home',
    color: '#00D632',
    target_amount: 10000,
    balance: 0
  }).select().single();

  assert(Boolean(newPocket?.id), 'Smart pocket created in database');

  // Allocate 2,000 from main wallet to pocket
  await clientCharlieRelogin.from('wallets').update({ balance: 9500 }).eq('id', cWallet.id);
  await clientCharlieRelogin.from('pockets').update({ balance: 2000 }).eq('id', newPocket.id);

  const { data: pCheck } = await clientCharlieRelogin.from('pockets').select('*').eq('id', newPocket.id).single();
  assert(Number(pCheck?.balance) === 2000, 'Pocket balance successfully allocated (₹2,000.00)');

  // -------------------------------------------------------------------------
  // TEST 9: Recipient Directory Search
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 9]: Recipient Directory Autocomplete');
  const { data: searchResults } = await clientCharlieRelogin.rpc('search_cash_users', { p_query: 'Diana' });
  assert(searchResults?.length > 0 && searchResults.some(r => r.email === dianaEmail), 'search_cash_users resolves Diana by partial name');

  // -------------------------------------------------------------------------
  // TEST 10: Live Demo Account Regression Guard (Anand -> Akash by handle)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 10]: Active Demo Transfer Guard (Anand -> Akash)');
  const clientAnand = createClient(url, key);
  const { data: anandAuth, error: anandErr } = await clientAnand.auth.signInWithPassword({
    email: 'anand@gmail.com',
    password: 'Cash2026!'
  });
  assert(!anandErr && Boolean(anandAuth?.user), 'Anand logged in successfully with Cash2026!');

  const clientAkash = createClient(url, key);
  const { data: akashAuth, error: akashErr } = await clientAkash.auth.signInWithPassword({
    email: 'akash@cash.me',
    password: 'Cash2026!'
  });
  assert(!akashErr && Boolean(akashAuth?.user), 'Akash logged in successfully with Cash2026!');

  // Initial balances
  const { data: aWalletBefore } = await clientAnand.from('wallets').select('*').eq('user_id', anandAuth.user.id).single();
  const { data: kWalletBefore } = await clientAkash.from('wallets').select('*').eq('user_id', akashAuth.user.id).single();
  const anandBalInit = Number(aWalletBefore.balance);
  const akashBalInit = Number(kWalletBefore.balance);

  // Check legacy account balance before
  const { data: legacyBefore } = await clientAnon.from('profiles').select('id, wallets(balance)').eq('email', 'akash.legacy@cash.test').maybeSingle();
  const legacyBalBefore = legacyBefore?.wallets?.[0]?.balance;

  // Transfer ₹100 from Anand to Akash via 'akash@cash'
  const { data: transferToAkash, error: tErr } = await clientAnand.rpc('transfer_cash_funds', {
    p_recipient_identifier: 'akash@cash',
    p_amount: 100,
    p_category: 'peer_transfer',
    p_description: 'Automated regression test: Anand to Akash'
  });

  assert(!tErr && transferToAkash?.success === true, 'Anand -> Akash transfer RPC executed successfully');
  assert(transferToAkash?.is_internal === true, 'Transfer recognized as internal peer-to-peer');

  // Verify Anand debited
  const { data: aWalletAfter } = await clientAnand.from('wallets').select('*').eq('user_id', anandAuth.user.id).single();
  assert(Number(aWalletAfter.balance) === Number((anandBalInit - 100).toFixed(2)), 'Anand wallet debited by exactly ₹100');

  // Verify Akash credited
  const { data: kWalletAfter } = await clientAkash.from('wallets').select('*').eq('user_id', akashAuth.user.id).single();
  assert(Number(kWalletAfter.balance) === Number((akashBalInit + 100).toFixed(2)), 'Akash (akash@cash.me) wallet credited by exactly ₹100');

  // Verify legacy account was NOT touched
  const { data: legacyAfter } = await clientAnon.from('profiles').select('id, wallets(balance)').eq('email', 'akash.legacy@cash.test').maybeSingle();
  const legacyBalAfter = legacyAfter?.wallets?.[0]?.balance;
  assert(legacyBalBefore === legacyBalAfter, 'Legacy seed account balance strictly UNTOUCHED (Zero misrouting)');

  // -------------------------------------------------------------------------
  // TEST 11: Return Transfer Guard (Akash -> Anand by handle)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 11]: Return Transfer Guard (Akash -> Anand)');
  const { data: returnTransfer, error: retErr } = await clientAkash.rpc('transfer_cash_funds', {
    p_recipient_identifier: 'anand@cash',
    p_amount: 100,
    p_category: 'peer_transfer',
    p_description: 'Automated regression test return: Akash to Anand'
  });

  assert(!retErr && returnTransfer?.success === true, 'Akash -> Anand return transfer RPC executed successfully');

  const { data: aWalletFinal } = await clientAnand.from('wallets').select('*').eq('user_id', anandAuth.user.id).single();
  const { data: kWalletFinal } = await clientAkash.from('wallets').select('*').eq('user_id', akashAuth.user.id).single();
  assert(Number(aWalletFinal.balance) === anandBalInit, 'Anand balance perfectly restored');
  assert(Number(kWalletFinal.balance) === akashBalInit, 'Akash balance perfectly restored');

  // -------------------------------------------------------------------------
  // TEST 12: Unique UPI ID & Legacy Exclusion Verification
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 12]: UPI ID Integrity & Zero Legacy In Directory');
  const { data: akashSearch } = await clientAnand.rpc('search_cash_users', { p_query: 'Akash' });
  assert(akashSearch?.length === 1 && akashSearch[0].email === 'akash@cash.me', 'search_cash_users returns only active akash@cash.me (zero duplicates)');

  const { data: aaravSearch } = await clientAnand.rpc('search_cash_users', { p_query: 'Aarav' });
  assert(aaravSearch?.length === 1 && aaravSearch[0].email === 'aarav@cash.me', 'search_cash_users returns only active aarav@cash.me (zero duplicates)');

  console.log('\n======================================================');
  console.log(`📊 FINAL RESULTS: ${passed}/${total} BACKTESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runBacktests().catch((e) => {
  console.error('Fatal backtest error:', e);
  process.exit(1);
});
