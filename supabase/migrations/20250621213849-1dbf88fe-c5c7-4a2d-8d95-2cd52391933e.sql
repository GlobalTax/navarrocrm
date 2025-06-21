
-- Habilitar RLS en todas las tablas que lo necesitan
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retainer_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para service_catalog
CREATE POLICY "Users can view service catalog in their org" ON public.service_catalog
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create service catalog in their org" ON public.service_catalog
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update service catalog in their org" ON public.service_catalog
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete service catalog in their org" ON public.service_catalog
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear políticas RLS para proposals
CREATE POLICY "Users can view proposals in their org" ON public.proposals
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create proposals in their org" ON public.proposals
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update proposals in their org" ON public.proposals
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete proposals in their org" ON public.proposals
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear políticas RLS para proposal_line_items
CREATE POLICY "Users can view proposal line items in their org" ON public.proposal_line_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can create proposal line items in their org" ON public.proposal_line_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can update proposal line items in their org" ON public.proposal_line_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can delete proposal line items in their org" ON public.proposal_line_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND org_id = get_user_org_id())
  );

-- Crear políticas RLS para revenue_metrics
CREATE POLICY "Users can view revenue metrics in their org" ON public.revenue_metrics
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create revenue metrics in their org" ON public.revenue_metrics
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update revenue metrics in their org" ON public.revenue_metrics
  FOR UPDATE USING (org_id = get_user_org_id());

-- Crear políticas RLS para subscription_services
CREATE POLICY "Users can view subscription services in their org" ON public.subscription_services
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create subscription services in their org" ON public.subscription_services
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update subscription services in their org" ON public.subscription_services
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete subscription services in their org" ON public.subscription_services
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear políticas RLS para retainer_contracts
CREATE POLICY "Users can view retainer contracts in their org" ON public.retainer_contracts
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create retainer contracts in their org" ON public.retainer_contracts
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update retainer contracts in their org" ON public.retainer_contracts
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete retainer contracts in their org" ON public.retainer_contracts
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear políticas RLS para recurring_invoices
CREATE POLICY "Users can view recurring invoices in their org" ON public.recurring_invoices
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create recurring invoices in their org" ON public.recurring_invoices
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update recurring invoices in their org" ON public.recurring_invoices
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete recurring invoices in their org" ON public.recurring_invoices
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear políticas RLS para recurring_revenue_metrics
CREATE POLICY "Users can view recurring revenue metrics in their org" ON public.recurring_revenue_metrics
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create recurring revenue metrics in their org" ON public.recurring_revenue_metrics
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update recurring revenue metrics in their org" ON public.recurring_revenue_metrics
  FOR UPDATE USING (org_id = get_user_org_id());

-- Crear políticas RLS para proposal_templates
CREATE POLICY "Users can view proposal templates in their org" ON public.proposal_templates
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create proposal templates in their org" ON public.proposal_templates
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update proposal templates in their org" ON public.proposal_templates
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete proposal templates in their org" ON public.proposal_templates
  FOR DELETE USING (org_id = get_user_org_id());
