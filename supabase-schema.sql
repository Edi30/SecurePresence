-- SecurePresence web user database
-- Ruleaza acest fisier in Supabase SQL Editor.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text,
  first_name text default '',
  last_name text default '',
  phone text default '',
  cnp text default '',
  face_photo_data text default '',
  full_name text,
  role text not null default 'user',
  created_at timestamp with time zone not null default now()
);

alter table profiles add column if not exists first_name text default '';
alter table profiles add column if not exists username text;
alter table profiles add column if not exists last_name text default '';
alter table profiles add column if not exists phone text default '';
alter table profiles add column if not exists cnp text default '';
alter table profiles add column if not exists face_photo_data text default '';
create unique index if not exists profiles_username_unique on profiles(lower(username)) where username is not null;

drop policy if exists "users can find profile by username" on profiles;
create policy "users can find profile by username"
on profiles for select
to anon, authenticated
using (username is not null);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = coalesce(public.profiles.username, new.raw_user_meta_data->>'username'),
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists events (
  id text primary key,
  name text not null,
  description text default '',
  event_date text default '',
  event_time text default '',
  location text default '',
  status text not null default 'Upcoming',
  total integer not null default 0,
  registered integer not null default 0,
  available integer not null default 0,
  is_private boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists event_access (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique(event_id, user_id)
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text default '',
  cnp text default '',
  face_photo_data text default '',
  synced_to_admin boolean not null default false,
  created_at timestamp with time zone not null default now(),
  unique(event_id, user_id)
);

alter table registrations add column if not exists face_photo_data text default '';
create unique index if not exists registrations_event_user_unique on registrations(event_id, user_id);

create or replace function public.increment_event_registration(p_event_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
  set
    registered = registered + 1,
    available = greatest(available - 1, 0)
  where id = p_event_id;
end;
$$;

grant execute on function public.increment_event_registration(text) to authenticated;

alter table profiles enable row level security;
alter table events enable row level security;
alter table event_access enable row level security;
alter table registrations enable row level security;

drop policy if exists "users can read own profile" on profiles;
create policy "users can read own profile"
on profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile"
on profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "users can read allowed events" on events;
create policy "users can read allowed events"
on events for select
to authenticated
using (
  is_private = false
  or exists (
    select 1
    from event_access
    where event_access.event_id = events.id
      and event_access.user_id = auth.uid()
  )
);

drop policy if exists "users can read own access" on event_access;
create policy "users can read own access"
on event_access for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "users can create own registrations" on registrations;
create policy "users can create own registrations"
on registrations for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from events
    where events.id = registrations.event_id
      and (
        events.is_private = false
        or exists (
          select 1
          from event_access
          where event_access.event_id = registrations.event_id
            and event_access.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "users can read own registrations" on registrations;
create policy "users can read own registrations"
on registrations for select
to authenticated
using (user_id = auth.uid());
