-- GidaLink Trust: remove any leftover policy on public.properties that is not part of the trust engine.
-- Why: an older or hand-made policy (for example "Public can view verified properties") would let
-- anonymous visitors read the base table, including the street address and owner id, and bypass the
-- public_properties view. The trust-engine migration only drops policies it knows by name.
-- Run AFTER 20261122000000_trust_engine.sql. Safe to re-run.

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'properties'
      and policyname not in (
        'Owners can view their own listings',
        'Staff read all listings',
        'Inspection holders read listing address',
        'Landlords and agents create draft listings',
        'Owners edit draft or rejected listings',
        'Owners delete draft listings'
      )
  loop
    execute format('drop policy %I on public.properties', pol.policyname);
    raise notice 'Dropped unexpected policy on properties: %', pol.policyname;
  end loop;
end $$;

-- Confirm what remains. Expect exactly six policies, and none that applies to anon.
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'properties'
order by policyname;
