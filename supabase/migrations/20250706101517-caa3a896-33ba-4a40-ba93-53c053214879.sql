-- Fase 1: Estructura de datos para sincronización de correo electrónico

-- 1. Tabla para almacenar mensajes de email individuales
CREATE TABLE public.email_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  thread_id UUID REFERENCES public.email_threads(id) ON DELETE CASCADE,
  outlook_id VARCHAR(255) UNIQUE,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  from_address VARCHAR(255),
  to_addresses TEXT[],
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  sent_datetime TIMESTAMP WITH TIME ZONE,
  received_datetime TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  message_type VARCHAR(20) DEFAULT 'received' CHECK (message_type IN ('sent', 'received', 'draft')),
  sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabla para adjuntos de email
CREATE TABLE public.email_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
  outlook_id VARCHAR(255),
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  file_size INTEGER,
  file_path TEXT,
  is_downloaded BOOLEAN DEFAULT false,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tabla para carpetas de Outlook
CREATE TABLE public.email_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  outlook_id VARCHAR(255) UNIQUE,
  folder_name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES public.email_folders(id) ON DELETE CASCADE,
  folder_type VARCHAR(20) DEFAULT 'custom' CHECK (folder_type IN ('inbox', 'sent', 'drafts', 'deleted', 'custom')),
  message_count INTEGER DEFAULT 0,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Tabla para estado de sincronización
CREATE TABLE public.email_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.email_folders(id) ON DELETE CASCADE,
  last_sync_datetime TIMESTAMP WITH TIME ZONE,
  next_sync_datetime TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(20) DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'completed')),
  total_messages INTEGER DEFAULT 0,
  synced_messages INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id, folder_id)
);

-- 5. Tabla para reglas de automatización de email
CREATE TABLE public.email_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Tabla para firmas de email
CREATE TABLE public.email_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  signature_name VARCHAR(255) NOT NULL,
  html_content TEXT,
  is_default BOOLEAN DEFAULT false,
  use_for_replies BOOLEAN DEFAULT true,
  use_for_new_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Ampliar tabla email_threads existente
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.email_folders(id);
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS latest_message_id UUID REFERENCES public.email_messages(id);
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS auto_assigned_client_id UUID;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Índices para optimizar rendimiento
CREATE INDEX idx_email_messages_org_thread ON public.email_messages(org_id, thread_id);
CREATE INDEX idx_email_messages_outlook_id ON public.email_messages(outlook_id) WHERE outlook_id IS NOT NULL;
CREATE INDEX idx_email_messages_received_datetime ON public.email_messages(received_datetime);
CREATE INDEX idx_email_messages_sync_status ON public.email_messages(sync_status) WHERE sync_status != 'synced';

CREATE INDEX idx_email_attachments_message ON public.email_attachments(message_id);
CREATE INDEX idx_email_folders_user ON public.email_folders(org_id, user_id);
CREATE INDEX idx_email_sync_status_user_folder ON public.email_sync_status(user_id, folder_id);
CREATE INDEX idx_email_rules_active ON public.email_rules(org_id, is_active) WHERE is_active = true;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_messages
CREATE POLICY "Users can view emails from their org" ON public.email_messages
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert emails in their org" ON public.email_messages
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update emails in their org" ON public.email_messages
  FOR UPDATE USING (org_id = get_user_org_id());

-- Políticas RLS para email_attachments
CREATE POLICY "Users can view attachments from their org" ON public.email_attachments
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert attachments in their org" ON public.email_attachments
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update attachments in their org" ON public.email_attachments
  FOR UPDATE USING (org_id = get_user_org_id());

-- Políticas RLS para email_folders
CREATE POLICY "Users can view their own folders" ON public.email_folders
  FOR SELECT USING (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can create their own folders" ON public.email_folders
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own folders" ON public.email_folders
  FOR UPDATE USING (org_id = get_user_org_id() AND user_id = auth.uid());

-- Políticas RLS para email_sync_status
CREATE POLICY "Users can view their own sync status" ON public.email_sync_status
  FOR SELECT USING (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "System can manage sync status" ON public.email_sync_status
  FOR ALL USING (org_id = get_user_org_id());

-- Políticas RLS para email_rules
CREATE POLICY "Users can manage their own email rules" ON public.email_rules
  FOR ALL USING (org_id = get_user_org_id() AND user_id = auth.uid());

-- Políticas RLS para email_signatures
CREATE POLICY "Users can manage their own signatures" ON public.email_signatures
  FOR ALL USING (org_id = get_user_org_id() AND user_id = auth.uid());

-- Triggers para updated_at
CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_attachments_updated_at
  BEFORE UPDATE ON public.email_attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_folders_updated_at
  BEFORE UPDATE ON public.email_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_sync_status_updated_at
  BEFORE UPDATE ON public.email_sync_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_rules_updated_at
  BEFORE UPDATE ON public.email_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_signatures_updated_at
  BEFORE UPDATE ON public.email_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();