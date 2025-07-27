-- Crear cron job para ejecutar la función de expiración de suscripciones externas diariamente a las 09:00
SELECT cron.schedule(
  'expire-outgoing-subscriptions-daily',
  '0 9 * * *', -- Ejecutar a las 09:00 UTC todos los días
  $$
  SELECT
    net.http_post(
        url:='https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/expire-outgoing-subscriptions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
        body:=jsonb_build_object('scheduled_execution', true, 'executed_at', now())
    ) as request_id;
  $$
);