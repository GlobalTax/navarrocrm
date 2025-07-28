-- SECURITY FIX: Final batch of database functions (Part 4)

-- Fix remaining functions with secure search_path
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  quantum_token TEXT;
  company_id TEXT;
  api_url TEXT;
  response JSONB;
  cuenta_record RECORD;
  registros_procesados INT := 0;
BEGIN
  -- 1. OBTENER SECRETOS DEL VAULT usando consulta directa
  SELECT secret INTO quantum_token
  FROM vault.secrets 
  WHERE name = 'quantum_api_token' 
  LIMIT 1;
  
  SELECT secret INTO company_id
  FROM vault.secrets 
  WHERE name = 'quantum_company_id' 
  LIMIT 1;

  -- Verificar que los secretos existen
  IF quantum_token IS NULL OR company_id IS NULL THEN
    RETURN 'Error: No se encontraron los secretos en Supabase Vault. Asegúrate de que "quantum_api_token" y "quantum_company_id" estén configurados correctamente.';
  END IF;

  -- 2. CONSTRUIR LA URL Y LLAMAR A LA API CON PG_NET
  api_url := 'https://app.quantumeconomics.es/contabilidad/ws/account?companyId=' || company_id || '&year=2024&accountType=C';

  -- CAMBIO CRÍTICO: Usar API-KEY en lugar de Bearer
  SELECT content::jsonb INTO response
  FROM net.http_get(
    url := api_url,
    headers := jsonb_build_object(
      'Authorization', 'API-KEY ' || quantum_token,
      'Accept', 'application/json'
    )
  );

  -- Verificar respuesta válida
  IF response IS NULL THEN
    RETURN 'Error: Respuesta nula de la API de Quantum. Verifique las credenciales y la conectividad.';
  END IF;

  -- CAMBIO: Procesar 'accounts' directamente, no 'getaccounts'
  IF response->'accounts' IS NULL THEN
    RETURN 'Error: Respuesta inválida de la API de Quantum. Respuesta recibida: ' || response::text;
  END IF;

  -- 3. PROCESAR LA RESPUESTA Y GUARDAR EN LA BASE DE DATOS
  FOR cuenta_record IN 
    SELECT * FROM jsonb_to_recordset(response->'accounts') 
    AS x(id TEXT, name TEXT, "currentBalance" NUMERIC, debit NUMERIC, credit NUMERIC)
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

  -- 4. DEVOLVER MENSAJE DE ÉXITO
  RETURN 'Sincronización completada exitosamente. Registros procesados: ' || registros_procesados;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_service_catalog_updated_at()
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

CREATE OR REPLACE FUNCTION public.create_document_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Solo crear versión si el contenido cambió
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.variables_data IS DISTINCT FROM NEW.variables_data THEN
    -- Actualizar número de versión
    NEW.version_number := COALESCE(OLD.version_number, 0) + 1;
    
    -- Insertar nueva versión en el historial
    INSERT INTO public.document_versions (
      document_id, version_number, content, variables_data, 
      created_by, org_id, changes_summary
    ) VALUES (
      NEW.id, NEW.version_number, NEW.content, NEW.variables_data,
      auth.uid(), NEW.org_id, 'Versión actualizada automáticamente'
    );
    
    -- Registrar actividad
    INSERT INTO public.document_activities (
      document_id, user_id, action_type, details, org_id
    ) VALUES (
      NEW.id, auth.uid(), 'version_created', 
      jsonb_build_object('version_number', NEW.version_number), NEW.org_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_person_company_relation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Una empresa no puede estar vinculada a otra empresa
  IF NEW.client_type = 'empresa' AND NEW.company_id IS NOT NULL THEN
    RAISE EXCEPTION 'Una empresa no puede estar vinculada a otra empresa';
  END IF;
  
  -- Solo personas físicas pueden tener company_id
  IF NEW.client_type != 'empresa' AND NEW.company_id IS NOT NULL THEN
    -- Verificar que company_id apunta a una empresa válida
    IF NOT EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = NEW.company_id 
      AND client_type = 'empresa' 
      AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'La empresa especificada no existe o no es válida';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_revenue_metrics(org_uuid uuid, target_date date DEFAULT CURRENT_DATE)
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