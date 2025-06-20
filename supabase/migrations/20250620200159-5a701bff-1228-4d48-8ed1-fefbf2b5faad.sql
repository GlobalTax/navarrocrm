
-- Eliminar todas las políticas RLS problemáticas de las tablas que tienen RLS deshabilitado

-- Eliminar políticas de clients
DROP POLICY IF EXISTS "Users can manage clients in their organization" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in their organization" ON public.clients;

-- Eliminar políticas de cases  
DROP POLICY IF EXISTS "Users can manage cases in their organization" ON public.cases;
DROP POLICY IF EXISTS "Users can view cases in their organization" ON public.cases;

-- Eliminar políticas de time_entries
DROP POLICY IF EXISTS "Users can manage time entries in their organization" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view time entries in their organization" ON public.time_entries;

-- Confirmar que RLS está deshabilitado en estas tablas (ya debería estarlo)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;
