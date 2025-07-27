-- Configurar cron job para expirar suscripciones diariamente
-- Primero, asegurar que las extensiones estén habilitadas
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Programar la función para ejecutarse diariamente a las 2:00 AM
SELECT cron.schedule(
  'expire-subscriptions-daily',
  '0 2 * * *', -- A las 2:00 AM todos los días
  $$
  SELECT
    net.http_post(
        url:='https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/expire-subscriptions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Verificar que el cron job se ha creado correctamente
-- SELECT * FROM cron.job;