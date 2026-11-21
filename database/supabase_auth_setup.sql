-- RoutineTrack: move login to Supabase Auth and lock tables down with Row Level Security.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to run again (every step is idempotent).
--
-- What it does:
--   1. Links public.users to Supabase Auth accounts through a new auth_id column.
--   2. Creates/links the public.users + student_profiles rows automatically when someone
--      signs up and confirms their email (existing rows are matched by email, so old
--      routine logs are kept).
--   3. Enables Row Level Security: students can only see and change their own data;
--      admins (users.role = 'ADMIN') can read all students and change account_status.
--   4. Adds admin_delete_student(email) for the admin console.

-- ---------------------------------------------------------------------------
-- 1. Link users to auth.users
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists auth_id uuid unique references auth.users (id) on delete set null;

-- Passwords now live in Supabase Auth, so new rows no longer need a hash.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'password_hash'
  ) then
    execute 'alter table public.users alter column password_hash drop not null';
  end if;
end $$;

-- Keep the existing administrator account an admin.
update public.users set role = 'ADMIN' where lower(email) = 'admin@usiu.ac.ke';

-- ---------------------------------------------------------------------------
-- 2. Create or link the profile when an auth account is confirmed
-- ---------------------------------------------------------------------------
-- Creates or links the public.users row for one auth account. Used by the
-- sign-up trigger, by the backfill below, and by ensure_my_profile().
create or replace function public.link_auth_user(p_auth_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id public.users.user_id%type;
  v_auth auth.users%rowtype;
  v_meta jsonb;
begin
  select * into v_auth from auth.users where id = p_auth_id;

  -- Only link once the email address is confirmed, so nobody can claim
  -- an existing student's records by signing up with their email.
  if v_auth.id is null or v_auth.email_confirmed_at is null then
    return;
  end if;

  if exists (select 1 from public.users where auth_id = v_auth.id) then
    return;
  end if;

  v_meta := coalesce(v_auth.raw_user_meta_data, '{}'::jsonb);

  -- Existing student from before Supabase Auth: link it and discard the old hash.
  update public.users
     set auth_id = v_auth.id,
         password_hash = null
   where lower(email) = lower(v_auth.email)
     and auth_id is null
  returning user_id into v_user_id;

  if v_user_id is null then
    -- Brand-new student. The role is always STUDENT; sign-up data can't make someone an admin.
    insert into public.users (auth_id, full_name, student_id, email, role, account_status)
    values (
      v_auth.id,
      coalesce(nullif(trim(v_meta ->> 'full_name'), ''), split_part(v_auth.email, '@', 1)),
      nullif(trim(v_meta ->> 'student_id'), ''),
      lower(v_auth.email),
      'STUDENT',
      'Active'
    )
    returning user_id into v_user_id;

    insert into public.student_profiles (user_id, degree_program, academic_year, target_sleep_hours)
    values (
      v_user_id,
      coalesce(nullif(v_meta ->> 'degree_program', ''), 'Software Engineering'),
      4,
      8.0
    );
  end if;
end;
$$;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.link_auth_user(new.id);
  return new;
end;
$$;

-- Lets a signed-in user repair a missing link for their own account only.
create or replace function public.ensure_my_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;
  perform public.link_auth_user(auth.uid());
end;
$$;

revoke all on function public.link_auth_user(uuid) from public, anon, authenticated;
revoke all on function public.ensure_my_profile() from public, anon;
grant execute on function public.ensure_my_profile() to authenticated;

-- Backfill: link logins that were created before this script was run.
select public.link_auth_user(id) from auth.users where email_confirmed_at is not null;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user();

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where auth_id = auth.uid()
      and upper(role) = 'ADMIN'
      and account_status = 'Active'
  );
$$;

alter table public.users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.daily_routine_logs enable row level security;

-- Remove any old (possibly wide-open) policies on these tables.
do $$
declare
  p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('users', 'student_profiles', 'daily_routine_logs')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- Signed-out visitors get nothing.
revoke all on public.users, public.student_profiles, public.daily_routine_logs from anon;

-- users: read your own row; admins read everyone. Only admins may update, and only account_status.
revoke insert, update, delete on public.users from authenticated;
grant update (account_status) on public.users to authenticated;

create policy "users: read own row" on public.users
  for select to authenticated
  using (auth_id = auth.uid() or public.is_admin());

create policy "users: admins update status" on public.users
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- student_profiles: read your own; admins read all.
create policy "profiles: read own" on public.student_profiles
  for select to authenticated
  using (
    public.is_admin()
    or user_id in (select u.user_id from public.users u where u.auth_id = auth.uid())
  );

-- daily_routine_logs: active students manage their own logs; admins can read all.
create policy "logs: read own" on public.daily_routine_logs
  for select to authenticated
  using (
    public.is_admin()
    or user_id in (select u.user_id from public.users u
                   where u.auth_id = auth.uid() and u.account_status = 'Active')
  );

create policy "logs: insert own" on public.daily_routine_logs
  for insert to authenticated
  with check (
    user_id in (select u.user_id from public.users u
                where u.auth_id = auth.uid() and u.account_status = 'Active')
  );

create policy "logs: update own" on public.daily_routine_logs
  for update to authenticated
  using (
    user_id in (select u.user_id from public.users u
                where u.auth_id = auth.uid() and u.account_status = 'Active')
  )
  with check (
    user_id in (select u.user_id from public.users u
                where u.auth_id = auth.uid() and u.account_status = 'Active')
  );

create policy "logs: delete own" on public.daily_routine_logs
  for delete to authenticated
  using (
    user_id in (select u.user_id from public.users u
                where u.auth_id = auth.uid() and u.account_status = 'Active')
  );

-- ---------------------------------------------------------------------------
-- 4. Admin: delete a student completely (logs, profile, user row, login account)
-- ---------------------------------------------------------------------------
create or replace function public.admin_delete_student(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id public.users.user_id%type;
  v_auth_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can delete accounts.';
  end if;

  select user_id, auth_id into v_user_id, v_auth_id
  from public.users
  where lower(email) = lower(target_email)
    and upper(role) <> 'ADMIN';

  if v_user_id is null then
    raise exception 'No student account found for %.', target_email;
  end if;

  delete from public.daily_routine_logs where user_id = v_user_id;
  delete from public.student_profiles where user_id = v_user_id;
  delete from public.users where user_id = v_user_id;

  if v_auth_id is not null then
    delete from auth.users where id = v_auth_id;
  end if;
end;
$$;

revoke all on function public.admin_delete_student(text) from public, anon;
grant execute on function public.admin_delete_student(text) to authenticated;
