-- Agregar índices usando el nombre correcto de columna
CREATE INDEX IF NOT EXISTS idx_quantum_sync_history_status ON public.quantum_sync_history(status);
CREATE INDEX IF NOT EXISTS idx_quantum_sync_history_sync_date ON public.quantum_sync_history(sync_date DESC);

-- Habilitar RLS si no está habilitado
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'quantum_sync_history' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Crear políticas RLS solo si no existen
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quantum_sync_history' 
    AND policyname = 'Authenticated users can view quantum sync history'
  ) THEN
    CREATE POLICY "Authenticated users can view quantum sync history" 
    ON public.quantum_sync_history 
    FOR SELECT 
    TO authenticated 
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quantum_sync_history' 
    AND policyname = 'System can insert quantum sync history'
  ) THEN
    CREATE POLICY "System can insert quantum sync history" 
    ON public.quantum_sync_history 
    FOR INSERT 
    TO service_role 
    WITH CHECK (true);
  END IF;
END $$;