
-- Actualizar tabla nylas_connections para Nylas v3
ALTER TABLE public.nylas_connections 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token,
DROP COLUMN IF EXISTS expires_at;

-- Añadir columnas específicas de Nylas v3
ALTER TABLE public.nylas_connections 
ADD COLUMN IF NOT EXISTS application_id TEXT,
ADD COLUMN IF NOT EXISTS account_id TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT '{}';

-- Actualizar índices
DROP INDEX IF EXISTS idx_nylas_connections_user_org;
CREATE INDEX idx_nylas_connections_user_org ON public.nylas_connections(user_id, org_id);
CREATE INDEX idx_nylas_connections_grant_id ON public.nylas_connections(grant_id);

-- Añadir comentarios para documentación
COMMENT ON TABLE public.nylas_connections IS 'Conexiones de Nylas v3 usando el modelo de grants';
COMMENT ON COLUMN public.nylas_connections.grant_id IS 'ID del grant de Nylas v3';
COMMENT ON COLUMN public.nylas_connections.application_id IS 'ID de la aplicación de Nylas';
COMMENT ON COLUMN public.nylas_connections.account_id IS 'ID de la cuenta conectada en Nylas';
COMMENT ON COLUMN public.nylas_connections.scopes IS 'Permisos otorgados al grant';
