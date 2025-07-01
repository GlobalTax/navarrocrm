
-- Crear tabla para reportes programados
CREATE TABLE public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  report_name CHARACTER VARYING NOT NULL,
  report_type CHARACTER VARYING NOT NULL DEFAULT 'dashboard' CHECK (report_type IN ('dashboard', 'time_tracking', 'financial', 'cases')),
  frequency CHARACTER VARYING NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  email_recipients TEXT[] NOT NULL DEFAULT '{}',
  metrics_included TEXT[] NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  next_send_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para scheduled_reports
CREATE POLICY "Users can view their org's scheduled reports"
  ON public.scheduled_reports
  FOR SELECT
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their org's scheduled reports"
  ON public.scheduled_reports
  FOR INSERT
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their org's scheduled reports"
  ON public.scheduled_reports
  FOR UPDATE
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their org's scheduled reports"
  ON public.scheduled_reports
  FOR DELETE
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_scheduled_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_reports_updated_at
    BEFORE UPDATE ON public.scheduled_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_scheduled_reports_updated_at();
