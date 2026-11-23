-- GidaLink Trust: trust engine, role-safe signup, public listing view, storage and favourites.
-- Run AFTER 20261119000000_initial_schema.sql in Supabase Dashboard -> SQL Editor.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- 1. Helpers
-- ---------------------------------------------------------------------------

create or replace function public.my_role()
returns public.account_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- RLS helpers. SECURITY DEFINER so a policy on one table can look at another without
-- re-triggering that table's policies (which would recurse forever).
create or replace function public.owns_property(p_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.properties where id = p_id and owner_id = (select auth.uid()));
$$;

create or replace function public.property_is_live(p_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.properties where id = p_id and status in ('pending_review', 'verified'));
$$;

create or replace function public.holds_accepted_inspection(p_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.inspection_requests
    where property_id = p_id and requester_id = (select auth.uid()) and status in ('accepted', 'completed')
  );
$$;

create or replace function public.write_audit(
  p_action text, p_entity_type text, p_entity_id uuid, p_property_id uuid, p_metadata jsonb default '{}'::jsonb
) returns void
language sql security definer set search_path = ''
as $$
  insert into public.audit_logs (actor_id, property_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), p_property_id, p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
$$;

-- ---------------------------------------------------------------------------
-- 2. Signup: buyer, landlord or agent only. Verifier/admin are never self-assigned.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'requested_role', 'buyer');
  final_role public.account_role := 'buyer';
