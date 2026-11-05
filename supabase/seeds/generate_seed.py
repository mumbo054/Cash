#!/usr/bin/env python3
"""
Cash Fintech Wallet — Reproducible Demo Dataset Generator
Generates:
- 50 Realistic Sample Indian Users with Auth accounts, Profiles, and Wallets
- Pockets, Savings Goals, Budgets
- ~500 Realistic Simulated Transactions (credits, debits, UPI simulations, merchant payments)
All generated with fixed random seed (42) for 100% reproducibility.
"""

import random
import uuid
from datetime import datetime, timedelta

random.seed(42)

# Common bcrypt hash for password 'CashDemo2026!'
# Allows logging in as any of the 50 sample users in Supabase Auth if needed
DEMO_PASSWORD_HASH = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345"

FIRST_NAMES = [
    "Aarav", "Aditi", "Akash", "Ananya", "Arjun", "Deepak", "Divya", "Gaurav",
    "Isha", "Karan", "Kavya", "Manish", "Meera", "Neha", "Nikhil", "Pooja",
    "Pranav", "Priya", "Rahul", "Rhea", "Rohan", "Sanjay", "Shreya", "Siddharth",
    "Sneha", "Tanvi", "Varun", "Vikram", "Yash", "Zoya", "Aman", "Bhavna",
    "Chirag", "Devika", "Harsh", "Juhi", "Kunal", "Lavanya", "Mohit", "Nandini",
    "Omkar", "Payal", "Rakesh", "Sanjana", "Tarun", "Urvashi", "Vivek", "Vidya",
    "Karthik", "Ritu"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Iyer", "Nair", "Reddy", "Gupta", "Singh",
    "Mehta", "Chopra", "Deshmukh", "Joshi", "Bose", "Kulkarni", "Malhotra",
    "Bhat", "Rao", "Menon", "Agarwal", "Saxena", "Kapoor", "Banerjee", "Pillai",
    "Chatterjee", "Mishra"
]

MERCHANTS = [
    {"name": "Swiggy", "upi": "swiggy@icici", "cat": "food", "range": (150, 950)},
    {"name": "Zomato", "upi": "zomato@hdfc", "cat": "food", "range": (200, 1200)},
    {"name": "Zepto Quick Commerce", "upi": "zepto@icici", "cat": "groceries", "range": (180, 1600)},
    {"name": "Blinkit Instant", "upi": "blinkit@axis", "cat": "groceries", "range": (250, 2200)},
    {"name": "Amazon India", "upi": "amazonpay@apl", "cat": "shopping", "range": (499, 8500)},
    {"name": "Flipkart Internet", "upi": "flipkart@axis", "cat": "shopping", "range": (699, 9500)},
    {"name": "Tata Neu / Croma", "upi": "tataneu@hdfc", "cat": "shopping", "range": (1200, 15000)},
    {"name": "Uber India", "upi": "uber.rides@hdfc", "cat": "travel", "range": (120, 950)},
    {"name": "Ola Cabs", "upi": "olacabs@axis", "cat": "travel", "range": (150, 800)},
    {"name": "MakeMyTrip Flights", "upi": "makemytrip@icici", "cat": "travel", "range": (3500, 12000)},
    {"name": "Airtel Fiber Broadband", "upi": "airtel.bills@airtel", "cat": "utilities", "range": (999, 1499)},
    {"name": "BESCOM Electricity", "upi": "bescom@karnataka", "cat": "utilities", "range": (1200, 3800)},
    {"name": "BookMyShow Movies", "upi": "bookmyshow@kotak", "cat": "entertainment", "range": (350, 1500)},
    {"name": "Netflix India", "upi": "netflix.sub@citi", "cat": "entertainment", "range": (499, 649)},
    {"name": "Spotify Premium", "upi": "spotify@yesbank", "cat": "entertainment", "range": (119, 299)},
    {"name": "Apollo Pharmacy", "upi": "apollo@hdfc", "cat": "health", "range": (250, 3200)},
    {"name": "Cult.fit Gym & Wellness", "upi": "cultfit@icici", "cat": "health", "range": (1800, 6500)},
    {"name": "Coursera Learning", "upi": "coursera@paypal", "cat": "education", "range": (1500, 4500)},
]

