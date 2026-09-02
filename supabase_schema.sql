-- GradeFlow initial schema
-- Run once in the Supabase SQL Editor of a fresh project.

-- Profiles: 1:1 extension of auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text not null,
  avatar_url text not null default '',
  academic_year text not null default '',
  semester text not null default '',
  target_gpa numeric not null default 3.5,
  grading_scale text not null default '4.0',
  theme text not null default 'default',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Modules
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  code text not null,
  colour text not null,
  academic_period text not null default '',
  module_weight numeric not null default 1.0,
  credit_hours numeric not null default 3,
  instructor text,
  room text,
  target_grade numeric,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.modules enable row level security;
create policy "modules_all_own" on public.modules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Assessments
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  name text not null,
  assessment_type text not null,
  score numeric not null,
  total_score numeric not null,
  percentage numeric not null,
  weighting numeric,
  assessment_date text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.assessments enable row level security;
create policy "assessments_all_own" on public.assessments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  title text not null,
  event_type text not null,
  start_at timestamptz,
  due_at timestamptz not null,
  priority text not null default 'medium',
  is_completed boolean not null default false,
  location text,
  notes text,
  reminder_minutes numeric,
  external_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "events_all_own" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Study sessions
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  session_type text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds numeric not null default 0,
  status text not null default 'completed',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.study_sessions enable row level security;
create policy "study_sessions_all_own" on public.study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Study goals
create table public.study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_target_hours numeric not null default 10,
  daily_target_minutes numeric not null default 60,
  active boolean not null default true
);
alter table public.study_goals enable row level security;
create policy "study_goals_all_own" on public.study_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
