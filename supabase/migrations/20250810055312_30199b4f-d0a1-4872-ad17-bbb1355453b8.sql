-- Notifications and SLA migration for recurring tasks notifications and SLA configs

-- 1) Create notifications_log table (idempotent)
create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  contract_id uuid null,
  task_id uuid not null,
  recipient_user_id uuid not null,
  notification_stage text not null check (notification_stage in ('5d','1d','0d')),
  status text not null check (status in ('sent','skipped','error')),
  error_message text,
  sent_at timestamptz not null default now()
);

-- Uniqueness to avoid duplicate notifications per task/recipient/stage
create unique index if not exists uq_notifications_unique 
  on public.notifications_log (task_id, recipient_user_id, notification_stage);

-- Enable RLS and basic policies
alter table public.notifications_log enable row level security;

-- View own org notifications
create policy if not exists "Users can view org notifications"
  on public.notifications_log
  for select
  using (org_id = get_user_org_id());

-- Allow system inserts (edge functions with service role bypass RLS, but keep for safety)
create policy if not exists "System can insert notifications logs"
  on public.notifications_log
  for insert
  with check (true);

-- 2) Add SLA configuration to recurring_service_contracts
alter table public.recurring_service_contracts
  add column if not exists sla_config jsonb not null default '{"accounting":8,"tax":6,"labor":4}';

comment on column public.recurring_service_contracts.sla_config is 'SLA target hours by service: {accounting, tax, labor}';

-- 3) Helpful indexes for notification scans
create index if not exists idx_tasks_due_date on public.tasks (due_date);
create index if not exists idx_task_assignments_task_id on public.task_assignments (task_id);

-- 4) Schedule daily notifier (idempotent)
-- Run every day at 06:00 UTC
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'notify-recurring-tasks-daily'
  ) THEN
    PERFORM cron.schedule(
      'notify-recurring-tasks-daily',
      '0 6 * * *',
      $$
      select net.http_post(
        url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/notify-recurring-tasks',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
        body := '{}'::jsonb
      );
      $$
    );
  END IF;
END$$;