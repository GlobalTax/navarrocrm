
-- Primero, eliminar las funciones existentes que pueden tener errores
DROP FUNCTION IF EXISTS public.identify_churn_risk_clients(uuid);
DROP FUNCTION IF EXISTS public.get_historical_revenue(uuid, integer);

-- Recrear la función identify_churn_risk_clients con sintaxis corregida
CREATE OR REPLACE FUNCTION public.identify_churn_risk_clients(org_uuid uuid)
RETURNS TABLE(
  client_id uuid, 
  client_name character varying, 
  risk_score numeric, 
  risk_factors text[], 
  last_activity_days integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    -- Calcular score de riesgo basado en múltiples factores
    CASE 
      WHEN days_since_activity > 90 THEN 0.9::numeric
      WHEN days_since_activity > 60 THEN 0.7::numeric
      WHEN days_since_activity > 30 THEN 0.5::numeric
      ELSE 0.2::numeric
    END as risk_score,
    -- Factores de riesgo
    ARRAY_REMOVE(ARRAY[
      CASE WHEN days_since_activity > 60 THEN 'Inactividad prolongada' END,
      CASE WHEN total_cases < 2 THEN 'Pocos casos' END,
      CASE WHEN avg_case_value < 1000 THEN 'Bajo valor promedio' END
    ], NULL)::text[] as risk_factors,
    days_since_activity::integer as last_activity_days
  FROM (
    SELECT 
      c.id,
      c.name,
      COALESCE(
        EXTRACT(DAY FROM (CURRENT_DATE - MAX(ca.updated_at)::date))::integer, 
        365
      ) as days_since_activity,
      COUNT(ca.id)::integer as total_cases,
      AVG(COALESCE(p.total_amount, 0))::numeric as avg_case_value
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

-- Recrear la función get_historical_revenue con sintaxis corregida
CREATE OR REPLACE FUNCTION public.get_historical_revenue(
  org_uuid uuid, 
  months_back integer DEFAULT 12
)
RETURNS TABLE(
  month_date date, 
  revenue numeric, 
  proposal_count integer, 
  conversion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      DATE_TRUNC('month', p.created_at)::date as month_date,
      COALESCE(SUM(CASE WHEN p.status = 'won' THEN p.total_amount ELSE 0 END), 0)::numeric as revenue,
      COUNT(*)::integer as proposal_count,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(CASE WHEN p.status = 'won' THEN 1 END)::numeric / COUNT(*)::numeric) * 100
        ELSE 0::numeric 
      END as conversion_rate
    FROM public.proposals p
    WHERE p.org_id = org_uuid 
      AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * months_back)
    GROUP BY DATE_TRUNC('month', p.created_at)::date
  )
  SELECT 
    md.month_date, 
    md.revenue, 
    md.proposal_count, 
    md.conversion_rate
  FROM monthly_data md
  ORDER BY md.month_date;
END;
$$;

-- Crear tabla workflow_rules si no existe
CREATE TABLE IF NOT EXISTS public.workflow_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  trigger_event character varying NOT NULL,
  conditions jsonb DEFAULT '[]'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en workflow_rules
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para workflow_rules
CREATE POLICY "Users can view workflow_rules from their org" ON public.workflow_rules
  FOR SELECT USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create workflow_rules in their org" ON public.workflow_rules
  FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update workflow_rules in their org" ON public.workflow_rules
  FOR UPDATE USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete workflow_rules from their org" ON public.workflow_rules
  FOR DELETE USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Crear función para obtener el org_id del usuario actual (si no existe)
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid();
$$;

-- Crear políticas más permisivas para analytics_metrics si existe conflicto
DROP POLICY IF EXISTS "Users can view analytics_metrics from their org" ON public.analytics_metrics;
DROP POLICY IF EXISTS "Users can create analytics_metrics in their org" ON public.analytics_metrics;

CREATE POLICY "Users can view analytics_metrics from their org" ON public.analytics_metrics
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create analytics_metrics in their org" ON public.analytics_metrics
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

-- Comentarios para documentar las funciones
COMMENT ON FUNCTION public.identify_churn_risk_clients(uuid) IS 
'Identifica clientes en riesgo de abandono basado en inactividad y métricas de valor';

COMMENT ON FUNCTION public.get_historical_revenue(uuid, integer) IS 
'Obtiene datos históricos de ingresos por mes para análisis de tendencias';
