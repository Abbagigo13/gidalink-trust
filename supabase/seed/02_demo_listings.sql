-- GidaLink Trust: demo listings so the landing page, dashboard and Kane scenarios have real rows.
-- Run in Supabase Dashboard -> SQL Editor AFTER 01_test_roles.sql. Safe to re-run (skips existing titles).
--
-- HONESTY NOTE: these rows are written directly as "verified" by the seed, NOT by a real review.
-- Their descriptions say so. Delete them before any real launch with 99_remove_demo_listings.sql.
-- Evidence files do not exist for these rows, so the pending ones have no documents to open.

do $$
declare
  owner_email text := 'kane-landlord@example.com';   -- must be an existing landlord or agent
  owner_uid uuid;
  note text := ' Demo data seeded for the hackathon; not a real property and not independently verified.';
begin
  select u.id into owner_uid
  from auth.users u join public.profiles p on p.id = u.id
  where u.email = owner_email and p.role in ('landlord', 'agent');

  if owner_uid is null then
    raise exception 'No landlord or agent with email %. Run 01_test_roles.sql first or edit owner_email.', owner_email;
  end if;

  -- Verified rent listings
  insert into public.properties (owner_id, title, description, listing_type, price_ngn, price_period, bedrooms, bathrooms, area_sqm, address, neighbourhood, city, state, image_urls, features, status, published_at)
  select owner_uid, v.title, v.description || note, v.listing_type::public.listing_type, v.price, v.period, v.beds, v.baths, v.sqm, v.address, v.hood, v.city, v.state, array[v.img], v.features, 'verified', now() - v.age * interval '1 day'
  from (values
    ('Contemporary four-bedroom residence', 'A spacious home with generous natural light and calm interiors in a quiet Mabushi street.', 'rent', 8500000, 'year', 4, 4, 320, '5 Demo Street, Mabushi', 'Mabushi', 'Abuja', 'FCT', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85', array['Parking','Fitted kitchen','Gated compound','Seed data'], 1),
    ('Garden house in Barnawa', 'A welcoming family home with practical living spaces and a quiet residential feel.', 'rent', 4500000, 'year', 3, 3, 210, '12 Demo Road, Barnawa', 'Barnawa', 'Kaduna', 'Kaduna', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85', array['Garden','Water supply','Parking','Seed data'], 2),
    ('Compact city apartment in Wuse 2', 'A two-bedroom apartment close to offices, restaurants and transport.', 'rent', 7200000, 'year', 2, 2, 120, '3 Demo Avenue, Wuse 2', 'Wuse 2', 'Abuja', 'FCT', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85', array['Fitted kitchen','Central location','Seed data'], 3),
    ('Modern five-bedroom home in Lekki', 'A modern purchase listing in Lekki Phase 1 with high-quality finishes throughout.', 'sale', 185000000, null, 5, 5, 480, '9 Demo Close, Lekki Phase 1', 'Lekki Phase 1', 'Lagos', 'Lagos', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85', array['Modern finish','Parking','Fitted kitchen','Seed data'], 4),
    ('Townhouse for sale in Ajah', 'A four-bedroom townhouse with a family lounge, ideal for a growing household.', 'sale', 95000000, null, 4, 4, 260, '21 Demo Estate, Ajah', 'Ajah', 'Lagos', 'Lagos', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85', array['Family lounge','Parking','Seed data'], 5),
    ('Hillside residential plot in Rayfield', 'A residential plot with road access to be confirmed. Buyers must verify title and survey independently.', 'land', 18000000, null, null, null, 600, 'Demo Layout, Rayfield', 'Rayfield', 'Jos', 'Plateau', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85', array['Residential use','Seed data'], 6)
  ) as v(title, description, listing_type, price, period, beds, baths, sqm, address, hood, city, state, img, features, age)
  where not exists (select 1 from public.properties p where p.owner_id = owner_uid and p.title = v.title);

  -- Pending-review listings so the verifier queue (scenario K06) has something to open
  insert into public.properties (owner_id, title, description, listing_type, price_ngn, price_period, bedrooms, bathrooms, address, neighbourhood, city, state, image_urls, features, status)
  select owner_uid, v.title, v.description || note, v.listing_type::public.listing_type, v.price, v.period, v.beds, v.baths, v.address, v.hood, v.city, v.state, array[v.img], v.features, 'pending_review'
  from (values
    ('Quiet courtyard home in Gwarinpa', 'A three-bedroom home with a balcony and parking, awaiting review.', 'rent', 6500000, 'year', 3, 3, '8 Demo Crescent, Gwarinpa', 'Gwarinpa', 'Abuja', 'FCT', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=85', array['Balcony','Parking','Seed data']),
    ('Open plot in Sabon Gari', 'A residential plot whose title review is pending.', 'land', 12000000, null, null, null, 'Demo Layout, Sabon Gari', 'Sabon Gari', 'Zaria', 'Kaduna', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85', array['Residential use','Title review pending','Seed data'])
  ) as v(title, description, listing_type, price, period, beds, baths, address, hood, city, state, img, features)
  where not exists (select 1 from public.properties p where p.owner_id = owner_uid and p.title = v.title);

  raise notice 'Seeded demo listings for %', owner_email;
end $$;

select status, count(*) from public.properties group by status order by status;
