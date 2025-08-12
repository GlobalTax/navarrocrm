-- Make cron unschedule idempotent, then schedule job
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'invoke-deed-reminders-daily-08') then
    perform cron.unschedule('invoke-deed-reminders-daily-08');
  end if;
end$$;

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