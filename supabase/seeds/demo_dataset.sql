-- ==============================================================================
-- CASH FINTECH WALLET — REPRODUCIBLE DEMO SEED DATASET
-- Total Users: 50 | Total Wallets: 50 | Total Transactions: 527
-- Password for all demo users in auth: 'CashDemo2026!'
-- ==============================================================================

begin;

-- 1. DEMO AUTH USERS & PROFILES
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '644ff41f-b2ae-4159-8594-98bd913197d4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'aarav.sharma1@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Aarav Sharma","phone":"+91 9786579303","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '644ff41f-b2ae-4159-8594-98bd913197d4', 'Aarav Sharma', 'aarav.sharma1@example.com', '+91 9786579303', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'aditi.verma2@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Aditi Verma","phone":"+91 9271432881","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', 'Aditi Verma', 'aditi.verma2@example.com', '+91 9271432881', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '1d5ce110-6d14-4794-b113-08141dbb0772', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'akash.patel3@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Akash Patel","phone":"+91 9185675980","tier":"pro","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '1d5ce110-6d14-4794-b113-08141dbb0772', 'Akash Patel', 'akash.patel3@example.com', '+91 9185675980', 'verified', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'd8e6d2ac-7d16-45d5-ad26-2ef289670004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'ananya.iyer4@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Ananya Iyer","phone":"+91 9171069472","tier":"standard","kyc_status":"pending"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'd8e6d2ac-7d16-45d5-ad26-2ef289670004', 'Ananya Iyer', 'ananya.iyer4@example.com', '+91 9171069472', 'pending', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '5e8114dd-9a98-4049-8537-077f3b315017', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'arjun.nair5@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Arjun Nair","phone":"+91 9950488739","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '5e8114dd-9a98-4049-8537-077f3b315017', 'Arjun Nair', 'arjun.nair5@example.com', '+91 9950488739', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'deepak.reddy6@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Deepak Reddy","phone":"+91 9264109919","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', 'Deepak Reddy', 'deepak.reddy6@example.com', '+91 9264109919', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '17810ce4-036a-41e1-92c7-1ed933158506', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'divya.gupta7@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Divya Gupta","phone":"+91 9554340903","tier":"basic","kyc_status":"pending"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '17810ce4-036a-41e1-92c7-1ed933158506', 'Divya Gupta', 'divya.gupta7@example.com', '+91 9554340903', 'pending', 'basic', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '024c3664-851f-4897-9637-965c836c2d57', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'gaurav.singh8@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Gaurav Singh","phone":"+91 9399012686","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '024c3664-851f-4897-9637-965c836c2d57', 'Gaurav Singh', 'gaurav.singh8@example.com', '+91 9399012686', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'isha.mehta9@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Isha Mehta","phone":"+91 9399085574","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', 'Isha Mehta', 'isha.mehta9@example.com', '+91 9399085574', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'add2f84f-94b9-414e-8db7-21a001476068', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'karan.chopra10@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Karan Chopra","phone":"+91 9943026227","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'add2f84f-94b9-414e-8db7-21a001476068', 'Karan Chopra', 'karan.chopra10@example.com', '+91 9943026227', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'c37b77fa-89d7-4115-8dae-9d2c2374a97c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'kavya.deshmukh11@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Kavya Deshmukh","phone":"+91 9738360085","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'c37b77fa-89d7-4115-8dae-9d2c2374a97c', 'Kavya Deshmukh', 'kavya.deshmukh11@example.com', '+91 9738360085', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'manish.joshi12@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Manish Joshi","phone":"+91 9570497096","tier":"pro","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', 'Manish Joshi', 'manish.joshi12@example.com', '+91 9570497096', 'verified', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '65e097b9-b580-46b2-8dc7-5bf34fba0bac', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'meera.bose13@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Meera Bose","phone":"+91 9147337803","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '65e097b9-b580-46b2-8dc7-5bf34fba0bac', 'Meera Bose', 'meera.bose13@example.com', '+91 9147337803', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'c13f2e85-882e-44f8-b845-25a7d827bbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'neha.kulkarni14@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Neha Kulkarni","phone":"+91 9536344399","tier":"basic","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'c13f2e85-882e-44f8-b845-25a7d827bbbb', 'Neha Kulkarni', 'neha.kulkarni14@example.com', '+91 9536344399', 'verified', 'basic', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'nikhil.malhotra15@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Nikhil Malhotra","phone":"+91 9399147754","tier":"pro","kyc_status":"pending"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', 'Nikhil Malhotra', 'nikhil.malhotra15@example.com', '+91 9399147754', 'pending', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '1f2b623d-e1f5-4b5c-ba4d-573091a88744', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'pooja.bhat16@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Pooja Bhat","phone":"+91 9861052404","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '1f2b623d-e1f5-4b5c-ba4d-573091a88744', 'Pooja Bhat', 'pooja.bhat16@example.com', '+91 9861052404', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'pranav.rao17@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Pranav Rao","phone":"+91 9100435874","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', 'Pranav Rao', 'pranav.rao17@example.com', '+91 9100435874', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'priya.menon18@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Priya Menon","phone":"+91 9756350429","tier":"pro","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', 'Priya Menon', 'priya.menon18@example.com', '+91 9756350429', 'verified', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '87d5b041-962c-4c60-b6af-0c48a31e12ef', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rahul.agarwal19@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rahul Agarwal","phone":"+91 9910943524","tier":"pro","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '87d5b041-962c-4c60-b6af-0c48a31e12ef', 'Rahul Agarwal', 'rahul.agarwal19@example.com', '+91 9910943524', 'verified', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'ba585597-9206-4bf6-b964-d7b135b85702', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rhea.saxena20@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rhea Saxena","phone":"+91 9348315126","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'ba585597-9206-4bf6-b964-d7b135b85702', 'Rhea Saxena', 'rhea.saxena20@example.com', '+91 9348315126', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '5e103d1e-7efb-4833-a141-5879e2828646', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rohan.kapoor21@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rohan Kapoor","phone":"+91 9517532243","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '5e103d1e-7efb-4833-a141-5879e2828646', 'Rohan Kapoor', 'rohan.kapoor21@example.com', '+91 9517532243', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '830b6ab1-361a-41b4-a012-efc9fdccd6f6', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'sanjay.banerjee22@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sanjay Banerjee","phone":"+91 9173678414","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '830b6ab1-361a-41b4-a012-efc9fdccd6f6', 'Sanjay Banerjee', 'sanjay.banerjee22@example.com', '+91 9173678414', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'shreya.pillai23@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Shreya Pillai","phone":"+91 9502982778","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', 'Shreya Pillai', 'shreya.pillai23@example.com', '+91 9502982778', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '47e33209-15b5-462c-963e-1e459e1641e8', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'siddharth.chatterjee24@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Siddharth Chatterjee","phone":"+91 9567600762","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '47e33209-15b5-462c-963e-1e459e1641e8', 'Siddharth Chatterjee', 'siddharth.chatterjee24@example.com', '+91 9567600762', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '6d6a3d55-7499-43f2-adf5-8b0110384540', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'sneha.mishra25@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sneha Mishra","phone":"+91 9480990401","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '6d6a3d55-7499-43f2-adf5-8b0110384540', 'Sneha Mishra', 'sneha.mishra25@example.com', '+91 9480990401', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '67f104fa-8ecf-4f19-a85c-728b120a7a41', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'tanvi.sharma26@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Tanvi Sharma","phone":"+91 9854684750","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '67f104fa-8ecf-4f19-a85c-728b120a7a41', 'Tanvi Sharma', 'tanvi.sharma26@example.com', '+91 9854684750', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'varun.verma27@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Varun Verma","phone":"+91 9235917419","tier":"standard","kyc_status":"pending"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', 'Varun Verma', 'varun.verma27@example.com', '+91 9235917419', 'pending', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'ba398aa7-03b2-4d41-8981-1e6f46c404c3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'vikram.patel28@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Vikram Patel","phone":"+91 9970957171","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'ba398aa7-03b2-4d41-8981-1e6f46c404c3', 'Vikram Patel', 'vikram.patel28@example.com', '+91 9970957171', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'yash.iyer29@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Yash Iyer","phone":"+91 9268075622","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', 'Yash Iyer', 'yash.iyer29@example.com', '+91 9268075622', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'zoya.nair30@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Zoya Nair","phone":"+91 9738923667","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', 'Zoya Nair', 'zoya.nair30@example.com', '+91 9738923667', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '959eee56-0fc7-4d54-9455-ec3ae99b3655', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'aman.reddy31@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Aman Reddy","phone":"+91 9799552991","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '959eee56-0fc7-4d54-9455-ec3ae99b3655', 'Aman Reddy', 'aman.reddy31@example.com', '+91 9799552991', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'a8abe131-0960-4f9b-b1ca-71fdef6596a4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'bhavna.gupta32@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Bhavna Gupta","phone":"+91 9985758835","tier":"basic","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'a8abe131-0960-4f9b-b1ca-71fdef6596a4', 'Bhavna Gupta', 'bhavna.gupta32@example.com', '+91 9985758835', 'verified', 'basic', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'chirag.singh33@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Chirag Singh","phone":"+91 9221827951","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', 'Chirag Singh', 'chirag.singh33@example.com', '+91 9221827951', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '52ce9349-c609-4ea1-a49d-311c2f77bfb9', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'devika.mehta34@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Devika Mehta","phone":"+91 9420571903","tier":"pro","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '52ce9349-c609-4ea1-a49d-311c2f77bfb9', 'Devika Mehta', 'devika.mehta34@example.com', '+91 9420571903', 'verified', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '31814119-2521-4af5-8cb2-9e9ab07ad934', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'harsh.chopra35@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Harsh Chopra","phone":"+91 9139749508","tier":"standard","kyc_status":"pending"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '31814119-2521-4af5-8cb2-9e9ab07ad934', 'Harsh Chopra', 'harsh.chopra35@example.com', '+91 9139749508', 'pending', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '293a5964-aa91-4a92-8a27-2a399fb6fcb4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'juhi.deshmukh36@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Juhi Deshmukh","phone":"+91 9352082631","tier":"premium","kyc_status":"pending"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '293a5964-aa91-4a92-8a27-2a399fb6fcb4', 'Juhi Deshmukh', 'juhi.deshmukh36@example.com', '+91 9352082631', 'pending', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'ec0cd5cc-f092-4d66-b201-8a49417e3476', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'kunal.joshi37@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Kunal Joshi","phone":"+91 9184791618","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'ec0cd5cc-f092-4d66-b201-8a49417e3476', 'Kunal Joshi', 'kunal.joshi37@example.com', '+91 9184791618', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '6f2979fd-6695-4630-b9ac-b1606a4316c2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'lavanya.bose38@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Lavanya Bose","phone":"+91 9618840705","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '6f2979fd-6695-4630-b9ac-b1606a4316c2', 'Lavanya Bose', 'lavanya.bose38@example.com', '+91 9618840705', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'd22b5dac-0bda-4095-bec5-e99c4308fbd4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'mohit.kulkarni39@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Mohit Kulkarni","phone":"+91 9573330302","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'd22b5dac-0bda-4095-bec5-e99c4308fbd4', 'Mohit Kulkarni', 'mohit.kulkarni39@example.com', '+91 9573330302', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '8873abca-0bf7-4853-9f37-5bbefb077e9a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'nandini.malhotra40@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Nandini Malhotra","phone":"+91 9877621770","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '8873abca-0bf7-4853-9f37-5bbefb077e9a', 'Nandini Malhotra', 'nandini.malhotra40@example.com', '+91 9877621770', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '53f1f834-fe43-4d49-b637-c9cd1d337385', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'omkar.bhat41@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Omkar Bhat","phone":"+91 9424474225","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '53f1f834-fe43-4d49-b637-c9cd1d337385', 'Omkar Bhat', 'omkar.bhat41@example.com', '+91 9424474225', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'd03d749f-498d-447d-84c5-22634a1c4b13', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'payal.rao42@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Payal Rao","phone":"+91 9206681214","tier":"basic","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'd03d749f-498d-447d-84c5-22634a1c4b13', 'Payal Rao', 'payal.rao42@example.com', '+91 9206681214', 'verified', 'basic', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rakesh.menon43@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rakesh Menon","phone":"+91 9350180427","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', 'Rakesh Menon', 'rakesh.menon43@example.com', '+91 9350180427', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '79852118-097b-46cc-a775-e6150332dece', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'sanjana.agarwal44@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sanjana Agarwal","phone":"+91 9217095851","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '79852118-097b-46cc-a775-e6150332dece', 'Sanjana Agarwal', 'sanjana.agarwal44@example.com', '+91 9217095851', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '57de058b-cfac-4e20-9fe0-bc98c0d5e470', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'tarun.saxena45@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Tarun Saxena","phone":"+91 9779760958","tier":"premium","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '57de058b-cfac-4e20-9fe0-bc98c0d5e470', 'Tarun Saxena', 'tarun.saxena45@example.com', '+91 9779760958', 'verified', 'premium', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'urvashi.kapoor46@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Urvashi Kapoor","phone":"+91 9609241268","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', 'Urvashi Kapoor', 'urvashi.kapoor46@example.com', '+91 9609241268', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '92f4497d-3364-4a22-82cb-5312ef7d63ec', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'vivek.banerjee47@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Vivek Banerjee","phone":"+91 9340781088","tier":"pro","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '92f4497d-3364-4a22-82cb-5312ef7d63ec', 'Vivek Banerjee', 'vivek.banerjee47@example.com', '+91 9340781088', 'verified', 'pro', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '317c43e1-27cc-42f6-930b-f7413bd1cf9b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'vidya.pillai48@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Vidya Pillai","phone":"+91 9669601448","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '317c43e1-27cc-42f6-930b-f7413bd1cf9b', 'Vidya Pillai', 'vidya.pillai48@example.com', '+91 9669601448', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'karthik.chatterjee49@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Karthik Chatterjee","phone":"+91 9219066986","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', 'Karthik Chatterjee', 'karthik.chatterjee49@example.com', '+91 9219066986', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'dd25dd36-fe38-4491-badc-62d3ccf5a194', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'ritu.mishra50@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Ritu Mishra","phone":"+91 9896760809","tier":"standard","kyc_status":"verified"}'::jsonb,
  now(), now()
) on conflict (id) do nothing;
insert into public.profiles (
  id, full_name, email, phone, kyc_status, tier, created_at, updated_at
) values (
  'dd25dd36-fe38-4491-badc-62d3ccf5a194', 'Ritu Mishra', 'ritu.mishra50@example.com', '+91 9896760809', 'verified', 'standard', now(), now()
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  kyc_status = excluded.kyc_status,
  tier = excluded.tier;


-- 2. MASTER WALLETS
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'f2a43ab3-9fb7-45e6-b3bb-ccfea5a7a897', '644ff41f-b2ae-4159-8594-98bd913197d4', 'CSH-2051802512', 'INR', 38721.45, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '303ff050-e9a4-4469-b212-b7fb2e721de5', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', 'CSH-1667779376', 'INR', 177726.22, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '7c09ebdf-9455-4c38-a070-73a09dbb1cab', '1d5ce110-6d14-4794-b113-08141dbb0772', 'CSH-6927597015', 'INR', 92079.75, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'af24f6a9-b700-46f5-9599-164e71ab0992', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', 'CSH-2351531223', 'INR', 126424.57, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'bdf5c293-7929-4469-8c67-bcb4c17646e7', '5e8114dd-9a98-4049-8537-077f3b315017', 'CSH-6947530309', 'INR', 116301.03, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '1af9abfd-ca12-44ff-aff7-7818796ed618', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', 'CSH-4944899549', 'INR', 116820.58, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'be2eeb2d-6774-4e46-bcfe-5f437e4ea05c', '17810ce4-036a-41e1-92c7-1ed933158506', 'CSH-3962958940', 'INR', 136201.33, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '1863403a-90cf-46f2-95dd-eed4b1a082ea', '024c3664-851f-4897-9637-965c836c2d57', 'CSH-3030106617', 'INR', 148385.30, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'e83f1b0d-c224-46dc-ba48-387d0272fc97', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', 'CSH-5618742930', 'INR', 152363.78, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '2101f85b-0957-481b-ac53-a0aff3e8f0a1', 'add2f84f-94b9-414e-8db7-21a001476068', 'CSH-8380507338', 'INR', 41315.46, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'd6639f0a-f630-44fc-8d9a-88e687fe3f35', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', 'CSH-2119980130', 'INR', 128853.42, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'a6fc17aa-50a2-49df-9e62-557289fbea83', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', 'CSH-9623534576', 'INR', 153907.70, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'dd86633a-564b-48fc-9565-bc2122e2a898', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', 'CSH-2125089309', 'INR', 141009.25, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '89909db6-bdf7-47d9-ba97-5e48924f9d74', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', 'CSH-2770791023', 'INR', 45491.31, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '591d667e-20ef-40f7-8c12-a03df6b66da1', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', 'CSH-6493800024', 'INR', 124051.90, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '43e545af-9fe1-493f-9a84-10732d42d31a', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', 'CSH-6141226746', 'INR', 88320.56, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '79778aca-8f64-49b1-9991-d7cb9eaf1d83', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', 'CSH-6679017210', 'INR', 90103.62, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '3892e68f-51af-45c5-b968-d7288844d020', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', 'CSH-8285786023', 'INR', 99044.12, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '9f5334e6-5b45-4353-b6f7-5d2f83f2c485', '87d5b041-962c-4c60-b6af-0c48a31e12ef', 'CSH-7462972995', 'INR', 156196.76, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '4743d98f-45ff-4e45-b8a2-32a553ff5be1', 'ba585597-9206-4bf6-b964-d7b135b85702', 'CSH-1918920620', 'INR', 85527.54, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'cf44146a-f5c6-4b3b-a4eb-1c4ffad60b57', '5e103d1e-7efb-4833-a141-5879e2828646', 'CSH-1116402431', 'INR', 124267.44, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '9de1674e-98ba-41a7-9ecd-d80556280624', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', 'CSH-4239406957', 'INR', 176433.99, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '26e235a5-73b1-4bfd-836b-b3741fda031e', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', 'CSH-9916336966', 'INR', 132404.45, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '16f743a6-0efe-47c7-91cb-bb78547693fb', '47e33209-15b5-462c-963e-1e459e1641e8', 'CSH-8088660633', 'INR', 119705.10, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'fc52100d-b8f6-4629-812e-5a2a283880a2', '6d6a3d55-7499-43f2-adf5-8b0110384540', 'CSH-9633533290', 'INR', 176170.64, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'da61826e-618d-46da-84bc-42a9f2da7a40', '67f104fa-8ecf-4f19-a85c-728b120a7a41', 'CSH-1990153355', 'INR', 137618.34, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '4c088560-8dd1-4138-8327-c27a8c01f33a', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', 'CSH-7671625956', 'INR', 133560.96, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '73d01b5f-262b-4989-8022-116695ebed93', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', 'CSH-5268845844', 'INR', 35136.77, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'ae29b81b-6f71-4744-90f9-23524d535890', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', 'CSH-7845366946', 'INR', 64514.08, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'f7909e5f-a197-4e52-8904-3d93390d4ea4', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', 'CSH-6534540349', 'INR', 36140.12, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '5cf28094-0a63-4425-8c4c-556570ca4e6d', '959eee56-0fc7-4d54-9455-ec3ae99b3655', 'CSH-8792122716', 'INR', 179739.39, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'be432589-5a06-405d-aaf1-a414728c7ef4', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', 'CSH-7625389037', 'INR', 85252.09, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '920bde1d-e47e-4971-918c-b2bcec21d031', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', 'CSH-4574027737', 'INR', 99723.84, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '13478751-803e-4d32-b27f-fa36d311be04', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', 'CSH-8129391249', 'INR', 162094.30, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'f2fab795-5cf7-4c3e-9a33-b657de7be010', '31814119-2521-4af5-8cb2-9e9ab07ad934', 'CSH-8924383984', 'INR', 31950.99, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '4bb93cfc-5cdf-431d-b811-643c238ca9b6', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', 'CSH-5283911723', 'INR', 141950.28, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'b2d0531b-8401-48ff-9b07-fd9e287d7346', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', 'CSH-3934040683', 'INR', 99603.43, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'f19bb723-2425-407d-bbeb-83f57d4746de', '6f2979fd-6695-4630-b9ac-b1606a4316c2', 'CSH-8298348088', 'INR', 18729.73, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '11420e52-dca3-41b0-bab3-e3f025832800', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', 'CSH-1564409423', 'INR', 169636.73, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'f5692b32-d012-42d2-a621-3488a5bcaf15', '8873abca-0bf7-4853-9f37-5bbefb077e9a', 'CSH-7688606771', 'INR', 30351.49, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'c8dc9e57-3df7-4300-8b38-3d47a94915eb', '53f1f834-fe43-4d49-b637-c9cd1d337385', 'CSH-5454792171', 'INR', 184307.65, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'f2123466-2387-40e1-bd61-852001b50524', 'd03d749f-498d-447d-84c5-22634a1c4b13', 'CSH-8064477344', 'INR', 25293.52, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '132cac22-80e1-4727-a2e6-dfe3bf3e89c0', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', 'CSH-5307145891', 'INR', 160929.04, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '29f0bfd1-7ab6-4b35-a422-b3200e95c38a', '79852118-097b-46cc-a775-e6150332dece', 'CSH-3641863774', 'INR', 138631.31, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '737f6779-20c9-4ce2-a08f-67cfa4827ff2', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', 'CSH-6561543484', 'INR', 100943.68, 100000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'd254e8d3-0702-4916-8b34-8fb64b11b825', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', 'CSH-5695387521', 'INR', 31415.95, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '0bd5796e-b221-4706-b559-4a02f633d570', '92f4497d-3364-4a22-82cb-5312ef7d63ec', 'CSH-7684109313', 'INR', 34530.50, 200000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  '948f7b63-e120-4242-986c-051282562744', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', 'CSH-2464137110', 'INR', 77909.03, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'fd231907-3d8f-4d77-ba7b-ca87a0dbb171', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', 'CSH-8160279830', 'INR', 22720.95, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;
insert into public.wallets (
  id, user_id, wallet_number, currency, balance, daily_limit, created_at, updated_at
) values (
  'fff962ef-2d1c-41ee-9bfa-25e8a8cb11f5', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', 'CSH-4956362540', 'INR', 161558.70, 50000.00, now(), now()
) on conflict (user_id) do update set
  balance = excluded.balance,
  daily_limit = excluded.daily_limit;

-- 3. VIRTUAL POCKETS
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'e910109f-a27e-4b8f-b353-3d4f93819beb', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), 'Monthly Rent', 'home', '#3B82F6', 7049.90, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'b3d49d20-e939-4ec5-a8e8-3badb21da92c', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), 'Monthly Rent', 'home', '#3B82F6', 11731.89, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '30a04a21-90c8-4aa7-8a74-0b90e556dc4e', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), 'Dining & Treats', 'coffee', '#F59E0B', 2580.30, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'fd4cc1ee-62e7-43f2-a493-aa39703c5d66', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), 'Emergency Stash', 'shield', '#10B981', 15692.89, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '03940dad-00f7-4596-ad74-76aa00b6bb5d', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), 'Dining & Treats', 'coffee', '#F59E0B', 4753.11, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '75a7d68a-7abb-4fc3-ae35-db3d85aab223', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), 'Dining & Treats', 'coffee', '#F59E0B', 5319.36, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '96178674-317d-4e90-9709-836dbe70139b', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), 'Emergency Stash', 'shield', '#10B981', 13915.37, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '8abc5218-7588-4e93-bd5d-6d15a5bf96e5', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), 'Monthly Rent', 'home', '#3B82F6', 14772.11, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'b0bf85f3-4ad2-4fdc-a30a-36ec0de00d62', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), 'Monthly Rent', 'home', '#3B82F6', 12979.85, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'badacb92-4286-4995-9dd7-e6da0b45d4b0', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 10895.75, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '9f08c87b-d182-4c4a-a293-51fbcb38cf2e', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 5741.56, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '4753f234-5475-4589-8b6f-8c2833618f49', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), 'Emergency Stash', 'shield', '#10B981', 16664.35, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '862a2708-67bd-4f89-ab54-fc3a2600d0bf', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), 'Monthly Rent', 'home', '#3B82F6', 22119.34, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '8f657b6a-91ce-4ab0-ae1c-8ca1fc0d1bee', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), 'Monthly Rent', 'home', '#3B82F6', 10934.16, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '718376d6-cca0-49f5-a518-041f1212a978', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 6964.15, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '55a74861-66a3-46d8-9b48-b1a32d1c9f5b', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), 'Dining & Treats', 'coffee', '#F59E0B', 2785.27, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '27fea650-1a59-44e7-830c-6a3716f5f80d', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), 'Monthly Rent', 'home', '#3B82F6', 11283.68, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '33a10cf4-2b02-460f-aea8-01f007fd82cb', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), 'Monthly Rent', 'home', '#3B82F6', 10987.58, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '38377df8-e9f7-419f-a06f-fcc6d9dbfa86', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), 'Monthly Rent', 'home', '#3B82F6', 16033.61, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '9527f76f-4e8c-4f83-80e7-43d03ffff250', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), 'Dining & Treats', 'coffee', '#F59E0B', 4470.28, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'fcc803b6-6af9-4bfa-952e-7512ae2e8844', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), 'Dining & Treats', 'coffee', '#F59E0B', 5217.29, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '36936e13-1351-42cf-bb65-67d9dd7fc913', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), 'Dining & Treats', 'coffee', '#F59E0B', 5738.93, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'e6ddfdae-c820-4efa-8254-fcd415a9aba6', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), 'Monthly Rent', 'home', '#3B82F6', 18512.54, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '0b223834-54ed-4aee-a715-b75701efb78b', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 9260.61, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '320b6b96-41d1-4b08-803e-ce1640033051', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), 'Emergency Stash', 'shield', '#10B981', 41402.28, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'c65669b8-9215-4c26-9934-043db810d927', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), 'Dining & Treats', 'coffee', '#F59E0B', 6461.93, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'a5b7b350-7a15-4d5d-88e4-9048f50c53f2', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), 'Monthly Rent', 'home', '#3B82F6', 11617.63, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '7f9a6049-d304-41d1-9967-f02403f2504d', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), 'Dining & Treats', 'coffee', '#F59E0B', 2373.59, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'e379371b-1aa1-4a8f-9327-05f15355bb3a', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 5170.14, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '0d565f7d-dda1-4baa-91f6-fde67fc05b2d', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), 'Emergency Stash', 'shield', '#10B981', 10713.30, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '80b87856-f39a-4682-942d-5dbf5b8cf84d', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), 'Monthly Rent', 'home', '#3B82F6', 17544.85, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'c0059757-0c42-4cfb-988d-7cdf422b63b5', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), 'Dining & Treats', 'coffee', '#F59E0B', 4789.24, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'fb876a62-35a8-4b49-adf6-185be6d8d90d', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), 'Monthly Rent', 'home', '#3B82F6', 23392.35, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '0b79349b-4471-4367-835a-5ecd4f1a8d5e', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 9339.81, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '8f43f0e4-80f2-4336-a6be-d9766fc5b21d', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), 'Emergency Stash', 'shield', '#10B981', 35202.61, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'ac329485-c9bb-41cd-b1b9-81f41de4c474', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), 'Emergency Stash', 'shield', '#10B981', 36000.84, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'c87c10f0-ec9d-4431-aed9-be81198555ff', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 10599.92, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '89a439b5-40b1-464a-b9f5-20f76c889acb', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), 'Emergency Stash', 'shield', '#10B981', 40396.14, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'be05c660-7ffa-4ead-9261-fd7594c55688', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 3482.56, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '5a3d8e9e-5b1c-410f-a1a3-8ff86a1c134e', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), 'Emergency Stash', 'shield', '#10B981', 31221.12, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'a9362a20-7b1c-472a-b5f3-4aae05c856c1', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), 'Dining & Treats', 'coffee', '#F59E0B', 6217.93, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'e378b1af-c7ac-4e3a-85c8-d4c6dfad9034', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 6505.19, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '68789862-4925-49b2-9ab7-234426a05ab3', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), 'Monthly Rent', 'home', '#3B82F6', 18773.56, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'e90dc0c2-1f00-444d-9c47-3e9ead672466', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), 'Dining & Treats', 'coffee', '#F59E0B', 3926.35, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '5a07018b-4d47-4bed-9801-26c09d87a7a8', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), 'Emergency Stash', 'shield', '#10B981', 22662.28, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'ac5bfb06-9003-4f6d-8f98-242f96888883', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), 'Emergency Stash', 'shield', '#10B981', 27810.52, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'd462425a-bce5-4fef-86d4-74262a103ccc', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 10181.96, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'befca853-9c88-48bb-9e29-441bdd88ce4f', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 9391.60, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '4ba1e28b-fbbf-45a1-8c8b-2ce9b51a0fc6', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), 'Emergency Stash', 'shield', '#10B981', 26951.95, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '3382154a-67ab-47b2-bf9d-5cecf5861194', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), 'Monthly Rent', 'home', '#3B82F6', 23208.83, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '03d2f0da-a8c7-4bea-9e58-070a27324169', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), 'Emergency Stash', 'shield', '#10B981', 13445.51, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'ab29f0a2-40f6-4a8b-8249-fe7ce610e17b', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), 'Dining & Treats', 'coffee', '#F59E0B', 5802.49, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'a4b5566b-7068-4b68-8abe-200396f259c3', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 6055.28, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '7bc5911a-51d9-4d48-bd28-7d24ac2345cf', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 10515.74, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '3e50af97-fa98-49e3-ab92-f7b03c9d1f08', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), 'Dining & Treats', 'coffee', '#F59E0B', 3204.77, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'aafab600-045f-4cdc-a9ac-aa07aba61541', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), 'Monthly Rent', 'home', '#3B82F6', 11534.38, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '1ec84593-e005-42ab-962e-bc31eafb4c53', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 5054.44, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '5f0daaf5-993e-4c15-b5db-353a7bd8a662', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), 'Dining & Treats', 'coffee', '#F59E0B', 2741.53, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '405f17ac-6340-4726-aa59-0d5288a0b3ca', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 5275.10, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '2ba5b5f5-e0ef-47bb-9017-38bfd497bd4a', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), 'Dining & Treats', 'coffee', '#F59E0B', 5225.28, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '6b1d35d9-de6c-4323-b0f7-e17548fcde87', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), 'Emergency Stash', 'shield', '#10B981', 43887.24, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '5fdc3fae-32d2-4f2b-936f-0d7259b39f1c', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), 'Emergency Stash', 'shield', '#10B981', 14549.72, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '4125be59-3579-42ba-bdb7-99b911ae72fb', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), 'Monthly Rent', 'home', '#3B82F6', 23175.03, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '2a267675-00cd-4a53-9a14-01268f575510', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 8201.84, 15000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '5038aa81-a4a8-4a50-9749-434aee8dd006', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), 'Monthly Rent', 'home', '#3B82F6', 19775.92, 25000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '43477add-9a8b-414c-a862-e0e2ff3c8dc8', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), 'Emergency Stash', 'shield', '#10B981', 38411.92, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'aadab2e1-f889-45c6-8297-475bd0713eed', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), 'Dining & Treats', 'coffee', '#F59E0B', 4574.67, 10000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '4a317e3a-36fa-41b1-a3b4-bf51a41f409c', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), 'Emergency Stash', 'shield', '#10B981', 37189.25, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  'a68cfd9f-658e-4cb8-b502-cb84e3172cb9', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), 'Emergency Stash', 'shield', '#10B981', 30976.37, 50000.00, false
) on conflict (id) do nothing;
insert into public.pockets (
  id, user_id, wallet_id, name, icon, color, balance, target_amount, is_locked
) values (
  '55536f2a-fd10-43af-86f8-5ecf79d077b1', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), 'Weekend Roadtrips', 'compass', '#8B5CF6', 5594.63, 15000.00, false
) on conflict (id) do nothing;

