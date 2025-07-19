-- Crear tablas para integración con Nylas
CREATE TABLE public.nylas_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  grant_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  email_address TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gmail',
  status TEXT NOT NULL DEFAULT 'connected',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para tracking de sincronización
CREATE TABLE public.nylas_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  messages_synced INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_nylas_connections_user_org ON public.nylas_connections(user_id, org_id);
CREATE INDEX idx_nylas_sync_status_user_org ON public.nylas_sync_status(user_id, org_id);

-- Habilitar RLS
ALTER TABLE public.nylas_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nylas_sync_status ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para nylas_connections
CREATE POLICY "Users can view their own Nylas connections" 
ON public.nylas_connections 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own Nylas connections" 
ON public.nylas_connections 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own Nylas connections" 
ON public.nylas_connections 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own Nylas connections" 
ON public.nylas_connections 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Políticas RLS para nylas_sync_status
CREATE POLICY "Users can view their own Nylas sync status" 
ON public.nylas_sync_status 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can upsert their own Nylas sync status" 
ON public.nylas_sync_status 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own Nylas sync status" 
ON public.nylas_sync_status 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Triggers para updated_at
CREATE TRIGGER update_nylas_connections_updated_at
  BEFORE UPDATE ON public.nylas_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nylas_sync_status_updated_at
  BEFORE UPDATE ON public.nylas_sync_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Agregar columna sync_source a email_messages si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'email_messages' 
                 AND column_name = 'sync_source') THEN
    ALTER TABLE public.email_messages 
    ADD COLUMN sync_source TEXT DEFAULT 'outlook';
  END IF;
END $$;