EMPLOYERS = [
    ("TechCorp India Pvt Ltd", "payroll@techcorp.in", 75000, 165000),
    ("Infosys Digital Solutions", "salary@infosys.com", 65000, 140000),
    ("Tata Consultancy Services", "salary@tcs.com", 58000, 130000),
    ("Flipkart Commerce Corp", "talent@flipkart.com", 85000, 190000),
    ("Wipro Technologies Ltd", "payroll@wipro.com", 60000, 125000),
    ("Razorpay Software", "people@razorpay.com", 95000, 220000),
    ("Swiggy Bundl Tech", "finance@swiggy.in", 90000, 210000),
]

def generate_dataset():
    users = []
    wallets = []
    pockets = []
    goals = []
    budgets = []
    transactions = []

    base_time = datetime(2026, 11, 4, 3, 0, 0)

    # 1. Generate 50 Users
    for i in range(50):
        user_id = str(uuid.uuid4())
        fname = FIRST_NAMES[i % len(FIRST_NAMES)]
        lname = LAST_NAMES[i % len(LAST_NAMES)]
        full_name = f"{fname} {lname}"
        email = f"{fname.lower()}.{lname.lower()}{i+1}@example.com"
        phone = f"+91 9{random.randint(100000000, 999999999)}"
        tier = random.choices(["standard", "premium", "pro", "basic"], weights=[50, 30, 15, 5])[0]
        kyc = random.choices(["verified", "pending"], weights=[92, 8])[0]
        
        users.append({
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "phone": phone,
            "tier": tier,
            "kyc": kyc
        })

        # 2. Primary Wallet
        wallet_id = str(uuid.uuid4())
        wallet_num = f"CSH-{random.randint(1000000000, 9999999999)}"
        initial_balance = round(random.uniform(15000.0, 185000.0), 2)
        daily_limit = 50000.0 if tier == "standard" else (100000.0 if tier == "premium" else 200000.0)

        wallets.append({
            "id": wallet_id,
            "user_id": user_id,
            "wallet_number": wallet_num,
            "balance": initial_balance,
            "daily_limit": daily_limit
        })

        # 3. Pockets (1 to 2 per user)
        pocket_templates = [
            {"name": "Monthly Rent", "icon": "home", "color": "#3B82F6", "target": 25000.0, "bal": round(random.uniform(5000, 25000), 2)},
            {"name": "Emergency Stash", "icon": "shield", "color": "#10B981", "target": 50000.0, "bal": round(random.uniform(10000, 45000), 2)},
            {"name": "Dining & Treats", "icon": "coffee", "color": "#F59E0B", "target": 10000.0, "bal": round(random.uniform(2000, 8000), 2)},
            {"name": "Weekend Roadtrips", "icon": "compass", "color": "#8B5CF6", "target": 15000.0, "bal": round(random.uniform(1000, 12000), 2)},
        ]
        user_pockets = random.sample(pocket_templates, k=random.randint(1, 2))
        for p in user_pockets:
            p_id = str(uuid.uuid4())
            pockets.append({
                "id": p_id,
                "user_id": user_id,
                "wallet_id": wallet_id,
                "name": p["name"],
                "icon": p["icon"],
                "color": p["color"],
                "balance": p["bal"],
                "target_amount": p["target"]
            })

        # 4. Savings Goals (1 per user)
        goal_templates = [
            {"title": "MacBook Pro M4", "target": 199900.0, "cat": "gadgets", "cur": round(random.uniform(25000, 150000), 2)},
            {"title": "Goa Year-End Trip", "target": 45000.0, "cat": "travel", "cur": round(random.uniform(10000, 42000), 2)},
            {"title": "Diwali Gold Coin 10g", "target": 78000.0, "cat": "investment", "cur": round(random.uniform(15000, 65000), 2)},
            {"title": "Royal Enfield Hunter 350", "target": 185000.0, "cat": "vehicle", "cur": round(random.uniform(40000, 130000), 2)},
            {"title": "Emergency Medical Fund", "target": 100000.0, "cat": "health", "cur": round(random.uniform(30000, 95000), 2)},
        ]
        g = random.choice(goal_templates)
        goals.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "wallet_id": wallet_id,
            "title": g["title"],
            "target_amount": g["target"],
            "current_amount": g["cur"],
            "target_date": (base_time + timedelta(days=random.randint(60, 365))).strftime("%Y-%m-%d"),
            "category": g["cat"],
            "status": "in_progress"
        })

        # 5. Budgets (2 categories per user)
        budget_categories = ["food", "groceries", "shopping", "entertainment", "utilities"]
        chosen_cats = random.sample(budget_categories, k=2)
        for cat in chosen_cats:
            limit = float(random.choice([5000, 8000, 12000, 15000, 20000]))
            spent = round(random.uniform(0.2 * limit, 0.95 * limit), 2)
            budgets.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "category": cat,
                "amount_limit": limit,
                "spent_amount": spent,
                "period": "monthly",
                "alert_threshold_pct": 80,
                "start_date": "2026-11-01"
            })

    # 6. Generate ~500 Transactions across the 50 users (~10 per user)
    txn_ref_counter = 100000
    for u_idx, u in enumerate(users):
        w = wallets[u_idx]
        user_id = u["id"]
        wallet_id = w["id"]

        # 6.1 Monthly Salary Credit (1 or 2 per user over last 60 days)
        emp_name, emp_upi, sal_min, sal_max = random.choice(EMPLOYERS)
        salary_amt = round(random.uniform(sal_min, sal_max), 2)
        salary_date = base_time - timedelta(days=random.randint(3, 30))
        txn_ref_counter += 1
        transactions.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "wallet_id": wallet_id,
            "pocket_id": None,
            "goal_id": None,
            "reference_id": f"TXN_SAL_{txn_ref_counter}",
            "type": "credit",
            "amount": salary_amt,
            "currency": "INR",
            "category": "salary",
            "status": "completed",
            "counterparty_name": emp_name,
            "counterparty_upi_id": emp_upi,
            "description": f"Monthly Salary Credit — {emp_name}",
            "created_at": salary_date.strftime("%Y-%m-%d %H:%M:%S+00")
        })

        # 6.2 8-10 Daily Expenses / UPI transfers
        num_expenses = random.randint(8, 11)
        for _ in range(num_expenses):
            m = random.choice(MERCHANTS)
            amt = round(random.uniform(m["range"][0], m["range"][1]), 2)
            txn_date = base_time - timedelta(
                days=random.randint(1, 60),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            txn_ref_counter += 1
            transactions.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "wallet_id": wallet_id,
                "pocket_id": None,
                "goal_id": None,
                "reference_id": f"TXN_UPI_{txn_ref_counter}",
                "type": "debit",
                "amount": amt,
                "currency": "INR",
                "category": m["cat"],
                "status": "completed",
                "counterparty_name": m["name"],
                "counterparty_upi_id": m["upi"],
                "description": f"Paid {m['name']} via Cash UPI Simulator",
                "created_at": txn_date.strftime("%Y-%m-%d %H:%M:%S+00")
            })

    # Total transactions will be roughly 50 * (1 + 9) = ~500
    return users, wallets, pockets, goals, budgets, transactions

