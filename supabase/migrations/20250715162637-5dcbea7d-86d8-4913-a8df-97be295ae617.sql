-- Añadir campos para sincronización automática de Quantum
ALTER TABLE public.contacts 
ADD COLUMN source character varying DEFAULT 'manual',
ADD COLUMN auto_imported_at timestamp with time zone,
ADD COLUMN quantum_customer_id character varying;

-- Crear índice para búsqueda eficiente por quantum_customer_id
CREATE INDEX idx_contacts_quantum_customer_id ON public.contacts(quantum_customer_id);

-- Crear tabla para notificaciones de sincronización automática
CREATE TABLE public.quantum_sync_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  sync_date timestamp with time zone NOT NULL DEFAULT now(),
  contacts_imported integer NOT NULL DEFAULT 0,
  contacts_skipped integer NOT NULL DEFAULT 0,
  status character varying NOT NULL DEFAULT 'success',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quantum_sync_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications
CREATE POLICY "Users can view their org sync notifications" 
ON public.quantum_sync_notifications 
FOR SELECT 
USING (org_id = get_user_org_id());

-- Crear función para programar sincronización automática cada 5 horas
SELECT cron.schedule(
  'quantum-auto-sync',
  '0 */5 * * *', -- Cada 5 horas
  $$
  SELECT
    net.http_post(
      url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/quantum-clients',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
      body := '{"auto_sync": true}'::jsonb
    ) as request_id;
  $$
);