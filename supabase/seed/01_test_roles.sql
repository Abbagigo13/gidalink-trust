-- GidaLink Trust: assign roles to your Kane test users.
-- Run in Supabase Dashboard -> SQL Editor AFTER creating the four users in Authentication -> Users.
-- Edit the four emails below to match the users you created. Buyers keep the default role.
-- Running this in the SQL editor is the controlled admin process for verifier and admin access.

do $$
declare
  landlord_email text := 'kane-landlord@example.com';
  verifier_email text := 'kane-verifier@example.com';
  admin_email    text := 'kane-admin@example.com';
  updated int;
begin
  update public.profiles set role = 'landlord'
   where id = (select id from auth.users where email = landlord_email);
  get diagnostics updated = row_count;
  if updated = 0 then raise warning 'No user found for landlord email %', landlord_email; end if;

  update public.profiles set role = 'verifier'
   where id = (select id from auth.users where email = verifier_email);
  get diagnostics updated = row_count;
  if updated = 0 then raise warning 'No user found for verifier email %', verifier_email; end if;

  update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = admin_email);
  get diagnostics updated = row_count;
  if updated = 0 then raise warning 'No user found for admin email %', admin_email; end if;
end $$;

select u.email, p.role
from auth.users u join public.profiles p on p.id = u.id
order by p.role, u.email;
