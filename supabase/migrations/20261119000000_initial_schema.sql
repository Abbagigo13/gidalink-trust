-- GidaLink Trust: initial Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor.
-- This schema establishes the database foundation; it does not create demo listings.

create extension if not exists pgcrypto;

do $$ begin
  create type public.account_role as enum ('buyer', 'landlord', 'agent', 'verifier', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_type as enum ('rent', 'sale', 'land');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.property_status as enum ('draft', 'pending_review', 'verified', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('submitted', 'in_review', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inspection_status as enum ('requested', 'accepted', 'declined', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('open', 'investigating', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.account_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 8 and 140),
  description text not null default '',
  listing_type public.listing_type not null,
  price_ngn numeric(15,2) not null check (price_ngn >= 0),
  price_period text,
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  area_sqm numeric(10,2) check (area_sqm is null or area_sqm > 0),
  address text not null,
  neighbourhood text,
  city text not null,
  state text not null,
  country text not null default 'Nigeria',
  image_urls text[] not null default '{}',
  features text[] not null default '{}',
  status public.property_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  document_type text not null,
  storage_path text not null,
  notes text,
  status public.verification_status not null default 'submitted',
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.inspection_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete restrict,
  preferred_at timestamptz not null,
  message text,
  status public.inspection_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists properties_discovery_idx on public.properties (status, listing_type, city, price_ngn);
create index if not exists properties_owner_idx on public.properties (owner_id, created_at desc);
create index if not exists verification_property_idx on public.verification_submissions (property_id, created_at desc);
create index if not exists inspections_property_idx on public.inspection_requests (property_id, created_at desc);
create index if not exists reports_status_idx on public.property_reports (status, created_at desc);
create index if not exists audit_property_idx on public.audit_logs (property_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties
for each row execute function public.set_updated_at();
drop trigger if exists inspections_set_updated_at on public.inspection_requests;
create trigger inspections_set_updated_at before update on public.inspection_requests
for each row execute function public.set_updated_at();
drop trigger if exists reports_set_updated_at on public.property_reports;
create trigger reports_set_updated_at before update on public.property_reports
for each row execute function public.set_updated_at();

-- Create a basic buyer profile automatically for each new auth account.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable Row Level Security on every application table.
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.verification_submissions enable row level security;
alter table public.inspection_requests enable row level security;
alter table public.property_reports enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users can read and edit their own contact details, but cannot change their role.
drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner" on public.profiles
for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Users update own profile details" on public.profiles;
create policy "Users update own profile details" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = (select p.role from public.profiles p where p.id = (select auth.uid())));

-- Public can discover listings that are under review or verified. Draft, rejected and suspended listings stay private.
drop policy if exists "Public can view published listings" on public.properties;
create policy "Public can view published listings" on public.properties
for select to anon, authenticated
using (status in ('pending_review', 'verified'));
drop policy if exists "Owners can view their own listings" on public.properties;
create policy "Owners can view their own listings" on public.properties
for select to authenticated
using (owner_id = (select auth.uid()));
drop policy if exists "Landlords and agents can create listings" on public.properties;
create policy "Landlords and agents can create listings" on public.properties
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('landlord', 'agent', 'admin'))
  and status in ('draft', 'pending_review')
);
drop policy if exists "Owners can edit their own unverified listings" on public.properties;
create policy "Owners can edit their own unverified listings" on public.properties
for update to authenticated
using (owner_id = (select auth.uid()) and status in ('draft', 'pending_review'))
with check (owner_id = (select auth.uid()) and status in ('draft', 'pending_review'));

-- Verification evidence is private to its submitter and authorized reviewers.
drop policy if exists "Submitters and reviewers can read verification records" on public.verification_submissions;
create policy "Submitters and reviewers can read verification records" on public.verification_submissions
for select to authenticated
using (
  submitted_by = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin'))
);
drop policy if exists "Owners submit verification evidence" on public.verification_submissions;
create policy "Owners submit verification evidence" on public.verification_submissions
for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = (select auth.uid()))
  and status = 'submitted'
);
drop policy if exists "Reviewers update verification decisions" on public.verification_submissions;
create policy "Reviewers update verification decisions" on public.verification_submissions
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin')))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin')));

-- Inspection requests: requesters create/read their own; property owners can read requests for their listings.
drop policy if exists "Requesters and owners can read inspections" on public.inspection_requests;
create policy "Requesters and owners can read inspections" on public.inspection_requests
for select to authenticated
using (
  requester_id = (select auth.uid())
  or exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = (select auth.uid()))
);
drop policy if exists "Authenticated users request inspections" on public.inspection_requests;
create policy "Authenticated users request inspections" on public.inspection_requests
for insert to authenticated
with check (requester_id = (select auth.uid()) and status = 'requested');
drop policy if exists "Owners respond to inspection requests" on public.inspection_requests;
create policy "Owners respond to inspection requests" on public.inspection_requests
for update to authenticated
using (exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = (select auth.uid())))
with check (exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = (select auth.uid())));

-- Reports: authenticated users can report; reporters and moderators can read them.
drop policy if exists "Reporters and moderators can read reports" on public.property_reports;
create policy "Reporters and moderators can read reports" on public.property_reports
for select to authenticated
using (
  reporter_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin'))
);
drop policy if exists "Authenticated users can report properties" on public.property_reports;
create policy "Authenticated users can report properties" on public.property_reports
for insert to authenticated
with check (reporter_id = (select auth.uid()) and status = 'open');
drop policy if exists "Moderators manage reports" on public.property_reports;
create policy "Moderators manage reports" on public.property_reports
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin')))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin')));

-- Audit logs are read-only to moderators; application writes should go through trusted server-side functions.
drop policy if exists "Moderators can read audit logs" on public.audit_logs;
create policy "Moderators can read audit logs" on public.audit_logs
for select to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('verifier', 'admin')));

-- NOTE: Do not expose the Supabase service_role key in the browser.
