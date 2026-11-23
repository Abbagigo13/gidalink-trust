-- Removes every listing created by 02_demo_listings.sql (identified by the "Seed data" feature tag).
-- Run in the SQL Editor before a real launch. Related inspections, reports and favourites cascade.
delete from public.properties where 'Seed data' = any (features);

select status, count(*) from public.properties group by status order by status;
