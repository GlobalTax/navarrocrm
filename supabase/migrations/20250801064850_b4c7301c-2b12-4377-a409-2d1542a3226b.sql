-- Crear tabla para ofertas de trabajo
CREATE TABLE public.job_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title CHARACTER VARYING NOT NULL,
  department CHARACTER VARYING,
  position_level CHARACTER VARYING DEFAULT 'junior', -- junior, senior, manager, director
  candidate_name CHARACTER VARYING NOT NULL,
  candidate_email CHARACTER VARYING NOT NULL,
  candidate_phone CHARACTER VARYING,
  
  -- Detalles de la oferta
  salary_amount NUMERIC,
  salary_currency CHARACTER VARYING DEFAULT 'EUR',
  salary_period CHARACTER VARYING DEFAULT 'annual', -- monthly, annual
  start_date DATE,
  probation_period_months INTEGER DEFAULT 6,
  vacation_days INTEGER DEFAULT 22,
  work_schedule CHARACTER VARYING DEFAULT 'full_time', -- full_time, part_time, hybrid
  work_location CHARACTER VARYING,
  remote_work_allowed BOOLEAN DEFAULT false,
  
  -- Beneficios y condiciones
  benefits JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  additional_notes TEXT,
  
  -- Estado y seguimiento
  status CHARACTER VARYING DEFAULT 'draft', -- draft, sent, viewed, accepted, declined, expired
  template_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Integración con onboarding
  employee_onboarding_id UUID,
  
  -- Metadatos
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para plantillas de ofertas
CREATE TABLE public.job_offer_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  position_level CHARACTER VARYING DEFAULT 'junior',
  department CHARACTER VARYING,
  
  -- Plantilla de contenido
  title_template CHARACTER VARYING,
  salary_range_min NUMERIC,
  salary_range_max NUMERIC,
  default_benefits JSONB DEFAULT '[]'::jsonb,
  default_requirements JSONB DEFAULT '[]'::jsonb,
  default_responsibilities JSONB DEFAULT '[]'::jsonb,
  default_probation_months INTEGER DEFAULT 6,
  default_vacation_days INTEGER DEFAULT 22,
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Metadatos
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para actividades/histórico de ofertas
CREATE TABLE public.job_offer_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_offer_id UUID NOT NULL,
  org_id UUID NOT NULL,
  user_id UUID,
  activity_type CHARACTER VARYING NOT NULL, -- created, sent, viewed, accepted, declined, modified
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offer_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para job_offers
CREATE POLICY "Users can view job offers from their org" 
ON public.job_offers FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create job offers in their org" 
ON public.job_offers FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update job offers in their org" 
ON public.job_offers FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete job offers in their org" 
ON public.job_offers FOR DELETE 
USING (org_id = get_user_org_id());

-- Políticas RLS para job_offer_templates
CREATE POLICY "Users can view templates from their org" 
ON public.job_offer_templates FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create templates in their org" 
ON public.job_offer_templates FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update templates in their org" 
ON public.job_offer_templates FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete templates in their org" 
ON public.job_offer_templates FOR DELETE 
USING (org_id = get_user_org_id());

-- Políticas RLS para job_offer_activities
CREATE POLICY "Users can view activities from their org" 
ON public.job_offer_activities FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "System can insert activities" 
ON public.job_offer_activities FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

-- Índices para optimización
CREATE INDEX idx_job_offers_org_id ON public.job_offers(org_id);
CREATE INDEX idx_job_offers_status ON public.job_offers(status);
CREATE INDEX idx_job_offers_created_by ON public.job_offers(created_by);
CREATE INDEX idx_job_offers_employee_onboarding_id ON public.job_offers(employee_onboarding_id);

CREATE INDEX idx_job_offer_templates_org_id ON public.job_offer_templates(org_id);
CREATE INDEX idx_job_offer_templates_department ON public.job_offer_templates(department);
CREATE INDEX idx_job_offer_templates_position_level ON public.job_offer_templates(position_level);

CREATE INDEX idx_job_offer_activities_job_offer_id ON public.job_offer_activities(job_offer_id);
CREATE INDEX idx_job_offer_activities_org_id ON public.job_offer_activities(org_id);

-- Triggers para updated_at
CREATE TRIGGER update_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_offer_templates_updated_at
  BEFORE UPDATE ON public.job_offer_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para generar token de acceso seguro para candidatos
CREATE OR REPLACE FUNCTION public.generate_job_offer_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$$;

-- Agregar token de acceso a job_offers
ALTER TABLE public.job_offers ADD COLUMN access_token TEXT UNIQUE DEFAULT generate_job_offer_token();