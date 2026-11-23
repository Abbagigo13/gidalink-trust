drop table if exists t_results; create table t_results(name text, ok boolean, detail text);
create or replace function t_run(tname text, uid uuid, rolename text, stmt text, expect text) returns void language plpgsql as $$
declare ok boolean := false; detail text := ''; n bigint;
begin
  begin
    perform set_config('request.jwt.claim.sub', coalesce(uid::text,''), true);
    execute format('set local role %I', rolename);
    if expect like 'rows:%' then
      execute 'select count(*) from (' || stmt || ') q' into n;
      ok := n = substr(expect,6)::bigint; detail := 'rows=' || n;
    elsif expect like 'affected:%' then
      execute stmt; get diagnostics n = row_count;
      ok := n = substr(expect,10)::bigint; detail := 'affected=' || n;
    else
      execute stmt;
      ok := (expect = 'ok'); detail := 'no error';
    end if;
    reset role;
  exception when others then
    reset role;
    ok := (expect = 'fail'); detail := sqlerrm;
  end;
  insert into t_results values (tname, ok, detail);
end $$;

-- users
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000b1','buyer@t.io','{"full_name":"Buyer One"}'),
 ('00000000-0000-0000-0000-0000000000a1','landlord@t.io','{"full_name":"Land Lord","requested_role":"landlord"}'),
 ('00000000-0000-0000-0000-0000000000a2','sneaky@t.io','{"full_name":"Sneaky","requested_role":"admin"}'),
 ('00000000-0000-0000-0000-0000000000c1','verifier@t.io','{"full_name":"Veri Fier"}'),
 ('00000000-0000-0000-0000-0000000000d1','admin@t.io','{"full_name":"Ad Min"}');
update public.profiles set role='verifier' where id='00000000-0000-0000-0000-0000000000c1';
update public.profiles set role='admin' where id='00000000-0000-0000-0000-0000000000d1';

select t_run('signup cannot self-assign admin', null,'postgres',$$select 1 from public.profiles where id='00000000-0000-0000-0000-0000000000a2' and role='buyer'$$,'rows:1');
select t_run('signup landlord role honoured', null,'postgres',$$select 1 from public.profiles where id='00000000-0000-0000-0000-0000000000a1' and role='landlord'$$,'rows:1');
select t_run('user cannot change own role','00000000-0000-0000-0000-0000000000b1','authenticated',$$update public.profiles set role='admin' where id='00000000-0000-0000-0000-0000000000b1'$$,'fail');

