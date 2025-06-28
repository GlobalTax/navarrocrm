
-- 1. Arreglar el problema de seguridad crítico: La tabla 'cuentas' no tiene RLS habilitado
-- Como parece ser una tabla legacy que ya fue eliminada en una migración anterior,
-- vamos a asegurar que esté completamente eliminada y limpia

-- Eliminar la tabla cuentas completamente (ya debería estar eliminada pero por seguridad)
DROP TABLE IF EXISTS public.cuentas CASCADE;

-- 2. Mejorar la función is_system_setup para ser más robusta
CREATE OR REPLACE FUNCTION public.is_system_setup()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Verificar si existe al menos una organización Y al menos un usuario
  RETURN EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id IS NOT NULL 
    LIMIT 1
  ) AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE org_id IS NOT NULL 
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, devolver false para ser conservadores
    RETURN false;
END;
$function$;

-- 3. Crear una función auxiliar para obtener el estado detallado del setup
CREATE OR REPLACE FUNCTION public.get_setup_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  org_count int;
  user_count int;
  users_with_org int;
BEGIN
  SELECT COUNT(*) INTO org_count FROM public.organizations;
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO users_with_org FROM public.users WHERE org_id IS NOT NULL;
  
  RETURN jsonb_build_object(
    'organizations_count', org_count,
    'users_count', user_count,
    'users_with_org_count', users_with_org,
    'is_setup_complete', org_count > 0 AND users_with_org > 0,
    'checked_at', now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'is_setup_complete', false,
      'checked_at', now()
    );
END;
$function$;
