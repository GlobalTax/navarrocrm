
-- Habilitar las extensiones necesarias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Crear un trabajo cron que se ejecute cada hora para enviar reportes programados
SELECT cron.schedule(
  'send-scheduled-reports',
  '0 * * * *', -- Cada hora en punto
  $$
  SELECT net.http_post(
    url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/send-scheduled-report',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
    body := '{"check_scheduled_reports": true}'::jsonb
  );
  $$
);

-- Función para procesar reportes programados que están listos para enviar
CREATE OR REPLACE FUNCTION public.process_scheduled_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  report_record RECORD;
BEGIN
  -- Buscar reportes que necesitan ser enviados
  FOR report_record IN 
    SELECT id, org_id, user_id, report_name, next_send_date, frequency
    FROM public.scheduled_reports 
    WHERE is_enabled = true 
    AND next_send_date <= now()
  LOOP
    -- Llamar a la función edge para enviar el reporte
    PERFORM net.http_post(
      url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/send-scheduled-report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
      body := json_build_object('reportId', report_record.id)::jsonb
    );
  END LOOP;
END;
$$;
