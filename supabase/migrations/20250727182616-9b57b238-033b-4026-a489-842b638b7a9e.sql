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