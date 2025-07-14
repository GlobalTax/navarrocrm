-- Corregir función sincronizar_cuentas_quantum con header API-KEY y estructura correcta
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