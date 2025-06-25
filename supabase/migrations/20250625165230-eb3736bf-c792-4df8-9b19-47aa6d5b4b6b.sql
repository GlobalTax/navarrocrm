
-- Crear función RPC optimizada para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  org_id_param UUID,
  current_month TEXT DEFAULT NULL
)
RETURNS TABLE(
  total_cases INTEGER,
  active_cases INTEGER,
  total_contacts INTEGER,
  total_time_entries INTEGER,
  total_billable_hours NUMERIC,
  total_non_billable_hours NUMERIC,
  this_month_cases INTEGER,
  this_month_contacts INTEGER,
  this_month_hours NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  month_start TIMESTAMP;
BEGIN
  -- Calcular inicio del mes actual
  IF current_month IS NOT NULL THEN
    month_start := (current_month || '-01')::DATE;
  ELSE
    month_start := DATE_TRUNC('month', CURRENT_DATE);
  END IF;

  RETURN QUERY
  WITH case_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'open') as active,
      COUNT(*) FILTER (WHERE created_at >= month_start) as this_month
    FROM public.cases 
    WHERE org_id = org_id_param
  ),
  contact_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= month_start) as this_month
    FROM public.contacts 
    WHERE org_id = org_id_param
  ),
  time_stats AS (
    SELECT 
      COUNT(*) as total_entries,
      SUM(duration_minutes / 60.0) FILTER (WHERE is_billable = true) as billable_hours,
      SUM(duration_minutes / 60.0) FILTER (WHERE is_billable = false) as non_billable_hours,
      SUM(duration_minutes / 60.0) FILTER (WHERE created_at >= month_start) as month_hours
    FROM public.time_entries 
    WHERE org_id = org_id_param
  )
  SELECT 
    cs.total::INTEGER,
    cs.active::INTEGER,
    cont.total::INTEGER,
    ts.total_entries::INTEGER,
    COALESCE(ts.billable_hours, 0)::NUMERIC,
    COALESCE(ts.non_billable_hours, 0)::NUMERIC,
    cs.this_month::INTEGER,
    cont.this_month::INTEGER,
    COALESCE(ts.month_hours, 0)::NUMERIC
  FROM case_stats cs, contact_stats cont, time_stats ts;
END;
$function$;
