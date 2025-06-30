
-- Corregir funciones con search_path mutable para prevenir ataques de manipulación del search path

-- 1. Corregir función sincronizar_cuentas_quantum
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT;
  company_id TEXT;
  api_url TEXT;
  response JSONB;
  cuenta_record RECORD;
  registros_insertados INT := 0;
BEGIN
  -- 1. OBTENER SECRETOS DEL VAULT (USANDO LA FUNCIÓN CORRECTA: vault.secret_get)
  SELECT vault.secret_get('quantum_api_token'::text) INTO quantum_token;
  SELECT vault.secret_get('quantum_company_id'::text) INTO company_id;

  -- Comprobación de si los secretos existen.
  IF quantum_token IS NULL OR company_id IS NULL THEN
    RETURN 'Error: No se encontraron los secretos en Supabase Vault. Asegúrate de que los nombres "quantum_api_token" y "quantum_company_id" son correctos y existen en el Vault.';
  END IF;

  -- 2. CONSTRUIR LA URL Y LLAMAR A LA API CON PG_NET
  api_url := 'https://app.quantumeconomics.es/contabilidad/ws/account?companyId=' || company_id || '&year=2024&accountType=C';

  SELECT content::jsonb INTO response
  FROM net.http_get(
    url := api_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || quantum_token,
      'Accept', 'application/json'
    )
  );

  -- Si la respuesta de la API no contiene la lista de cuentas, salimos para evitar errores.
  IF response->'getaccounts' IS NULL THEN
      RETURN 'La respuesta de la API no contiene la lista de cuentas ("getaccounts"). Respuesta recibida: ' || response;
  END IF;

  -- 3. PROCESAR LA RESPUESTA Y GUARDAR EN LA BASE DE DATOS
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
    
    registros_insertados := registros_insertados + 1;
  END LOOP;

  -- 4. DEVOLVER UN MENSAJE DE ÉXITO
  RETURN 'Sincronización completada. Registros procesados: ' || registros_insertados;
END;
$function$;

-- 2. Corregir función sincronizar_cuentas_quantum_final
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum_final()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- 3. Corregir función update_service_catalog_updated_at
CREATE OR REPLACE FUNCTION public.update_service_catalog_updated_at()
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

-- 4. Proteger vistas materializadas revocando acceso público
-- Revocar acceso anónimo a las vistas materializadas de HubSpot
REVOKE SELECT ON public.copia_empresas_hubspot FROM anon;
REVOKE SELECT ON public.copia_contactos_hubspot FROM anon;

-- Solo permitir acceso a usuarios autenticados con permisos específicos
GRANT SELECT ON public.copia_empresas_hubspot TO authenticated;
GRANT SELECT ON public.copia_contactos_hubspot TO authenticated;

-- 5. Proteger tablas foráneas de HubSpot revocando acceso público
-- Revocar acceso anónimo a las tablas foráneas
REVOKE SELECT ON public."Contacts hubspot" FROM anon;
REVOKE SELECT ON public.hubspot_contacts FROM anon;
REVOKE SELECT ON public.hubspot_companies FROM anon;
REVOKE SELECT ON public.hubspot_deals FROM anon;
REVOKE SELECT ON public."CRM hubspot companies" FROM anon;

-- Solo permitir acceso a usuarios autenticados
GRANT SELECT ON public."Contacts hubspot" TO authenticated;
GRANT SELECT ON public.hubspot_contacts TO authenticated;
GRANT SELECT ON public.hubspot_companies TO authenticated;
GRANT SELECT ON public.hubspot_deals TO authenticated;
GRANT SELECT ON public."CRM hubspot companies" TO authenticated;
