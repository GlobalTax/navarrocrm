-- Tabla de logs para evitar duplicados de recordatorios
CREATE TABLE IF NOT EXISTS public.deed_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  deed_id UUID NOT NULL,
  reminder_type VARCHAR(32) NOT NULL, -- 'modelo600' | 'asiento' | 'calificacion'
  days_before INT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  CONSTRAINT deed_reminder_type_chk CHECK (reminder_type IN ('modelo600','asiento','calificacion')),
  CONSTRAINT deed_reminder_unique UNIQUE (deed_id, reminder_type, days_before)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_deed_reminder_logs_org_deed ON public.deed_reminder_logs(org_id, deed_id);

-- RLS
ALTER TABLE public.deed_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Solo lectura para usuarios de la org; inserciones/updates las hará el service role (edge functions)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'deed_reminder_logs' AND policyname = 'Users can view deed reminder logs from their org'
  ) THEN
    CREATE POLICY "Users can view deed reminder logs from their org"
    ON public.deed_reminder_logs
    FOR SELECT
    USING (org_id = get_user_org_id());
  END IF;
END $$;

-- Programar cron diario a las 08:00 (UTC) para invocar la función deed-reminders
-- Si se desea otro horario, podemos ajustarlo luego.
SELECT
  cron.schedule(
    'deed-reminders-daily-0800',
    '0 8 * * *',
    $$
    SELECT net.http_post(
      url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/deed-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
      body := jsonb_build_object('source','cron','run_at', now())
    );
    $$
  );