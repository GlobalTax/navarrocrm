-- Agregar índices para la tabla quantum_sync_history
CREATE INDEX IF NOT EXISTS idx_quantum_sync_history_status ON public.quantum_sync_history(status);
CREATE INDEX IF NOT EXISTS idx_quantum_sync_history_created_at ON public.quantum_sync_history(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
DROP POLICY IF EXISTS "Authenticated users can view quantum sync history" ON public.quantum_sync_history;
DROP POLICY IF EXISTS "System can insert quantum sync history" ON public.quantum_sync_history;

CREATE POLICY "Authenticated users can view quantum sync history" 
ON public.quantum_sync_history 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "System can insert quantum sync history" 
ON public.quantum_sync_history 
FOR INSERT 
TO service_role 
WITH CHECK (true);