-- landlord creates listings
select t_run('buyer cannot create listing','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.properties(owner_id,title,listing_type,price_ngn,address,city,state) values ('00000000-0000-0000-0000-0000000000b1','Buyer listing here','rent',1000,'1 St','Abuja','FCT')$$,'fail');
select t_run('landlord cannot insert as verified','00000000-0000-0000-0000-0000000000a1','authenticated',$$insert into public.properties(owner_id,title,listing_type,price_ngn,address,city,state,status) values ('00000000-0000-0000-0000-0000000000a1','Sneaky verified one','rent',1000,'1 St','Abuja','FCT','verified')$$,'fail');
select t_run('landlord creates draft','00000000-0000-0000-0000-0000000000a1','authenticated',$$insert into public.properties(id,owner_id,title,listing_type,price_ngn,address,city,state) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a1','Landlord draft listing','rent',4500000,'12 Test Close','Abuja','FCT')$$,'ok');
select t_run('landlord cannot self-verify via update','00000000-0000-0000-0000-0000000000a1','authenticated',$$update public.properties set status='verified' where id='11111111-1111-1111-1111-111111111111'$$,'fail');
select t_run('submit blocked without photo','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.submit_property_for_review('11111111-1111-1111-1111-111111111111')$$,'fail');
select t_run('landlord adds photo','00000000-0000-0000-0000-0000000000a1','authenticated',$$update public.properties set image_urls=array['https://x/y.jpg'] where id='11111111-1111-1111-1111-111111111111'$$,'affected:1');
select t_run('submit blocked without evidence','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.submit_property_for_review('11111111-1111-1111-1111-111111111111')$$,'fail');
select t_run('landlord adds evidence','00000000-0000-0000-0000-0000000000a1','authenticated',$$insert into public.verification_submissions(property_id,submitted_by,document_type,storage_path) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a1','C of O','a1/x.pdf')$$,'ok');
select t_run('buyer cannot submit others listing','00000000-0000-0000-0000-0000000000b1','authenticated',$$select public.submit_property_for_review('11111111-1111-1111-1111-111111111111')$$,'fail');
select t_run('landlord submits for review','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.submit_property_for_review('11111111-1111-1111-1111-111111111111')$$,'ok');
select t_run('owner cannot edit while pending','00000000-0000-0000-0000-0000000000a1','authenticated',$$update public.properties set title='Changed after review ok' where id='11111111-1111-1111-1111-111111111111'$$,'affected:0');

-- public exposure
select t_run('anon sees pending in public view',null,'anon',$$select * from public.public_properties$$,'rows:1');
select t_run('anon cannot read base table',null,'anon',$$select * from public.properties$$,'rows:0');
select t_run('anon view has no address column',null,'anon',$$select address from public.public_properties$$,'fail');
select t_run('anon view has no owner column',null,'anon',$$select owner_id from public.public_properties$$,'fail');
select t_run('buyer cannot read base listing','00000000-0000-0000-0000-0000000000b1','authenticated',$$select * from public.properties$$,'rows:0');
select t_run('verifier reads queue','00000000-0000-0000-0000-0000000000c1','authenticated',$$select * from public.properties where status='pending_review'$$,'rows:1');

-- review rules
select t_run('buyer cannot review','00000000-0000-0000-0000-0000000000b1','authenticated',$$select public.review_property('11111111-1111-1111-1111-111111111111','approve',null)$$,'fail');
select t_run('landlord cannot review','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.review_property('11111111-1111-1111-1111-111111111111','approve',null)$$,'fail');
select t_run('reject needs reason','00000000-0000-0000-0000-0000000000c1','authenticated',$$select public.review_property('11111111-1111-1111-1111-111111111111','reject','')$$,'fail');
select t_run('verifier rejects with reason','00000000-0000-0000-0000-0000000000c1','authenticated',$$select public.review_property('11111111-1111-1111-1111-111111111111','reject','Blurry document')$$,'ok');
select t_run('rejected listing editable by owner','00000000-0000-0000-0000-0000000000a1','authenticated',$$update public.properties set title='Fixed landlord listing' where id='11111111-1111-1111-1111-111111111111'$$,'affected:1');
select t_run('resubmit needs fresh evidence','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.submit_property_for_review('11111111-1111-1111-1111-111111111111')$$,'fail');
select t_run('landlord uploads new evidence','00000000-0000-0000-0000-0000000000a1','authenticated',$$insert into public.verification_submissions(property_id,submitted_by,document_type,storage_path) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a1','C of O','a1/y.pdf')$$,'ok');
select t_run('landlord resubmits','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.submit_property_for_review('11111111-1111-1111-1111-111111111111')$$,'ok');
select t_run('verifier approves','00000000-0000-0000-0000-0000000000c1','authenticated',$$select public.review_property('11111111-1111-1111-1111-111111111111','approve','Documents match')$$,'ok');
select t_run('verified listing is public',null,'anon',$$select * from public.public_properties where status='verified'$$,'rows:1');
select t_run('owner cannot edit verified','00000000-0000-0000-0000-0000000000a1','authenticated',$$update public.properties set price_ngn=1 where id='11111111-1111-1111-1111-111111111111'$$,'affected:0');
select t_run('cannot review twice','00000000-0000-0000-0000-0000000000c1','authenticated',$$select public.review_property('11111111-1111-1111-1111-111111111111','approve',null)$$,'fail');

-- inspections
select t_run('buyer requests inspection','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.inspection_requests(id,property_id,requester_id,preferred_at) values ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000b1', now()+interval '2 days')$$,'ok');
select t_run('past inspection date refused','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.inspection_requests(property_id,requester_id,preferred_at) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000b1', now()-interval '1 day')$$,'fail');
select t_run('owner cannot request own listing','00000000-0000-0000-0000-0000000000a1','authenticated',$$insert into public.inspection_requests(property_id,requester_id,preferred_at) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a1', now()+interval '1 day')$$,'fail');
select t_run('buyer cannot accept own request','00000000-0000-0000-0000-0000000000b1','authenticated',$$select public.set_inspection_status('22222222-2222-2222-2222-222222222222','accepted')$$,'fail');
select t_run('buyer cannot see address before accept','00000000-0000-0000-0000-0000000000b1','authenticated',$$select * from public.properties$$,'rows:0');
select t_run('owner accepts','00000000-0000-0000-0000-0000000000a1','authenticated',$$select public.set_inspection_status('22222222-2222-2222-2222-222222222222','accepted')$$,'ok');
select t_run('buyer sees address after accept','00000000-0000-0000-0000-0000000000b1','authenticated',$$select address from public.properties$$,'rows:1');
select t_run('owner cannot rewrite request directly','00000000-0000-0000-0000-0000000000a1','authenticated',$$update public.inspection_requests set requester_id='00000000-0000-0000-0000-0000000000a1'$$,'affected:0');

-- reports
select t_run('buyer reports listing','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.property_reports(id,property_id,reporter_id,reason) values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000b1','Fake photos')$$,'ok');
select t_run('duplicate open report refused','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.property_reports(property_id,reporter_id,reason) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000b1','Again')$$,'fail');
select t_run('verifier cannot moderate report','00000000-0000-0000-0000-0000000000c1','authenticated',$$select public.moderate_report('33333333-3333-3333-3333-333333333333','resolved','x')$$,'fail');
select t_run('verifier can read reports','00000000-0000-0000-0000-0000000000c1','authenticated',$$select * from public.property_reports$$,'rows:1');
select t_run('buyer cannot suspend','00000000-0000-0000-0000-0000000000b1','authenticated',$$select public.suspend_property('11111111-1111-1111-1111-111111111111','spam')$$,'fail');
select t_run('admin suspends listing','00000000-0000-0000-0000-0000000000d1','authenticated',$$select public.suspend_property('11111111-1111-1111-1111-111111111111','Under investigation')$$,'ok');
select t_run('suspended hidden from public',null,'anon',$$select * from public.public_properties$$,'rows:0');
select t_run('admin resolves report','00000000-0000-0000-0000-0000000000d1','authenticated',$$select public.moderate_report('33333333-3333-3333-3333-333333333333','resolved','Confirmed and suspended')$$,'ok');

-- admin
select t_run('admin changes role','00000000-0000-0000-0000-0000000000d1','authenticated',$$select public.set_user_role('00000000-0000-0000-0000-0000000000b1','agent')$$,'ok');
select t_run('admin cannot change own role','00000000-0000-0000-0000-0000000000d1','authenticated',$$select public.set_user_role('00000000-0000-0000-0000-0000000000d1','buyer')$$,'fail');
select t_run('non-admin cannot change role','00000000-0000-0000-0000-0000000000c1','authenticated',$$select public.set_user_role('00000000-0000-0000-0000-0000000000b1','admin')$$,'fail');
select t_run('admin reads all profiles','00000000-0000-0000-0000-0000000000d1','authenticated',$$select * from public.profiles$$,'rows:5');
select t_run('buyer reads only own profile','00000000-0000-0000-0000-0000000000c1','authenticated',$$select * from public.profiles$$,'rows:1');
select t_run('audit written','00000000-0000-0000-0000-0000000000d1','authenticated',$$select * from public.audit_logs$$,'rows:8');
select t_run('anon cannot call review',null,'anon',$$select public.review_property('11111111-1111-1111-1111-111111111111','approve',null)$$,'fail');
select t_run('user cannot call write_audit','00000000-0000-0000-0000-0000000000b1','authenticated',$$select public.write_audit('x','y',null,null)$$,'fail');

-- favourites
select t_run('user saves favourite','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.favorites(user_id,property_id) values ('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-111111111111')$$,'ok');
select t_run('user cannot save for others','00000000-0000-0000-0000-0000000000b1','authenticated',$$insert into public.favorites(user_id,property_id) values ('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-111111111111')$$,'fail');

select case when ok then 'PASS' else 'FAIL' end as r, name, detail from t_results order by ok, name;
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from t_results;
