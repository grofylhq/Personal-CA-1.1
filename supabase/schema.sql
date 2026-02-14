create extension if not exists pgcrypto;

create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  profile_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_accounts_update_timestamp on public.user_accounts;
create trigger user_accounts_update_timestamp
before update on public.user_accounts
for each row
execute function public.update_timestamp();

alter table public.user_accounts enable row level security;

-- Recommended policies (authenticated users only):
-- create policy "read own profile" on public.user_accounts
--   for select to authenticated using (auth.uid() = id);
-- create policy "insert own profile" on public.user_accounts
--   for insert to authenticated with check (auth.uid() = id);
-- create policy "update own profile" on public.user_accounts
--   for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
