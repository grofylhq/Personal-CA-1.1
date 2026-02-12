create extension if not exists pgcrypto;

create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
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

-- NOTE: For client-side anon-key access, add policies in Supabase dashboard.
-- Example (development only, open access):
-- create policy "allow all" on public.user_accounts for all using (true) with check (true);
