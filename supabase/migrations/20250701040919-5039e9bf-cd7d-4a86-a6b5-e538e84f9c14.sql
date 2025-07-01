
-- Crear tabla de configuración de WhatsApp
CREATE TABLE public.whatsapp_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number VARCHAR NOT NULL,
  business_account_id VARCHAR NOT NULL,
  access_token TEXT NOT NULL,
  webhook_verify_token VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  auto_reminders BOOLEAN NOT NULL DEFAULT true,
  appointment_confirms BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Crear tabla de mensajes de WhatsApp
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  phone_number VARCHAR NOT NULL,
  message_type VARCHAR NOT NULL CHECK (message_type IN ('text', 'template', 'media')),
  content TEXT NOT NULL,
  template_name VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Crear índices por separado (sintaxis correcta para PostgreSQL)
CREATE INDEX idx_whatsapp_messages_org_created ON public.whatsapp_messages(org_id, created_at);
CREATE INDEX idx_whatsapp_messages_contact ON public.whatsapp_messages(contact_id);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);

-- Habilitar RLS en las tablas
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whatsapp_config
CREATE POLICY "Users can view their org WhatsApp config" 
  ON public.whatsapp_config 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can insert their org WhatsApp config" 
  ON public.whatsapp_config 
  FOR INSERT 
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can update their org WhatsApp config" 
  ON public.whatsapp_config 
  FOR UPDATE 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can delete their org WhatsApp config" 
  ON public.whatsapp_config 
  FOR DELETE 
  USING (org_id = get_current_user_org_id());

-- Políticas RLS para whatsapp_messages
CREATE POLICY "Users can view their org WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can insert their org WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR INSERT 
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can update their org WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR UPDATE 
  USING (org_id = get_current_user_org_id());

-- Trigger para actualizar updated_at
CREATE TRIGGER update_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
