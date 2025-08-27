-- Optimización del profile enrichment
-- Crear índice para mejorar la consulta de usuarios por ID si no existe
CREATE INDEX IF NOT EXISTS idx_users_id_org_role ON public.users (id, org_id, role);

-- Crear índice para mejorar las consultas por org_id si no existe  
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users (org_id) WHERE org_id IS NOT NULL;