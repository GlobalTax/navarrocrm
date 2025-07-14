-- Crear tabla para historial de sincronización con Quantum
CREATE TABLE IF NOT EXISTS public.quantum_sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status character varying NOT NULL,
  message text,
  records_processed integer DEFAULT 0,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Agregar constraint para status después de crear la tabla
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quantum_sync_history_status_check') THEN
    ALTER TABLE public.quantum_sync_history 
    ADD CONSTRAINT quantum_sync_history_status_check 
    CHECK (status IN ('success', 'error', 'in_progress'));
  END IF;
END $$;