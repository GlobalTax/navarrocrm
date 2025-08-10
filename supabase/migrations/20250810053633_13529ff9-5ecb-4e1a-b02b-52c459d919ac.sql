-- Programar ejecución diaria de la edge function generate-recurring-tasks
-- Requiere pg_cron y pg_net habilitados en el proyecto

-- Desprogramar si existía un job previo con el mismo nombre
select cron.unschedule('generate-recurring-tasks-daily')
where exists (
  select 1 from cron.job where jobname = 'generate-recurring-tasks-daily'
);

-- Programar a las 02:15 UTC cada día
select cron.schedule(
  'generate-recurring-tasks-daily',
  '15 2 * * *',
  $$
  select net.http_post(
    url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/generate-recurring-tasks',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
    body := '{"period":"current"}'::jsonb
  );
  $$
);
