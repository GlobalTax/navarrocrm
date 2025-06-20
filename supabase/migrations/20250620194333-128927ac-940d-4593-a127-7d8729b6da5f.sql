
-- Paso 1: Eliminar TODAS las políticas RLS existentes primero (en el orden correcto)
-- Eliminar políticas de tablas que dependen de las funciones
DROP POLICY IF EXISTS "Users can view clients from their org" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients in their org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in their org" ON public.clients;

DROP POLICY IF EXISTS "Users can view cases from their org" ON public.cases;
DROP POLICY IF EXISTS "Users can insert cases in their org" ON public.cases;
DROP POLICY IF EXISTS "Users can update cases in their org" ON public.cases;

DROP POLICY IF EXISTS "Users can view time entries from their org" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert time entries in their org" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update time entries in their org" ON public.time_entries;

-- Ahora eliminar políticas de users y organizations
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow insert during setup" ON public.users;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Allow operations during setup" ON public.organizations;

-- Paso 2: Ahora sí podemos eliminar las funciones
DROP FUNCTION IF EXISTS public.get_current_user_org();
DROP FUNCTION IF EXISTS public.is_system_setup();

-- Paso 3: Recrear las funciones de seguridad definer
CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT org_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_system_setup()
RETURNS boolean AS $$
BEGIN
  -- Verificar si existe al menos una organización
  RETURN EXISTS (SELECT 1 FROM public.organizations LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 4: Crear políticas RLS simples y no recursivas

-- Políticas para users (solo las esenciales)
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política especial para permitir inserción durante setup inicial
CREATE POLICY "Allow user creation during setup" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas para organizations (solo las esenciales)
CREATE POLICY "Users can view own organization" 
  ON public.organizations 
  FOR SELECT 
  USING (
    -- Permitir acceso si el sistema no está configurado O si es la org del usuario
    NOT public.is_system_setup() OR 
    id = public.get_current_user_org()
  );

CREATE POLICY "Allow organization operations during setup" 
  ON public.organizations 
  FOR ALL 
  USING (NOT public.is_system_setup())
  WITH CHECK (NOT public.is_system_setup());

-- Paso 5: Recrear políticas para las otras tablas usando la función de seguridad
CREATE POLICY "Users can view clients from their org" 
  ON public.clients 
  FOR SELECT 
  USING (org_id = public.get_current_user_org());

CREATE POLICY "Users can insert clients in their org" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (org_id = public.get_current_user_org());

CREATE POLICY "Users can update clients in their org" 
  ON public.clients 
  FOR UPDATE 
  USING (org_id = public.get_current_user_org());

CREATE POLICY "Users can view cases from their org" 
  ON public.cases 
  FOR SELECT 
  USING (org_id = public.get_current_user_org());

CREATE POLICY "Users can insert cases in their org" 
  ON public.cases 
  FOR INSERT 
  WITH CHECK (org_id = public.get_current_user_org());

CREATE POLICY "Users can update cases in their org" 
  ON public.cases 
  FOR UPDATE 
  USING (org_id = public.get_current_user_org());

CREATE POLICY "Users can view time entries from their org" 
  ON public.time_entries 
  FOR SELECT 
  USING (org_id = public.get_current_user_org());

CREATE POLICY "Users can insert time entries in their org" 
  ON public.time_entries 
  FOR INSERT 
  WITH CHECK (org_id = public.get_current_user_org());

CREATE POLICY "Users can update time entries in their org" 
  ON public.time_entries 
  FOR UPDATE 
  USING (org_id = public.get_current_user_org());
