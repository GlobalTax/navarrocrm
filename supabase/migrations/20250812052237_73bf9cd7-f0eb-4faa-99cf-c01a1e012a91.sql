-- Resilient migration: fix columns, policies, indexes, and cron
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.deed_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  deed_id uuid not null,
  reminder_type text not null,
  days_before integer not null
);

-- Ensure required columns exist with proper defaults
alter table public.deed_reminder_logs add column if not exists org_id uuid;
alter table public.deed_reminder_logs add column if not exists deed_id uuid;
alter table public.deed_reminder_logs add column if not exists reminder_type text;
alter table public.deed_reminder_logs add column if not exists days_before integer;
alter table public.deed_reminder_logs add column if not exists created_at timestamptz not null default now();

alter table public.deed_reminder_logs enable row level security;

-- Policies (drop/recreate)
drop policy if exists "Org members can view their deed reminder logs" on public.deed_reminder_logs;
create policy "Org members can view their deed reminder logs"
  on public.deed_reminder_logs
  for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.org_id = deed_reminder_logs.org_id
  ));

drop policy if exists "Org members can insert deed reminder logs" on public.deed_reminder_logs;
create policy "Org members can insert deed reminder logs"
  on public.deed_reminder_logs
  for insert
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.org_id = deed_reminder_logs.org_id
  ));

drop policy if exists "Org members can update their deed reminder logs" on public.deed_reminder_logs;
create policy "Org members can update their deed reminder logs"
  on public.deed_reminder_logs
  for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.org_id = deed_reminder_logs.org_id
  ))
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.org_id = deed_reminder_logs.org_id
  ));

-- Enforce uniqueness via unique index
create unique index if not exists uniq_deed_reminder_logs
  on public.deed_reminder_logs(org_id, deed_id, reminder_type, days_before);

-- Helpful index (after ensuring column exists)
create index if not exists idx_deed_reminder_logs_created_at on public.deed_reminder_logs(created_at desc);

-- Reschedule daily job at 08:00 UTC
select cron.unschedule('invoke-deed-reminders-daily-08');
select
  cron.schedule(
    'invoke-deed-reminders-daily-08',
    '0 8 * * *',
    $$
    select net.http_post(
      url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/deed-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
      body := '{"dryRun": false}'::jsonb
    );
    $$
  );