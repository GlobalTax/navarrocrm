-- Add request_id to Quantum sync history tables with safe backfill
-- quantum_invoice_sync_history
ALTER TABLE IF EXISTS public.quantum_invoice_sync_history
  ADD COLUMN IF NOT EXISTS request_id uuid;

-- Backfill and enforce constraints
UPDATE public.quantum_invoice_sync_history
SET request_id = COALESCE(request_id, gen_random_uuid());

ALTER TABLE IF EXISTS public.quantum_invoice_sync_history
  ALTER COLUMN request_id SET NOT NULL,
  ALTER COLUMN request_id SET DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_qish_request_id
  ON public.quantum_invoice_sync_history(request_id);

COMMENT ON COLUMN public.quantum_invoice_sync_history.request_id IS 'Correlation ID per sync execution';

-- Optional secondary table if present: quantum_sync_history
ALTER TABLE IF EXISTS public.quantum_sync_history
  ADD COLUMN IF NOT EXISTS request_id uuid;

UPDATE public.quantum_sync_history
SET request_id = COALESCE(request_id, gen_random_uuid());

ALTER TABLE IF EXISTS public.quantum_sync_history
  ALTER COLUMN request_id SET NOT NULL,
  ALTER COLUMN request_id SET DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_qsh_request_id
  ON public.quantum_sync_history(request_id);

COMMENT ON COLUMN public.quantum_sync_history.request_id IS 'Correlation ID per sync execution';