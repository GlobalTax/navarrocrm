
-- Tabla para configuración de integraciones por organización
CREATE TABLE public.organization_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL DEFAULT 'outlook',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  outlook_client_id TEXT,
  outlook_tenant_id TEXT,
  outlook_client_secret_encrypted TEXT,
  email_integration_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_email_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_frequency_minutes INTEGER DEFAULT 15,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  config_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, integration_type)
);

-- Tabla para tokens OAuth de usuarios
CREATE TABLE public.user_outlook_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope_permissions TEXT[] DEFAULT '{}',
  outlook_email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Tabla para hilos de conversación por email
CREATE TABLE public.email_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  thread_subject VARCHAR(500) NOT NULL,
  outlook_thread_id VARCHAR(255),
  participants TEXT[] DEFAULT '{}',
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para plantillas de email
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'invitation', 'reminder', 'followup', 'custom'
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Variables disponibles
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para log de sincronizaciones
CREATE TABLE public.calendar_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  sync_type VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete', 'import'
  sync_direction VARCHAR(20) NOT NULL, -- 'to_outlook', 'from_outlook', 'bidirectional'
  outlook_event_id VARCHAR(255),
  sync_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'conflict'
  error_message TEXT,
  sync_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extender tabla calendar_events con campos de Outlook
ALTER TABLE public.calendar_events 
ADD COLUMN outlook_id VARCHAR(255),
ADD COLUMN sync_with_outlook BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN sync_status VARCHAR(20) DEFAULT 'not_synced', -- 'not_synced', 'synced', 'failed', 'conflict'
ADD COLUMN outlook_meeting_url TEXT,
ADD COLUMN attendees_emails TEXT[] DEFAULT '{}',
ADD COLUMN outlook_calendar_id VARCHAR(255),
ADD COLUMN auto_send_invitations BOOLEAN NOT NULL DEFAULT false;

-- Extender tabla clients con preferencias de email
ALTER TABLE public.clients
ADD COLUMN email_preferences JSONB DEFAULT '{"receive_invitations": true, "receive_reminders": true, "receive_followups": true}',
ADD COLUMN preferred_meeting_time VARCHAR(20) DEFAULT 'morning', -- 'morning', 'afternoon', 'evening'
ADD COLUMN timezone VARCHAR(50) DEFAULT 'Europe/Madrid';

-- Extender tabla cases con tracking de comunicación
ALTER TABLE public.cases
ADD COLUMN communication_preferences JSONB DEFAULT '{"auto_updates": true, "milestone_notifications": true}',
ADD COLUMN primary_contact_email VARCHAR(255),
ADD COLUMN last_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Índices para performance
CREATE INDEX idx_organization_integrations_org_id ON public.organization_integrations(org_id);
CREATE INDEX idx_user_outlook_tokens_user_org ON public.user_outlook_tokens(user_id, org_id);
CREATE INDEX idx_user_outlook_tokens_expires ON public.user_outlook_tokens(token_expires_at);
CREATE INDEX idx_email_threads_client_case ON public.email_threads(client_id, case_id);
CREATE INDEX idx_email_threads_outlook_id ON public.email_threads(outlook_thread_id);
CREATE INDEX idx_calendar_sync_log_event ON public.calendar_sync_log(event_id);
CREATE INDEX idx_calendar_sync_log_org_user ON public.calendar_sync_log(org_id, user_id);
CREATE INDEX idx_calendar_events_outlook_id ON public.calendar_events(outlook_id);
CREATE INDEX idx_calendar_events_sync_status ON public.calendar_events(sync_status);

-- Triggers para updated_at
CREATE TRIGGER update_organization_integrations_updated_at
  BEFORE UPDATE ON public.organization_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_outlook_tokens_updated_at
  BEFORE UPDATE ON public.user_outlook_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_threads_updated_at
  BEFORE UPDATE ON public.email_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.organization_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_outlook_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas para organization_integrations
