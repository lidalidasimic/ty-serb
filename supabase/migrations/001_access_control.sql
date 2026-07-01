create type public.access_status as enum ('pending', 'approved', 'rejected', 'revoked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  contact text,
  access_status public.access_status not null default 'pending',
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact text,
  status public.access_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  lesson_slug text,
  action_type text not null,
  created_at timestamptz not null default now()
);

create index profiles_access_status_idx on public.profiles(access_status);
create index activity_events_user_id_idx on public.activity_events(user_id);
create index activity_events_lesson_slug_idx on public.activity_events(lesson_slug);
create index activity_events_created_at_idx on public.activity_events(created_at desc);

alter table public.profiles enable row level security;
alter table public.access_requests enable row level security;
alter table public.activity_events enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can request own access"
  on public.access_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can read own access requests"
  on public.access_requests for select
  using (auth.uid() = user_id);

create policy "Users can read own activity"
  on public.activity_events for select
  using (auth.uid() = user_id);

insert into public.profiles (id, email, access_status, created_at)
select id, email, 'revoked', created_at
from auth.users
on conflict (id) do nothing;

update public.profiles
set access_status = 'revoked'
where access_status = 'approved';
