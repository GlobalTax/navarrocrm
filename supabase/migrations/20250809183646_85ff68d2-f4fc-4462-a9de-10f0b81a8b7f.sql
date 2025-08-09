-- Create quantum_invoice_sync_history table if not exists
CREATE TABLE IF NOT EXISTS public.quantum_invoice_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  sync_status TEXT NOT NULL, -- 'success' | 'error' | 'partial'
  sync_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'cron'
  start_date DATE NULL,
  end_date DATE NULL,
  invoices_processed INTEGER NOT NULL DEFAULT 0,
  invoices_created INTEGER NOT NULL DEFAULT 0,
  invoices_updated INTEGER NOT NULL DEFAULT 0,
  error_details JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quantum_invoice_sync_history ENABLE ROW LEVEL SECURITY;

-- Policies: org-based access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quantum_invoice_sync_history' AND policyname = 'Users can view their org quantum invoice sync history'
  ) THEN
    CREATE POLICY "Users can view their org quantum invoice sync history"
    ON public.quantum_invoice_sync_history
    FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quantum_invoice_sync_history' AND policyname = 'Users can insert their org quantum invoice sync history'
  ) THEN
    CREATE POLICY "Users can insert their org quantum invoice sync history"
    ON public.quantum_invoice_sync_history
    FOR INSERT
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;
END$$;

-- Indexes for history
CREATE INDEX IF NOT EXISTS idx_qinv_hist_org_created_at ON public.quantum_invoice_sync_history (org_id, created_at DESC);

-- Ensure indexes on quantum_invoices
CREATE INDEX IF NOT EXISTS idx_quantum_invoices_org_invoice ON public.quantum_invoices (org_id, quantum_invoice_id);
CREATE INDEX IF NOT EXISTS idx_quantum_invoices_org_customer ON public.quantum_invoices (org_id, quantum_customer_id);

-- Schedule daily cron to invoke sync-quantum-invoices for the last 7 days
-- Requires pg_cron and pg_net extensions (already used in project)
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
      $$
      SELECT net.http_post(
        url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/sync-quantum-invoices',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
        ),
        body := '{"periodDays":7}'::jsonb
      )
      $$
    );
  END IF;
END$$;