CREATE POLICY "Users can view their org integrations" 
  ON public.organization_integrations FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Partners can manage org integrations" 
  ON public.organization_integrations FOR ALL 
  USING (org_id = get_user_org_id() AND 
         EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')));

-- Políticas para user_outlook_tokens
CREATE POLICY "Users can manage their own tokens" 
  ON public.user_outlook_tokens FOR ALL 
  USING (user_id = auth.uid() AND org_id = get_user_org_id());

-- Políticas para email_threads
CREATE POLICY "Users can view org email threads" 
  ON public.email_threads FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage email threads" 
  ON public.email_threads FOR INSERT 
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

-- Políticas para email_templates
CREATE POLICY "Users can view org email templates" 
  ON public.email_templates FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Partners can manage email templates" 
  ON public.email_templates FOR ALL 
  USING (org_id = get_user_org_id() AND 
         EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')));

-- Políticas para calendar_sync_log
CREATE POLICY "Users can view org sync logs" 
  ON public.calendar_sync_log FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create sync logs" 
  ON public.calendar_sync_log FOR INSERT 
  WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Marcar como inactivos los tokens expirados
  UPDATE public.user_outlook_tokens 
  SET is_active = false, updated_at = now()
  WHERE token_expires_at < now() AND is_active = true;
  
  -- Log de limpieza
  INSERT INTO public.calendar_sync_log (org_id, user_id, sync_type, sync_status, sync_data)
  SELECT 
    org_id, 
    user_id, 
    'cleanup', 
    'success',
    jsonb_build_object('cleaned_tokens', ROW_NUMBER() OVER())
  FROM public.user_outlook_tokens 
  WHERE token_expires_at < now() AND is_active = false;
END;
$$;

-- Insertar plantillas de email por defecto
INSERT INTO public.email_templates (org_id, name, template_type, subject_template, body_template, variables, created_by)
SELECT 
  o.id as org_id,
  'Invitación a Reunión',
  'invitation',
  'Invitación: {{event_title}} - {{event_date}}',
  '<h2>Tiene una reunión programada</h2><p><strong>Asunto:</strong> {{event_title}}</p><p><strong>Fecha:</strong> {{event_date}}</p><p><strong>Hora:</strong> {{event_time}}</p><p><strong>Ubicación:</strong> {{event_location}}</p><p>{{event_description}}</p><p>Saludos cordiales,<br>{{sender_name}}</p>',
  '{"event_title": "Título del evento", "event_date": "Fecha", "event_time": "Hora", "event_location": "Ubicación", "event_description": "Descripción", "sender_name": "Nombre del remitente"}',
  (SELECT id FROM public.users WHERE org_id = o.id AND role = 'partner' LIMIT 1)
FROM public.organizations o
WHERE EXISTS(SELECT 1 FROM public.users WHERE org_id = o.id AND role = 'partner');

INSERT INTO public.email_templates (org_id, name, template_type, subject_template, body_template, variables, created_by)
SELECT 
  o.id as org_id,
  'Recordatorio de Reunión',
  'reminder',
  'Recordatorio: {{event_title}} mañana a las {{event_time}}',
  '<h2>Recordatorio de Reunión</h2><p>Le recordamos que tiene una reunión programada:</p><p><strong>Asunto:</strong> {{event_title}}</p><p><strong>Fecha:</strong> {{event_date}}</p><p><strong>Hora:</strong> {{event_time}}</p><p><strong>Ubicación:</strong> {{event_location}}</p><p>Nos vemos mañana.</p><p>Saludos,<br>{{sender_name}}</p>',
  '{"event_title": "Título del evento", "event_date": "Fecha", "event_time": "Hora", "event_location": "Ubicación", "sender_name": "Nombre del remitente"}',
  (SELECT id FROM public.users WHERE org_id = o.id AND role = 'partner' LIMIT 1)
FROM public.organizations o
WHERE EXISTS(SELECT 1 FROM public.users WHERE org_id = o.id AND role = 'partner');
