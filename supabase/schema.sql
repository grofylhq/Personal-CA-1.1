-- Supabase schema for Personal CA
-- Run this in your Supabase SQL Editor to set up the database.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table (stores all user profile data)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  "phoneNumber" text default '',
  "avatarUrl" text default '',
  designation text default 'Executive',
  "companyName" text default '',
  "businessAddress" text default '',
  "industryType" text default '',
  "monthlyIncome" numeric default 0,
  "monthlyExpenses" numeric default 0,
  assets jsonb default '{"cash":0,"equity":0,"realEstate":0,"emergencyFund":0,"gold":0}'::jsonb,
  liabilities jsonb default '{"homeLoan":0,"personalLoan":0,"creditCard":0}'::jsonb,
  "riskAppetite" text default 'Moderate' check ("riskAppetite" in ('Conservative','Moderate','Aggressive')),
  goals jsonb default '[]'::jsonb,
  "investmentPreferences" jsonb default '[]'::jsonb,
  "complianceTracks" jsonb default '["Income Tax","GST"]'::jsonb,
  documents jsonb default '[]'::jsonb,
  drafts jsonb default '[]'::jsonb,
  "linkedAccounts" jsonb default '[]'::jsonb,
  "chatSessions" jsonb default '[]'::jsonb,
  "currentSessionId" text,
  "memoryBank" text default '',
  subscription jsonb default '{"tier":"free","messageCount":0}'::jsonb,
  "preferredAIProvider" text,
  "preferredModel" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: users can only access their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, "avatarUrl")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