-- 4. SAVINGS GOALS
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '9c62a4d8-72a8-4e1d-b7ae-d3b89ae922cc', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), 'Emergency Medical Fund', 100000.00, 76541.27, '2027-08-05', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'c94b1879-129f-41ec-bff8-5cd3bd2c043b', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), 'Emergency Medical Fund', 100000.00, 49056.59, '2027-07-07', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '63e2017d-7571-4efb-9a9f-bc9d2c06b093', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), 'Emergency Medical Fund', 100000.00, 90150.43, '2027-04-25', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '669ae4e2-6dc9-403c-b46f-f10e552c611f', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), 'Goa Year-End Trip', 45000.00, 23709.88, '2027-09-20', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '3603a10c-034b-443c-a9e1-ac61e282c113', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), 'Diwali Gold Coin 10g', 78000.00, 29675.01, '2027-09-16', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '2028d4d3-4cb5-4fed-8e0a-d6c11931b808', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), 'Emergency Medical Fund', 100000.00, 83041.51, '2027-03-08', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '45fc37a4-f931-4c0e-bad8-6213e7f128c1', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), 'MacBook Pro M4', 199900.00, 53087.17, '2027-02-02', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'e5849c5e-84b8-4e18-9f1a-48bf7cb73932', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), 'Diwali Gold Coin 10g', 78000.00, 47672.77, '2027-02-27', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'd9a79c25-64ca-4dd0-a679-5b991be395eb', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), 'Royal Enfield Hunter 350', 185000.00, 83707.70, '2027-02-02', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '4c614a41-3bc1-45b1-a500-cfc1c5a315ef', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), 'MacBook Pro M4', 199900.00, 98022.20, '2027-04-08', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'e0dc779e-963c-4041-be46-78ab502fc2ab', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), 'Emergency Medical Fund', 100000.00, 64946.24, '2027-05-18', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '7adbcc00-c610-47b5-acfc-a8a86c76dd4f', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), 'Diwali Gold Coin 10g', 78000.00, 29087.81, '2027-09-18', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '7524cd7d-5937-40ae-b2f1-a1528e88fd5a', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), 'MacBook Pro M4', 199900.00, 129324.38, '2027-07-05', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '806c979f-6cd5-4c73-aa61-7934a8826158', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), 'Goa Year-End Trip', 45000.00, 32440.90, '2027-08-26', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '4f18c08c-6a16-4b95-a868-f6906b8d2b90', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), 'Diwali Gold Coin 10g', 78000.00, 28273.32, '2027-08-14', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '1b8a7346-3baa-4f3c-9af2-edab37930d70', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), 'Goa Year-End Trip', 45000.00, 31340.57, '2027-08-06', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '80739c14-1db1-4d35-b1ca-8c391efdccb5', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), 'Goa Year-End Trip', 45000.00, 31243.32, '2027-06-10', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '89e8daa4-7921-4806-9405-53bc619b0577', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), 'MacBook Pro M4', 199900.00, 52355.14, '2027-08-24', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '34800bcd-21b7-4f12-969f-ae622ef832ce', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), 'Diwali Gold Coin 10g', 78000.00, 39229.85, '2027-05-03', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '61af1457-580a-4520-ba09-0692d3144b89', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), 'Royal Enfield Hunter 350', 185000.00, 107812.76, '2027-10-05', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'c57ace3c-00c6-40d5-b87a-2521b3150742', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), 'Diwali Gold Coin 10g', 78000.00, 33956.31, '2027-02-13', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '29df50fd-4a68-4917-a108-7a6fff24619d', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), 'MacBook Pro M4', 199900.00, 83129.25, '2027-03-27', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '6d60c050-acc7-4253-89f5-d7354040acd2', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), 'Royal Enfield Hunter 350', 185000.00, 85536.47, '2027-09-10', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'd2f5ff58-bc65-4356-9d6f-61e4cf390457', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), 'Emergency Medical Fund', 100000.00, 60206.05, '2027-07-16', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '523c8b12-1e92-426d-a84b-9f62688758f2', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), 'Emergency Medical Fund', 100000.00, 49903.39, '2027-07-10', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '971d4def-1e93-4e0f-bfac-7ac80a9610c3', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), 'MacBook Pro M4', 199900.00, 117325.58, '2027-04-12', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'd5f8e066-20ee-4bd8-87c1-a2c2ab5879d4', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), 'MacBook Pro M4', 199900.00, 80058.60, '2027-07-27', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '76a44db9-ddaa-4f7e-94a8-80c90126e135', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), 'MacBook Pro M4', 199900.00, 62169.14, '2027-04-19', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '118b6786-2e8e-4547-9d45-85746a9e5611', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), 'Emergency Medical Fund', 100000.00, 57634.03, '2027-04-28', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'eca37c11-4e70-4826-9e07-d66e8340799d', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), 'Goa Year-End Trip', 45000.00, 38461.53, '2027-10-24', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '8960a29d-aa2a-428f-a954-fa3c9ffa8d1c', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), 'MacBook Pro M4', 199900.00, 76455.64, '2027-08-23', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'fb9f23ed-c612-492d-8040-2e7d6f70c557', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), 'MacBook Pro M4', 199900.00, 58382.03, '2027-05-05', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '0ce2fcc2-55fd-4d4d-85cb-a08c4bb3f28f', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), 'MacBook Pro M4', 199900.00, 93908.13, '2027-05-24', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '70e7ced3-cc74-404c-8410-73904ab5db8e', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), 'Royal Enfield Hunter 350', 185000.00, 74467.38, '2027-01-25', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'a7c2cc55-0b11-428a-8515-964090215434', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), 'Diwali Gold Coin 10g', 78000.00, 31928.06, '2027-10-03', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'eba27e40-c8a7-4976-aee9-14abac8faf9b', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), 'Royal Enfield Hunter 350', 185000.00, 45050.73, '2027-03-18', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '763a2b14-6a27-4a40-a558-3e713e6e3567', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), 'Emergency Medical Fund', 100000.00, 52461.77, '2027-06-05', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '0d40b375-0fec-43b6-8ba6-151756f3e788', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), 'Goa Year-End Trip', 45000.00, 38893.92, '2027-04-10', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '1e809740-b78b-44b4-9869-ee64c8b931b1', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), 'Diwali Gold Coin 10g', 78000.00, 39092.39, '2027-03-02', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'd06c998f-e0c9-40f3-a2bd-ba734b8b0fb0', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), 'Emergency Medical Fund', 100000.00, 87475.26, '2027-06-19', 'health', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '53a94ab8-8fc0-4e60-b16e-12cc13b4753d', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), 'Royal Enfield Hunter 350', 185000.00, 48911.95, '2027-05-26', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'a8fc6211-5588-4d36-8805-0873277c2a24', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), 'Goa Year-End Trip', 45000.00, 29108.67, '2027-10-19', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'e2ddbad3-eed5-4bf3-bcb5-d98d496082cf', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), 'MacBook Pro M4', 199900.00, 26857.54, '2027-03-08', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'cce10daa-d754-4888-8d49-507789a4ff58', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), 'Royal Enfield Hunter 350', 185000.00, 49716.56, '2027-02-09', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '2cc3b469-0b1b-41fe-83ef-52cf25775110', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), 'MacBook Pro M4', 199900.00, 81444.36, '2027-06-12', 'gadgets', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '3cb5522b-faa5-4332-ab7a-6876e4b6a4e0', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), 'Diwali Gold Coin 10g', 78000.00, 52514.21, '2027-06-11', 'investment', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'c369a1d3-ef6c-4b17-8de1-78cb86c588a9', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), 'Goa Year-End Trip', 45000.00, 18744.65, '2027-03-17', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  'c69f63fc-222d-4236-bc2b-73cfe756531a', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), 'Royal Enfield Hunter 350', 185000.00, 64489.26, '2027-08-17', 'vehicle', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '9370ce38-4ef0-40c2-ad5d-2ec8122755ca', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), 'Goa Year-End Trip', 45000.00, 19262.31, '2027-07-16', 'travel', 'in_progress'
) on conflict (id) do nothing;
insert into public.savings_goals (
  id, user_id, wallet_id, title, target_amount, current_amount, target_date, category, status
) values (
  '11c76e61-af21-4af1-821b-4c5bc1704875', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), 'Diwali Gold Coin 10g', 78000.00, 55066.11, '2027-02-17', 'investment', 'in_progress'
) on conflict (id) do nothing;

