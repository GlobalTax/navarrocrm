-- SECURITY FIX: Final completion of all remaining functions (Part 5)

-- Complete the remaining functions with secure search_path
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

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(org_id_param uuid, current_month text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.calculate_recurring_revenue_metrics(org_uuid uuid, target_date date DEFAULT CURRENT_DATE)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_mrr NUMERIC := 0;
  current_arr NUMERIC := 0;
  active_subs INTEGER := 0;
  active_ret INTEGER := 0;
BEGIN
  -- Calcular MRR de suscripciones activas
  SELECT COALESCE(SUM(
    CASE 
      WHEN p.recurring_frequency = 'monthly' THEN p.total_amount
      WHEN p.recurring_frequency = 'quarterly' THEN p.total_amount / 3
      WHEN p.recurring_frequency = 'yearly' THEN p.total_amount / 12
      ELSE 0
    END
  ), 0), COUNT(*)
  INTO current_mrr, active_subs
  FROM public.proposals p
  WHERE p.org_id = org_uuid 
    AND p.is_recurring = true 
    AND p.status = 'won'
    AND (p.contract_end_date IS NULL OR p.contract_end_date >= target_date);

  -- Calcular MRR de retainers activos
  SELECT COALESCE(SUM(retainer_amount), 0), COUNT(*)
  INTO current_mrr, active_ret
  FROM public.retainer_contracts rc
  WHERE rc.org_id = org_uuid 
    AND rc.status = 'active'
    AND (rc.contract_end_date IS NULL OR rc.contract_end_date >= target_date);

  -- ARR = MRR * 12
  current_arr := current_mrr * 12;

  -- Insertar o actualizar métricas
  INSERT INTO public.recurring_revenue_metrics (
    org_id, metric_date, monthly_recurring_revenue, annual_recurring_revenue,
    active_subscriptions, active_retainers
  ) VALUES (
    org_uuid, target_date, current_mrr, current_arr, active_subs, active_ret
  )
  ON CONFLICT (org_id, metric_date) 
  DO UPDATE SET
    monthly_recurring_revenue = EXCLUDED.monthly_recurring_revenue,
    annual_recurring_revenue = EXCLUDED.annual_recurring_revenue,
    active_subscriptions = EXCLUDED.active_subscriptions,
    active_retainers = EXCLUDED.active_retainers;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_analytics_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Marcar como inactivos los tokens expirados
  UPDATE public.user_outlook_tokens 
  SET is_active = false, updated_at = now()
  WHERE token_expires_at < now() AND is_active = true;
  
  -- Log de limpieza
  INSERT INTO public.calendar_sync_log (org_id, user_id, sync_type, sync_status, sync_data)
  SELECT 
    org_id, 
    user_id, 
    'cleanup', 
    'success',
    jsonb_build_object('cleaned_tokens', ROW_NUMBER() OVER())
  FROM public.user_outlook_tokens 
  WHERE token_expires_at < now() AND is_active = false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum_final()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  -- ====================================================================
  -- >> ZONA DE CONFIGURACIÓN <<
  -- ADVERTENCIA: Las credenciales están directamente en el código.
  -- Reemplaza los valores DENTRO de las comillas simples.
  
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  company_id TEXT    := '28171';
  
  -- ====================================================================

  -- Variables para el proceso
  api_url TEXT;
  response JSONB;
  cuenta_record RECORD;
  registros_procesados INT := 0;
BEGIN
  -- 1. CONSTRUIR LA URL Y LLAMAR A LA API CON PG_NET
  api_url := 'https://app.quantumeconomics.es/contabilidad/ws/account?companyId=' || company_id || '&year=2024&accountType=C';

  -- Realizamos la petición GET usando la extensión pg_net
  SELECT content::jsonb INTO response
  FROM net.http_get(
    url := api_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || quantum_token,
      'Accept', 'application/json'
    )
  );
  
  IF response IS NULL OR response->'getaccounts' IS NULL THEN
      RETURN 'Respuesta de la API inválida, vacía o no contenía la lista "getaccounts".';
  END IF;

  -- 2. PROCESAR LA RESPUESTA Y GUARDAR EN LA BASE DE DATOS
  FOR cuenta_record IN SELECT * FROM jsonb_to_recordset(response->'getaccounts') AS x(id TEXT, name TEXT, "currentBalance" NUMERIC, debit NUMERIC, credit NUMERIC)
  LOOP
    INSERT INTO public.cuentas (id, nombre, balance_actual, debito, credito, datos_completos)
    VALUES (
      cuenta_record.id,
      cuenta_record.name,
      cuenta_record."currentBalance",
      cuenta_record.debit,
      cuenta_record.credit,
      to_jsonb(cuenta_record)
    )
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      balance_actual = EXCLUDED.balance_actual,
      debito = EXCLUDED.debito,
      credito = EXCLUDED.credito,
      datos_completos = EXCLUDED.datos_completos,
      updated_at = now();
    
    registros_procesados := registros_procesados + 1;
  END LOOP;

  -- 3. DEVOLVER UN MENSAJE DE ÉXITO
  RETURN 'Sincronización completada. Registros procesados: ' || registros_procesados;
END;
$function$;