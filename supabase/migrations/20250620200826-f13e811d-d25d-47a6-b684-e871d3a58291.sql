
-- Verificar y recrear la función is_system_setup si es necesario
CREATE OR REPLACE FUNCTION public.is_system_setup()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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

-- Asegurar que la tabla organizations tiene RLS habilitado y políticas correctas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can create organizations" ON public.organizations;

-- Crear políticas más permisivas para organizations (necesarias para el setup)
CREATE POLICY "Enable read access for all users" ON public.organizations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.organizations
    FOR INSERT WITH CHECK (true);

-- Asegurar que la tabla users tiene políticas correctas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Crear políticas para users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
