
-- Eliminar la función existente primero
DROP FUNCTION IF EXISTS public.get_dashboard_stats(uuid, text);

-- Crear la nueva función optimizada que retorna JSON
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  org_id_param UUID,
  current_month TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  start_of_month TIMESTAMP;
  result JSON;
BEGIN
  -- Calcular inicio del mes actual
  IF current_month IS NOT NULL THEN
    start_of_month := TO_DATE(current_month || '-01', 'YYYY-MM-DD');
  ELSE
    start_of_month := DATE_TRUNC('month', CURRENT_DATE);
  END IF;
  
  -- Ejecutar consultas optimizadas en paralelo
  WITH 
    case_stats AS (
      SELECT 
        COUNT(*) as total_cases,
        COUNT(*) FILTER (WHERE status = 'open') as active_cases,
        COUNT(*) FILTER (WHERE created_at >= start_of_month) as this_month_cases
      FROM public.cases 
      WHERE org_id = org_id_param
    ),
    contact_stats AS (
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(*) FILTER (WHERE created_at >= start_of_month) as this_month_contacts
      FROM public.contacts 
      WHERE org_id = org_id_param
    ),
    time_stats AS (
      SELECT 
        COUNT(*) as total_time_entries,
        COALESCE(SUM(duration_minutes) FILTER (WHERE is_billable = true) / 60.0, 0) as total_billable_hours,
        COALESCE(SUM(duration_minutes) FILTER (WHERE is_billable = false) / 60.0, 0) as total_non_billable_hours,
        COALESCE(SUM(duration_minutes) FILTER (WHERE created_at >= start_of_month) / 60.0, 0) as this_month_hours
      FROM public.time_entries 
      WHERE org_id = org_id_param
    )
  SELECT 
    json_build_object(
      'totalCases', cs.total_cases,
      'activeCases', cs.active_cases,
      'totalContacts', cos.total_contacts,
      'totalTimeEntries', ts.total_time_entries,
      'totalBillableHours', ROUND(ts.total_billable_hours::numeric, 2),
      'totalNonBillableHours', ROUND(ts.total_non_billable_hours::numeric, 2),
      'thisMonthCases', cs.this_month_cases,
      'thisMonthContacts', cos.this_month_contacts,
      'thisMonthHours', ROUND(ts.this_month_hours::numeric, 2)
    ) INTO result
  FROM case_stats cs, contact_stats cos, time_stats ts;
  
  RETURN result;
END;
$$;

-- Crear índices para optimizar las consultas del dashboard
CREATE INDEX IF NOT EXISTS idx_cases_org_status ON public.cases(org_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_org_created ON public.cases(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_org_created ON public.contacts(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_time_entries_org_billable ON public.time_entries(org_id, is_billable);
CREATE INDEX IF NOT EXISTS idx_time_entries_org_created ON public.time_entries(org_id, created_at);

-- Comentario para documentar la función
COMMENT ON FUNCTION public.get_dashboard_stats(UUID, TEXT) IS 
'Función optimizada para obtener estadísticas del dashboard. 
Parámetros:
- org_id_param: ID de la organización
- current_month: Mes en formato YYYY-MM (opcional)

Retorna estadísticas incluyendo casos, contactos y tiempo registrado en formato JSON.
Incluye índices optimizados para mejorar el rendimiento de las consultas.';
