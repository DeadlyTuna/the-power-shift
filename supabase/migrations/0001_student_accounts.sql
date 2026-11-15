-- Student accounts for The Power Shift courses.
-- Run in the Supabase SQL editor (or with `supabase db push`).
-- Safe to run more than once: every step checks before creating.
--
-- Auth (email + password) is Supabase Auth. These tables hold the student's
-- profile, which courses they can access, and which lessons they've finished.
-- Row Level Security lets students read only their own rows. Course access
-- (enrollments) can ONLY be written by the website's server with the service
-- role key, after a verified payment, so nobody can grant themselves a course
-- from the browser.

-- ---------- Guard: only for an EMPTY project ----------
-- This script creates its own profiles/enrollments/progress tables and a sign-up trigger.
-- It must never run on a project that already has a course platform (courses, purchases,
-- lesson_progress, profiles with roles…): that project's own schema should be used instead.
do $$
begin
  if to_regclass('public.courses') is not null or to_regclass('public.purchases') is not null then
    raise exception 'This Supabase project already has a course platform (public.courses / public.purchases). Do not run this script here; the website should use that existing schema instead.';
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    raise exception 'public.profiles already exists with roles. Do not run this script here: its profile policies would let users edit their own role.';
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'lesson_progress')
     and not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and table_name = 'lesson_progress' and column_name = 'course_slug') then
    raise exception 'public.lesson_progress already exists with different columns. Rename or drop it, then run this script again.';
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'enrollments')
     and not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and table_name = 'enrollments' and column_name = 'course_slug') then
    raise exception 'public.enrollments already exists with different columns. Rename or drop it, then run this script again.';
  end if;
end
$$;

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Students read their own profile" on public.profiles;
create policy "Students read their own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Students update their own profile" on public.profiles;
create policy "Students update their own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create the profile from the sign-up form's metadata.
create or replace function public.handle_new_student()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_student();

-- ---------- Enrollments (course access) ----------
create table if not exists public.enrollments (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null,
  reference text not null,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);

alter table public.enrollments enable row level security;

drop policy if exists "Students read their own enrollments" on public.enrollments;
create policy "Students read their own enrollments"
  on public.enrollments for select using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role (server) writes here.

-- Is the signed-in student enrolled in this course? Used by the progress policy below.
-- security definer so it can read enrollments regardless of the caller's policies;
-- it only ever answers for auth.uid(), so it can't reveal anyone else's data.
create or replace function public.is_enrolled(course text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments e
    where e.user_id = auth.uid() and e.course_slug = course
  );
$$;

revoke all on function public.is_enrolled(text) from public;
grant execute on function public.is_enrolled(text) to authenticated;

-- ---------- Lesson progress ----------
create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_id)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Students read their own progress" on public.lesson_progress;
create policy "Students read their own progress"
  on public.lesson_progress for select using (auth.uid() = user_id);

drop policy if exists "Students mark lessons in courses they own" on public.lesson_progress;
create policy "Students mark lessons in courses they own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id and public.is_enrolled(course_slug));

-- Re-marking a finished lesson is an upsert, which also needs an update policy.
drop policy if exists "Students update their own lessons" on public.lesson_progress;
create policy "Students update their own lessons"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and public.is_enrolled(course_slug));

drop policy if exists "Students unmark their own lessons" on public.lesson_progress;
create policy "Students unmark their own lessons"
  on public.lesson_progress for delete using (auth.uid() = user_id);