def generate_sql_file():
    users, wallets, pockets, goals, budgets, transactions = generate_dataset()

    lines = []
    lines.append("-- ==============================================================================")
    lines.append("-- CASH FINTECH WALLET — REPRODUCIBLE DEMO SEED DATASET")
    lines.append(f"-- Total Users: {len(users)} | Total Wallets: {len(wallets)} | Total Transactions: {len(transactions)}")
    lines.append("-- Password for all demo users in auth: 'CashDemo2026!'")
    lines.append("-- ==============================================================================\n")

    lines.append("begin;\n")

    # 1. Auth Users & Profiles
    lines.append("-- 1. DEMO AUTH USERS & PROFILES")
    for u in users:
        # Supabase auth.users record
        lines.append(f"""insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '{u['id']}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  '{u['email']}', '{DEMO_PASSWORD_HASH}', now(),
  '{{"provider":"email","providers":["email"]}}'::jsonb,
  '{{"full_name":"{u['full_name']}","phone":"{u['phone']}","tier":"{u['tier']}","kyc_status":"{u['kyc']}"}}'::jsonb,
  now(), now()
) on conflict (id) do nothing;""")

        # Profiles record (overriding trigger defaults if needed)
        lines.append(f"""insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '{u['id']}', '{u['full_name']}', '{u['email']}', '{u['phone']}', '{u['kyc']}', '{u['tier']}', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;\n""")

    # 2. Wallets
    lines.append("\n-- 2. MASTER WALLETS")
    for w in wallets:
        lines.append(f"""insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '{w['id']}', '{w['user_id']}', '{w['wallet_number']}', 'INR', {w['balance']:.2f}, {w['daily_limit']:.2f}, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;""")

    # 3. Pockets
    lines.append("\n-- 3. VIRTUAL POCKETS")
    for p in pockets:
        lines.append(f"""insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '{p['id']}', '{p['user_id']}', (select id from public.wallets where user_id = '{p['user_id']}'), '{p['name']}', '{p['icon']}', '{p['color']}', {p['balance']:.2f}, {p['target_amount']:.2f}, false
) on conflict (id) do nothing;""")

    # 4. Savings Goals
    lines.append("\n-- 4. SAVINGS GOALS")
    for g in goals:
        lines.append(f"""insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '{g['id']}', '{g['user_id']}', (select id from public.wallets where user_id = '{g['user_id']}'), '{g['title']}', {g['target_amount']:.2f}, {g['current_amount']:.2f}, '{g['target_date']}', '{g['category']}', '{g['status']}'
) on conflict (id) do nothing;""")

    # 5. Budgets
    lines.append("\n-- 5. MONTHLY BUDGETS")
    for b in budgets:
        lines.append(f"""insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '{b['id']}', '{b['user_id']}', '{b['category']}', {b['amount_limit']:.2f}, {b['spent_amount']:.2f}, '{b['period']}', {b['alert_threshold_pct']}, '{b['start_date']}'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;""")

    # 6. Transactions
    lines.append("\n-- 6. SIMULATED TRANSACTIONS (~500 RECORDS)")
    # Batch into multi-row inserts for optimal SQL execution performance
    batch_size = 50
    for chunk_start in range(0, len(transactions), batch_size):
        chunk = transactions[chunk_start:chunk_start+batch_size]
        lines.append("insert into public.transactions (")
        lines.append("  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at")
        lines.append(") values")
        val_rows = []
        for t in chunk:
            p_val = f"'{t['pocket_id']}'" if t['pocket_id'] else "null"
            g_val = f"'{t['goal_id']}'" if t['goal_id'] else "null"
            row_str = f"  ('{t['id']}', '{t['user_id']}', (select id from public.wallets where user_id = '{t['user_id']}'), {p_val}, {g_val}, '{t['reference_id']}', '{t['type']}', {t['amount']:.2f}, '{t['currency']}', '{t['category']}', '{t['status']}', '{t['counterparty_name']}', '{t['counterparty_upi_id']}', '{t['description']}', '{t['created_at']}')"
            val_rows.append(row_str)
        lines.append(",\n".join(val_rows))
        lines.append("on conflict (reference_id) do nothing;\n")

    lines.append("commit;\n")
    return "\n".join(lines)

if __name__ == "__main__":
    sql_content = generate_sql_file()
    out_path = "supabase/seeds/demo_dataset.sql"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    print(f"Successfully generated demo dataset to {out_path}!")
