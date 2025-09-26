-- Crear tabla para almacenar credenciales temporales de usuarios creados
CREATE TABLE IF NOT EXISTS public.user_credentials_temp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email VARCHAR NOT NULL,
  encrypted_password TEXT NOT NULL,
  created_by UUID NOT NULL,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  viewed_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.user_credentials_temp ENABLE ROW LEVEL SECURITY;

-- Política: Solo el creador puede ver las credenciales de su org
CREATE POLICY "Users can view credentials they created in their org"
ON public.user_credentials_temp
FOR SELECT
USING (org_id = get_user_org_id() AND created_by = auth.uid());

-- Política: Solo el creador puede actualizar (para el contador de vistas)
CREATE POLICY "Users can update credentials they created"
ON public.user_credentials_temp
FOR UPDATE
USING (org_id = get_user_org_id() AND created_by = auth.uid());

-- Política: Solo el sistema puede insertar
CREATE POLICY "System can insert user credentials"
ON public.user_credentials_temp
FOR INSERT
WITH CHECK (true);

-- Función para limpiar credenciales expiradas (ejecutar diariamente)
CREATE OR REPLACE FUNCTION cleanup_expired_credentials()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.user_credentials_temp 
  WHERE expires_at < now();
END;
$$;

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_user_credentials_temp_org_created_by 
ON public.user_credentials_temp(org_id, created_by);

CREATE INDEX IF NOT EXISTS idx_user_credentials_temp_expires_at 
ON public.user_credentials_temp(expires_at);