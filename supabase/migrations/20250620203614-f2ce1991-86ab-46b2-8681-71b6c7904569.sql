
-- Corregir las funciones para incluir SET search_path = '' como medida de seguridad
-- Esto previene ataques de manipulación del search path

-- Actualizar función is_system_setup
CREATE OR REPLACE FUNCTION public.is_system_setup()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Verificar si existe al menos una organización
  RETURN EXISTS (SELECT 1 FROM public.organizations LIMIT 1);
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, devolver false
    RETURN false;
END;
$function$;

-- Actualizar función get_user_org_id
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN (SELECT org_id FROM public.users WHERE id = auth.uid());
END;
$function$;
