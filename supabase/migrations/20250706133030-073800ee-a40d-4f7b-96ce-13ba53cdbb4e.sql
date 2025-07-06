-- Crear tablas para el sistema de emails

-- Tabla para almacenar threads de emails
CREATE TABLE public.email_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  subject TEXT NOT NULL,
  participants TEXT[] NOT NULL DEFAULT '{}',
  last_message_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER NOT NULL DEFAULT 0,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para almacenar mensajes de email individuales
CREATE TABLE public.email_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.email_threads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  outlook_id TEXT UNIQUE,
  message_type TEXT NOT NULL CHECK (message_type IN ('received', 'sent', 'draft')),
  from_address TEXT,
  to_addresses TEXT[] NOT NULL DEFAULT '{}',
  cc_addresses TEXT[] NOT NULL DEFAULT '{}',
  bcc_addresses TEXT[] NOT NULL DEFAULT '{}',
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  importance TEXT DEFAULT 'normal' CHECK (importance IN ('low', 'normal', 'high')),
  sent_datetime TIMESTAMP WITH TIME ZONE,
  received_datetime TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para almacenar tokens de Outlook por usuario
CREATE TABLE public.user_outlook_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL DEFAULT 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Tabla para log de sincronización de emails
CREATE TABLE public.email_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'running', 'completed', 'failed')),
  messages_synced INTEGER DEFAULT 0,
  sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  sync_data JSONB DEFAULT '{}'
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_outlook_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_threads
CREATE POLICY "Users can view their org email threads" 
ON public.email_threads FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create email threads in their org" 
ON public.email_threads FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update their org email threads" 
ON public.email_threads FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete their org email threads" 
ON public.email_threads FOR DELETE 
USING (org_id = get_user_org_id());

-- Políticas RLS para email_messages
CREATE POLICY "Users can view their org email messages" 
ON public.email_messages FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create email messages in their org" 
ON public.email_messages FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update their org email messages" 
ON public.email_messages FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete their org email messages" 
ON public.email_messages FOR DELETE 
USING (org_id = get_user_org_id());

-- Políticas RLS para user_outlook_tokens
CREATE POLICY "Users can view their own outlook tokens" 
ON public.user_outlook_tokens FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own outlook tokens" 
ON public.user_outlook_tokens FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own outlook tokens" 
ON public.user_outlook_tokens FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own outlook tokens" 
ON public.user_outlook_tokens FOR DELETE 
USING (user_id = auth.uid());

-- Políticas RLS para email_sync_log
CREATE POLICY "Users can view their org sync logs" 
ON public.email_sync_log FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create sync logs in their org" 
ON public.email_sync_log FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own sync logs" 
ON public.email_sync_log FOR UPDATE 
USING (user_id = auth.uid());

-- Índices para mejorar rendimiento
CREATE INDEX idx_email_threads_org_id ON public.email_threads(org_id);
CREATE INDEX idx_email_threads_last_message ON public.email_threads(last_message_at DESC);

CREATE INDEX idx_email_messages_org_id ON public.email_messages(org_id);
CREATE INDEX idx_email_messages_thread_id ON public.email_messages(thread_id);
CREATE INDEX idx_email_messages_outlook_id ON public.email_messages(outlook_id);
CREATE INDEX idx_email_messages_type ON public.email_messages(message_type);
CREATE INDEX idx_email_messages_received ON public.email_messages(received_datetime DESC);

CREATE INDEX idx_user_outlook_tokens_user_org ON public.user_outlook_tokens(user_id, org_id);
CREATE INDEX idx_user_outlook_tokens_active ON public.user_outlook_tokens(is_active);

CREATE INDEX idx_email_sync_log_user_org ON public.email_sync_log(user_id, org_id);
CREATE INDEX idx_email_sync_log_status ON public.email_sync_log(sync_status);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_threads_updated_at
    BEFORE UPDATE ON public.email_threads
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_messages_updated_at
    BEFORE UPDATE ON public.email_messages
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_user_outlook_tokens_updated_at
    BEFORE UPDATE ON public.user_outlook_tokens
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();