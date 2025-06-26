
-- Crear tabla para métricas de analytics
CREATE TABLE IF NOT EXISTS public.analytics_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type VARCHAR(50) NOT NULL,
  metric_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, metric_date, metric_type)
);

-- Crear tabla para reportes personalizados
CREATE TABLE IF NOT EXISTS public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metrics TEXT[] NOT NULL DEFAULT '{}',
  filters JSONB NOT NULL DEFAULT '{}',
  schedule VARCHAR(20) CHECK (schedule IN ('daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_generated TIMESTAMP WITH TIME ZONE,
  next_generation TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para insights predictivos
CREATE TABLE IF NOT EXISTS public.predictive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  insight_type VARCHAR(50) NOT NULL,
  insight_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Crear tabla para seguimiento de métricas históricas
CREATE TABLE IF NOT EXISTS public.historical_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_org_date ON public.analytics_metrics(org_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_custom_reports_org ON public.custom_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_org_type ON public.predictive_insights(org_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_historical_metrics_org_name_date ON public.historical_metrics(org_id, metric_name, metric_date);

-- Función para calcular métricas de ingresos históricas
CREATE OR REPLACE FUNCTION public.get_historical_revenue(org_uuid uuid, months_back integer DEFAULT 12)
RETURNS TABLE(month_date date, revenue numeric, proposal_count integer, conversion_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      DATE_TRUNC('month', p.created_at)::date as month_date,
      COALESCE(SUM(CASE WHEN p.status = 'won' THEN p.total_amount ELSE 0 END), 0) as revenue,
      COUNT(*) as proposal_count,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(CASE WHEN p.status = 'won' THEN 1 END)::numeric / COUNT(*)::numeric) * 100
        ELSE 0 
      END as conversion_rate
    FROM public.proposals p
    WHERE p.org_id = org_uuid 
      AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * months_back)
    GROUP BY DATE_TRUNC('month', p.created_at)::date
  )
  SELECT md.month_date, md.revenue, md.proposal_count, md.conversion_rate
  FROM monthly_data md
  ORDER BY md.month_date;
END;
$$;

-- Función para calcular métricas de productividad
CREATE OR REPLACE FUNCTION public.calculate_productivity_metrics(org_uuid uuid, target_date date DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_hours NUMERIC;
  billable_hours NUMERIC;
  utilization_rate NUMERIC;
  task_completion_rate NUMERIC;
BEGIN
  -- Calcular horas totales y facturables
  SELECT 
    COALESCE(SUM(duration_minutes), 0) / 60.0,
    COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0) / 60.0
  INTO total_hours, billable_hours
  FROM public.time_entries
  WHERE org_id = org_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', target_date);

  -- Calcular tasa de utilización
  utilization_rate := CASE 
    WHEN total_hours > 0 THEN (billable_hours / total_hours) * 100 
    ELSE 0 
  END;

  -- Calcular tasa de finalización de tareas
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / COUNT(*)::numeric) * 100
      ELSE 0 
    END
  INTO task_completion_rate
  FROM public.tasks
  WHERE org_id = org_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', target_date);

  -- Construir resultado JSON
  result := jsonb_build_object(
    'total_hours', total_hours,
    'billable_hours', billable_hours,
    'utilization_rate', utilization_rate,
    'task_completion_rate', task_completion_rate,
    'calculated_at', now()
  );

  RETURN result;
END;
$$;

-- Función para identificar clientes en riesgo
CREATE OR REPLACE FUNCTION public.identify_churn_risk_clients(org_uuid uuid)
RETURNS TABLE(
  client_id uuid,
  client_name varchar,
  risk_score numeric,
  risk_factors text[],
  last_activity_days integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    -- Calcular score de riesgo basado en múltiples factores
    CASE 
      WHEN days_since_activity > 90 THEN 0.9
      WHEN days_since_activity > 60 THEN 0.7
      WHEN days_since_activity > 30 THEN 0.5
      ELSE 0.2
    END as risk_score,
    -- Factores de riesgo
    ARRAY[
      CASE WHEN days_since_activity > 60 THEN 'Inactividad prolongada' END,
      CASE WHEN total_cases < 2 THEN 'Pocos casos' END,
      CASE WHEN avg_case_value < 1000 THEN 'Bajo valor promedio' END
    ]::text[] as risk_factors,
    days_since_activity as last_activity_days
  FROM (
    SELECT 
      c.id,
      c.name,
      COALESCE(EXTRACT(DAY FROM (CURRENT_DATE - MAX(ca.updated_at)::date)), 365) as days_since_activity,
      COUNT(ca.id) as total_cases,
      AVG(COALESCE(p.total_amount, 0)) as avg_case_value
    FROM public.contacts c
    LEFT JOIN public.cases ca ON ca.contact_id = c.id
    LEFT JOIN public.proposals p ON p.contact_id = c.id
    WHERE c.org_id = org_uuid
    GROUP BY c.id, c.name
  ) client_analysis
  WHERE days_since_activity > 30  -- Solo clientes con riesgo
  ORDER BY risk_score DESC, days_since_activity DESC;
END;
$$;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers a las nuevas tablas
CREATE TRIGGER update_analytics_metrics_updated_at 
  BEFORE UPDATE ON public.analytics_metrics 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_reports_updated_at 
  BEFORE UPDATE ON public.custom_reports 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_metrics ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS básicas (permitir acceso por org_id)
CREATE POLICY "Users can access their org analytics metrics" ON public.analytics_metrics
  FOR ALL USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can access their org custom reports" ON public.custom_reports
  FOR ALL USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can access their org predictive insights" ON public.predictive_insights
  FOR ALL USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can access their org historical metrics" ON public.historical_metrics
  FOR ALL USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
