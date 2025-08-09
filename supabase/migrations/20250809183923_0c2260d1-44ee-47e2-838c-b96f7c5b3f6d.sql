DO $$
DECLARE
  job_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'sync-quantum-invoices-daily'
  ) INTO job_exists;

  IF NOT job_exists THEN
    PERFORM cron.schedule(
      'sync-quantum-invoices-daily',
      '0 5 * * *',  -- daily at 05:00 UTC
      $cron$
      select
        net.http_post(
          url:='https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/sync-quantum-invoices',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.anon_key', true) || '"}'::jsonb,
          body:='{"periodDays":7}'::jsonb
        ) as request_id;
      $cron$
    );
  END IF;
END$$;