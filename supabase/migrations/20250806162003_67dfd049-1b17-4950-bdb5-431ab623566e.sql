-- Create recruitment pipeline stages table for customizable stages
CREATE TABLE public.recruitment_pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  color CHARACTER VARYING NOT NULL DEFAULT '#6366f1',
  icon CHARACTER VARYING DEFAULT 'users',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recruitment_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view stages from their org" 
ON public.recruitment_pipeline_stages 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage stages in their org" 
ON public.recruitment_pipeline_stages 
FOR ALL 
USING (org_id = get_user_org_id())
WITH CHECK (org_id = get_user_org_id());

-- Add trigger for updated_at
CREATE TRIGGER update_recruitment_pipeline_stages_updated_at
BEFORE UPDATE ON public.recruitment_pipeline_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default stages for existing organizations
INSERT INTO public.recruitment_pipeline_stages (org_id, name, description, color, icon, sort_order, is_default)
SELECT 
  o.id,
  stage_data.name,
  stage_data.description,
  stage_data.color,
  stage_data.icon,
  stage_data.sort_order,
  true
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('Nuevos', 'Candidatos recién agregados al sistema', '#8b5cf6', 'user-plus', 1),
    ('Screening', 'Revisión inicial de CV y requisitos', '#06b6d4', 'search', 2),
    ('Entrevista Técnica', 'Evaluación de habilidades técnicas', '#10b981', 'code', 3),
    ('Entrevista Final', 'Entrevista con managers y cultural fit', '#f59e0b', 'users', 4),
    ('Oferta', 'Candidatos con oferta enviada', '#3b82f6', 'mail', 5),
    ('Contratado', 'Proceso completado exitosamente', '#22c55e', 'check-circle', 6),
    ('Rechazado', 'Candidatos que no continuaron el proceso', '#ef4444', 'x-circle', 7)
) AS stage_data(name, description, color, icon, sort_order);