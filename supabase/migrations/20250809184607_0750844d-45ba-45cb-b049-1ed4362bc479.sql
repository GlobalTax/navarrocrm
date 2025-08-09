-- Create table for detailed invoice sync history
CREATE TABLE IF NOT EXISTS public.quantum_invoice_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  sync_status TEXT NOT NULL, -- in_progress | success | error | partial
  sync_type TEXT NOT NULL DEFAULT 'manual', -- manual | cron
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

-- Policies per org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quantum_invoice_sync_history' AND policyname='Users view their org invoice sync history'
  ) THEN
    CREATE POLICY "Users view their org invoice sync history"
      ON public.quantum_invoice_sync_history
      FOR SELECT
      USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quantum_invoice_sync_history' AND policyname='Users insert their org invoice sync history'
  ) THEN
    CREATE POLICY "Users insert their org invoice sync history"
      ON public.quantum_invoice_sync_history
      FOR INSERT
      WITH CHECK (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quantum_invoice_sync_history' AND policyname='Users update their org invoice sync history'
  ) THEN
    CREATE POLICY "Users update their org invoice sync history"
      ON public.quantum_invoice_sync_history
      FOR UPDATE
      USING (org_id = public.get_user_org_id());
  END IF;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qinv_hist_org_created_at ON public.quantum_invoice_sync_history (org_id, created_at DESC);

-- Ensure helpful indexes on invoices
CREATE INDEX IF NOT EXISTS idx_quantum_invoices_org_invoice ON public.quantum_invoices (org_id, quantum_invoice_id);
CREATE INDEX IF NOT EXISTS idx_quantum_invoices_org_customer ON public.quantum_invoices (org_id, quantum_customer_id);