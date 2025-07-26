-- 1. LIMPIAR DUPLICADOS EXISTENTES
-- Crear tabla temporal con empresas únicas (mantenemos el más reciente)
CREATE TEMP TABLE contacts_unique AS
SELECT DISTINCT ON (quantum_customer_id, org_id) 
  id, quantum_customer_id, org_id, name, created_at
FROM contacts 
WHERE client_type = 'empresa' 
  AND quantum_customer_id IS NOT NULL
ORDER BY quantum_customer_id, org_id, created_at DESC;

-- Eliminar todos los registros duplicados excepto los únicos
DELETE FROM contacts 
WHERE client_type = 'empresa' 
  AND quantum_customer_id IS NOT NULL 
  AND id NOT IN (SELECT id FROM contacts_unique);

-- 2. CREAR CONSTRAINT ÚNICO PARA PREVENIR FUTUROS DUPLICADOS
-- Primero eliminar el constraint existente si existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'contacts_quantum_customer_org_unique'
  ) THEN
    ALTER TABLE contacts DROP CONSTRAINT contacts_quantum_customer_org_unique;
  END IF;
END $$;

-- Crear el constraint único mejorado
ALTER TABLE contacts 
ADD CONSTRAINT contacts_quantum_customer_org_unique 
UNIQUE (quantum_customer_id, org_id);

-- 3. MEJORAR LA FUNCIÓN DE SINCRONIZACIÓN QUANTUM
CREATE OR REPLACE FUNCTION public.sync_quantum_customers_safe()
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
  customer_record RECORD;
  registros_procesados INT := 0;
  registros_actualizados INT := 0;
  registros_nuevos INT := 0;
  registros_omitidos INT := 0;
  errores TEXT[] := '{}';
  default_org_id UUID;
BEGIN
  -- Obtener credenciales
  SELECT secret INTO quantum_token FROM vault.secrets WHERE name = 'quantum_api_token' LIMIT 1;
  SELECT secret INTO company_id FROM vault.secrets WHERE name = 'quantum_company_id' LIMIT 1;

  IF quantum_token IS NULL OR company_id IS NULL THEN
    RETURN 'Error: Credenciales de Quantum no configuradas';
  END IF;

  -- Obtener org_id por defecto
  SELECT org_id INTO default_org_id FROM public.users LIMIT 1;
  IF default_org_id IS NULL THEN
    RETURN 'Error: No se pudo determinar la organización';
  END IF;

  -- Llamar a la API
  api_url := 'https://app.quantumeconomics.es/contabilidad/ws/customers?companyId=' || company_id;
  
  SELECT content::jsonb INTO response
  FROM net.http_get(
    url := api_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || quantum_token,
      'Accept', 'application/json'
    )
  );

  -- Procesar respuesta
  IF response IS NULL OR (response->'customers' IS NULL AND response->'getCustomers' IS NULL) THEN
    RETURN 'Error: Respuesta inválida de la API de Quantum';
  END IF;

  -- Obtener lista de clientes
  FOR customer_record IN 
    SELECT * FROM jsonb_to_recordset(COALESCE(response->'customers', response->'getCustomers')) 
    AS x(id TEXT, name TEXT, email TEXT, phone TEXT, address TEXT, nif TEXT, sector TEXT)
  LOOP
    -- Validar datos mínimos
    IF customer_record.id IS NULL OR customer_record.name IS NULL OR trim(customer_record.name) = '' THEN
      registros_omitidos := registros_omitidos + 1;
      errores := array_append(errores, 'Cliente omitido - datos incompletos: ' || COALESCE(customer_record.id, 'SIN_ID'));
      CONTINUE;
    END IF;

    BEGIN
      -- Intentar insertar o actualizar con manejo seguro de duplicados
      INSERT INTO public.contacts (
        quantum_customer_id, name, email, phone, address_street, 
        dni_nif, business_sector, client_type, source, 
        relationship_type, status, org_id, created_at, updated_at
      ) VALUES (
        customer_record.id,
        trim(customer_record.name),
        NULLIF(trim(customer_record.email), ''),
        NULLIF(trim(customer_record.phone), ''),
        NULLIF(trim(customer_record.address), ''),
        NULLIF(trim(customer_record.nif), ''),
        NULLIF(trim(customer_record.sector), ''),
        'empresa',
        'quantum_auto',
        'cliente',
        'activo',
        default_org_id,
        now(),
        now()
      ) 
      ON CONFLICT (quantum_customer_id, org_id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address_street = EXCLUDED.address_street,
        dni_nif = EXCLUDED.dni_nif,
        business_sector = EXCLUDED.business_sector,
        updated_at = now();

      -- Verificar si fue inserción o actualización
      IF FOUND THEN
        registros_actualizados := registros_actualizados + 1;
      ELSE
        registros_nuevos := registros_nuevos + 1;
      END IF;
      
      registros_procesados := registros_procesados + 1;
      
    EXCEPTION WHEN OTHERS THEN
      registros_omitidos := registros_omitidos + 1;
      errores := array_append(errores, 'Error procesando ' || customer_record.id || ': ' || SQLERRM);
    END;
  END LOOP;

  -- Verificación final de duplicados
  PERFORM 1 FROM contacts 
  WHERE quantum_customer_id IS NOT NULL 
    AND client_type = 'empresa' 
    AND org_id = default_org_id
  GROUP BY quantum_customer_id, org_id 
  HAVING COUNT(*) > 1 
  LIMIT 1;

  IF FOUND THEN
    RETURN 'ADVERTENCIA: Se detectaron duplicados después de la sincronización. Procesados: ' || 
           registros_procesados || ', Nuevos: ' || registros_nuevos || 
           ', Actualizados: ' || registros_actualizados || ', Omitidos: ' || registros_omitidos;
  END IF;

  RETURN 'Sincronización exitosa. Procesados: ' || registros_procesados || 
         ', Nuevos: ' || registros_nuevos || ', Actualizados: ' || registros_actualizados || 
         ', Omitidos: ' || registros_omitidos || CASE WHEN array_length(errores, 1) > 0 THEN ', Errores: ' || array_length(errores, 1) ELSE '' END;
END;
$function$;