begin
  if requested in ('landlord', 'agent') then
    final_role := requested::public.account_role;
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    final_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Profiles: own row, plus admins can read everyone.
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles" on public.profiles
for select to authenticated using (public.my_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 3. Properties: private base table, public view without address or owner.
-- ---------------------------------------------------------------------------

drop policy if exists "Public can view published listings" on public.properties;
drop policy if exists "Landlords and agents can create listings" on public.properties;
drop policy if exists "Owners can edit their own unverified listings" on public.properties;
drop policy if exists "Staff read all listings" on public.properties;
drop policy if exists "Inspection holders read listing address" on public.properties;

create policy "Staff read all listings" on public.properties
for select to authenticated using (public.my_role() in ('verifier', 'admin'));

-- A requester whose inspection was accepted may see the full listing, including the address.
create policy "Inspection holders read listing address" on public.properties
for select to authenticated using (public.holds_accepted_inspection(id));

drop policy if exists "Landlords and agents create draft listings" on public.properties;
create policy "Landlords and agents create draft listings" on public.properties
for insert to authenticated with check (
  owner_id = (select auth.uid())
  and public.my_role() in ('landlord', 'agent')
  and status = 'draft'
  and published_at is null
);

drop policy if exists "Owners edit draft or rejected listings" on public.properties;
create policy "Owners edit draft or rejected listings" on public.properties
for update to authenticated
using (owner_id = (select auth.uid()) and status in ('draft', 'rejected'))
with check (owner_id = (select auth.uid()) and status in ('draft', 'rejected'));

drop policy if exists "Owners delete draft listings" on public.properties;
create policy "Owners delete draft listings" on public.properties
for delete to authenticated using (owner_id = (select auth.uid()) and status = 'draft');

-- Status, publication and ownership can only change through the trust-engine functions below.
create or replace function public.guard_property_columns()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.owner_id is distinct from old.owner_id then
      raise exception 'Listing ownership cannot be changed';
    end if;
    if (new.status is distinct from old.status or new.published_at is distinct from old.published_at)
       and coalesce(current_setting('gidalink.trusted', true), '') <> 'on' then
      raise exception 'Listing status can only change through the trust engine';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists properties_guard_columns on public.properties;
create trigger properties_guard_columns before update on public.properties
for each row execute function public.guard_property_columns();

-- Public discovery reads this view. It never exposes the street address or owner id.
drop view if exists public.public_properties;
create view public.public_properties with (security_invoker = false) as
select id, title, description, listing_type, price_ngn, price_period, bedrooms, bathrooms,
       area_sqm, neighbourhood, city, state, country, image_urls, features, status,
       published_at, created_at
from public.properties
where status in ('pending_review', 'verified');

grant select on public.public_properties to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Verification evidence
-- ---------------------------------------------------------------------------

drop policy if exists "Owners submit verification evidence" on public.verification_submissions;
drop policy if exists "Reviewers update verification decisions" on public.verification_submissions;

drop policy if exists "Owners submit evidence for editable listings" on public.verification_submissions;
create policy "Owners submit evidence for editable listings" on public.verification_submissions
for insert to authenticated with check (
  submitted_by = (select auth.uid())
  and status = 'submitted'
  and reviewer_id is null
  and exists (
    select 1 from public.properties pr
    where pr.id = property_id and pr.owner_id = (select auth.uid()) and pr.status in ('draft', 'rejected')
  )
);

-- ---------------------------------------------------------------------------
-- 5. Trust-engine functions (the only way to change listing status)
-- ---------------------------------------------------------------------------

create or replace function public.submit_property_for_review(p_property uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  prop public.properties;
begin
  select * into prop from public.properties where id = p_property;
  if not found or prop.owner_id <> (select auth.uid()) then
    raise exception 'Listing not found';
  end if;
  if prop.status not in ('draft', 'rejected') then
    raise exception 'Only draft or rejected listings can be submitted';
  end if;
  if coalesce(array_length(prop.image_urls, 1), 0) < 1 then
    raise exception 'Add at least one photograph before submitting';
  end if;
  if not exists (
    select 1 from public.verification_submissions v where v.property_id = p_property and v.status = 'submitted'
  ) then
    raise exception 'Upload at least one ownership or authority document before submitting';
  end if;

  perform set_config('gidalink.trusted', 'on', true);
  update public.properties set status = 'pending_review' where id = p_property;
  perform public.write_audit('property.submitted', 'property', p_property, p_property, '{}'::jsonb);
end;
$$;

create or replace function public.withdraw_property(p_property uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  prop public.properties;
begin
  select * into prop from public.properties where id = p_property;
  if not found or prop.owner_id <> (select auth.uid()) then
    raise exception 'Listing not found';
  end if;
  if prop.status <> 'pending_review' then
    raise exception 'Only listings awaiting review can be withdrawn';
  end if;

  perform set_config('gidalink.trusted', 'on', true);
  update public.properties set status = 'draft' where id = p_property;
  update public.verification_submissions set status = 'submitted' where property_id = p_property and status = 'in_review';
  perform public.write_audit('property.withdrawn', 'property', p_property, p_property, '{}'::jsonb);
end;
$$;

create or replace function public.review_property(p_property uuid, p_decision text, p_notes text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  prop public.properties;
  caller uuid := (select auth.uid());
begin
  if public.my_role() not in ('verifier', 'admin') then
    raise exception 'Only verifiers can review listings';
  end if;
  if p_decision not in ('approve', 'reject') then
    raise exception 'Decision must be approve or reject';
  end if;
  if p_decision = 'reject' and coalesce(btrim(p_notes), '') = '' then
    raise exception 'A reason is required when rejecting a listing';
  end if;

  select * into prop from public.properties where id = p_property for update;
  if not found then raise exception 'Listing not found'; end if;
  if prop.owner_id = caller then
    raise exception 'You cannot review your own listing';
  end if;
  if prop.status <> 'pending_review' then
    raise exception 'Listing is not awaiting review';
  end if;

  perform set_config('gidalink.trusted', 'on', true);
  update public.verification_submissions
     set status = case when p_decision = 'approve' then 'approved'::public.verification_status else 'rejected'::public.verification_status end,
         reviewer_id = caller, reviewer_notes = p_notes, reviewed_at = now()
   where property_id = p_property and status in ('submitted', 'in_review');

  update public.properties
     set status = case when p_decision = 'approve' then 'verified'::public.property_status else 'rejected'::public.property_status end,
         published_at = case when p_decision = 'approve' then now() else null end
   where id = p_property;

  perform public.write_audit('property.' || p_decision, 'property', p_property, p_property, jsonb_build_object('notes', p_notes));
end;
$$;

create or replace function public.suspend_property(p_property uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.my_role() <> 'admin' then raise exception 'Only admins can suspend listings'; end if;
  if coalesce(btrim(p_reason), '') = '' then raise exception 'A reason is required'; end if;
  if not exists (select 1 from public.properties where id = p_property and status in ('pending_review', 'verified')) then
    raise exception 'Only live listings can be suspended';
  end if;
  perform set_config('gidalink.trusted', 'on', true);
  update public.properties set status = 'suspended', published_at = null where id = p_property;
  perform public.write_audit('property.suspended', 'property', p_property, p_property, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.reinstate_property(p_property uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.my_role() <> 'admin' then raise exception 'Only admins can reinstate listings'; end if;
  if not exists (select 1 from public.properties where id = p_property and status = 'suspended') then
    raise exception 'Listing is not suspended';
  end if;
  perform set_config('gidalink.trusted', 'on', true);
  update public.properties set status = 'pending_review' where id = p_property;
  perform public.write_audit('property.reinstated', 'property', p_property, p_property, '{}'::jsonb);
end;
$$;

create or replace function public.set_user_role(p_user uuid, p_role public.account_role)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.my_role() <> 'admin' then raise exception 'Only admins can change roles'; end if;
  if p_user = (select auth.uid()) then raise exception 'You cannot change your own role'; end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then raise exception 'User not found'; end if;
  perform public.write_audit('user.role_changed', 'profile', p_user, null, jsonb_build_object('role', p_role));
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Inspections: server-enforced transitions
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated users request inspections" on public.inspection_requests;
drop policy if exists "Owners respond to inspection requests" on public.inspection_requests;

drop policy if exists "Buyers request inspections on live listings" on public.inspection_requests;
create policy "Buyers request inspections on live listings" on public.inspection_requests
for insert to authenticated with check (
  requester_id = (select auth.uid())
  and status = 'requested'
  and preferred_at > now()
  and public.property_is_live(property_id)
  and not public.owns_property(property_id)
);

drop policy if exists "Requesters and owners can read inspections" on public.inspection_requests;
create policy "Requesters and owners can read inspections" on public.inspection_requests
for select to authenticated
using (requester_id = (select auth.uid()) or public.owns_property(property_id));

create or replace function public.set_inspection_status(p_request uuid, p_status public.inspection_status)
returns void language plpgsql security definer set search_path = '' as $$
declare
  req public.inspection_requests;
  owner uuid;
  caller uuid := (select auth.uid());
  allowed boolean := false;
begin
  select * into req from public.inspection_requests where id = p_request for update;
  if not found then raise exception 'Inspection request not found'; end if;
  select owner_id into owner from public.properties where id = req.property_id;

  if caller = owner then
    allowed := (req.status = 'requested' and p_status in ('accepted', 'declined'))
            or (req.status = 'accepted' and p_status in ('completed', 'cancelled'));
  elsif caller = req.requester_id then
    allowed := req.status in ('requested', 'accepted') and p_status = 'cancelled';
  end if;

  if not allowed then raise exception 'That status change is not allowed'; end if;
  update public.inspection_requests set status = p_status where id = p_request;
  perform public.write_audit('inspection.' || p_status::text, 'inspection', p_request, req.property_id, '{}'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Reports: one open report per reporter and listing; admins moderate
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated users can report properties" on public.property_reports;
drop policy if exists "Moderators manage reports" on public.property_reports;

create unique index if not exists property_reports_one_open_per_reporter
  on public.property_reports (property_id, reporter_id) where status in ('open', 'investigating');

drop policy if exists "Users report live listings" on public.property_reports;
create policy "Users report live listings" on public.property_reports
for insert to authenticated with check (
  reporter_id = (select auth.uid())
  and status = 'open'
  and assigned_to is null
  and public.property_is_live(property_id)
);

create or replace function public.moderate_report(p_report uuid, p_status public.report_status, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  rep public.property_reports;
begin
  if public.my_role() <> 'admin' then raise exception 'Only admins can moderate reports'; end if;
  if p_status = 'open' then raise exception 'A report cannot be reopened'; end if;
  if p_status in ('resolved', 'dismissed') and coalesce(btrim(p_note), '') = '' then
    raise exception 'A resolution note is required';
  end if;
  select * into rep from public.property_reports where id = p_report for update;
  if not found then raise exception 'Report not found'; end if;
  update public.property_reports
     set status = p_status, assigned_to = (select auth.uid()), resolution_note = coalesce(p_note, resolution_note)
   where id = p_report;
  perform public.write_audit('report.' || p_status::text, 'report', p_report, rep.property_id, jsonb_build_object('note', p_note));
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Favourites
-- ---------------------------------------------------------------------------

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
alter table public.favorites enable row level security;

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites" on public.favorites
for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users add own favorites" on public.favorites;
create policy "Users add own favorites" on public.favorites
for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users remove own favorites" on public.favorites;
create policy "Users remove own favorites" on public.favorites
for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 9. Storage: public photos, private evidence
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification-evidence', 'verification-evidence', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners upload property images" on storage.objects;
create policy "Owners upload property images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'property-images' and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "Owners delete property images" on storage.objects;
create policy "Owners delete property images" on storage.objects
for delete to authenticated using (
  bucket_id = 'property-images' and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Owners upload evidence" on storage.objects;
create policy "Owners upload evidence" on storage.objects
for insert to authenticated with check (
  bucket_id = 'verification-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "Owners and reviewers read evidence" on storage.objects;
create policy "Owners and reviewers read evidence" on storage.objects
for select to authenticated using (
  bucket_id = 'verification-evidence'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.my_role() in ('verifier', 'admin'))
);

-- ---------------------------------------------------------------------------
-- 10. Execute grants: only signed-in users may call the trust-engine functions
-- ---------------------------------------------------------------------------

revoke execute on function public.submit_property_for_review(uuid) from public, anon;
revoke execute on function public.withdraw_property(uuid) from public, anon;
revoke execute on function public.review_property(uuid, text, text) from public, anon;
revoke execute on function public.suspend_property(uuid, text) from public, anon;
revoke execute on function public.reinstate_property(uuid) from public, anon;
revoke execute on function public.set_user_role(uuid, public.account_role) from public, anon;
revoke execute on function public.set_inspection_status(uuid, public.inspection_status) from public, anon;
revoke execute on function public.moderate_report(uuid, public.report_status, text) from public, anon;
revoke execute on function public.write_audit(text, text, uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.my_role() from public, anon;

grant execute on function public.submit_property_for_review(uuid) to authenticated;
grant execute on function public.withdraw_property(uuid) to authenticated;
grant execute on function public.review_property(uuid, text, text) to authenticated;
grant execute on function public.suspend_property(uuid, text) to authenticated;
grant execute on function public.reinstate_property(uuid) to authenticated;
grant execute on function public.set_user_role(uuid, public.account_role) to authenticated;
grant execute on function public.set_inspection_status(uuid, public.inspection_status) to authenticated;
grant execute on function public.moderate_report(uuid, public.report_status, text) to authenticated;
grant execute on function public.my_role() to authenticated;
revoke execute on function public.owns_property(uuid) from public, anon;
revoke execute on function public.property_is_live(uuid) from public, anon;
revoke execute on function public.holds_accepted_inspection(uuid) from public, anon;
grant execute on function public.owns_property(uuid) to authenticated;
grant execute on function public.property_is_live(uuid) to authenticated;
grant execute on function public.holds_accepted_inspection(uuid) to authenticated;