-- 5. MONTHLY BUDGETS
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1592f6ee-ddc4-4fb8-ac6b-5512c374de01', '644ff41f-b2ae-4159-8594-98bd913197d4', 'groceries', 20000.00, 8172.86, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '41ba4b98-cb22-47ef-a688-e58dee0744f6', '644ff41f-b2ae-4159-8594-98bd913197d4', 'entertainment', 5000.00, 3845.53, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'a1449953-744f-4d21-8f38-3e93e40b743e', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', 'utilities', 5000.00, 1171.84, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '0a026519-5d44-4665-970e-21c1557b64b1', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', 'groceries', 8000.00, 6238.41, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '4216e5c6-276b-46dc-8876-46a18fbed470', '1d5ce110-6d14-4794-b113-08141dbb0772', 'shopping', 8000.00, 6530.82, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '622aeb12-07c3-4795-86d0-eca28ff7a13d', '1d5ce110-6d14-4794-b113-08141dbb0772', 'food', 12000.00, 6010.48, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'fc7d128c-0b8b-4b33-b23c-2b928c412f7e', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', 'entertainment', 5000.00, 4229.14, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'e36849cf-5a64-433c-897d-b606292952a4', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', 'food', 8000.00, 5364.68, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'a5bca3ab-29b8-40be-a4b2-b9929909a538', '5e8114dd-9a98-4049-8537-077f3b315017', 'groceries', 12000.00, 9975.02, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1d9b8068-838a-4248-863b-bcda54321c1d', '5e8114dd-9a98-4049-8537-077f3b315017', 'food', 20000.00, 13134.55, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '3311053b-71d1-420d-99c3-866ec4d7649a', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', 'groceries', 20000.00, 6476.90, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '5127f923-698a-497d-b676-10af85eb2029', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', 'entertainment', 20000.00, 17086.50, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'cabbf701-d3c4-420d-bc9b-8a072fd782f0', '17810ce4-036a-41e1-92c7-1ed933158506', 'groceries', 5000.00, 4223.63, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f85d1191-d2da-4954-a0bf-e98df2f7c833', '17810ce4-036a-41e1-92c7-1ed933158506', 'food', 5000.00, 2928.09, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'e7ebfa2f-c52b-4694-ba41-d9b2f8332453', '024c3664-851f-4897-9637-965c836c2d57', 'groceries', 8000.00, 4817.71, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f448bb24-f472-4cd8-8cde-eebd09cd224a', '024c3664-851f-4897-9637-965c836c2d57', 'utilities', 8000.00, 4131.29, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '97ec2477-f764-4ed8-92df-567a6fca8fe8', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', 'groceries', 5000.00, 4694.91, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '5daad326-98a4-42e0-b645-0d620e533533', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', 'entertainment', 12000.00, 10738.66, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'cd79f0ad-21f5-400d-8b93-1d1b1d1c72c4', 'add2f84f-94b9-414e-8db7-21a001476068', 'food', 8000.00, 4022.65, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '4e71fbb0-2616-47e8-9491-f19f64b51468', 'add2f84f-94b9-414e-8db7-21a001476068', 'utilities', 20000.00, 7693.23, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'b9a9d066-d9f5-4434-8dfe-7c3b765f293d', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', 'groceries', 5000.00, 4297.26, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'ed4420c9-fe87-4545-8d9d-5d7d8226d028', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', 'shopping', 12000.00, 4964.89, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1ad6a64c-9163-409a-9d5e-db80f333eaea', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', 'entertainment', 5000.00, 1346.12, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'a1b751a7-04c2-4cb9-a479-e325914249cb', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', 'shopping', 15000.00, 12330.17, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '587fa1c7-57e3-434e-bc81-9e976c2f0814', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', 'groceries', 5000.00, 2326.29, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '7b4938e1-9ccd-40b7-897b-da0146c4584e', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', 'utilities', 20000.00, 17262.02, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd632cc94-268d-49cf-99b1-fed4c88e6131', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', 'shopping', 8000.00, 2937.54, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '780b2eeb-431d-41db-8253-191dfc5b37d4', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', 'utilities', 8000.00, 3990.80, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '90d71f13-6ebc-416e-81de-aab8bdd40d4d', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', 'utilities', 15000.00, 13119.43, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '6ec12b55-2067-4ed0-9c18-24350340cfaa', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', 'food', 8000.00, 3128.34, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '995f8785-11b1-4782-86be-b59573eac1a9', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', 'entertainment', 20000.00, 12536.58, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '14e1b6fb-68b7-4d63-8ab8-2d0eb59b6450', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', 'groceries', 15000.00, 9164.29, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '2b0ff82b-b36d-4320-b66b-f7ce7c9558c4', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', 'groceries', 8000.00, 1746.55, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'a1b1063e-e013-440f-8d45-fc0e2c343ab9', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', 'utilities', 8000.00, 7503.62, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '2bc9a3cf-3da4-4137-99f3-cb6fae81db32', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', 'groceries', 20000.00, 18818.39, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '07f7088c-b435-447a-9e63-07a65e205937', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', 'entertainment', 20000.00, 8759.47, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd6f967c9-315b-4d84-bd33-fea7b376361e', '87d5b041-962c-4c60-b6af-0c48a31e12ef', 'shopping', 12000.00, 10437.24, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '00d9f3b8-29cf-41b5-8028-980e53552556', '87d5b041-962c-4c60-b6af-0c48a31e12ef', 'utilities', 5000.00, 1518.90, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'ad2ddc09-27f1-4311-94f4-8f5cea0ecc9c', 'ba585597-9206-4bf6-b964-d7b135b85702', 'utilities', 15000.00, 5468.49, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '9c66775f-6601-4dcd-bde8-9513443f22a1', 'ba585597-9206-4bf6-b964-d7b135b85702', 'groceries', 15000.00, 8463.47, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'ceb0a138-b1b7-4576-908d-4c8585cad5e7', '5e103d1e-7efb-4833-a141-5879e2828646', 'entertainment', 20000.00, 4781.28, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd12ccb18-bc6a-493c-a718-67985e484b5e', '5e103d1e-7efb-4833-a141-5879e2828646', 'food', 12000.00, 4418.00, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd6c17dc6-4aa9-45b3-8e3a-dd9c8d65039c', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', 'shopping', 20000.00, 4385.18, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '622b288d-9a6e-4462-aed6-2d9be511890a', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', 'food', 12000.00, 7582.17, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'be8b54f5-c97c-4275-b65c-59f26f1aac4c', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', 'food', 12000.00, 8120.27, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '851763ed-72f5-4533-a023-761b091f8a6b', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', 'entertainment', 15000.00, 10957.22, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '16bfb9e0-e08d-461a-9ada-45d042375ac8', '47e33209-15b5-462c-963e-1e459e1641e8', 'shopping', 15000.00, 12573.22, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '5e9e9e1e-ea47-4cac-a342-b11471190d27', '47e33209-15b5-462c-963e-1e459e1641e8', 'food', 8000.00, 4525.30, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '486ac275-3a9e-483b-9cdb-8f1740afd6b0', '6d6a3d55-7499-43f2-adf5-8b0110384540', 'entertainment', 15000.00, 14212.10, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '4459c351-052c-4132-968f-6b2efc622533', '6d6a3d55-7499-43f2-adf5-8b0110384540', 'shopping', 20000.00, 8961.87, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd7a38ba4-e593-4f59-a64e-77380709944c', '67f104fa-8ecf-4f19-a85c-728b120a7a41', 'shopping', 12000.00, 4014.97, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '04edab11-88e7-4f64-bac9-b7dce98a8752', '67f104fa-8ecf-4f19-a85c-728b120a7a41', 'groceries', 5000.00, 3655.07, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f21e2b10-be16-4229-b57d-8965fec871a3', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', 'entertainment', 20000.00, 13441.69, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '94e6ab06-865b-457b-b780-8e094b363b66', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', 'food', 5000.00, 1568.98, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '0cccdb18-c053-4f89-be7e-5066c25e439c', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', 'groceries', 5000.00, 1588.96, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '8a691db5-28fa-4bfb-ba01-17116c2acc75', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', 'shopping', 8000.00, 4911.95, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '5ed36c03-3c50-4e66-8898-895118487754', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', 'groceries', 8000.00, 2028.46, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '256feba4-df84-4803-a55b-8abec31ed7bb', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', 'shopping', 8000.00, 6355.77, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'adf7b5de-0b84-40db-987c-b9fcdce18de6', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', 'utilities', 12000.00, 7586.22, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'cd49dc51-35bf-4e79-bb9f-59036e4aead4', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', 'food', 8000.00, 4423.00, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'a8018f01-2451-481a-bd12-1cc3ebbe0f7b', '959eee56-0fc7-4d54-9455-ec3ae99b3655', 'food', 12000.00, 5309.46, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'b6e11cb6-4ed5-4fd7-b2f3-2332faccd25e', '959eee56-0fc7-4d54-9455-ec3ae99b3655', 'shopping', 15000.00, 12730.24, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f7c1d7e4-23b7-4582-80a3-3797bcec2e9c', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', 'groceries', 20000.00, 4205.12, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1cfaccd6-98a6-47fc-8dad-06b7e8c4097c', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', 'shopping', 15000.00, 4048.60, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '805375c4-7726-4fea-bf82-729e946ac2e9', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', 'entertainment', 20000.00, 8007.59, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1a624a93-fc32-44f1-b200-2248fe36c4fb', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', 'shopping', 5000.00, 2060.65, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '2aaae6a5-7728-4f44-9f68-05334f5fbb3c', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', 'shopping', 15000.00, 7343.39, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f33243c6-5c50-4f44-bfc3-e9ba7b978729', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', 'entertainment', 8000.00, 4571.97, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '50620a9c-7798-43cd-9bba-6f5d05def3f1', '31814119-2521-4af5-8cb2-9e9ab07ad934', 'entertainment', 15000.00, 12814.31, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f6e5fc1a-bf2f-46ef-b9a6-41f9bcf75278', '31814119-2521-4af5-8cb2-9e9ab07ad934', 'shopping', 5000.00, 3315.47, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '0f54f61c-334d-488b-861f-67e593f79190', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', 'groceries', 20000.00, 14227.01, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '6810acc8-a1ea-40b5-bec0-e0feef26b9f2', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', 'entertainment', 8000.00, 2619.90, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '87ce568c-b2ee-4af8-b01b-251fd1b10b61', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', 'entertainment', 15000.00, 12509.67, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '9cb0d4f5-d6b1-48c0-931c-6d9bc2087f88', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', 'shopping', 8000.00, 7596.24, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'cfb42109-eca9-4d82-98b8-0dce1aad8c33', '6f2979fd-6695-4630-b9ac-b1606a4316c2', 'utilities', 8000.00, 5369.49, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '896f269e-f0cd-4ca6-ac63-925fea519b19', '6f2979fd-6695-4630-b9ac-b1606a4316c2', 'shopping', 5000.00, 2158.50, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd6e0848a-e611-4b36-b9fe-5984a60bb293', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', 'entertainment', 8000.00, 6124.91, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1a98ab67-7c7e-4197-bbbb-7580008e1c92', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', 'food', 8000.00, 6760.84, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '24b6765f-b1e0-4a8f-b5fa-72081648d7d9', '8873abca-0bf7-4853-9f37-5bbefb077e9a', 'utilities', 5000.00, 3382.76, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '97552c51-b8b1-40b3-8d09-6166c0e30b68', '8873abca-0bf7-4853-9f37-5bbefb077e9a', 'groceries', 15000.00, 13230.61, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'be99750c-b11c-4ee7-991a-a684383256c5', '53f1f834-fe43-4d49-b637-c9cd1d337385', 'food', 8000.00, 4260.30, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '017340c8-f72f-4b98-beb8-d9c18bab3429', '53f1f834-fe43-4d49-b637-c9cd1d337385', 'shopping', 8000.00, 6732.70, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '59bf57c2-1a56-4237-8fd3-c59a446a9330', 'd03d749f-498d-447d-84c5-22634a1c4b13', 'groceries', 20000.00, 7107.36, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '1613b35b-7089-4046-8956-8310c8f1b5cc', 'd03d749f-498d-447d-84c5-22634a1c4b13', 'food', 8000.00, 6478.32, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'f1d0b2be-92c0-4b55-bf25-14af567da7de', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', 'entertainment', 5000.00, 2785.92, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '6a52ed95-77ef-47a5-b9d8-c93fc33f15d7', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', 'food', 12000.00, 7019.14, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'af9eb074-178b-40ec-a392-6c6245412ccd', '79852118-097b-46cc-a775-e6150332dece', 'food', 20000.00, 6225.01, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '756e984c-c2ec-4ba8-ad2f-209a00513599', '79852118-097b-46cc-a775-e6150332dece', 'shopping', 8000.00, 3250.10, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd9d222c3-054f-430c-809a-53ddcb71c273', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', 'entertainment', 12000.00, 5768.71, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '32da1ec6-bcc5-4c73-8b6f-9aa36af4a07e', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', 'shopping', 8000.00, 5720.93, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '630df893-5fd9-4423-b29a-e1a240447445', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', 'shopping', 20000.00, 11611.19, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '3c456874-d272-4201-82eb-5d06c7036541', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', 'food', 8000.00, 5540.42, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'feb4b7b3-d14f-4e69-85fe-8c7a4d4a9463', '92f4497d-3364-4a22-82cb-5312ef7d63ec', 'utilities', 5000.00, 1532.03, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd20ecc8b-6045-4fae-98f6-b366a821efce', '92f4497d-3364-4a22-82cb-5312ef7d63ec', 'entertainment', 5000.00, 1344.09, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '7a6f39f0-427b-4c9b-9ca2-886aba022c19', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', 'entertainment', 8000.00, 6129.66, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '68fcc9f8-6b03-453f-b006-68c307c70fcc', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', 'shopping', 5000.00, 2294.40, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  '5a572bce-83e6-4b00-8106-6fae4dfa9582', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', 'utilities', 20000.00, 12380.85, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'b62cbb86-051d-44db-a712-eab9765afd5d', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', 'groceries', 12000.00, 3048.68, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'd7268c3b-d49a-496f-88e1-8c0886930c06', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', 'entertainment', 8000.00, 4214.06, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;
insert into public.budgets (
  id, user_id, category, amount_limit, spent_amount, period, alert_threshold_pct, start_date
) values (
  'a30b5d51-d4b9-4414-a033-8db266847c85', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', 'food', 15000.00, 8894.58, 'monthly', 80, '2026-11-01'
) on conflict (user_id, category, period, start_date) do update set
  amount_limit = excluded.amount_limit,
  spent_amount = excluded.spent_amount;

