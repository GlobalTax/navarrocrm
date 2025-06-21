
-- Crear tabla para catálogo de servicios
CREATE TABLE public.service_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  default_price NUMERIC,
  billing_unit VARCHAR DEFAULT 'hour', -- hour, fixed, monthly
  practice_area_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para propuestas
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  client_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL DEFAULT 'draft', -- draft, sent, negotiating, won, lost, expired
  total_amount NUMERIC DEFAULT 0,
  currency VARCHAR DEFAULT 'EUR',
  proposal_type VARCHAR DEFAULT 'service', -- service, retainer, project
  valid_until DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  assigned_to UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para items de la propuesta
CREATE TABLE public.proposal_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL,
  service_catalog_id UUID,
  name VARCHAR NOT NULL,
  description TEXT,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  billing_unit VARCHAR DEFAULT 'hour',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para métricas de revenue
CREATE TABLE public.revenue_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  proposals_sent INTEGER DEFAULT 0,
  proposals_won INTEGER DEFAULT 0,
  proposals_lost INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_deal_size NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, metric_date)
);

-- Agregar foreign keys
ALTER TABLE public.service_catalog 
ADD CONSTRAINT fk_service_catalog_org FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE public.service_catalog 
ADD CONSTRAINT fk_service_catalog_practice_area FOREIGN KEY (practice_area_id) REFERENCES public.practice_areas(id);

ALTER TABLE public.proposals 
ADD CONSTRAINT fk_proposals_org FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE public.proposals 
ADD CONSTRAINT fk_proposals_client FOREIGN KEY (client_id) REFERENCES public.clients(id);

ALTER TABLE public.proposal_line_items 
ADD CONSTRAINT fk_proposal_line_items_proposal FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;

ALTER TABLE public.proposal_line_items 
ADD CONSTRAINT fk_proposal_line_items_service FOREIGN KEY (service_catalog_id) REFERENCES public.service_catalog(id);

ALTER TABLE public.revenue_metrics 
ADD CONSTRAINT fk_revenue_metrics_org FOREIGN KEY (org_id) REFERENCES public.organizations(id);

-- Crear índices para optimizar consultas
CREATE INDEX idx_proposals_org_status ON public.proposals(org_id, status);
CREATE INDEX idx_proposals_client ON public.proposals(client_id);
CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX idx_proposal_line_items_proposal ON public.proposal_line_items(proposal_id);
CREATE INDEX idx_service_catalog_org_active ON public.service_catalog(org_id, is_active);
CREATE INDEX idx_revenue_metrics_org_date ON public.revenue_metrics(org_id, metric_date);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_proposals_updated_at 
  BEFORE UPDATE ON public.proposals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_catalog_updated_at 
  BEFORE UPDATE ON public.service_catalog 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para calcular métricas de revenue
CREATE OR REPLACE FUNCTION public.calculate_revenue_metrics(org_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  sent_count INTEGER;
  won_count INTEGER;
  lost_count INTEGER;
  total_rev NUMERIC;
  avg_deal NUMERIC;
  conv_rate NUMERIC;
BEGIN
  -- Contar propuestas enviadas en el mes
  SELECT COUNT(*) INTO sent_count
  FROM public.proposals 
  WHERE org_id = org_uuid 
    AND DATE_TRUNC('month', sent_at) = DATE_TRUNC('month', target_date)
    AND status != 'draft';

  -- Contar propuestas ganadas en el mes
  SELECT COUNT(*), COALESCE(SUM(total_amount), 0) INTO won_count, total_rev
  FROM public.proposals 
  WHERE org_id = org_uuid 
    AND DATE_TRUNC('month', accepted_at) = DATE_TRUNC('month', target_date)
    AND status = 'won';

  -- Contar propuestas perdidas en el mes
  SELECT COUNT(*) INTO lost_count
  FROM public.proposals 
  WHERE org_id = org_uuid 
    AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', target_date)
    AND status = 'lost';

  -- Calcular promedio y tasa de conversión
  avg_deal := CASE WHEN won_count > 0 THEN total_rev / won_count ELSE 0 END;
  conv_rate := CASE WHEN sent_count > 0 THEN (won_count::NUMERIC / sent_count) * 100 ELSE 0 END;

  -- Insertar o actualizar métricas
  INSERT INTO public.revenue_metrics (
    org_id, metric_date, proposals_sent, proposals_won, proposals_lost,
    total_revenue, average_deal_size, conversion_rate
  ) VALUES (
    org_uuid, target_date, sent_count, won_count, lost_count,
    total_rev, avg_deal, conv_rate
  )
  ON CONFLICT (org_id, metric_date) 
  DO UPDATE SET
    proposals_sent = EXCLUDED.proposals_sent,
    proposals_won = EXCLUDED.proposals_won,
    proposals_lost = EXCLUDED.proposals_lost,
    total_revenue = EXCLUDED.total_revenue,
    average_deal_size = EXCLUDED.average_deal_size,
    conversion_rate = EXCLUDED.conversion_rate;
END;
$function$;

-- Función para actualizar el total de la propuesta
CREATE OR REPLACE FUNCTION public.update_proposal_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Actualizar el total de la propuesta
  UPDATE public.proposals 
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM public.proposal_line_items 
    WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id)
  )
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Crear triggers para actualizar totales automáticamente
CREATE TRIGGER update_proposal_total_on_insert
  AFTER INSERT ON public.proposal_line_items
  FOR EACH ROW EXECUTE FUNCTION public.update_proposal_total();

CREATE TRIGGER update_proposal_total_on_update
  AFTER UPDATE ON public.proposal_line_items
  FOR EACH ROW EXECUTE FUNCTION public.update_proposal_total();

CREATE TRIGGER update_proposal_total_on_delete
  AFTER DELETE ON public.proposal_line_items
  FOR EACH ROW EXECUTE FUNCTION public.update_proposal_total();
