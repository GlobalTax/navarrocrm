-- Crear tabla para historial de sincronización con Quantum
CREATE TABLE IF NOT EXISTS public.quantum_sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status character varying NOT NULL CHECK (status IN ('success', 'error', 'in_progress')),
  message text,
  records_processed integer DEFAULT 0,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_quantum_sync_history_status ON public.quantum_sync_history(status);
CREATE INDEX idx_quantum_sync_history_created_at ON public.quantum_sync_history(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;

-- Política de acceso: solo usuarios autenticados pueden leer
CREATE POLICY "Authenticated users can view quantum sync history" 
ON public.quantum_sync_history 
FOR SELECT 
TO authenticated 
USING (true);

-- Política de inserción: solo el sistema puede insertar registros
CREATE POLICY "System can insert quantum sync history" 
ON public.quantum_sync_history 
FOR INSERT 
TO service_role 
WITH CHECK (true);