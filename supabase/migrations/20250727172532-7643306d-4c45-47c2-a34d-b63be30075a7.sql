-- Crear tabla para suscripciones externas (gastos de la empresa)
CREATE TABLE public.outgoing_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'SOFTWARE' CHECK (category IN ('SOFTWARE', 'MARKETING', 'SERVICIOS_LEGALES', 'INFRAESTRUCTURA', 'DISENO', 'COMUNICACION', 'OTROS')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'YEARLY', 'OTHER')),
  start_date DATE NOT NULL,
  next_renewal_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
  payment_method VARCHAR(100),
  responsible_user_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.outgoing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view outgoing subscriptions from their org" 
ON public.outgoing_subscriptions 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create outgoing subscriptions in their org" 
ON public.outgoing_subscriptions 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update outgoing subscriptions in their org" 
ON public.outgoing_subscriptions 
FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete outgoing subscriptions in their org" 
ON public.outgoing_subscriptions 
FOR DELETE 
USING (org_id = get_user_org_id());

-- Crear índices para mejor rendimiento
CREATE INDEX idx_outgoing_subscriptions_org_id ON public.outgoing_subscriptions(org_id);
CREATE INDEX idx_outgoing_subscriptions_status ON public.outgoing_subscriptions(status);
CREATE INDEX idx_outgoing_subscriptions_next_renewal ON public.outgoing_subscriptions(next_renewal_date);
CREATE INDEX idx_outgoing_subscriptions_category ON public.outgoing_subscriptions(category);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_outgoing_subscriptions_updated_at
  BEFORE UPDATE ON public.outgoing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();