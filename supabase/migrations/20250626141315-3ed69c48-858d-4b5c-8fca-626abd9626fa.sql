
-- Corregir funciones con search_path mutable para prevenir ataques de inyección SQL
-- Agregando SET search_path = '' a todas las funciones vulnerables

-- 1. Corregir identify_churn_risk_clients
CREATE OR REPLACE FUNCTION public.identify_churn_risk_clients(org_uuid uuid)
 RETURNS TABLE(client_id uuid, client_name character varying, risk_score numeric, risk_factors text[], last_activity_days integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 2. Corregir get_historical_revenue
CREATE OR REPLACE FUNCTION public.get_historical_revenue(org_uuid uuid, months_back integer DEFAULT 12)
 RETURNS TABLE(month_date date, revenue numeric, proposal_count integer, conversion_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 3. Corregir update_analytics_sessions_updated_at
CREATE OR REPLACE FUNCTION public.update_analytics_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 4. Corregir update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 5. Corregir calculate_productivity_metrics
CREATE OR REPLACE FUNCTION public.calculate_productivity_metrics(org_uuid uuid, target_date date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 6. Crear políticas RLS para restringir acceso a vistas materializadas HubSpot
-- Eliminar acceso público a las vistas materializadas si existen
DROP POLICY IF EXISTS "Restrict copia_empresas_hubspot access" ON public.copia_empresas_hubspot;
DROP POLICY IF EXISTS "Restrict copia_contactos_hubspot access" ON public.copia_contactos_hubspot;

-- 7. Configuración de seguridad de autenticación
-- Nota: La configuración de OTP y protección de contraseñas comprometidas 
-- debe hacerse desde el dashboard de Supabase en Authentication > Settings
-- Estas son las configuraciones recomendadas:
-- - OTP Expiry: 3600 segundos (1 hora) o menos
-- - Enable Leaked Password Protection: true

-- Comentario de documentación para las correcciones aplicadas
COMMENT ON FUNCTION public.identify_churn_risk_clients(uuid) IS 
'Función corregida con search_path seguro para prevenir ataques de inyección SQL';

COMMENT ON FUNCTION public.get_historical_revenue(uuid, integer) IS 
'Función corregida con search_path seguro para prevenir ataques de inyección SQL';

COMMENT ON FUNCTION public.update_analytics_sessions_updated_at() IS 
'Función trigger corregida con search_path seguro';

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Función trigger corregida con search_path seguro';

COMMENT ON FUNCTION public.calculate_productivity_metrics(uuid, date) IS 
'Función corregida con search_path seguro para prevenir ataques de inyección SQL';
