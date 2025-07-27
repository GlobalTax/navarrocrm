-- Crear tabla subscription_templates para plantillas de productos/servicios frecuentes
CREATE TABLE public.subscription_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN ('SOFTWARE', 'IA', 'MARKETING', 'SERVICIOS_LEGALES', 'INFRAESTRUCTURA', 'DISENO', 'COMUNICACION', 'OTROS')),
  default_price DECIMAL(10,2) NOT NULL,
  default_billing_cycle VARCHAR NOT NULL CHECK (default_billing_cycle IN ('MONTHLY', 'YEARLY', 'OTHER')) DEFAULT 'MONTHLY',
  default_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  default_payment_method VARCHAR,
  provider_website TEXT,
  description TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscription_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view templates from their org" 
ON public.subscription_templates 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create templates in their org" 
ON public.subscription_templates 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update templates in their org" 
ON public.subscription_templates 
FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete templates in their org" 
ON public.subscription_templates 
FOR DELETE 
USING (org_id = get_user_org_id());

-- Índices para rendimiento
CREATE INDEX idx_subscription_templates_org_id ON public.subscription_templates(org_id);
CREATE INDEX idx_subscription_templates_category ON public.subscription_templates(category);
CREATE INDEX idx_subscription_templates_usage_count ON public.subscription_templates(usage_count DESC);
CREATE INDEX idx_subscription_templates_is_active ON public.subscription_templates(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_subscription_templates_updated_at
  BEFORE UPDATE ON public.subscription_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar plantillas predefinidas (se aplicarán a todas las organizaciones que las activen)
INSERT INTO public.subscription_templates (org_id, name, category, default_price, default_billing_cycle, default_currency, default_payment_method, provider_website, description, created_by) VALUES
-- Nota: Estas plantillas se insertarán con org_id genérico y luego se clonarán por organización cuando sea necesario
-- Por ahora las dejamos comentadas hasta tener una estrategia de distribución
-- ('00000000-0000-0000-0000-000000000000', 'ChatGPT Plus', 'IA', 20.00, 'MONTHLY', 'EUR', 'VISA', 'https://openai.com', 'Suscripción mensual a ChatGPT Plus con GPT-4', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Notion Pro', 'SOFTWARE', 10.00, 'MONTHLY', 'EUR', 'VISA', 'https://notion.so', 'Plan profesional de Notion para equipos', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Google Workspace Business', 'SOFTWARE', 13.00, 'MONTHLY', 'EUR', 'Transferencia', 'https://workspace.google.com', 'Suite de productividad empresarial de Google', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Figma Pro', 'DISENO', 12.00, 'MONTHLY', 'EUR', 'VISA', 'https://figma.com', 'Herramienta de diseño colaborativo profesional', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Canva Pro', 'MARKETING', 11.99, 'MONTHLY', 'EUR', 'VISA', 'https://canva.com', 'Plataforma de diseño gráfico profesional', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Slack Pro', 'COMUNICACION', 7.25, 'MONTHLY', 'EUR', 'VISA', 'https://slack.com', 'Plataforma de comunicación empresarial', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'GitHub Pro', 'SOFTWARE', 4.00, 'MONTHLY', 'EUR', 'VISA', 'https://github.com', 'Repositorios privados y funciones avanzadas', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Dropbox Business', 'INFRAESTRUCTURA', 15.00, 'MONTHLY', 'EUR', 'Transferencia', 'https://dropbox.com', 'Almacenamiento en la nube empresarial', '00000000-0000-0000-0000-000000000000'),
-- ('00000000-0000-0000-0000-000000000000', 'Zoom Pro', 'COMUNICACION', 13.99, 'MONTHLY', 'EUR', 'VISA', 'https://zoom.us', 'Videoconferencias profesionales sin límite de tiempo', '00000000-0000-0000-0000-000000000000');