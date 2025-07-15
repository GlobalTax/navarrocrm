-- Arreglar permisos RLS para quantum_sync_history
-- Permitir INSERT desde usuarios autenticados del sistema

-- Crear política para permitir INSERT desde usuarios autenticados
CREATE POLICY "Authenticated users can insert quantum sync history" 
ON public.quantum_sync_history 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política para permitir UPDATE desde usuarios autenticados
CREATE POLICY "Authenticated users can update quantum sync history" 
ON public.quantum_sync_history 
FOR UPDATE 
TO authenticated 
USING (true);

-- Asegurar que la tabla tenga RLS habilitado
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;