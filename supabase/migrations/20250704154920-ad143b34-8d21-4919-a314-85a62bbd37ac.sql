-- Corrección de seguridad: Arreglar search_path mutable en funciones

-- 1. Actualizar validate_person_company_relation
CREATE OR REPLACE FUNCTION public.validate_person_company_relation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- 2. Actualizar create_document_version
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- 3. Actualizar update_ai_notification_configs_updated_at
CREATE OR REPLACE FUNCTION public.update_ai_notification_configs_updated_at()
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

-- 4. Actualizar update_scheduled_reports_updated_at
CREATE OR REPLACE FUNCTION public.update_scheduled_reports_updated_at()
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

-- 5. Proteger materialized views - removerlas de la API
DROP MATERIALIZED VIEW IF EXISTS public.copia_empresas_hubspot CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.copia_contactos_hubspot CASCADE;

-- 6. Proteger foreign tables - removerlas de la API
-- Nota: Estas tablas HubSpot no deberían estar expuestas públicamente
DROP FOREIGN TABLE IF EXISTS public."Contacts hubspot" CASCADE;
DROP FOREIGN TABLE IF EXISTS public.hubspot_contacts CASCADE;  
DROP FOREIGN TABLE IF EXISTS public.hubspot_companies CASCADE;
DROP FOREIGN TABLE IF EXISTS public.hubspot_deals CASCADE;
DROP FOREIGN TABLE IF EXISTS public."CRM hubspot companies" CASCADE;

-- 7. Log de seguridad mejorado
COMMENT ON FUNCTION public.validate_person_company_relation() IS 'Función de validación con search_path seguro';
COMMENT ON FUNCTION public.create_document_version() IS 'Función de versionado con search_path seguro';
COMMENT ON FUNCTION public.update_ai_notification_configs_updated_at() IS 'Trigger de actualización con search_path seguro';
COMMENT ON FUNCTION public.update_scheduled_reports_updated_at() IS 'Trigger de actualización con search_path seguro';