-- Corregir nombres de columnas en user_outlook_tokens para coincidir con el código
ALTER TABLE public.user_outlook_tokens 
RENAME COLUMN access_token TO access_token_encrypted;

ALTER TABLE public.user_outlook_tokens 
RENAME COLUMN refresh_token TO refresh_token_encrypted;

-- Agregar columnas faltantes que el código espera
ALTER TABLE public.user_outlook_tokens 
ADD COLUMN IF NOT EXISTS scope_permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS outlook_email VARCHAR,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Remover la columna scope que no se usa
ALTER TABLE public.user_outlook_tokens 
DROP COLUMN IF EXISTS scope;