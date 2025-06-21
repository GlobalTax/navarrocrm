
-- Añadir campos de recurrencia a la tabla proposals
ALTER TABLE public.proposals 
ADD COLUMN is_recurring BOOLEAN DEFAULT false,
ADD COLUMN recurring_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'yearly'
ADD COLUMN contract_start_date DATE,
ADD COLUMN contract_end_date DATE,
ADD COLUMN auto_renewal BOOLEAN DEFAULT false,
ADD COLUMN retainer_amount NUMERIC DEFAULT 0,
ADD COLUMN included_hours INTEGER DEFAULT 0,
ADD COLUMN hourly_rate_extra NUMERIC DEFAULT 0,
ADD COLUMN next_billing_date DATE,
ADD COLUMN billing_day INTEGER DEFAULT 1; -- día del mes para facturar

-- Crear tabla para servicios de suscripción
CREATE TABLE public.subscription_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  billing_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para contratos retainer
CREATE TABLE public.retainer_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  retainer_amount NUMERIC NOT NULL,
  included_hours INTEGER NOT NULL DEFAULT 0,
  used_hours INTEGER DEFAULT 0,
  hourly_rate_extra NUMERIC NOT NULL,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'expired', 'cancelled'
  last_invoice_date DATE,
  next_invoice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para plantillas de propuesta
CREATE TABLE public.proposal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL, -- 'retainer', 'subscription', 'project', 'hybrid'
  is_recurring BOOLEAN DEFAULT false,
  default_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'yearly'
  default_retainer_amount NUMERIC DEFAULT 0,
  default_included_hours INTEGER DEFAULT 0,
  default_hourly_rate NUMERIC DEFAULT 0,
  template_data JSONB, -- configuración flexible de la plantilla
  created_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para facturas recurrentes generadas automáticamente
CREATE TABLE public.recurring_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id),
  retainer_contract_id UUID REFERENCES public.retainer_contracts(id),
  client_id UUID NOT NULL,
  invoice_number VARCHAR(50),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'paid', 'overdue', 'cancelled'
  billing_period_start DATE,
  billing_period_end DATE,
  hours_included INTEGER DEFAULT 0,
  hours_used INTEGER DEFAULT 0,
  extra_hours INTEGER DEFAULT 0,
  extra_hours_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para métricas de ingresos recurrentes
CREATE TABLE public.recurring_revenue_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  monthly_recurring_revenue NUMERIC DEFAULT 0, -- MRR
  annual_recurring_revenue NUMERIC DEFAULT 0,  -- ARR
  active_subscriptions INTEGER DEFAULT 0,
  active_retainers INTEGER DEFAULT 0,
  new_mrr NUMERIC DEFAULT 0,
  churned_mrr NUMERIC DEFAULT 0,
  expansion_mrr NUMERIC DEFAULT 0,
  contraction_mrr NUMERIC DEFAULT 0,
  churn_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, metric_date)
);

-- Añadir índices para optimizar consultas
CREATE INDEX idx_proposals_recurring ON public.proposals(org_id, is_recurring) WHERE is_recurring = true;
CREATE INDEX idx_proposals_next_billing ON public.proposals(next_billing_date) WHERE next_billing_date IS NOT NULL;
CREATE INDEX idx_subscription_services_org ON public.subscription_services(org_id, is_active);
CREATE INDEX idx_retainer_contracts_org_status ON public.retainer_contracts(org_id, status);
CREATE INDEX idx_retainer_contracts_next_invoice ON public.retainer_contracts(next_invoice_date) WHERE next_invoice_date IS NOT NULL;
CREATE INDEX idx_recurring_invoices_org_status ON public.recurring_invoices(org_id, status);
CREATE INDEX idx_recurring_invoices_due_date ON public.recurring_invoices(due_date) WHERE status IN ('pending', 'sent');

-- Crear función para calcular métricas de ingresos recurrentes
CREATE OR REPLACE FUNCTION public.calculate_recurring_revenue_metrics(org_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_mrr NUMERIC := 0;
  current_arr NUMERIC := 0;
  active_subs INTEGER := 0;
  active_ret INTEGER := 0;
BEGIN
  -- Calcular MRR de suscripciones activas
  SELECT COALESCE(SUM(
    CASE 
      WHEN p.recurring_frequency = 'monthly' THEN p.total_amount
      WHEN p.recurring_frequency = 'quarterly' THEN p.total_amount / 3
      WHEN p.recurring_frequency = 'yearly' THEN p.total_amount / 12
      ELSE 0
    END
  ), 0), COUNT(*)
  INTO current_mrr, active_subs
  FROM public.proposals p
  WHERE p.org_id = org_uuid 
    AND p.is_recurring = true 
    AND p.status = 'won'
    AND (p.contract_end_date IS NULL OR p.contract_end_date >= target_date);

  -- Calcular MRR de retainers activos
  SELECT COALESCE(SUM(retainer_amount), 0), COUNT(*)
  INTO current_mrr, active_ret
  FROM public.retainer_contracts rc
  WHERE rc.org_id = org_uuid 
    AND rc.status = 'active'
    AND (rc.contract_end_date IS NULL OR rc.contract_end_date >= target_date);

  -- ARR = MRR * 12
  current_arr := current_mrr * 12;

  -- Insertar o actualizar métricas
  INSERT INTO public.recurring_revenue_metrics (
    org_id, metric_date, monthly_recurring_revenue, annual_recurring_revenue,
    active_subscriptions, active_retainers
  ) VALUES (
    org_uuid, target_date, current_mrr, current_arr, active_subs, active_ret
  )
  ON CONFLICT (org_id, metric_date) 
  DO UPDATE SET
    monthly_recurring_revenue = EXCLUDED.monthly_recurring_revenue,
    annual_recurring_revenue = EXCLUDED.annual_recurring_revenue,
    active_subscriptions = EXCLUDED.active_subscriptions,
    active_retainers = EXCLUDED.active_retainers;
END;
$function$;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_subscription_services_updated_at
    BEFORE UPDATE ON public.subscription_services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retainer_contracts_updated_at
    BEFORE UPDATE ON public.retainer_contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_templates_updated_at
    BEFORE UPDATE ON public.proposal_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_invoices_updated_at
    BEFORE UPDATE ON public.recurring_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
