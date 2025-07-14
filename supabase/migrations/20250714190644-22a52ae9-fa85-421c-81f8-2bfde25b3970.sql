-- Crear tabla para el historial de sincronización con Quantum
CREATE TABLE public.quantum_sync_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_date timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL DEFAULT 'pending',
  message text,
  records_processed integer DEFAULT 0,
  error_details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios autenticados lean el historial
CREATE POLICY "Users can view quantum sync history" 
ON public.quantum_sync_history 
FOR SELECT 
USING (true);

-- Política para permitir que el sistema inserte registros
CREATE POLICY "System can insert quantum sync history" 
ON public.quantum_sync_history 
FOR INSERT 
WITH CHECK (true);

-- Añadir índice para mejorar rendimiento
CREATE INDEX idx_quantum_sync_history_sync_date ON public.quantum_sync_history(sync_date DESC);