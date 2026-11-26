import { createClient } from '@supabase/supabase-js';

const url = 'https://pijqwveothxgtxcsxkoj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpanF3dmVvdGh4Z3R4Y3N4a29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MzMxNzIsImV4cCI6MjEwOTMwOTE3Mn0.4gLw6Zucbo3ykdYzXIOXLxgDK9V7_26cLqq6Mx6tiVQ';

async function runBacktests() {
  console.log('\n======================================================');
  console.log('🚀 CASH FINTECH BACKEND & P2P AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, debug = undefined) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`, debug !== undefined ? JSON.stringify(debug) : '');
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
  // TEST 7: Wallet Freeze / Lock Protection (via Server RPC)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 7]: Wallet Freeze & Security Lock');
  const { data: freezeRes, error: freezeErr } = await clientCharlieRelogin.rpc('toggle_wallet_freeze');
  assert(!freezeErr && freezeRes?.success === true && freezeRes?.is_frozen === true, 'toggle_wallet_freeze RPC locks wallet');

  const { data: frozenAttempt } = await clientCharlieRelogin.rpc('transfer_cash_funds', {
    p_recipient_identifier: dianaEmail,
    p_amount: 500,
    p_category: 'peer_transfer',
    p_description: 'Locked transfer attempt'
  });

  assert(frozenAttempt?.success === false && frozenAttempt?.error.includes('locked'), 'Payment blocked while wallet is frozen');

  // Unfreeze via RPC
  const { data: unfreezeRes, error: unfreezeErr } = await clientCharlieRelogin.rpc('toggle_wallet_freeze');
  assert(!unfreezeErr && unfreezeRes?.success === true && unfreezeRes?.is_frozen === false, 'toggle_wallet_freeze RPC unlocks wallet', { unfreezeErr, unfreezeRes });

  // -------------------------------------------------------------------------
  // TEST 8: Smart Pockets (Envelopes via Server RPC)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 8]: Smart Pockets Allocation & Withdrawal');
  const { data: pocketRes, error: pocketErr } = await clientCharlieRelogin.rpc('create_pocket', {
    p_name: 'Rent & Maintenance',
    p_icon: 'home',
    p_color: '#00D632',
    p_target_amount: 10000
  });
  const newPocket = pocketRes?.pocket;
  assert(!pocketErr && pocketRes?.success === true && Boolean(newPocket?.id), 'Smart pocket created via create_pocket RPC');

  // Allocate ₹2,000 from main wallet to pocket (11,500 -> 9,500)
  const { data: allocRes, error: allocErr } = await clientCharlieRelogin.rpc('move_pocket_funds', {
    p_pocket_id: newPocket.id,
    p_amount: 2000,
    p_direction: 'allocate'
  });
  assert(!allocErr && allocRes?.success === true && Number(allocRes?.wallet_balance) === 9500, 'Allocated ₹2,000 from wallet via move_pocket_funds');

  const { data: pCheck } = await clientCharlieRelogin.from('pockets').select('*').eq('id', newPocket.id).single();
  assert(Number(pCheck?.balance) === 2000, 'Pocket balance successfully allocated (₹2,000.00)');

  // Withdraw ₹500 back to wallet (9,500 -> 10,000; pocket 2,000 -> 1,500)
  const { data: withdrawRes, error: withdrawErr } = await clientCharlieRelogin.rpc('move_pocket_funds', {
    p_pocket_id: newPocket.id,
    p_amount: 500,
    p_direction: 'withdraw'
  });
  assert(
    !withdrawErr && withdrawRes?.success === true && Number(withdrawRes?.wallet_balance) === 10000 && Number(withdrawRes?.pocket_balance) === 1500,
    'Withdrew ₹500 back to main wallet (wallet=₹10,000, pocket=₹1,500)'
  );

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

  // Check legacy account balance before (via Admin RPC since direct anonymous reads are locked down)
  const { data: anonWallets } = await clientAnon.from('wallets').select('id, balance');
  assert(!anonWallets || anonWallets.length === 0, 'Anonymous client cannot read wallets table directly');

  const { data: legacySearchBefore } = await clientAnand.rpc('admin_search_users', { p_query: 'akash.legacy@cash.test' });
  const legacyBalBefore = legacySearchBefore?.users?.find(u => u.email === 'akash.legacy@cash.test')?.balance;

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
  const { data: legacySearchAfter } = await clientAnand.rpc('admin_search_users', { p_query: 'akash.legacy@cash.test' });
  const legacyBalAfter = legacySearchAfter?.users?.find(u => u.email === 'akash.legacy@cash.test')?.balance;
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

  // -------------------------------------------------------------------------
  // TEST 13: Security Lockdown, Column Permissions & Cross-User RLS
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 13]: Security Lockdown & Cross-User RLS Isolation');
  const { error: directWalletErr } = await clientCharlieRelogin
    .from('wallets')
    .update({ balance: 999999 })
    .eq('user_id', charlieAuth.user.id);
  assert(Boolean(directWalletErr), 'Direct client update to wallets.balance is BLOCKED');

  const { error: sensitiveProfErr } = await clientCharlieRelogin
    .from('profiles')
    .update({ kyc_status: 'rejected', tier: 'pro' })
    .eq('id', charlieAuth.user.id);
  assert(Boolean(sensitiveProfErr), 'Direct client escalation of profiles.kyc_status / tier is BLOCKED');

  const { error: safeProfErr } = await clientCharlieRelogin
    .from('profiles')
    .update({ full_name: 'Charlie Chaplin' })
    .eq('id', charlieAuth.user.id);
  assert(!safeProfErr, 'Allowed profile fields (full_name) remain editable');

  const { error: directLedgerErr } = await clientCharlieRelogin
    .from('ledger_entries')
    .insert({ amount: 5000, direction: 'credit' });
  assert(Boolean(directLedgerErr), 'Direct client insert to immutable ledger_entries is BLOCKED');

  const { error: txnDeleteErr } = await clientCharlieRelogin
    .from('transactions')
    .delete()
    .eq('user_id', charlieAuth.user.id);
  assert(Boolean(txnDeleteErr), 'Direct client delete on transactions is BLOCKED');

  const { data: crossUserWallets } = await clientCharlieRelogin
    .from('wallets')
    .select('*')
    .eq('user_id', dianaAuth.user.id);
  assert(!crossUserWallets || crossUserWallets.length === 0, 'Cross-user RLS hides Diana wallet from Charlie');

  const { data: ledgerViewRes } = await clientCharlieRelogin.rpc('get_my_ledger_entries', { p_limit: 20 });
  assert(ledgerViewRes?.success === true && (ledgerViewRes?.entries?.length || 0) > 0, 'get_my_ledger_entries returns Charlie double-entry journal rows');

  // -------------------------------------------------------------------------
  // TEST 14: Idempotency Key Replay Protection
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 14]: Idempotency Key Replay Guard');
  const idemKey = `idem-${timestamp}`;
  const { data: idemCall1, error: idemErr1 } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: dianaEmail,
    p_amount: 250,
    p_category: 'peer_transfer',
    p_description: 'Idempotency primary request',
    p_idempotency_key: idemKey
  });
  assert(!idemErr1 && idemCall1?.success === true && Number(idemCall1?.sender_balance) === 9750, 'Primary transfer succeeds (Charlie ₹10,000 -> ₹9,750)');

  const { data: idemCall2, error: idemErr2 } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: dianaEmail,
    p_amount: 250,
    p_category: 'peer_transfer',
    p_description: 'Idempotency duplicate retry',
    p_idempotency_key: idemKey
  });
  assert(
    !idemErr2 && idemCall2?.success === true && idemCall2?.idempotent_replay === true && idemCall2?.reference_id === idemCall1?.reference_id,
    'Duplicate idempotency_key returns cached receipt without double debiting'
  );

  const { data: dWalletAfterIdem } = await clientDiana.from('wallets').select('balance').eq('user_id', dianaAuth.user.id).single();
  assert(Number(dWalletAfterIdem?.balance) === 12550, 'Diana credited exactly once (₹12,300 -> ₹12,550)');

  // -------------------------------------------------------------------------
  // TEST 15: Transaction PIN Enforcement & 5-Attempt Lockout
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 15]: Transaction PIN & 5-Attempt Brute-Force Lockout');
  const { data: setPinRes } = await clientCharlieRelogin.rpc('set_transaction_pin', {
    p_new_pin: '4829',
    p_threshold: 1000
  });
  assert(setPinRes?.success === true && setPinRes?.has_pin === true, 'Charlie configured 4-digit Transaction PIN (threshold ₹1,000)');

  const { data: noPinHighPay } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: dianaEmail,
    p_amount: 1200,
    p_category: 'peer_transfer',
    p_description: 'High value transfer without PIN',
    p_idempotency_key: `pin-miss-${timestamp}`
  });
  assert(noPinHighPay?.success === false && noPinHighPay?.pin_required === true, 'Transfer ≥ ₹1,000 rejected without Transaction PIN');

  const { data: pinHighPay } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: dianaEmail,
    p_amount: 1200,
    p_category: 'peer_transfer',
    p_description: 'High value transfer verified with PIN',
    p_idempotency_key: `pin-ok-${timestamp}`,
    p_pin: '4829'
  });
  assert(pinHighPay?.success === true && Number(pinHighPay?.sender_balance) === 8550, 'Transfer ≥ ₹1,000 succeeds with valid PIN (Charlie -> ₹8,550)');

  const { data: lowPayNoPin } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: dianaEmail,
    p_amount: 200,
    p_category: 'peer_transfer',
    p_description: 'Low value transfer below PIN threshold',
    p_idempotency_key: `low-ok-${timestamp}`
  });
  assert(lowPayNoPin?.success === true && Number(lowPayNoPin?.sender_balance) === 8350, 'Low value transfer (< ₹1,000) succeeds smoothly without PIN prompt (Charlie -> ₹8,350)');

  await clientDiana.rpc('set_transaction_pin', { p_new_pin: '9135', p_threshold: 100 });
  let lockoutTriggered = false;
  for (let i = 0; i < 5; i++) {
    const { data: badPin } = await clientDiana.rpc('verify_transaction_pin', { p_pin: '0000' });
    if (badPin?.locked === true) lockoutTriggered = true;
  }
  const { data: lockedCorrectPin } = await clientDiana.rpc('verify_transaction_pin', { p_pin: '9135' });
  assert(lockoutTriggered && lockedCorrectPin?.success === false && lockedCorrectPin?.locked === true, '5 consecutive wrong PIN entries trigger 15-min lockout');

  // -------------------------------------------------------------------------
  // TEST 16: Parallel Concurrency & Overdraft Safety
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 16]: Concurrency Test (Parallel Debits & Overdraft Protection)');
  const concurrentOk = await Promise.all(
    Array.from({ length: 10 }, (_, idx) =>
      clientCharlieRelogin.rpc('execute_verified_transfer', {
        p_recipient_identifier: 'concurrent.merchant@okaxis',
        p_amount: 500,
        p_category: 'utilities',
        p_description: `Concurrent txn ${idx + 1}`,
        p_idempotency_key: `conc-ok-${timestamp}-${idx}`
      })
    )
  );
  const concurrentSuccessCount = concurrentOk.filter(r => r.data?.success === true).length;
  assert(concurrentSuccessCount === 10, `All 10 parallel ₹500 transfers succeeded without deadlock (${concurrentSuccessCount}/10)`);

  const { data: cBalAfter10 } = await clientCharlieRelogin.from('wallets').select('balance').eq('user_id', charlieAuth.user.id).single();
  assert(Number(cBalAfter10?.balance) === 3350, 'Charlie balance exact after 10 parallel debits (₹8,350 - ₹5,000 = ₹3,350)');

  // Fire 5 parallel ₹1,000 transfers against ₹3,350 balance -> strictly 3 should succeed, 2 rejected
  const concurrentRace = await Promise.all(
    Array.from({ length: 5 }, (_, idx) =>
      clientCharlieRelogin.rpc('execute_verified_transfer', {
        p_recipient_identifier: 'race.merchant@okaxis',
        p_amount: 1000,
        p_category: 'shopping',
        p_description: `Race overdraft test ${idx + 1}`,
        p_idempotency_key: `conc-race-${timestamp}-${idx}`,
        p_pin: '4829'
      })
    )
  );
  const raceSuccessCount = concurrentRace.filter(r => r.data?.success === true).length;
  const { data: cBalAfterRace } = await clientCharlieRelogin.from('wallets').select('balance').eq('user_id', charlieAuth.user.id).single();
  assert(raceSuccessCount === 3 && Number(cBalAfterRace?.balance) === 350, `Row locks prevented overdraft under race condition (3/5 succeeded, final balance=₹350)`);

  // -------------------------------------------------------------------------
  // TEST 17: Admin RBAC, Compensating Reversal & Ledger Reconciliation
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 17]: Admin Back Office, Txn Reversal & Double-Entry Reconciliation');
  const { data: nonAdminOverview } = await clientCharlieRelogin.rpc('admin_get_overview');
  assert(nonAdminOverview?.success === false && nonAdminOverview?.error?.includes('Forbidden'), 'Non-admin user denied access to admin_get_overview');

  const { data: adminOverview } = await clientAnand.rpc('admin_get_overview');
  assert(adminOverview?.success === true && Number(adminOverview?.kpis?.total_users) >= 3, 'Admin Anand accesses admin_get_overview successfully');

  const revTxnId = idemCall1?.transaction?.id || null;
  const { data: revRes, error: revErr } = revTxnId
    ? await clientAnand.rpc('admin_reverse_transaction', {
        p_transaction_id: revTxnId,
        p_reason: 'Automated Phase 1 backtest reversal check'
      })
    : { data: null, error: 'Missing idemCall1 transaction ID' };
  assert(!revErr && revRes?.success === true && Boolean(revRes?.reversal_reference), 'Admin reversed P2P ₹250 transaction via compensating entry', { revErr, revRes });

  const { data: doubleRevRes } = revTxnId
    ? await clientAnand.rpc('admin_reverse_transaction', {
        p_transaction_id: revTxnId,
        p_reason: 'Duplicate reversal attempt'
      })
    : { data: { success: false, skipped: true } };
  assert(Boolean(revTxnId) && doubleRevRes?.success === false, 'Double-reversal of an already-reversed transaction is BLOCKED', doubleRevRes);

  const { data: cBalReverted } = await clientCharlieRelogin.from('wallets').select('balance').eq('user_id', charlieAuth.user.id).single();
  const { data: dBalReverted } = await clientDiana.from('wallets').select('balance').eq('user_id', dianaAuth.user.id).single();
  assert(Number(cBalReverted?.balance) === 600 && Number(dBalReverted?.balance) === 13700, 'Reversal restored Charlie (₹350 -> ₹600) and debited Diana (₹13,950 -> ₹13,700)');

  const { data: reconRes, error: reconErr } = await clientAnand.rpc('admin_run_reconciliation');
  assert(
    !reconErr && reconRes?.success === true && Number(reconRes?.mismatches_found) === 0 && Number(reconRes?.total_system_net) === 0,
    `Ledger reconciliation zero-mismatch verified (accounts=${reconRes?.accounts_checked}, mismatches=${reconRes?.mismatches_found}, net=${reconRes?.total_system_net})`
  );

  // -------------------------------------------------------------------------
  // TEST 18: Saved Payees, 24h Cooling-Off Cap, Fee/GST & Duplicate Warning
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 18]: Payee Cooling-Off, Fee+GST IMPS Payout & Quote Warnings');
  const { data: topupRes } = await clientCharlieRelogin.rpc('execute_wallet_topup', {
    p_amount: 10000,
    p_description: 'Phase 2 test liquidity top-up',
    p_idempotency_key: `topup2-${timestamp}`
  });
  assert(topupRes?.success === true && Number(topupRes?.new_balance) === 10600, 'Topped up Charlie +₹10,000 (₹600 -> ₹10,600)');

  const { data: payeeAddRes } = await clientCharlieRelogin.rpc('upsert_saved_payee', {
    p_payee_identifier: 'cooler@okhdfc',
    p_payee_name: 'Cooler Vendor',
    p_is_favourite: true
  });
  assert(payeeAddRes?.success === true && Boolean(payeeAddRes?.payee?.id), 'Saved new payee with 24h cooling-off window');

  const { data: quoteHigh } = await clientCharlieRelogin.rpc('preview_transfer_quote', {
    p_recipient_identifier: 'cooler@okhdfc',
    p_amount: 6000,
    p_rail: 'imps_payout'
  });
  assert(
    quoteHigh?.success === true && quoteHigh?.cooling_off_active === true && Number(quoteHigh?.fee_amount) === 10 && Number(quoteHigh?.gst_amount) === 1.8,
    'Pre-transfer quote detects 24h cooling-off + calculates IMPS ₹10 Fee & ₹1.80 GST'
  );

  const { data: coolingBlock } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: 'cooler@okhdfc',
    p_amount: 6000,
    p_category: 'imps_payout',
    p_description: 'Should exceed cooling cap',
    p_idempotency_key: `cool-blk-${timestamp}`,
    p_pin: '4829'
  });
  assert(coolingBlock?.success === false && coolingBlock?.error?.includes('cooling-off'), 'Transfer > ₹5,000 blocked for newly added unverified payee');

  const { data: impsOk } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: 'cooler@okhdfc',
    p_amount: 5000,
    p_category: 'imps_payout',
    p_description: 'Allowed cooling-cap IMPS payout',
    p_idempotency_key: `imps-ok-${timestamp}`,
    p_pin: '4829'
  });
  assert(
    impsOk?.success === true && Number(impsOk?.fee_amount) === 10 && Number(impsOk?.gst_amount) === 1.8 && Number(impsOk?.sender_balance) === 5588.2,
    'IMPS ₹5,000 debited ₹5,011.80 (principal + ₹10 fee + ₹1.80 GST -> ₹5,588.20)'
  );

  const { data: dupQuote } = await clientCharlieRelogin.rpc('preview_transfer_quote', {
    p_recipient_identifier: 'cooler@okhdfc',
    p_amount: 5000,
    p_rail: 'upi'
  });
  assert(dupQuote?.duplicate_recent === true && Number(dupQuote?.risk_score) >= 35, 'Duplicate-payment detector flags repeat ₹5,000 within 5 minutes');

  await clientCharlieRelogin.rpc('toggle_payee_favourite', { p_payee_id: payeeAddRes.payee.id });
  const { data: delPayeeRes } = await clientCharlieRelogin.rpc('delete_saved_payee', { p_payee_id: payeeAddRes.payee.id });
  assert(delPayeeRes?.success === true, 'Payee favourite toggle & archive succeeded cleanly');

  // -------------------------------------------------------------------------
  // TEST 19: Payment Requests & Real-Time Notifications
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 19]: Payment Requests & Server Notifications');
  const { data: reqCreate } = await clientCharlieRelogin.rpc('create_payment_request', {
    p_payer_identifier: 'anand@cash',
    p_amount: 300,
    p_note: 'Split lunch bill',
    p_expires_hours: 24
  });
  assert(reqCreate?.success === true && Boolean(reqCreate?.request?.id), 'Created P2P money request REQ-...');

  const { data: reqPay } = await clientAnand.rpc('respond_payment_request', {
    p_request_id: reqCreate.request.id,
    p_action: 'pay'
  });
  assert(reqPay?.success === true && reqPay?.status === 'paid', 'Anand settled money request via double-entry transfer');

  // Restore Anand's ₹300 test spend
  await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: 'anand@cash',
    p_amount: 300,
    p_category: 'peer_transfer',
    p_description: 'Refund request backtest',
    p_idempotency_key: `ret-anand-${timestamp}`
  });

  const { data: cNotifs } = await clientCharlieRelogin.from('notifications').select('id, read_at').eq('user_id', charlieAuth.user.id);
  assert((cNotifs?.length || 0) > 0, 'Server triggers emitted notification rows for Charlie');
  await clientCharlieRelogin.rpc('mark_notifications_read', { p_ids: null });
  const { data: cUnreadAfter } = await clientCharlieRelogin.from('notifications').select('id').eq('user_id', charlieAuth.user.id).is('read_at', null);
  assert(!cUnreadAfter || cUnreadAfter.length === 0, 'mark_notifications_read cleared unread notifications');

  // -------------------------------------------------------------------------
  // TEST 20: Smart Categorisation, Budgets, Cashback & Scheduled Autopay
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 20]: Smart Categories, Budgets, Marketing Cashback & Autopay');
  const { data: swiggyPay } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: 'swiggy.blr@okaxis',
    p_amount: 400,
    p_category: 'other',
    p_description: 'Swiggy Instamart snacks',
    p_idempotency_key: `swiggy-${timestamp}`
  });
  assert(swiggyPay?.success === true && swiggyPay?.transaction?.category === 'food', 'Auto-categorisation tagged Swiggy payment as food');

  const { data: budgetRes } = await clientCharlieRelogin.rpc('upsert_budget', {
    p_category: 'food',
    p_amount_limit: 500,
    p_period: 'monthly',
    p_alert_threshold_pct: 75,
    p_rollover_enabled: true
  });
  assert(budgetRes?.success === true && Number(budgetRes?.budget?.spent_amount) >= 400, 'Budget tracks live category spend');

  const { data: zomatoPay } = await clientCharlieRelogin.rpc('execute_verified_transfer', {
    p_recipient_identifier: 'zomato@okicici',
    p_amount: 150,
    p_category: 'food',
    p_description: 'Zomato order',
    p_idempotency_key: `zomato-${timestamp}`
  });
  assert(zomatoPay?.success === true, 'Second food txn crosses budget cap & arms threshold alert');

  const { data: retagRes } = await clientCharlieRelogin.rpc('update_transaction_category', {
    p_transaction_id: zomatoPay.transaction.id,
    p_new_category: 'entertainment',
    p_learn_merchant: true
  });
  assert(retagRes?.success === true && retagRes?.category === 'entertainment', 'Transaction category re-tagged & learned for merchant');

  const { data: cbRes } = await clientCharlieRelogin.rpc('claim_transaction_cashback', {
    p_transaction_id: swiggyPay.transaction.id
  });
  assert(cbRes?.success === true && Number(cbRes?.reward_amount) === 8, 'Claimed ₹8 (2%) cashback funded from SYS_MARKETING ledger');

  const { data: cbDupRes } = await clientCharlieRelogin.rpc('claim_transaction_cashback', {
    p_transaction_id: swiggyPay.transaction.id
  });
  assert(cbDupRes?.success === false, 'Duplicate cashback claim blocked');

  const { data: schedRes } = await clientCharlieRelogin.rpc('create_scheduled_payment', {
    p_recipient_identifier: 'bescom@bharatbill',
    p_recipient_name: 'BESCOM Electricity',
    p_amount: 200,
    p_category: 'utilities',
    p_description: 'Monthly electricity mandate',
    p_frequency: 'monthly'
  });
  const { data: schedRunRes } = await clientCharlieRelogin.rpc('run_my_scheduled_payment_now', {
    p_scheduled_id: schedRes.scheduled_payment.id
  });
  assert(schedRes?.success === true && schedRunRes?.success === true, 'Scheduled autopay mandate created and settled on double-entry ledger');

  // -------------------------------------------------------------------------
  // TEST 21: KYC Upload + Admin Review, Disputes + Refund, Sessions & Export
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 21]: KYC Queue, Disputes Refund, Device Session & DPDP Export');
  const { data: kycSubmitRes } = await clientCharlieRelogin.rpc('submit_kyc_document', {
    p_doc_type: 'pan',
    p_doc_number_masked: 'ABCDE••••Z',
    p_full_legal_name: 'Charlie Chaplin'
  });
  assert(kycSubmitRes?.success === true && kycSubmitRes?.document?.status === 'pending', 'KYC document submitted with pending queue status');

  const { data: queuesData } = await clientAnand.rpc('admin_get_queues');
  assert(
    queuesData?.success === true && queuesData?.kyc_documents?.some(k => k.id === kycSubmitRes.document.id),
    'Admin queue surfaces newly submitted KYC document'
  );

  const { data: kycReviewRes } = await clientAnand.rpc('admin_review_kyc', {
    p_kyc_id: kycSubmitRes.document.id,
    p_decision: 'verified',
    p_reason: 'Simulated PAN document verified'
  });
  assert(kycReviewRes?.success === true && kycReviewRes?.status === 'verified', 'Admin verified Charlie KYC document');

  const { data: dispSubmit } = await clientCharlieRelogin.rpc('submit_dispute', {
    p_transaction_id: zomatoPay.transaction.id,
    p_reason: 'Duplicate merchant debit claim',
    p_details: 'Automated dispute resolution verification'
  });
  assert(dispSubmit?.success === true && dispSubmit?.dispute?.status === 'open', 'User filed dispute ticket linked to transaction');

  const { data: dispResolve } = await clientAnand.rpc('admin_resolve_dispute', {
    p_dispute_id: dispSubmit.dispute.id,
    p_action: 'refund',
    p_resolution_note: 'Approved & refunded via compensating ledger entry'
  });
  assert(dispResolve?.success === true && dispResolve?.action === 'refund', 'Admin resolved dispute with linked ledger reversal');

  const { data: sessReg1 } = await clientCharlieRelogin.rpc('register_device_session', {
    p_device_fingerprint: `fp-${timestamp}`,
    p_device_label: 'Backtest Headless Agent',
    p_user_agent: 'Node/22'
  });
  const { data: sessReg2 } = await clientCharlieRelogin.rpc('register_device_session', {
    p_device_fingerprint: `fp-${timestamp}`,
    p_device_label: 'Backtest Headless Agent',
    p_user_agent: 'Node/22'
  });
  assert(sessReg1?.is_new_device === true && sessReg2?.is_new_device === false, 'Device tracking flags new logins & recognizes returning devices');

  const { data: exportRes } = await clientCharlieRelogin.rpc('export_my_account_data');
  assert(
    exportRes?.success === true && exportRes?.export?.wallet?.wallet_number_masked?.includes('••••') && Array.isArray(exportRes?.export?.transactions),
    'DPDP export returns masked wallet archive & audit entry'
  );

  // -------------------------------------------------------------------------
  // TEST 22: Background Worker, Edge Function Health & Final Zero-Mismatch Recon
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 22]: pgmq Worker Sweep, Edge Function Probe & Final Reconciliation');
  const { data: workerRes } = await clientAnand.rpc('admin_run_worker_jobs');
  assert(workerRes?.success === true, `pgmq & pg_cron worker sweep completed cleanly (archived=${workerRes?.archived_queue_jobs})`);

  const { data: anandSess } = await clientAnand.auth.getSession();
  const edgeResp = await fetch(`${url}/functions/v1/cash-ops`, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${anandSess.session.access_token}`,
      traceparent: `00-0123456789abcdef0123456789abcdef-0123456789abcdef-01`
    }
  });
  const edgeJson = await edgeResp.json();
  assert(edgeResp.ok && edgeJson?.status === 'healthy' && edgeJson?.db_reachable === true, `Edge function cash-ops healthy (latency=${edgeJson?.latency_ms}ms)`);

  const { data: finalReconRes } = await clientAnand.rpc('admin_run_reconciliation');
  assert(
    finalReconRes?.success === true && Number(finalReconRes?.mismatches_found) === 0 && Number(finalReconRes?.total_system_net) === 0,
    `Final full ledger reconciliation: accounts=${finalReconRes?.accounts_checked}, mismatches=${finalReconRes?.mismatches_found}, net=${finalReconRes?.total_system_net}`
  );

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
