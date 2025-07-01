
-- Crear tabla para configuraciones de notificaciones IA
CREATE TABLE public.ai_notification_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type CHARACTER VARYING NOT NULL DEFAULT 'email' CHECK (notification_type IN ('email', 'dashboard', 'both')),
  threshold_cost NUMERIC NOT NULL DEFAULT 50,
  threshold_failures NUMERIC NOT NULL DEFAULT 20,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  email_address CHARACTER VARYING,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para notificaciones de alertas IA (dashboard)
CREATE TABLE public.ai_alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  alert_type CHARACTER VARYING NOT NULL CHECK (alert_type IN ('high_cost', 'high_failures', 'unusual_pattern')),
  message TEXT NOT NULL,
  severity CHARACTER VARYING NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  alert_data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ai_notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_alert_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_notification_configs
CREATE POLICY "Users can view their org's AI notification configs"
  ON public.ai_notification_configs
  FOR SELECT
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their org's AI notification configs"
  ON public.ai_notification_configs
  FOR INSERT
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their org's AI notification configs"
  ON public.ai_notification_configs
  FOR UPDATE
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Políticas RLS para ai_alert_notifications
CREATE POLICY "Users can view their AI alert notifications"
  ON public.ai_alert_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert AI alert notifications"
  ON public.ai_alert_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their AI alert notifications"
  ON public.ai_alert_notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_ai_notification_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_notification_configs_updated_at
    BEFORE UPDATE ON public.ai_notification_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ai_notification_configs_updated_at();