-- 6. SIMULATED TRANSACTIONS (~500 RECORDS)
insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('510d0c48-eace-4c65-838e-1b6a0209a190', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_SAL_100001', 'credit', 176405.06, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-09 03:00:00+00'),
  ('dd09632a-48a0-4b93-9826-6040af881544', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100002', 'debit', 396.45, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-24 00:28:00+00'),
  ('1baa00d0-0335-4536-8c15-bfba6f6a45fc', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100003', 'debit', 1284.68, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-21 15:38:00+00'),
  ('9de080f0-fe6f-4002-95bc-5e9b73212f4e', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100004', 'debit', 2389.39, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-24 18:48:00+00'),
  ('83cbfb0d-6684-4f79-b303-7bf215f80141', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100005', 'debit', 6000.71, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-15 06:56:00+00'),
  ('17671085-a7c8-4e1c-b91e-9edebb477e09', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100006', 'debit', 9071.32, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-23 11:31:00+00'),
  ('bf104f03-3975-409e-82e4-78ed8c02d8c0', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100007', 'debit', 241.60, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-07 08:19:00+00'),
  ('30b07e27-0b60-4041-ae71-9285fa586064', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100008', 'debit', 1431.12, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-23 16:51:00+00'),
  ('005bb612-ff7c-4762-b422-d59c12023d6b', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100009', 'debit', 131.29, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-05 06:41:00+00'),
  ('425ad221-1403-4916-8c52-72e42a77557a', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100010', 'debit', 534.42, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-11 10:56:00+00'),
  ('77f4dc15-df9a-4d39-a929-0c6f8d130793', '644ff41f-b2ae-4159-8594-98bd913197d4', (select id from public.wallets where user_id = '644ff41f-b2ae-4159-8594-98bd913197d4'), null, null, 'TXN_UPI_100011', 'debit', 7424.81, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-11-01 01:37:00+00'),
  ('03ed8d2e-8ce5-4d65-aba7-eb236e605b75', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_SAL_100012', 'credit', 124449.24, 'INR', 'salary', 'completed', 'Swiggy Bundl Tech', 'finance@swiggy.in', 'Monthly Salary Credit — Swiggy Bundl Tech', '2026-10-12 03:00:00+00'),
  ('7c309fe7-8122-4548-861a-3e712880fa7c', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100013', 'debit', 3607.07, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-26 09:10:00+00'),
  ('27b1f0c1-36ac-4774-b0d7-02f058a9901d', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100014', 'debit', 649.73, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-12 08:19:00+00'),
  ('96b0cdcf-5d8f-4a94-81a5-955a6d61160d', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100015', 'debit', 5637.07, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-03 10:51:00+00'),
  ('8882152e-7585-4149-b5d9-4d1d4160d041', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100016', 'debit', 650.52, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-12 16:15:00+00'),
  ('63001f09-67e3-4a99-869e-f82e8bf786f8', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100017', 'debit', 896.46, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-23 01:45:00+00'),
  ('2494b6fe-4df1-4069-acaf-80b59376c004', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100018', 'debit', 297.38, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-30 10:21:00+00'),
  ('ac395dfa-0dcf-44f9-9e9e-ca0b5c3d3b40', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100019', 'debit', 3901.67, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-05 17:36:00+00'),
  ('7cb4b5c2-b158-4c7d-865c-900ac53d1c54', '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7', (select id from public.wallets where user_id = '390e5bbd-0d48-4790-9a3e-4c6d40ca33a7'), null, null, 'TXN_UPI_100020', 'debit', 615.17, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-20 07:57:00+00'),
  ('732ca63c-1a7e-48b6-ad20-7b212b96e1a0', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_SAL_100021', 'credit', 165706.39, 'INR', 'salary', 'completed', 'Swiggy Bundl Tech', 'finance@swiggy.in', 'Monthly Salary Credit — Swiggy Bundl Tech', '2026-10-22 03:00:00+00'),
  ('b3f751de-28a6-4cf1-bda7-b752b2a6295f', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100022', 'debit', 1046.25, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-20 14:42:00+00'),
  ('1157b020-ad85-4c70-9e3e-c0dac66101a7', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100023', 'debit', 620.43, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-21 07:05:00+00'),
  ('862f774a-3f9e-4223-b0cd-db646fd08e8b', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100024', 'debit', 3166.23, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-26 05:51:00+00'),
  ('f29ac50d-35d5-40f1-b1f0-28d69e132f0f', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100025', 'debit', 2006.60, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-22 04:18:00+00'),
  ('42aca3e8-76f1-40b3-b7eb-8233a3951a0d', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100026', 'debit', 498.29, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-19 00:41:00+00'),
  ('d693934c-dfdf-4628-8231-31c3bcb07433', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100027', 'debit', 2630.04, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-13 16:08:00+00'),
  ('bfa9ac3d-05e2-45c3-b442-dfa6ca550e39', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100028', 'debit', 5860.60, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-10 03:17:00+00'),
  ('884c0a3f-e926-40eb-a71f-e621e303eb03', '1d5ce110-6d14-4794-b113-08141dbb0772', (select id from public.wallets where user_id = '1d5ce110-6d14-4794-b113-08141dbb0772'), null, null, 'TXN_UPI_100029', 'debit', 2239.23, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-21 13:28:00+00'),
  ('adacc8e5-5f53-4640-bb8e-7d58cdb9665c', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_SAL_100030', 'credit', 59312.60, 'INR', 'salary', 'completed', 'Tata Consultancy Services', 'salary@tcs.com', 'Monthly Salary Credit — Tata Consultancy Services', '2026-10-23 03:00:00+00'),
  ('4f69faa5-8980-4ed9-9e89-f18da70635db', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100031', 'debit', 5915.91, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-14 11:48:00+00'),
  ('edd82ec9-1611-49f0-b980-ad3dff05283f', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100032', 'debit', 949.98, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-25 00:42:00+00'),
  ('48f451f6-cd79-4a40-8e6e-65224e41ec29', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100033', 'debit', 1239.99, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-29 03:04:00+00'),
  ('3d4e3ccf-1c52-4ffd-869f-9ac05965d9b0', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100034', 'debit', 1977.41, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-12 07:52:00+00'),
  ('d0b1abae-31a4-419f-817b-c6ae3c2f2918', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100035', 'debit', 527.39, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-22 04:11:00+00'),
  ('8228b372-d831-41d5-a46a-672c7206fc00', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100036', 'debit', 7046.13, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-31 13:37:00+00'),
  ('82127da0-400d-48a0-b3ca-043b2f3accd6', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100037', 'debit', 924.76, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-24 17:12:00+00'),
  ('b4d11a49-35d8-4942-baa2-29922b1082ea', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100038', 'debit', 161.12, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-18 17:09:00+00'),
  ('da03fb07-fa68-41b0-9c99-0e854bcdd166', 'd8e6d2ac-7d16-45d5-ad26-2ef289670004', (select id from public.wallets where user_id = 'd8e6d2ac-7d16-45d5-ad26-2ef289670004'), null, null, 'TXN_UPI_100039', 'debit', 2916.72, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-21 15:17:00+00'),
  ('ec0779fa-7653-42d9-98b1-76c4e3322e70', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_SAL_100040', 'credit', 123988.59, 'INR', 'salary', 'completed', 'Wipro Technologies Ltd', 'payroll@wipro.com', 'Monthly Salary Credit — Wipro Technologies Ltd', '2026-10-18 03:00:00+00'),
  ('4f6de204-d3df-4aa9-af1b-0bc39e2bb050', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100041', 'debit', 928.34, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-07 21:08:00+00'),
  ('eaa48f4f-7d97-483d-9d60-d301945b8fe9', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100042', 'debit', 12257.38, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-25 18:57:00+00'),
  ('3cb42472-8932-41ca-9fb2-fdcba4db42e4', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100043', 'debit', 2828.64, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-28 23:15:00+00'),
  ('76059e99-afb7-4351-8371-4e203c815363', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100044', 'debit', 5800.48, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-16 00:12:00+00'),
  ('9768f4c0-d753-4efa-a809-5be970c8dccb', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100045', 'debit', 3099.84, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-06 10:51:00+00'),
  ('0e78c6b8-3794-4b83-a5bc-816abba5b826', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100046', 'debit', 512.76, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-05 19:08:00+00'),
  ('7a5e20a9-5ac9-4bbb-a018-fd1a1606626a', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100047', 'debit', 278.23, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-05 02:34:00+00'),
  ('242c72c8-84bf-4dae-997a-cf99777bc782', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100048', 'debit', 596.45, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-10 19:36:00+00'),
  ('c4f4e698-acd6-412a-ae24-75ded85a6f71', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100049', 'debit', 712.38, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-11-01 16:01:00+00'),
  ('78e60f29-53bc-4689-8625-62549bb93b2d', '5e8114dd-9a98-4049-8537-077f3b315017', (select id from public.wallets where user_id = '5e8114dd-9a98-4049-8537-077f3b315017'), null, null, 'TXN_UPI_100050', 'debit', 1886.39, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-22 16:10:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('dc99151e-e138-46d8-9a1f-1f2a9ddfcad2', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_SAL_100051', 'credit', 75319.97, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-23 03:00:00+00'),
  ('9b39eda1-f454-487a-b14e-6ce70f965b9b', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100052', 'debit', 6570.49, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-03 12:21:00+00'),
  ('24512f03-e870-4958-a8ba-ec22836df1b7', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100053', 'debit', 874.69, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-11-01 18:47:00+00'),
  ('637f1128-bacf-439d-a90a-4da7ad5c01da', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100054', 'debit', 4889.98, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-17 07:27:00+00'),
  ('6be8c790-44a0-4442-b61b-e8e4e26c2d7c', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100055', 'debit', 515.68, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-15 19:41:00+00'),
  ('c74c77eb-d3b8-4aca-9876-e1f673d3fe49', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100056', 'debit', 343.11, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-07 06:10:00+00'),
  ('46e06bc9-1f92-4d39-8060-ebd657fd9d1a', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100057', 'debit', 130.31, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-10 11:22:00+00'),
  ('5fafb4d2-dc9e-4369-bea8-278d3758ba25', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100058', 'debit', 1549.31, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-01 08:45:00+00'),
  ('3ff2a205-4e60-4d4e-864f-96cec0943e63', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100059', 'debit', 2829.47, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-11-02 07:38:00+00'),
  ('20f333b2-46b5-456f-a8ea-0af17fbf2985', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100060', 'debit', 593.65, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-22 05:18:00+00'),
  ('1bed0836-c114-47df-8733-eac97e887f15', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100061', 'debit', 923.35, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-11 00:27:00+00'),
  ('141c5599-95fb-4c9d-bb02-246c478356b9', '6318eb72-c1d3-42bc-a867-e815ff6e4bd3', (select id from public.wallets where user_id = '6318eb72-c1d3-42bc-a867-e815ff6e4bd3'), null, null, 'TXN_UPI_100062', 'debit', 3021.98, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-01 09:59:00+00'),
  ('55c1e99c-63f1-481b-aae9-1887aa6a7ce5', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_SAL_100063', 'credit', 176699.80, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-31 03:00:00+00'),
  ('6bbe6ac8-2a3d-4af4-9204-27f2d1cf0ff5', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100064', 'debit', 1859.49, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-11-01 15:10:00+00'),
  ('f704f278-928d-491b-a5be-71654be5dfba', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100065', 'debit', 669.62, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-17 05:20:00+00'),
  ('abc3af10-c738-4e92-8447-3c0c298ff789', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100066', 'debit', 1754.43, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-16 16:52:00+00'),
  ('acea0b81-6156-4296-9295-5ee3effa8306', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100067', 'debit', 552.30, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-12 06:49:00+00'),
  ('275dee53-7de7-4cfe-ad7f-72d9ccfa0339', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100068', 'debit', 295.55, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-03 06:49:00+00'),
  ('f19976f1-0234-48e8-9b28-55b26d110e4f', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100069', 'debit', 1003.87, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-14 12:58:00+00'),
  ('478d0952-83e3-413b-b289-be22dd8f34fa', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100070', 'debit', 5213.52, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-13 20:04:00+00'),
  ('688fe015-124d-4f9c-9098-03b054c19e61', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100071', 'debit', 515.60, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-14 10:35:00+00'),
  ('5da14d67-eb62-4473-a127-5edccf5acc5d', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100072', 'debit', 2920.20, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-31 06:48:00+00'),
  ('25942caf-f474-4f2b-a378-e55fe832abeb', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100073', 'debit', 6534.28, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-15 01:05:00+00'),
  ('f5db33db-b2e9-46ab-99b0-89ac9e76fd57', '17810ce4-036a-41e1-92c7-1ed933158506', (select id from public.wallets where user_id = '17810ce4-036a-41e1-92c7-1ed933158506'), null, null, 'TXN_UPI_100074', 'debit', 1135.61, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-12 15:33:00+00'),
  ('5fa8b717-a533-495c-9782-27c97668299d', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_SAL_100075', 'credit', 163047.31, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-20 03:00:00+00'),
  ('d0c44760-d6de-4cdf-9f43-c93fa0bd82f7', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100076', 'debit', 5066.08, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-02 15:01:00+00'),
  ('a1819146-6c7e-47fd-8bc4-763e6a9d4846', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100077', 'debit', 3053.59, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-28 03:33:00+00'),
  ('21cedb35-aa68-471e-9665-758e5c317c1c', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100078', 'debit', 791.46, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-11 21:26:00+00'),
  ('ffd52642-1e99-42dc-9920-9d77759cad8c', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100079', 'debit', 6230.30, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-28 16:18:00+00'),
  ('f787f999-d383-442d-8c63-11146cb38866', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100080', 'debit', 6105.21, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-25 04:33:00+00'),
  ('56a143b7-6f0f-4779-8c50-0707d21a92a7', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100081', 'debit', 6769.62, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-11 12:58:00+00'),
  ('ebd2a228-b842-4b8c-bd32-392aa1a2cc37', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100082', 'debit', 2798.61, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-06 18:20:00+00'),
  ('47e78f5e-c8c0-484e-8650-91334a463bc1', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100083', 'debit', 275.04, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-23 14:37:00+00'),
  ('eb3cd040-726f-4257-9432-24652d1d0b09', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100084', 'debit', 5565.15, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-20 21:59:00+00'),
  ('28b88b1a-296d-4cf0-826e-fd82693f2838', '024c3664-851f-4897-9637-965c836c2d57', (select id from public.wallets where user_id = '024c3664-851f-4897-9637-965c836c2d57'), null, null, 'TXN_UPI_100085', 'debit', 7289.20, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-20 12:58:00+00'),
  ('ad231a4b-6aa2-4e85-bd67-c81d2f4493da', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_SAL_100086', 'credit', 70042.50, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-08 03:00:00+00'),
  ('b4ef3222-193f-4778-9b7a-8a9750b976fc', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100087', 'debit', 2195.42, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-28 01:22:00+00'),
  ('c1a50b4e-6491-4441-963a-898b264ab6c1', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100088', 'debit', 5932.18, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-10 15:32:00+00'),
  ('5bc240ea-3f6f-42a9-b154-8a7cb200120a', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100089', 'debit', 994.97, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-30 15:35:00+00'),
  ('5d6130c9-dc27-46dd-9a51-70a2c07c2991', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100090', 'debit', 1323.78, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-18 23:59:00+00'),
  ('d4a430f8-d8f3-481b-874e-dcd13bda83cd', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100091', 'debit', 5091.09, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-09 09:53:00+00'),
  ('af77e8b4-8cf5-41ba-831c-22210276128d', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100092', 'debit', 653.73, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-18 12:47:00+00'),
  ('cc6c3b54-f21a-4bf1-a7d4-604cd5993a4e', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100093', 'debit', 9398.84, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-02 20:53:00+00'),
  ('e5d0d8f9-b8f5-44e2-9375-15d84e64a524', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100094', 'debit', 7322.46, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-05 21:03:00+00'),
  ('410eaf3d-1137-4f22-bff1-c76f1481bcb2', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100095', 'debit', 298.51, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-12 05:06:00+00'),
  ('b3ec3be8-7c3c-46fb-a41a-7d02032bcc3e', '6b7da639-b46f-40c9-9e3e-3182f8f1dde2', (select id from public.wallets where user_id = '6b7da639-b46f-40c9-9e3e-3182f8f1dde2'), null, null, 'TXN_UPI_100096', 'debit', 1332.92, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-19 00:25:00+00'),
  ('5c18a07f-8aa2-40d0-9f53-88197c122141', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_SAL_100097', 'credit', 78873.55, 'INR', 'salary', 'completed', 'Wipro Technologies Ltd', 'payroll@wipro.com', 'Monthly Salary Credit — Wipro Technologies Ltd', '2026-10-23 03:00:00+00'),
  ('7902a54d-7263-41e2-ad9c-120405028400', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100098', 'debit', 7684.32, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-01 19:53:00+00'),
  ('7d17a9ee-73cb-407b-939a-1ec33fb5cffb', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100099', 'debit', 12130.51, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-18 11:59:00+00'),
  ('2a789d8f-9ec6-4a54-9584-20d920fbb462', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100100', 'debit', 2640.46, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-10 12:09:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('22983a23-4a12-40a7-96bf-9b617e5de8b3', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100101', 'debit', 1889.31, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-08 00:56:00+00'),
  ('fdade4cd-590b-4ae0-b98d-5ca82e3b835b', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100102', 'debit', 6884.36, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-18 03:30:00+00'),
  ('c2df9ff9-c9de-4d96-afc6-ccaba3f33cee', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100103', 'debit', 3730.74, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-07 08:56:00+00'),
  ('88168d40-cb79-43a4-bae7-f259ea04f62f', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100104', 'debit', 8279.01, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-23 00:32:00+00'),
  ('b1a47940-a201-4472-bef1-34ef592a7a2d', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100105', 'debit', 241.42, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-11 22:04:00+00'),
  ('0e6fa91e-022a-40de-a4b1-6c0df8f9d19f', 'add2f84f-94b9-414e-8db7-21a001476068', (select id from public.wallets where user_id = 'add2f84f-94b9-414e-8db7-21a001476068'), null, null, 'TXN_UPI_100106', 'debit', 3419.38, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-22 22:33:00+00'),
  ('d7fb3536-fae8-46fd-aa2c-f3ee665c4d01', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_SAL_100107', 'credit', 119196.30, 'INR', 'salary', 'completed', 'Wipro Technologies Ltd', 'payroll@wipro.com', 'Monthly Salary Credit — Wipro Technologies Ltd', '2026-10-31 03:00:00+00'),
  ('db219de5-7203-442c-9faa-bbd95607d337', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100108', 'debit', 2519.17, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-23 21:40:00+00'),
  ('a66a5f3c-cb4e-4389-8670-b9b0eea7624e', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100109', 'debit', 407.20, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-30 17:06:00+00'),
  ('f04835bf-9ba6-492e-9a0d-00639224ad33', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100110', 'debit', 535.86, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-23 09:43:00+00'),
  ('6ec79771-a1a3-46ee-a09a-9d7b3c7a75c1', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100111', 'debit', 5499.80, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-24 09:55:00+00'),
  ('d6e9a953-9c1a-4d9b-abe1-f8a9376cad12', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100112', 'debit', 4812.64, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-26 08:51:00+00'),
  ('4f51830f-f963-4e96-bfe7-a6bb8116fb98', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100113', 'debit', 6496.51, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-17 07:39:00+00'),
  ('b8516afd-8fa1-48d5-ac55-fce2bdcc8a15', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100114', 'debit', 1025.24, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-11-02 00:58:00+00'),
  ('bade9b03-d5fb-4cb2-84ed-aaa0c54c9e26', 'c37b77fa-89d7-4115-8dae-9d2c2374a97c', (select id from public.wallets where user_id = 'c37b77fa-89d7-4115-8dae-9d2c2374a97c'), null, null, 'TXN_UPI_100115', 'debit', 573.23, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-14 08:34:00+00'),
  ('190892fd-4a8f-4552-bd10-dba958febcaa', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_SAL_100116', 'credit', 101534.43, 'INR', 'salary', 'completed', 'Wipro Technologies Ltd', 'payroll@wipro.com', 'Monthly Salary Credit — Wipro Technologies Ltd', '2026-10-17 03:00:00+00'),
  ('3eed2747-24ff-45fb-aaee-b57b39d7dfca', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100117', 'debit', 7605.03, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-12 05:35:00+00'),
  ('0168369e-8ad0-492d-a963-d0886e2b2f68', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100118', 'debit', 7355.13, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-20 01:50:00+00'),
  ('864c6841-38f3-49ae-bfd5-c130b29b15bf', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100119', 'debit', 193.81, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-04 20:39:00+00'),
  ('6fe7a62b-d47f-4bae-84d6-cc1131596317', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100120', 'debit', 2999.97, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-18 16:14:00+00'),
  ('e19871a8-da95-4a39-b62e-7d668425e07e', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100121', 'debit', 3735.97, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-25 15:28:00+00'),
  ('1e3b8cbb-133a-411e-9bf1-d4540c3bcc46', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100122', 'debit', 1818.55, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-18 12:53:00+00'),
  ('428f36fa-9742-4337-8c3e-d2a1df1f4153', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100123', 'debit', 442.24, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-24 23:57:00+00'),
  ('0e7aad14-e7a0-4e1f-af17-e01d108069f4', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100124', 'debit', 11535.77, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-08 07:34:00+00'),
  ('da4a9161-6a35-42a2-8c8a-206e8aa5d8ea', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100125', 'debit', 919.03, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-06 21:08:00+00'),
  ('fbf0c135-dd7f-4bd2-97bf-e77d633f1010', '89c6c8dc-c5e4-4e4b-8604-349d86b0b174', (select id from public.wallets where user_id = '89c6c8dc-c5e4-4e4b-8604-349d86b0b174'), null, null, 'TXN_UPI_100126', 'debit', 1465.88, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-17 16:48:00+00'),
  ('feb713cb-892d-41ad-a346-49ff05704eb1', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_SAL_100127', 'credit', 109121.09, 'INR', 'salary', 'completed', 'Swiggy Bundl Tech', 'finance@swiggy.in', 'Monthly Salary Credit — Swiggy Bundl Tech', '2026-10-16 03:00:00+00'),
  ('1c74cd65-7196-475c-8925-7ef24e33ccbe', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100128', 'debit', 2843.27, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-03 02:55:00+00'),
  ('1882a4de-2b3d-46b3-b7d3-1e6275afd97c', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100129', 'debit', 931.26, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-18 20:23:00+00'),
  ('1b1a2f77-d403-4af1-acdd-44255c8000b0', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100130', 'debit', 1326.51, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-15 11:22:00+00'),
  ('0baf66fd-bc48-462c-b3cf-dba89425ac59', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100131', 'debit', 1092.96, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-11-02 23:33:00+00'),
  ('31165f41-86eb-418c-8636-a56e4d118c32', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100132', 'debit', 7559.53, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-17 15:12:00+00'),
  ('67515357-2a54-4abd-8e65-765c4a2f04f3', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100133', 'debit', 770.83, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-09 01:24:00+00'),
  ('dd3503b3-e8a3-4066-bcf2-cbdfcd2d31f4', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100134', 'debit', 2083.97, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-28 17:56:00+00'),
  ('d7c92522-85e3-4c59-bad1-b659377094d3', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100135', 'debit', 929.89, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-15 09:43:00+00'),
  ('7949c169-e554-40d0-bef1-3f319bc4c105', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100136', 'debit', 500.89, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-27 14:37:00+00'),
  ('f6cef6ef-3b4e-496e-b5e9-7f4d92216256', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100137', 'debit', 1277.92, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-10 22:48:00+00'),
  ('6657bce4-5432-416b-9c91-1662a5243566', '65e097b9-b580-46b2-8dc7-5bf34fba0bac', (select id from public.wallets where user_id = '65e097b9-b580-46b2-8dc7-5bf34fba0bac'), null, null, 'TXN_UPI_100138', 'debit', 3686.52, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-11-01 01:58:00+00'),
  ('b7976678-f36a-433c-a22e-00deca237cd7', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_SAL_100139', 'credit', 118519.39, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-07 03:00:00+00'),
  ('460e06e7-377b-4ccd-9e2e-c36064008703', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100140', 'debit', 3947.85, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-25 10:52:00+00'),
  ('a4615f80-b827-42e9-a596-fbffe1c53a64', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100141', 'debit', 1464.68, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-13 21:35:00+00'),
  ('858ca89b-740f-440a-b65a-4f555d3a2998', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100142', 'debit', 8546.66, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-01 10:26:00+00'),
  ('9a108bbd-7a7a-472d-9fdd-249e6fc34aa1', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100143', 'debit', 2340.78, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-14 11:08:00+00'),
  ('82087fee-1806-432c-b2a9-b2dbef3f1f1b', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100144', 'debit', 444.69, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-20 23:34:00+00'),
  ('f0a5e2ea-4628-42c6-a4eb-94aa0041d32c', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100145', 'debit', 10272.42, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-17 04:20:00+00'),
  ('6f83627c-b77d-458f-9143-cb7ccd844217', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100146', 'debit', 627.53, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-17 06:10:00+00'),
  ('0242f1a1-6e46-4ea2-9e4c-70c9f1fcf851', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100147', 'debit', 718.76, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-26 11:50:00+00'),
  ('a41ca86f-9163-4c7d-a7f8-938a6de13498', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100148', 'debit', 4756.42, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-24 14:51:00+00'),
  ('e77a9f26-dd98-488b-9731-153ee6133db8', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100149', 'debit', 146.20, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-19 23:48:00+00'),
  ('7f719642-8b9b-4fa3-a251-2343805eb6c2', 'c13f2e85-882e-44f8-b845-25a7d827bbbb', (select id from public.wallets where user_id = 'c13f2e85-882e-44f8-b845-25a7d827bbbb'), null, null, 'TXN_UPI_100150', 'debit', 502.83, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-07 22:34:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('6bba82f8-56a8-43eb-9002-50dc9b93f981', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_SAL_100151', 'credit', 120486.46, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-16 03:00:00+00'),
  ('63988a73-7790-48ba-adb5-cb8712b5e4e9', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100152', 'debit', 905.78, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-30 20:25:00+00'),
  ('f197581e-297a-449e-9cce-c7a8b6e43d73', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100153', 'debit', 1498.06, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-03 10:36:00+00'),
  ('6773dc27-c1a2-4462-a7f6-d594874cfd3e', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100154', 'debit', 1477.34, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-04 09:39:00+00'),
  ('98b30961-8c5e-4f10-9fd3-ab84023c2657', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100155', 'debit', 2562.86, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-14 03:17:00+00'),
  ('2da9126d-898a-4946-bf7e-51929d0b5b1a', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100156', 'debit', 546.55, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-21 19:43:00+00'),
  ('6e095509-042a-4281-9e64-6dba0942817c', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100157', 'debit', 2395.50, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-14 17:15:00+00'),
  ('0ba823f5-3ee8-4649-b6df-5e4cef228f35', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100158', 'debit', 10725.31, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-02 16:30:00+00'),
  ('f7e031b8-55c0-4b69-8956-9fcdfb5d4c11', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100159', 'debit', 2657.27, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-04 03:43:00+00'),
  ('06f310a6-9b0c-4cff-9359-1fd92228e424', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100160', 'debit', 4535.93, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-20 09:36:00+00'),
  ('ddbb1092-213e-4400-8b72-43f95bcc55bc', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100161', 'debit', 1291.13, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-14 22:42:00+00'),
  ('0923549b-4c2e-4afd-8ba6-dd0351a62c6c', '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6', (select id from public.wallets where user_id = '5c58b8c9-146e-4962-8e98-fce1b8aaf5b6'), null, null, 'TXN_UPI_100162', 'debit', 487.63, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-19 00:38:00+00'),
  ('09444a36-3e32-4061-9594-909933eb8522', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_SAL_100163', 'credit', 153877.07, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-09 03:00:00+00'),
  ('ec158291-ecac-4508-91ff-b2dfbd072368', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100164', 'debit', 3988.54, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-29 18:01:00+00'),
  ('e44d89a2-3a94-472b-8c35-f39c3ce4fa6c', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100165', 'debit', 3588.51, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-25 23:21:00+00'),
  ('69089b6b-9759-4c3a-9540-28e4d8082232', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100166', 'debit', 321.24, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-21 10:46:00+00'),
  ('e33ee857-5f08-46fc-bb8a-403ef0578188', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100167', 'debit', 163.57, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-07 16:15:00+00'),
  ('34aa2dec-7645-4d93-ae4f-0ce006bf9470', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100168', 'debit', 546.61, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-14 23:00:00+00'),
  ('b8ac6801-c8f4-4cfb-a82b-cb671545c72f', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100169', 'debit', 4433.73, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-23 13:19:00+00'),
  ('f93cea97-cf82-48e2-8971-4932d2dcd011', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100170', 'debit', 1658.47, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-21 17:40:00+00'),
  ('b01e8d8b-3c62-4041-bf73-f438155d24ec', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100171', 'debit', 8990.13, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-06 00:19:00+00'),
  ('fc1af480-e79a-4189-9830-0dafff480c6b', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100172', 'debit', 564.18, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-18 01:02:00+00'),
  ('0b4aecde-ed07-4680-8820-eaef14c89a48', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100173', 'debit', 4376.81, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-10 21:01:00+00'),
  ('63bd05dc-4b1d-480c-adba-5b4720ab7e00', '1f2b623d-e1f5-4b5c-ba4d-573091a88744', (select id from public.wallets where user_id = '1f2b623d-e1f5-4b5c-ba4d-573091a88744'), null, null, 'TXN_UPI_100174', 'debit', 1197.17, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-08 11:49:00+00'),
  ('b1dc0f4f-34b9-444d-9ca4-30226b880cae', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_SAL_100175', 'credit', 215266.42, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-23 03:00:00+00'),
  ('33a30be3-8c54-4141-90d5-27d52ac7153a', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100176', 'debit', 388.71, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-25 23:01:00+00'),
  ('5d9d6248-8b19-44e9-8bca-01898cc75b3c', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100177', 'debit', 1141.28, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-22 09:27:00+00'),
  ('ea6b455f-edc2-4f6b-8a7f-3a6cc7a0ba9d', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100178', 'debit', 2873.32, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-25 10:31:00+00'),
  ('ca78d802-c454-4d7d-9874-382bcc59a364', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100179', 'debit', 275.33, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-26 16:50:00+00'),
  ('5ed27baa-2cb0-48cc-889f-d70dfad19334', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100180', 'debit', 235.69, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-18 22:00:00+00'),
  ('6a59184d-cde8-4fcf-9591-02340b8f40b2', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100181', 'debit', 1394.38, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-27 05:12:00+00'),
  ('c51cb856-d34b-4d82-b74e-01048f4672f1', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100182', 'debit', 3621.83, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-09 06:03:00+00'),
  ('df32f738-81b9-49dd-9672-99c92a4695b5', 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5', (select id from public.wallets where user_id = 'e47162e9-81b8-44c0-9bcc-d0ed073f50b5'), null, null, 'TXN_UPI_100183', 'debit', 1301.04, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-01 16:55:00+00'),
  ('d52702eb-98c5-46ab-b440-8d2802ae32eb', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_SAL_100184', 'credit', 155271.86, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-27 03:00:00+00'),
  ('35a700ef-c715-4a72-a186-da1f62f54526', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100185', 'debit', 1204.62, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-19 02:44:00+00'),
  ('575b4291-8d22-4ced-ac4f-d1288c3eeb4a', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100186', 'debit', 620.85, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-15 18:39:00+00'),
  ('af3619fb-0c48-49fc-8ef4-16cf83d9cba7', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100187', 'debit', 8450.92, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-28 02:44:00+00'),
  ('6ed62241-d886-44b5-928b-b35df00b9bd9', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100188', 'debit', 3001.20, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-30 05:53:00+00'),
  ('d838c56e-2c22-4ef8-be08-6ffebf92078d', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100189', 'debit', 174.23, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-08 05:28:00+00'),
  ('1ff95bdb-bd97-43bf-99d9-fe6cd6f3c478', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100190', 'debit', 9367.47, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-23 17:37:00+00'),
  ('675643e2-660b-4910-bf29-d6b9eec90c40', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100191', 'debit', 301.88, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-25 11:51:00+00'),
  ('31ea0555-7ba5-427e-a98a-761e3031651a', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100192', 'debit', 253.59, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-25 15:34:00+00'),
  ('c88efa8a-c47f-4025-8b58-ed2f59fe6dc3', 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce', (select id from public.wallets where user_id = 'fb780cbf-c1e1-41d2-bb93-671d5c8ee0ce'), null, null, 'TXN_UPI_100193', 'debit', 4238.39, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-15 09:09:00+00'),
  ('05d11318-3af7-4725-8ee4-37df4fc280ab', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_SAL_100194', 'credit', 198200.44, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-08 03:00:00+00'),
  ('67356256-65ad-4073-9d40-06ae409db8a9', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100195', 'debit', 926.22, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-30 04:37:00+00'),
  ('5cc3e286-30df-42e6-9379-b80e2d3f4f74', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100196', 'debit', 1482.49, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-27 01:07:00+00'),
  ('a6e433f5-5052-4513-b800-397f26f54cd9', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100197', 'debit', 4208.66, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-21 08:26:00+00'),
  ('9593d0b0-581c-4075-b1a4-934858829dcf', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100198', 'debit', 1815.46, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-09 10:32:00+00'),
  ('3eb4dec6-6211-40e7-b36e-00bc4d072e77', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100199', 'debit', 1576.58, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-18 08:29:00+00'),
  ('3d712855-d5f0-45c7-8d54-f31f790ee661', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100200', 'debit', 1456.42, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-06 01:31:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('d6a71d0a-2532-4cb7-9b5e-0801a6b25b74', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100201', 'debit', 4605.50, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-04 08:57:00+00'),
  ('bbf2e3ed-683e-454b-8f84-ce7885e90326', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100202', 'debit', 2887.13, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-12 17:14:00+00'),
  ('49e99361-3ae6-408c-b894-a9c934837286', '87d5b041-962c-4c60-b6af-0c48a31e12ef', (select id from public.wallets where user_id = '87d5b041-962c-4c60-b6af-0c48a31e12ef'), null, null, 'TXN_UPI_100203', 'debit', 466.76, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-12 02:13:00+00'),
  ('13bb633d-dfcf-4fe1-9551-cd3509042f49', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_SAL_100204', 'credit', 108373.34, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-31 03:00:00+00'),
  ('a66aae1c-57cc-4bdf-bdf3-b094e52d5fd9', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100205', 'debit', 3021.00, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-30 01:01:00+00'),
  ('e99222b5-750f-480f-8b36-8325a2f8fb93', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100206', 'debit', 1580.31, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-04 01:42:00+00'),
  ('98907bd2-a6c8-44e4-bbbc-fe0225fcd3b7', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100207', 'debit', 526.00, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-25 06:14:00+00'),
  ('82d3e4dd-9dab-4134-82ae-3a721176bc2a', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100208', 'debit', 555.17, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-06 14:32:00+00'),
  ('3510814b-f265-45e8-87da-2769c8d40733', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100209', 'debit', 781.99, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-20 05:05:00+00'),
  ('a37ff362-fa37-4884-9333-ccf4c2dae5ce', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100210', 'debit', 1898.97, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-08 15:53:00+00'),
  ('b8f9ca05-f3e9-4d36-9b6a-6bd2baa64f2e', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100211', 'debit', 9437.04, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-08 10:52:00+00'),
  ('4f0f155d-e358-4228-bee9-dffaae3621d5', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100212', 'debit', 812.90, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-16 02:41:00+00'),
  ('274ed1e3-d96f-4ede-974a-14cb9d2f5ef3', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100213', 'debit', 240.23, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-29 13:26:00+00'),
  ('70e8bb09-c01f-44bd-aa1b-530991765b26', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100214', 'debit', 1296.86, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-18 12:38:00+00'),
  ('0fc32257-7348-4e98-b2df-6449d87f6339', 'ba585597-9206-4bf6-b964-d7b135b85702', (select id from public.wallets where user_id = 'ba585597-9206-4bf6-b964-d7b135b85702'), null, null, 'TXN_UPI_100215', 'debit', 2704.47, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-04 03:12:00+00'),
  ('e1e7930f-6b85-48f9-b825-c63afa6c47f4', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_SAL_100216', 'credit', 77899.56, 'INR', 'salary', 'completed', 'TechCorp India Pvt Ltd', 'payroll@techcorp.in', 'Monthly Salary Credit — TechCorp India Pvt Ltd', '2026-10-11 03:00:00+00'),
  ('4741960a-9f46-49e5-bee8-27d170dc88e1', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100217', 'debit', 342.53, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-29 23:22:00+00'),
  ('a14c85f7-70d7-4761-bae1-b1ac15fdab32', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100218', 'debit', 646.44, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-20 04:05:00+00'),
  ('62b44ded-f118-4d07-b207-013b5901245a', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100219', 'debit', 444.73, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-31 14:32:00+00'),
  ('42e1a0f7-d93d-49e3-9d9d-1efa708c2b82', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100220', 'debit', 568.00, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-16 01:52:00+00'),
  ('e177769f-c67a-480a-9a83-64713110e02f', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100221', 'debit', 6469.37, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-19 03:24:00+00'),
  ('06ec26ba-9e20-4994-835f-944fa08a4f43', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100222', 'debit', 1287.74, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-14 05:08:00+00'),
  ('dbdbc772-37e8-4e1a-8454-11ff0a7c9c95', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100223', 'debit', 1117.45, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-07 22:18:00+00'),
  ('6ac84052-a599-44a3-9d01-db0d6fca0694', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100224', 'debit', 2838.90, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-14 18:57:00+00'),
  ('6e3a71ff-c770-4acf-b342-259972cde25b', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100225', 'debit', 4345.56, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-07 03:02:00+00'),
  ('6f337861-b520-4a32-ba06-bca095c7d4e4', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100226', 'debit', 6208.37, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-06 09:29:00+00'),
  ('b59b4eed-b516-44f9-b8bb-a8a15b924f9a', '5e103d1e-7efb-4833-a141-5879e2828646', (select id from public.wallets where user_id = '5e103d1e-7efb-4833-a141-5879e2828646'), null, null, 'TXN_UPI_100227', 'debit', 1172.29, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-22 05:36:00+00'),
  ('b43cab95-0891-4237-b961-d4a4aa990fbc', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_SAL_100228', 'credit', 152935.57, 'INR', 'salary', 'completed', 'Swiggy Bundl Tech', 'finance@swiggy.in', 'Monthly Salary Credit — Swiggy Bundl Tech', '2026-10-10 03:00:00+00'),
  ('6a6c0940-1085-4b52-9c26-db566eba9cbf', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100229', 'debit', 521.38, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-09 21:12:00+00'),
  ('91aa8862-c7e8-4236-bc43-c3a39f59b114', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100230', 'debit', 2920.56, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-09 19:41:00+00'),
  ('f2361626-a4f7-4381-93c9-ccd27ceb5417', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100231', 'debit', 6946.02, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-06 01:25:00+00'),
  ('99bcf361-1e32-4adc-b88a-e736c4984399', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100232', 'debit', 644.17, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-28 10:52:00+00'),
  ('210aebdf-375d-45b4-90dc-e42b8f04a554', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100233', 'debit', 629.29, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-20 16:19:00+00'),
  ('04c1f21c-de20-4dd9-81e5-d47aa9f69f54', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100234', 'debit', 1489.56, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-09 15:55:00+00'),
  ('5d3fd144-a850-4cfe-b9f8-006eb9c81ed5', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100235', 'debit', 3673.75, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-22 01:43:00+00'),
  ('e3aa947b-7aa7-4b3c-bc7c-df771ffe03ae', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100236', 'debit', 1124.72, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-26 01:05:00+00'),
  ('9057c85d-8403-4ef9-a986-48ea42451a75', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100237', 'debit', 447.19, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-15 08:14:00+00'),
  ('10253d7b-87a4-4db5-8548-c86502e02f6b', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100238', 'debit', 2151.05, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-20 16:41:00+00'),
  ('b70e61f9-403a-4ff4-94fb-d9b3a7cadf95', '830b6ab1-361a-41b4-a012-efc9fdccd6f6', (select id from public.wallets where user_id = '830b6ab1-361a-41b4-a012-efc9fdccd6f6'), null, null, 'TXN_UPI_100239', 'debit', 319.45, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-21 03:53:00+00'),
  ('a5d4a3eb-cf43-4855-b41d-512e136bf8be', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_SAL_100240', 'credit', 219946.50, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-17 03:00:00+00'),
  ('0e8703be-cd10-4d55-bfec-fdac78307091', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100241', 'debit', 6673.52, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-18 09:40:00+00'),
  ('b6543665-86e6-40db-8a25-86cc6d7a8c03', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100242', 'debit', 6735.62, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-29 06:38:00+00'),
  ('b0a4cd54-1440-4f75-83f9-e033c1935f9b', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100243', 'debit', 5723.27, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-01 11:31:00+00'),
  ('e58fd8cb-e199-40c0-bee1-7c3a988cf562', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100244', 'debit', 1815.49, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-17 11:12:00+00'),
  ('45bbd9b3-188d-4225-a8a0-b7608db905ba', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100245', 'debit', 1456.17, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-10 16:34:00+00'),
  ('b4f67750-2a63-4d9b-b844-abaf052d49b2', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100246', 'debit', 762.52, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-19 03:51:00+00'),
  ('5be9894c-0d0e-407d-a826-bcb314d2d8e6', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100247', 'debit', 358.62, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-04 08:23:00+00'),
  ('8b955543-651c-49be-8df2-92aa1abdcc65', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100248', 'debit', 543.28, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-21 16:46:00+00'),
  ('dab3ebee-6a29-40a5-acab-dae16e6356d2', '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0', (select id from public.wallets where user_id = '92e43ed0-75be-4ea9-b9f7-fb7a64f081a0'), null, null, 'TXN_UPI_100249', 'debit', 1005.26, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-18 11:25:00+00'),
  ('cc5a156b-d647-424d-849a-637bf7e11eb7', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_SAL_100250', 'credit', 212933.07, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-22 03:00:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('6d109890-b36b-4df5-9497-9ce06d859ce9', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100251', 'debit', 3101.20, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-22 03:29:00+00'),
  ('e66b352d-219c-4d33-9656-35f1e0b86898', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100252', 'debit', 149.28, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-13 15:50:00+00'),
  ('f2a9f6b6-2916-4d2f-b5d8-313f5683dafe', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100253', 'debit', 6262.23, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-02 21:02:00+00'),
  ('e2d28303-0543-4632-9e44-04ab5557a955', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100254', 'debit', 4470.97, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-30 10:58:00+00'),
  ('e8347026-7268-449e-8c30-8f65e1f06549', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100255', 'debit', 1522.17, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-22 01:12:00+00'),
  ('f36bb804-b5d5-4ce9-8cca-30e416fa19ed', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100256', 'debit', 479.91, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-10 06:46:00+00'),
  ('b0a01500-5976-451f-9aae-8f66cba56075', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100257', 'debit', 1184.18, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-11-02 20:28:00+00'),
  ('4bc3b586-2771-4cbe-986e-931ae0176b45', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100258', 'debit', 186.18, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-24 06:18:00+00'),
  ('96e73b99-cd30-4e20-bdfa-c4466bcd8d34', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100259', 'debit', 2194.89, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-11-02 02:26:00+00'),
  ('2d61bbdd-f702-424c-aa7e-283d783a7264', '47e33209-15b5-462c-963e-1e459e1641e8', (select id from public.wallets where user_id = '47e33209-15b5-462c-963e-1e459e1641e8'), null, null, 'TXN_UPI_100260', 'debit', 2734.02, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-11-01 10:14:00+00'),
  ('0d4f3d8c-5ebf-4287-a0e5-e33766b59541', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_SAL_100261', 'credit', 96573.14, 'INR', 'salary', 'completed', 'Tata Consultancy Services', 'salary@tcs.com', 'Monthly Salary Credit — Tata Consultancy Services', '2026-10-23 03:00:00+00'),
  ('0e719061-f548-4307-89a6-eaa4249950c7', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100262', 'debit', 5621.84, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-20 13:09:00+00'),
  ('951a4e02-061e-4d33-be7c-f2f340e8f525', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100263', 'debit', 1640.85, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-27 10:51:00+00'),
  ('fff47afa-a50c-4705-8b13-cc4b3ef47547', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100264', 'debit', 279.30, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-30 18:08:00+00'),
  ('144a03a9-5cf1-4c13-b5d3-3e1208e73bf5', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100265', 'debit', 1895.04, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-09 00:37:00+00'),
  ('c992ebcd-35f7-4cd7-b5ac-f58d3d228953', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100266', 'debit', 877.85, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-18 04:46:00+00'),
  ('07125847-18b7-4f4e-8cf9-9be9bd19c96f', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100267', 'debit', 9314.35, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-10 00:19:00+00'),
  ('f6782113-1e61-463a-b4a9-c8af3dfac5ba', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100268', 'debit', 293.50, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-09 14:25:00+00'),
  ('746d5375-d56e-4b7b-8db2-254447e000a4', '6d6a3d55-7499-43f2-adf5-8b0110384540', (select id from public.wallets where user_id = '6d6a3d55-7499-43f2-adf5-8b0110384540'), null, null, 'TXN_UPI_100269', 'debit', 415.54, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-11-02 04:50:00+00'),
  ('31f2870a-fad0-4662-9949-30a6a223a478', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_SAL_100270', 'credit', 119987.26, 'INR', 'salary', 'completed', 'TechCorp India Pvt Ltd', 'payroll@techcorp.in', 'Monthly Salary Credit — TechCorp India Pvt Ltd', '2026-10-19 03:00:00+00'),
  ('29bab4e8-dbbc-4a36-82c8-466737df976c', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100271', 'debit', 1994.84, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-06 01:46:00+00'),
  ('c6f5fd44-12d2-492a-b791-c8b0c4fc8319', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100272', 'debit', 13637.57, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-19 08:30:00+00'),
  ('04f92b79-66fa-4fca-856d-235f3065b6b4', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100273', 'debit', 180.27, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-29 05:01:00+00'),
  ('e5aed1e1-f3f7-46db-b05f-d14f1776bd4a', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100274', 'debit', 734.55, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-27 05:58:00+00'),
  ('ed5a1aa8-7bb9-40e9-bdf5-3bcc3a7c9007', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100275', 'debit', 8873.07, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-14 02:47:00+00'),
  ('315c6d54-4064-4b37-8507-a5767ee7a266', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100276', 'debit', 6517.79, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-18 14:01:00+00'),
  ('395bc646-212c-4167-bde0-7b5aadeda4f5', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100277', 'debit', 604.97, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-27 19:24:00+00'),
  ('fb132602-b831-4aff-8fe8-8d924ae84145', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100278', 'debit', 1128.59, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-29 16:36:00+00'),
  ('125b75a3-2f19-4279-81af-04ab7ccbb381', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100279', 'debit', 6823.78, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-19 03:55:00+00'),
  ('771c5921-5307-41ec-bc6c-7b4335b82326', '67f104fa-8ecf-4f19-a85c-728b120a7a41', (select id from public.wallets where user_id = '67f104fa-8ecf-4f19-a85c-728b120a7a41'), null, null, 'TXN_UPI_100280', 'debit', 5303.65, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-12 01:54:00+00'),
  ('2f1d9272-4b58-4de4-878c-a60d1ceef2f0', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_SAL_100281', 'credit', 109375.12, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-30 03:00:00+00'),
  ('5dff2424-12d8-440e-9f52-adc22ec830a9', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100282', 'debit', 1464.26, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-14 02:20:00+00'),
  ('9aa1eb73-f43c-4c7b-9078-413bcfc40594', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100283', 'debit', 659.31, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-05 11:46:00+00'),
  ('4120c401-05d9-472b-a41d-083bea4d1045', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100284', 'debit', 2637.90, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-09 13:49:00+00'),
  ('051ef811-8150-4a0d-94e4-afe6d384c503', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100285', 'debit', 448.55, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-24 17:09:00+00'),
  ('f151857a-e238-482e-a621-e794ec74de87', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100286', 'debit', 711.88, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-28 18:51:00+00'),
  ('a6c3a475-66fa-4235-988d-5839e38e235b', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100287', 'debit', 1168.43, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-23 22:13:00+00'),
  ('95fc9aed-664d-47ae-b3bb-bf2011466aac', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100288', 'debit', 714.18, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-28 01:00:00+00'),
  ('4294de81-458f-4147-a878-0330db64963f', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100289', 'debit', 7280.25, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-15 18:54:00+00'),
  ('5bb57e5a-f3ae-480a-9dce-04a2da3074a6', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100290', 'debit', 1197.47, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-06 12:25:00+00'),
  ('8ffc1ef7-9495-476e-97fe-1e0fa13c0d60', '1baa3f03-9863-4cd5-9e3d-58d2da7b2696', (select id from public.wallets where user_id = '1baa3f03-9863-4cd5-9e3d-58d2da7b2696'), null, null, 'TXN_UPI_100291', 'debit', 3037.32, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-28 02:55:00+00'),
  ('ef877cc7-aecb-4e06-9f4c-bc86849baeb4', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_SAL_100292', 'credit', 97903.83, 'INR', 'salary', 'completed', 'Tata Consultancy Services', 'salary@tcs.com', 'Monthly Salary Credit — Tata Consultancy Services', '2026-10-13 03:00:00+00'),
  ('33676e30-484a-4992-849d-036e3bc4bbba', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100293', 'debit', 364.19, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-07 14:11:00+00'),
  ('2bf9eebd-25cc-409c-b83d-ba2a9023a1b5', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100294', 'debit', 1209.28, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-28 19:24:00+00'),
  ('a9546c20-5ef8-4e78-95a7-7ccc960ce332', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100295', 'debit', 2597.04, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-09 21:52:00+00'),
  ('027160e7-826d-4c68-8b27-4d010d2f49b9', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100296', 'debit', 345.74, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-02 22:56:00+00'),
  ('c59ec837-1048-4c11-a616-a7b106204deb', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100297', 'debit', 4524.59, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-07 17:30:00+00'),
  ('cefffd9e-4abf-4ba2-b448-f08a607c2092', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100298', 'debit', 692.80, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-18 03:20:00+00'),
  ('dec4b85e-dac8-4002-ada8-9d0cc56f9239', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100299', 'debit', 2001.73, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-21 12:54:00+00'),
  ('b6515cf9-58a2-48d0-bd95-ecc4b37554bf', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100300', 'debit', 2936.57, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-08 16:07:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('c74920d7-33a3-44f2-ad3b-8020b6968f6d', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100301', 'debit', 1274.69, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-12 12:39:00+00'),
  ('696ba98d-bfe2-4f49-8f74-9a695223e836', 'ba398aa7-03b2-4d41-8981-1e6f46c404c3', (select id from public.wallets where user_id = 'ba398aa7-03b2-4d41-8981-1e6f46c404c3'), null, null, 'TXN_UPI_100302', 'debit', 621.32, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-08 06:22:00+00'),
  ('87fae7b9-3771-4b62-a339-bfb677cfee76', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_SAL_100303', 'credit', 87532.65, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-13 03:00:00+00'),
  ('42b7fcba-95b9-4b09-9d4c-db84f897d76f', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100304', 'debit', 1176.84, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-08 16:42:00+00'),
  ('40bb7c4b-aa26-401f-a354-cbc4576c82cc', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100305', 'debit', 3104.90, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-13 19:40:00+00'),
  ('34f16db6-8de3-4f1c-b162-349b102c686c', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100306', 'debit', 672.35, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-13 14:37:00+00'),
  ('ef2a0d0e-284b-46d2-b916-0c818af99ca2', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100307', 'debit', 2067.53, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-21 08:26:00+00'),
  ('6a6994db-50c1-4033-a86f-ab5e26da928c', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100308', 'debit', 6698.75, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-29 02:14:00+00'),
  ('ef2dc3ef-747a-4f8a-a924-dab893fc141d', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100309', 'debit', 288.74, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-20 12:09:00+00'),
  ('8683c5e8-28d6-4477-8237-0a732af65d73', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100310', 'debit', 10565.90, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-29 13:17:00+00'),
  ('792c6c9d-7c1c-461e-92ed-f7f354a251fe', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100311', 'debit', 660.58, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-14 19:44:00+00'),
  ('ec0123f5-3c5e-4f14-a169-ef3d70fd2f9d', '9cb2c01e-26ec-4eab-964e-24ed3dc677a5', (select id from public.wallets where user_id = '9cb2c01e-26ec-4eab-964e-24ed3dc677a5'), null, null, 'TXN_UPI_100312', 'debit', 6221.61, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-13 14:56:00+00'),
  ('c23dc930-0fed-40f8-bb33-4111a6b901a0', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_SAL_100313', 'credit', 189023.56, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-17 03:00:00+00'),
  ('3e2a8e19-2101-4c50-b975-212286112226', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100314', 'debit', 3019.84, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-05 04:34:00+00'),
  ('2e6497c8-ff5d-4708-bdad-21b420a312a1', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100315', 'debit', 1610.30, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-10 04:03:00+00'),
  ('5c38c576-f9e4-4a3f-8b5e-b9277ed6eebf', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100316', 'debit', 3281.46, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-06 00:54:00+00'),
  ('8256ee98-e795-4703-a6ce-84f75b36ec76', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100317', 'debit', 665.81, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-11 21:19:00+00'),
  ('3be0a0fa-a97f-4669-80b5-7176cf2aa7f2', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100318', 'debit', 763.22, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-22 05:19:00+00'),
  ('2cb25005-54ec-40c5-8347-3ad8811b45ea', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100319', 'debit', 1461.83, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-12 13:54:00+00'),
  ('859b2882-cc95-49c0-b91a-f850f130cd74', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100320', 'debit', 228.89, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-19 10:13:00+00'),
  ('7392113b-4e8f-4544-af71-a693b91c9101', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100321', 'debit', 4422.57, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-19 08:46:00+00'),
  ('ebac9231-7736-495a-9d11-6b1f40113320', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100322', 'debit', 186.34, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-04 05:23:00+00'),
  ('0d3d167a-3394-4204-928f-6fa7e470dcef', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100323', 'debit', 2508.50, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-11-01 11:54:00+00'),
  ('6894ebe0-ce9a-4347-9f82-8ea8aad68630', 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81', (select id from public.wallets where user_id = 'a84fa3c9-49d1-4310-b3d9-a23e5f2bbc81'), null, null, 'TXN_UPI_100324', 'debit', 7035.79, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-28 23:07:00+00'),
  ('f2241f41-b208-4942-878b-fb601098addc', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_SAL_100325', 'credit', 112709.40, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-23 03:00:00+00'),
  ('66870840-21bd-4083-ac94-bec5276bb9d2', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100326', 'debit', 260.17, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-30 11:38:00+00'),
  ('ba20572d-ebd1-45b4-aad5-ac56f85b0fc2', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100327', 'debit', 537.99, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-17 04:32:00+00'),
  ('62d84827-b8ba-45cc-a65e-c3241966fbba', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100328', 'debit', 1032.59, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-31 04:53:00+00'),
  ('1f377455-dc8a-4c78-8331-145fddb836f2', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100329', 'debit', 829.34, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-22 23:17:00+00'),
  ('4e07886e-6162-4ee5-884c-54b525d58d9e', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100330', 'debit', 8883.25, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-16 19:27:00+00'),
  ('e3a54cb4-d658-4292-b145-0fcd6e4d3fd4', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100331', 'debit', 5556.36, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-12 09:33:00+00'),
  ('cbeb1b92-caf9-47c4-bd42-43648d108b35', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100332', 'debit', 160.73, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-08 06:49:00+00'),
  ('a09575bb-e12e-428a-a880-42fad5d3185c', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100333', 'debit', 6335.85, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-06 14:59:00+00'),
  ('05511ae5-9fd3-43ed-806c-0a1ebe7d9c37', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100334', 'debit', 7404.14, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-06 15:00:00+00'),
  ('e15b9dbb-5d03-4513-a341-1f85c99414d3', '959eee56-0fc7-4d54-9455-ec3ae99b3655', (select id from public.wallets where user_id = '959eee56-0fc7-4d54-9455-ec3ae99b3655'), null, null, 'TXN_UPI_100335', 'debit', 4039.83, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-15 04:09:00+00'),
  ('18be2aa9-4cd8-49d2-9d0a-426d97fad0d7', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_SAL_100336', 'credit', 97507.65, 'INR', 'salary', 'completed', 'Swiggy Bundl Tech', 'finance@swiggy.in', 'Monthly Salary Credit — Swiggy Bundl Tech', '2026-10-29 03:00:00+00'),
  ('e279259c-35cd-416d-92b9-b5ebebd23b6c', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100337', 'debit', 2047.56, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-04 23:44:00+00'),
  ('a6408df8-5ff7-4e36-bc24-4627d34f140a', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100338', 'debit', 1806.76, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-23 16:22:00+00'),
  ('80057918-d7e5-458c-9679-417718767923', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100339', 'debit', 1053.00, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-26 23:38:00+00'),
  ('07ce1d57-520a-4667-95ef-66084cb9addc', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100340', 'debit', 3398.35, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-24 21:08:00+00'),
  ('2ff89fc0-e515-413d-959e-864a65b1f588', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100341', 'debit', 11308.80, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-27 00:17:00+00'),
  ('29374890-86f0-4843-b8d5-b3e98e02ee13', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100342', 'debit', 3004.80, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-18 17:53:00+00'),
  ('8d65b8e5-89db-46d5-bfb7-35f9a2923963', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100343', 'debit', 3984.47, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-24 10:36:00+00'),
  ('d7300d16-4f32-4b13-b1f0-35e8b237a065', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100344', 'debit', 588.46, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-27 14:33:00+00'),
  ('ffa4bffe-1b80-4c81-9c50-7382d39cc3d4', 'a8abe131-0960-4f9b-b1ca-71fdef6596a4', (select id from public.wallets where user_id = 'a8abe131-0960-4f9b-b1ca-71fdef6596a4'), null, null, 'TXN_UPI_100345', 'debit', 4982.18, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-29 04:02:00+00'),
  ('ae35ab8c-4f44-4b16-ac51-2ba01df30aba', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_SAL_100346', 'credit', 211336.87, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-27 03:00:00+00'),
  ('d46d0f07-fae2-47c9-941a-f086b4822c71', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100347', 'debit', 1102.06, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-22 16:07:00+00'),
  ('101f4cf5-f845-47d2-8b61-f61918468b69', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100348', 'debit', 230.49, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-08 16:00:00+00'),
  ('0469808c-ddd9-4745-934b-ea97cbf3d682', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100349', 'debit', 652.78, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-11 14:25:00+00'),
  ('4cfbc6fb-34a1-4777-a9ff-30d429b6d93e', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100350', 'debit', 4869.43, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-07 05:29:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('b522d91b-b990-43b6-94a7-5d53f79fe2e9', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100351', 'debit', 605.52, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-05 11:50:00+00'),
  ('f859759e-5fdd-4a82-a664-83aa189595cb', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100352', 'debit', 982.86, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-13 19:42:00+00'),
  ('032f8768-d8a9-4936-96be-a842c60f951f', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100353', 'debit', 474.85, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-29 17:50:00+00'),
  ('06168dd5-2de2-4d67-82a8-bd9c7e0a30dc', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100354', 'debit', 220.82, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-14 11:25:00+00'),
  ('b4e7c9d6-4fe8-4cf0-a80c-f4f3785be71e', '224c0023-91ac-4cdc-8cbf-8c59ba1094b2', (select id from public.wallets where user_id = '224c0023-91ac-4cdc-8cbf-8c59ba1094b2'), null, null, 'TXN_UPI_100355', 'debit', 2332.09, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-26 18:11:00+00'),
  ('66a325bd-e35f-4acc-a4c0-437e1a603b69', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_SAL_100356', 'credit', 113513.38, 'INR', 'salary', 'completed', 'Wipro Technologies Ltd', 'payroll@wipro.com', 'Monthly Salary Credit — Wipro Technologies Ltd', '2026-10-21 03:00:00+00'),
  ('9cea268d-feb3-4dde-973b-1be442a1478a', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100357', 'debit', 217.34, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-10-06 23:13:00+00'),
  ('0ce7e5d1-7a51-42cd-a209-2d46652d1eef', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100358', 'debit', 367.10, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-31 12:44:00+00'),
  ('9833c1c1-3218-40eb-b53d-7eb507453a09', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100359', 'debit', 3441.72, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-28 12:05:00+00'),
  ('a7a7c74e-5c62-4e3a-bc1f-5e72742a0d15', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100360', 'debit', 1762.48, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-18 20:09:00+00'),
  ('d7dc7d85-e4f0-4f48-ac4e-8fa5d3006c08', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100361', 'debit', 3438.73, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-24 06:33:00+00'),
  ('161553af-0670-486b-9059-c28e1829de85', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100362', 'debit', 6121.75, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-13 20:08:00+00'),
  ('1cceaf72-661f-4bdc-a351-5b447c33675d', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100363', 'debit', 12315.08, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-27 15:26:00+00'),
  ('09d708f1-3e3e-4bd0-b11f-1840717cf754', '52ce9349-c609-4ea1-a49d-311c2f77bfb9', (select id from public.wallets where user_id = '52ce9349-c609-4ea1-a49d-311c2f77bfb9'), null, null, 'TXN_UPI_100364', 'debit', 537.96, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-23 16:15:00+00'),
  ('c844c60e-2cc7-425c-84de-d12f50342750', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_SAL_100365', 'credit', 78831.99, 'INR', 'salary', 'completed', 'Tata Consultancy Services', 'salary@tcs.com', 'Monthly Salary Credit — Tata Consultancy Services', '2026-10-24 03:00:00+00'),
  ('8607695e-2495-48b4-9b52-40af71d917a1', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100366', 'debit', 8202.14, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-13 13:02:00+00'),
  ('23b6caf0-5ccb-4e78-96c0-044c24be787f', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100367', 'debit', 1192.49, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-08 06:52:00+00'),
  ('e17e5e30-95f8-479d-aaf3-ce8e2ea1277c', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100368', 'debit', 2496.67, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-18 16:07:00+00'),
  ('f71e231a-ffac-4d40-a5c6-71e009487bdd', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100369', 'debit', 752.02, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-20 14:29:00+00'),
  ('539ac8d6-30e4-4674-92e4-631c6f52c388', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100370', 'debit', 5118.98, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-16 06:34:00+00'),
  ('b4d92ca7-b632-48b8-a1db-a6488201a7ae', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100371', 'debit', 869.79, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-24 00:35:00+00'),
  ('c09a3829-155e-4d5b-babb-1b545543a347', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100372', 'debit', 5324.07, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-19 15:31:00+00'),
  ('8ed0606c-bfc1-4e6c-8e87-1850db5ee3fc', '31814119-2521-4af5-8cb2-9e9ab07ad934', (select id from public.wallets where user_id = '31814119-2521-4af5-8cb2-9e9ab07ad934'), null, null, 'TXN_UPI_100373', 'debit', 1215.50, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-11-02 03:55:00+00'),
  ('df854307-cf74-4856-ab68-493da1d95586', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_SAL_100374', 'credit', 216518.79, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-12 03:00:00+00'),
  ('d3ae6f93-53a2-47e5-91b7-58aa087d2b70', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100375', 'debit', 1309.86, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-08 20:33:00+00'),
  ('f3198648-e7f1-417a-8887-256b6ee0fa0d', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100376', 'debit', 8027.07, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-13 17:39:00+00'),
  ('eb610f33-c2de-4e90-8ee3-d0dcac79d216', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100377', 'debit', 3233.80, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-27 11:10:00+00'),
  ('ce1dcb13-ec1d-4690-af47-7656e5873f91', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100378', 'debit', 1446.08, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-16 01:58:00+00'),
  ('bd82fca1-a1e6-4cf0-8b9b-0e0f3ef54bc0', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100379', 'debit', 1471.05, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-10 12:59:00+00'),
  ('a88d0ef7-d840-407a-b99f-998f85007f97', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100380', 'debit', 2062.39, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-23 12:31:00+00'),
  ('23c90061-0b59-4064-8b94-f6c4d2c67437', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100381', 'debit', 943.47, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-06 20:16:00+00'),
  ('335745bd-864c-4dd8-b79d-e85dfc656e49', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100382', 'debit', 7557.06, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-14 21:05:00+00'),
  ('8e046f45-f973-4774-8e28-1fbb0476f0e5', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100383', 'debit', 210.67, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-10 18:55:00+00'),
  ('6fb6299a-a12a-48ea-aa9a-632d18f8f63f', '293a5964-aa91-4a92-8a27-2a399fb6fcb4', (select id from public.wallets where user_id = '293a5964-aa91-4a92-8a27-2a399fb6fcb4'), null, null, 'TXN_UPI_100384', 'debit', 2927.72, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-22 21:57:00+00'),
  ('5c2965d9-c4e7-4d7c-a7fb-333bfa3fc5a5', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_SAL_100385', 'credit', 150688.45, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-09 03:00:00+00'),
  ('6fae16cb-f681-427c-a96f-076207798818', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100386', 'debit', 597.32, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-09-19 00:00:00+00'),
  ('eb289e2f-f2a7-4766-bc72-5f49b1069d24', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100387', 'debit', 7779.93, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-25 08:46:00+00'),
  ('fd9c8976-419d-4671-bd93-f272743eebb0', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100388', 'debit', 4995.92, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-11-03 02:16:00+00'),
  ('8ad25e2e-285d-4777-a2df-4082ef06f811', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100389', 'debit', 1407.55, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-08 13:16:00+00'),
  ('7345caf0-ceaf-482c-a9c0-2f7cdd03a929', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100390', 'debit', 4321.08, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-19 14:55:00+00'),
  ('a4e5be75-a597-47b3-987c-7a77799d3801', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100391', 'debit', 451.24, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-10 17:52:00+00'),
  ('1e14c572-345b-488d-a1fb-63d368dae739', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100392', 'debit', 1239.48, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-15 22:19:00+00'),
  ('3dea3cf7-ba3d-4040-876e-54f33fa60fa5', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100393', 'debit', 1046.36, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-09-28 02:21:00+00'),
  ('959a88e8-828a-48b1-9e54-3de1c084184b', 'ec0cd5cc-f092-4d66-b201-8a49417e3476', (select id from public.wallets where user_id = 'ec0cd5cc-f092-4d66-b201-8a49417e3476'), null, null, 'TXN_UPI_100394', 'debit', 4572.32, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-17 20:20:00+00'),
  ('9786bdc1-e376-4786-a7cb-eb37da633d5b', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_SAL_100395', 'credit', 113921.77, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-19 03:00:00+00'),
  ('4b696da2-52cb-4399-9a5a-d1dd18c21716', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100396', 'debit', 2396.29, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-27 22:12:00+00'),
  ('2865a980-3983-4e08-89fa-d5d2d4c00f39', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100397', 'debit', 1399.67, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-09 15:33:00+00'),
  ('20e57ba6-81ad-4a52-8474-c654692265ac', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100398', 'debit', 1394.54, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-18 18:19:00+00'),
  ('7c045aa3-9344-4774-a6ce-b9ad95a28990', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100399', 'debit', 532.40, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-25 07:14:00+00'),
  ('623a7b7f-38c3-4fbd-9e2f-d75f6e7e5985', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100400', 'debit', 10121.24, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-20 02:06:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('68db1a64-fbc7-41c9-a966-bc5f687ee1dc', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100401', 'debit', 5246.29, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-25 10:48:00+00'),
  ('359eee96-7882-4e62-9939-30659a6c338d', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100402', 'debit', 689.87, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-30 19:29:00+00'),
  ('a9ecad28-8ecd-472f-a058-5065f81c9b1f', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100403', 'debit', 479.66, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-02 06:22:00+00'),
  ('115cb125-9052-49b5-b74e-23fb2e7ea069', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100404', 'debit', 930.17, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-11-02 15:01:00+00'),
  ('c86874dd-fbb2-4926-a1fa-b973398a9703', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100405', 'debit', 1064.99, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-08 08:34:00+00'),
  ('79b6ffa2-6fea-4732-883d-83c3914d3507', '6f2979fd-6695-4630-b9ac-b1606a4316c2', (select id from public.wallets where user_id = '6f2979fd-6695-4630-b9ac-b1606a4316c2'), null, null, 'TXN_UPI_100406', 'debit', 2620.53, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-22 11:11:00+00'),
  ('39fe9432-d072-46ad-a1e5-2c4b2488de27', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_SAL_100407', 'credit', 76502.05, 'INR', 'salary', 'completed', 'TechCorp India Pvt Ltd', 'payroll@techcorp.in', 'Monthly Salary Credit — TechCorp India Pvt Ltd', '2026-10-30 03:00:00+00'),
  ('021e367a-aab0-491c-bc6a-a1ada23f4237', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100408', 'debit', 290.23, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-05 01:10:00+00'),
  ('2be5df82-c9d3-4042-8d78-e70dba60d06f', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100409', 'debit', 932.60, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-23 04:28:00+00'),
  ('8b15115c-50ae-45d0-a0e4-25c05e90510f', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100410', 'debit', 562.54, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-09 00:20:00+00'),
  ('83355844-9545-4cae-9353-30f6eabdcb58', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100411', 'debit', 3112.97, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-24 18:55:00+00'),
  ('d6754624-ee3b-4e90-b024-9c4e3c9d1756', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100412', 'debit', 4171.68, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-05 20:09:00+00'),
  ('6a624919-ce9c-420d-9eac-7f4eda08b85a', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100413', 'debit', 4790.66, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-08 08:20:00+00'),
  ('d038f860-2a43-4732-b6b6-fb950aaa390c', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100414', 'debit', 620.44, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-06 03:06:00+00'),
  ('e7f8b137-e822-45c0-bff5-8419adfe09b7', 'd22b5dac-0bda-4095-bec5-e99c4308fbd4', (select id from public.wallets where user_id = 'd22b5dac-0bda-4095-bec5-e99c4308fbd4'), null, null, 'TXN_UPI_100415', 'debit', 168.06, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-28 13:53:00+00'),
  ('646d0816-6f2e-48dd-9637-d3e08749d9c3', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_SAL_100416', 'credit', 149291.16, 'INR', 'salary', 'completed', 'Flipkart Commerce Corp', 'talent@flipkart.com', 'Monthly Salary Credit — Flipkart Commerce Corp', '2026-10-31 03:00:00+00'),
  ('f6f62df7-2847-402a-80a4-fe85b15107d0', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100417', 'debit', 1750.22, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-18 22:16:00+00'),
  ('7738d842-d1a1-4e2d-9f61-d20473351dc7', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100418', 'debit', 281.07, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-11 10:27:00+00'),
  ('b6a0d3a1-2416-48ee-a339-e32e56c5f789', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100419', 'debit', 258.53, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-25 03:11:00+00'),
  ('4d649d7c-9237-45e9-ad95-877ad6484c2c', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100420', 'debit', 626.41, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-27 02:39:00+00'),
  ('c8d3e59a-8f76-45c6-afc0-d0bc5ff1dc2b', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100421', 'debit', 539.80, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-29 18:15:00+00'),
  ('03fa11c5-2f48-4c3c-aca0-532b70abcbfa', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100422', 'debit', 884.53, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-01 15:57:00+00'),
  ('3b7803a7-a12a-41d1-9bb5-68726f0627d6', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100423', 'debit', 2785.11, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-23 15:50:00+00'),
  ('0208beed-da47-47fa-b9d6-e723916d598c', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100424', 'debit', 652.66, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-06 08:17:00+00'),
  ('055ee1c3-ecb9-4284-84fc-d59acb9009bd', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100425', 'debit', 695.39, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-02 02:58:00+00'),
  ('d4ad9ee6-85db-46b4-a1b7-a9749986665c', '8873abca-0bf7-4853-9f37-5bbefb077e9a', (select id from public.wallets where user_id = '8873abca-0bf7-4853-9f37-5bbefb077e9a'), null, null, 'TXN_UPI_100426', 'debit', 345.64, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-03 15:36:00+00'),
  ('d882db55-dfd6-4bca-adc7-a47865fc4a9f', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_SAL_100427', 'credit', 78422.07, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-05 03:00:00+00'),
  ('5fd3e3ab-a4c0-4d65-a254-e53a44e6f55c', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100428', 'debit', 3909.35, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-18 03:19:00+00'),
  ('f7ff64cf-d891-4e8d-ae32-c139c472e9a0', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100429', 'debit', 532.68, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-18 13:02:00+00'),
  ('0e19cdc7-7885-449f-9ea8-d7f04c3585f5', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100430', 'debit', 1134.63, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-29 08:37:00+00'),
  ('8f7aea56-3245-4b1c-9b73-eef7693c5782', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100431', 'debit', 1228.98, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-07 01:49:00+00'),
  ('66ec98dd-9b4b-4d5c-9773-51716f56486d', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100432', 'debit', 787.60, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-31 14:56:00+00'),
  ('f6757f93-fe1f-4b86-b82a-e31478b5b430', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100433', 'debit', 274.89, 'INR', 'entertainment', 'completed', 'Spotify Premium', 'spotify@yesbank', 'Paid Spotify Premium via Cash UPI Simulator', '2026-09-14 17:40:00+00'),
  ('3f2d1cff-e425-4921-8f0b-307fa612fb5b', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100434', 'debit', 965.39, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-11-02 15:48:00+00'),
  ('37a13115-3910-469b-b55f-370d947c957e', '53f1f834-fe43-4d49-b637-c9cd1d337385', (select id from public.wallets where user_id = '53f1f834-fe43-4d49-b637-c9cd1d337385'), null, null, 'TXN_UPI_100435', 'debit', 8292.36, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-14 03:21:00+00'),
  ('1cae8dca-dd80-44ae-bf16-fa618beb55fe', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_SAL_100436', 'credit', 99794.50, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-14 03:00:00+00'),
  ('21e67694-9122-4410-8013-0f6409050e1b', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100437', 'debit', 11307.99, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-29 19:51:00+00'),
  ('2e957820-1e3a-42dc-b77c-bf219da13689', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100438', 'debit', 895.92, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-11-01 19:26:00+00'),
  ('1c07b89b-48ec-4b41-aef2-79b8f1a4eb25', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100439', 'debit', 2853.45, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-20 02:39:00+00'),
  ('54a0bb40-8fde-41f2-af27-c04974e4d1aa', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100440', 'debit', 757.14, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-09 03:14:00+00'),
  ('37bc55cc-8aa5-4031-bdbb-8fc14d5a8a7c', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100441', 'debit', 4383.57, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-09-30 19:34:00+00'),
  ('6317b1f2-e89e-4c05-9732-2d03de20c058', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100442', 'debit', 3085.50, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-24 04:43:00+00'),
  ('66ca6bff-55e0-4c37-b753-3da8fd147e61', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100443', 'debit', 242.34, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-19 10:34:00+00'),
  ('3c4224dd-f150-49c3-80e1-c0664804e348', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100444', 'debit', 2391.99, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-17 00:23:00+00'),
  ('880bbde2-fee1-4cc1-b35b-736a29bee7c6', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100445', 'debit', 1235.58, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-23 14:56:00+00'),
  ('8b4166b8-a848-4e77-bc26-fbbbcda53f1d', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100446', 'debit', 634.98, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-25 19:42:00+00'),
  ('7e3c2472-7f6b-4dd6-97a2-c2af5f74764a', 'd03d749f-498d-447d-84c5-22634a1c4b13', (select id from public.wallets where user_id = 'd03d749f-498d-447d-84c5-22634a1c4b13'), null, null, 'TXN_UPI_100447', 'debit', 703.09, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-09-04 14:16:00+00'),
  ('d518cc04-dbf9-4b8c-8f04-e5187ec513b5', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_SAL_100448', 'credit', 178242.34, 'INR', 'salary', 'completed', 'Swiggy Bundl Tech', 'finance@swiggy.in', 'Monthly Salary Credit — Swiggy Bundl Tech', '2026-10-22 03:00:00+00'),
  ('b37d55c1-8d1c-4955-8028-f8ae01ec3a91', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100449', 'debit', 301.85, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-21 22:11:00+00'),
  ('8657f8e1-2809-4c9a-8a99-eb3a03a9ea8f', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100450', 'debit', 553.05, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-23 12:31:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('f3b0ebea-0f32-4da6-baca-3cc3ebb32df5', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100451', 'debit', 1202.26, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-09-29 15:11:00+00'),
  ('3744ff17-810a-4f5d-a326-858cd44373f3', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100452', 'debit', 7436.46, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-04 18:06:00+00'),
  ('3bed77d2-797c-4c37-948b-3ee93d107e32', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100453', 'debit', 426.32, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-12 05:41:00+00'),
  ('f3cee2b7-aeaf-4c8f-80ba-e12634911bdb', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100454', 'debit', 415.02, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-09-09 16:51:00+00'),
  ('de1b3173-aa12-44dc-adf8-6f3b82439be7', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100455', 'debit', 1189.84, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-11 14:28:00+00'),
  ('77cf2214-d3fb-4d71-b81f-083e5b7f3870', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100456', 'debit', 877.18, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-17 21:59:00+00'),
  ('55a61aed-efbc-41d1-ba7d-be7d1ef173d7', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100457', 'debit', 1332.79, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-28 03:25:00+00'),
  ('6c76cfe5-b36b-4cff-89cd-38e991ff36f6', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100458', 'debit', 198.62, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-27 22:53:00+00'),
  ('3afc443f-940a-43cc-a8f6-e1fea51a2ed4', '6c0a2819-0260-4bc8-8d6e-d1cc085c3732', (select id from public.wallets where user_id = '6c0a2819-0260-4bc8-8d6e-d1cc085c3732'), null, null, 'TXN_UPI_100459', 'debit', 199.34, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-14 19:52:00+00'),
  ('5bd76652-c535-445b-9f04-c2f241faf1dd', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_SAL_100460', 'credit', 126775.51, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-21 03:00:00+00'),
  ('b8e5f778-2b9e-4012-bb82-9f64134240e2', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100461', 'debit', 746.33, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-30 02:56:00+00'),
  ('363f46c2-9fbf-45d8-af56-171dd4f4b7b1', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100462', 'debit', 13654.45, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-10-05 22:55:00+00'),
  ('edabaa8d-1a3b-44e5-9c9e-d1f3725774e5', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100463', 'debit', 1060.26, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-05 01:50:00+00'),
  ('7406948a-d36c-4cc1-9815-c70d71e11ffe', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100464', 'debit', 622.25, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-08 11:59:00+00'),
  ('c13969f2-7199-4263-8102-a797a1fc1d7d', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100465', 'debit', 1135.69, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-10-22 15:47:00+00'),
  ('6fe01afb-ae38-4f9c-87b1-3e2b2e998285', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100466', 'debit', 3119.11, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-05 22:58:00+00'),
  ('fc8e46d0-d2a0-437f-960b-28757e57f73f', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100467', 'debit', 657.24, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-02 13:04:00+00'),
  ('2ce7bcf9-d973-4d13-8f15-c36bffa1c329', '79852118-097b-46cc-a775-e6150332dece', (select id from public.wallets where user_id = '79852118-097b-46cc-a775-e6150332dece'), null, null, 'TXN_UPI_100468', 'debit', 2937.09, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-28 18:36:00+00'),
  ('e81bbea5-d609-47c9-9d58-87d84f030baa', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_SAL_100469', 'credit', 96442.61, 'INR', 'salary', 'completed', 'Infosys Digital Solutions', 'salary@infosys.com', 'Monthly Salary Credit — Infosys Digital Solutions', '2026-10-12 03:00:00+00'),
  ('26a7c63e-7994-451d-ac69-0dba4a3f0063', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100470', 'debit', 3884.54, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-09 04:38:00+00'),
  ('6aaabde3-c04c-4e3f-a734-3478bad9e95a', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100471', 'debit', 1856.33, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-02 15:02:00+00'),
  ('9d71eb1c-8580-44cd-9c3a-29a0cec3d8aa', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100472', 'debit', 3311.54, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-10-16 21:59:00+00'),
  ('679b427a-b45c-4ef8-b6b1-e060e90228b4', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100473', 'debit', 1297.56, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-11-01 18:57:00+00'),
  ('59697239-de23-47e4-bb66-33c3e513125c', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100474', 'debit', 1811.83, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-09-14 08:46:00+00'),
  ('d3a27585-2a67-47f1-8f41-655f433bbbcd', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100475', 'debit', 1580.28, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-21 19:43:00+00'),
  ('66a8aa22-9b95-407b-afef-8f087b356bfc', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100476', 'debit', 3948.86, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-05 03:57:00+00'),
  ('5a71ce3b-4788-42d6-a5e2-006941c6dd8d', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100477', 'debit', 597.82, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-12 14:38:00+00'),
  ('9a4f4e4b-0779-4e2a-affa-da4514e2c9ff', '57de058b-cfac-4e20-9fe0-bc98c0d5e470', (select id from public.wallets where user_id = '57de058b-cfac-4e20-9fe0-bc98c0d5e470'), null, null, 'TXN_UPI_100478', 'debit', 2248.86, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-26 16:09:00+00'),
  ('d4465e20-7010-4c02-a26a-dae8d063b56c', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_SAL_100479', 'credit', 182203.32, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-14 03:00:00+00'),
  ('3a0e2bcd-605c-4ca5-8b8a-a258e13ef180', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100480', 'debit', 3663.65, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-27 22:24:00+00'),
  ('3e471e20-c548-403a-bc3d-ccea6e5c41b5', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100481', 'debit', 12746.42, 'INR', 'shopping', 'completed', 'Tata Neu / Croma', 'tataneu@hdfc', 'Paid Tata Neu / Croma via Cash UPI Simulator', '2026-09-12 11:26:00+00'),
  ('2935292e-cc90-423d-9443-4917acaba7c5', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100482', 'debit', 4992.23, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-11-01 00:57:00+00'),
  ('11112889-3031-497c-8b68-ccdcd7984ff0', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100483', 'debit', 619.38, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-11-01 10:30:00+00'),
  ('c3f63391-ea3a-4c74-940c-a8adaa803c07', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100484', 'debit', 415.39, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-24 20:09:00+00'),
  ('919ea091-00e4-4cad-8444-f59ed1fbb56c', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100485', 'debit', 3225.41, 'INR', 'shopping', 'completed', 'Amazon India', 'amazonpay@apl', 'Paid Amazon India via Cash UPI Simulator', '2026-10-22 16:57:00+00'),
  ('3f21c571-a7c6-4e7e-8f21-e683c68af70c', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100486', 'debit', 268.17, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-18 22:11:00+00'),
  ('3450dd65-2dd5-498f-b4a7-31dd8e748307', '39800d95-c7f6-4fe0-a08f-492ea7ca72ff', (select id from public.wallets where user_id = '39800d95-c7f6-4fe0-a08f-492ea7ca72ff'), null, null, 'TXN_UPI_100487', 'debit', 1900.64, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-09-08 15:56:00+00'),
  ('35d25fbf-83bc-4b28-bed8-337ab3879ec8', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_SAL_100488', 'credit', 108726.74, 'INR', 'salary', 'completed', 'Tata Consultancy Services', 'salary@tcs.com', 'Monthly Salary Credit — Tata Consultancy Services', '2026-10-11 03:00:00+00'),
  ('4ef0df6f-af63-4c8d-8d11-133ee1cce714', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100489', 'debit', 906.29, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-13 22:50:00+00'),
  ('8f03758d-490f-460a-b449-ef5aad14cc7f', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100490', 'debit', 617.78, 'INR', 'entertainment', 'completed', 'Netflix India', 'netflix.sub@citi', 'Paid Netflix India via Cash UPI Simulator', '2026-10-02 06:40:00+00'),
  ('8927515b-4963-46f7-95dc-7bc492c150a8', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100491', 'debit', 6922.92, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-09-28 04:04:00+00'),
  ('01e8a9b7-b541-48b7-995f-c13e13ecc249', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100492', 'debit', 1780.42, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-09-26 21:36:00+00'),
  ('65818e0b-535e-4379-b7ee-d48c1af46f04', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100493', 'debit', 9738.96, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-15 22:49:00+00'),
  ('dade7f7b-e4ba-4611-b34b-67faed45b52d', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100494', 'debit', 909.03, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-09-27 14:06:00+00'),
  ('94406a21-c70b-427a-a509-35bd0dcc5e70', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100495', 'debit', 382.08, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-13 07:46:00+00'),
  ('f671a83e-9b35-48f9-bd01-1150c627e5bc', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100496', 'debit', 2076.54, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-24 16:13:00+00'),
  ('9dd06d88-dec7-4073-864d-175c66833caa', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100497', 'debit', 517.95, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-10-13 21:20:00+00'),
  ('80106f69-9c7d-452b-ba90-d2b923766d47', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100498', 'debit', 1346.76, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-21 06:14:00+00'),
  ('7c1325bd-b275-4e0d-b2f9-8132ab4f8bc6', '92f4497d-3364-4a22-82cb-5312ef7d63ec', (select id from public.wallets where user_id = '92f4497d-3364-4a22-82cb-5312ef7d63ec'), null, null, 'TXN_UPI_100499', 'debit', 1222.31, 'INR', 'utilities', 'completed', 'Airtel Fiber Broadband', 'airtel.bills@airtel', 'Paid Airtel Fiber Broadband via Cash UPI Simulator', '2026-10-17 20:45:00+00'),
  ('137cc9da-ee4a-4fd8-93c0-a9554845bffc', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_SAL_100500', 'credit', 103474.35, 'INR', 'salary', 'completed', 'Razorpay Software', 'people@razorpay.com', 'Monthly Salary Credit — Razorpay Software', '2026-10-24 03:00:00+00')
on conflict (reference_id) do nothing;

insert into public.transactions (
  id, user_id, wallet_id, pocket_id, goal_id, reference_id, type, amount, currency, category, status, counterparty_name, counterparty_upi_id, description, created_at
) values
  ('3fc23061-be68-4971-b18d-795211e539f8', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100501', 'debit', 188.52, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-05 03:34:00+00'),
  ('8745e544-1a20-4728-bb8d-86a09b63b95d', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100502', 'debit', 8483.94, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-02 14:38:00+00'),
  ('4edaa986-c0f9-4627-b087-dfb91b97b601', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100503', 'debit', 2626.04, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-10 11:10:00+00'),
  ('0730e02a-5256-476a-8715-46f4d221fca7', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100504', 'debit', 255.00, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-10-30 01:42:00+00'),
  ('93fc8b7d-bf3e-435d-9efb-5181f58f61bf', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100505', 'debit', 404.97, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-28 00:39:00+00'),
  ('bea1b094-b792-4ecd-b10b-f53e25d49d7a', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100506', 'debit', 8513.68, 'INR', 'shopping', 'completed', 'Flipkart Internet', 'flipkart@axis', 'Paid Flipkart Internet via Cash UPI Simulator', '2026-10-23 03:56:00+00'),
  ('24668221-8170-4e4e-a9e8-17850d4c37ca', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100507', 'debit', 4325.50, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-28 16:22:00+00'),
  ('4c0ae2b3-db49-4cc2-bad6-5a77c680bb56', '317c43e1-27cc-42f6-930b-f7413bd1cf9b', (select id from public.wallets where user_id = '317c43e1-27cc-42f6-930b-f7413bd1cf9b'), null, null, 'TXN_UPI_100508', 'debit', 2328.29, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-06 06:50:00+00'),
  ('deefa288-291b-415f-92e3-3c89844336da', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_SAL_100509', 'credit', 117833.96, 'INR', 'salary', 'completed', 'Wipro Technologies Ltd', 'payroll@wipro.com', 'Monthly Salary Credit — Wipro Technologies Ltd', '2026-10-27 03:00:00+00'),
  ('4ad78c29-a599-47ef-9b17-4b1c63d16496', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100510', 'debit', 895.63, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-21 13:16:00+00'),
  ('24211284-278e-4d9c-a1ac-e2fc425ade7a', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100511', 'debit', 3666.11, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-09-17 09:44:00+00'),
  ('ee58e048-b5a0-4194-aa00-a85cfe0f48f6', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100512', 'debit', 6027.91, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-28 01:35:00+00'),
  ('935e67fa-1921-4484-9f47-ec6576342fa6', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100513', 'debit', 4019.56, 'INR', 'education', 'completed', 'Coursera Learning', 'coursera@paypal', 'Paid Coursera Learning via Cash UPI Simulator', '2026-10-25 01:37:00+00'),
  ('3e497bc1-5433-494c-a270-73cb19985fea', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100514', 'debit', 492.08, 'INR', 'food', 'completed', 'Swiggy', 'swiggy@icici', 'Paid Swiggy via Cash UPI Simulator', '2026-10-15 05:20:00+00'),
  ('b771995e-2ebd-4f5d-8306-0fc4e95d82dc', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100515', 'debit', 839.04, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-11-01 20:50:00+00'),
  ('ad9f64e4-f3bc-44a9-a2f2-391807454c10', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100516', 'debit', 11804.99, 'INR', 'travel', 'completed', 'MakeMyTrip Flights', 'makemytrip@icici', 'Paid MakeMyTrip Flights via Cash UPI Simulator', '2026-10-03 23:41:00+00'),
  ('338c6745-e9ca-4b94-bfa6-e500d6478817', '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab', (select id from public.wallets where user_id = '94b62b10-71bb-40a2-8719-8d9fb7a4f7ab'), null, null, 'TXN_UPI_100517', 'debit', 891.59, 'INR', 'entertainment', 'completed', 'BookMyShow Movies', 'bookmyshow@kotak', 'Paid BookMyShow Movies via Cash UPI Simulator', '2026-09-06 05:44:00+00'),
  ('d22fcf93-0e80-48b9-a7ed-51893e932d9b', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_SAL_100518', 'credit', 132767.97, 'INR', 'salary', 'completed', 'TechCorp India Pvt Ltd', 'payroll@techcorp.in', 'Monthly Salary Credit — TechCorp India Pvt Ltd', '2026-10-20 03:00:00+00'),
  ('ef38e0c8-49c4-4f8c-bd52-ef43deb0190d', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100519', 'debit', 3502.28, 'INR', 'utilities', 'completed', 'BESCOM Electricity', 'bescom@karnataka', 'Paid BESCOM Electricity via Cash UPI Simulator', '2026-10-10 21:32:00+00'),
  ('c51ca28b-81c3-4272-98fc-3226bc9874c0', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100520', 'debit', 463.30, 'INR', 'food', 'completed', 'Zomato', 'zomato@hdfc', 'Paid Zomato via Cash UPI Simulator', '2026-10-04 18:46:00+00'),
  ('943aad19-8148-4efd-b2d6-e595668ae2d4', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100521', 'debit', 516.76, 'INR', 'travel', 'completed', 'Ola Cabs', 'olacabs@axis', 'Paid Ola Cabs via Cash UPI Simulator', '2026-10-24 04:18:00+00'),
  ('68ecc53c-0e82-4db3-b610-f28bf80f4b88', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100522', 'debit', 417.13, 'INR', 'groceries', 'completed', 'Blinkit Instant', 'blinkit@axis', 'Paid Blinkit Instant via Cash UPI Simulator', '2026-10-11 09:34:00+00'),
  ('f250b3fb-286d-46e4-ae93-a9f508f94355', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100523', 'debit', 579.49, 'INR', 'travel', 'completed', 'Uber India', 'uber.rides@hdfc', 'Paid Uber India via Cash UPI Simulator', '2026-09-10 14:08:00+00'),
  ('3e676351-8e5c-4cb3-bd0b-9327a398e0a9', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100524', 'debit', 3767.57, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-29 05:05:00+00'),
  ('322bf5fd-4aa3-4ce3-84fb-3e0fc8d43e91', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100525', 'debit', 1939.51, 'INR', 'health', 'completed', 'Apollo Pharmacy', 'apollo@hdfc', 'Paid Apollo Pharmacy via Cash UPI Simulator', '2026-10-18 11:41:00+00'),
  ('3e7cf09c-1a5e-4116-aca5-030b6ce1e916', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100526', 'debit', 740.62, 'INR', 'groceries', 'completed', 'Zepto Quick Commerce', 'zepto@icici', 'Paid Zepto Quick Commerce via Cash UPI Simulator', '2026-09-09 04:58:00+00'),
  ('fda56cc2-276b-4243-9450-44fb18b45074', 'dd25dd36-fe38-4491-badc-62d3ccf5a194', (select id from public.wallets where user_id = 'dd25dd36-fe38-4491-badc-62d3ccf5a194'), null, null, 'TXN_UPI_100527', 'debit', 4484.73, 'INR', 'health', 'completed', 'Cult.fit Gym & Wellness', 'cultfit@icici', 'Paid Cult.fit Gym & Wellness via Cash UPI Simulator', '2026-09-30 08:17:00+00')
on conflict (reference_id) do nothing;

commit;
