-- Crear tabla de planes de suscripción
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla principal de suscripciones
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELED, EXPIRED, PAUSED
  payment_method VARCHAR(50),
  last_payment_date DATE,
  next_payment_due DATE NOT NULL,
  notes TEXT,
  billing_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla de historial de pagos
CREATE TABLE public.subscription_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- COMPLETED, FAILED, PENDING, REFUNDED
  transaction_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscription_plans
CREATE POLICY "Users can view plans from their org" ON public.subscription_plans
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage plans in their org" ON public.subscription_plans
  FOR ALL USING (org_id = get_user_org_id());

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view subscriptions from their org" ON public.subscriptions
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage subscriptions in their org" ON public.subscriptions
  FOR ALL USING (org_id = get_user_org_id());

-- Políticas RLS para subscription_payments
CREATE POLICY "Users can view payments from their org" ON public.subscription_payments
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage payments in their org" ON public.subscription_payments
  FOR ALL USING (org_id = get_user_org_id());

-- Índices para mejor rendimiento
CREATE INDEX idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX idx_subscriptions_contact_id ON public.subscriptions(contact_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_next_payment_due ON public.subscriptions(next_payment_due);
CREATE INDEX idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX idx_subscription_payments_payment_date ON public.subscription_payments(payment_date);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();