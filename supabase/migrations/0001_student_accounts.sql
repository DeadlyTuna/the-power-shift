-- Student accounts for The Power Shift courses.
-- Run once in the Supabase SQL editor (or with `supabase db push`).
--
-- Auth (email + password) is Supabase Auth. These tables hold the student's
-- profile, which courses they can access, and which lessons they've finished.
-- Row Level Security lets students read only their own rows. Course access
-- (enrollments) can ONLY be written by the website's server with the service
-- role key, after a verified payment, so nobody can grant themselves a course
-- from the browser.

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Students read their own profile"
  on public.profiles for select using (auth.uid() = id);

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

create policy "Students read their own enrollments"
  on public.enrollments for select using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role (server) writes here.

-- ---------- Lesson progress ----------
create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Students read their own progress"
  on public.lesson_progress for select using (auth.uid() = user_id);

create policy "Students mark lessons in courses they own"
  on public.lesson_progress for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_slug = lesson_progress.course_slug
    )
  );

create policy "Students unmark their own lessons"
  on public.lesson_progress for delete using (auth.uid() = user_id);
