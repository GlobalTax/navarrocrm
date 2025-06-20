
-- Paso 1: Eliminar todas las políticas RLS problemáticas de la tabla users
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Paso 2: Eliminar políticas problemáticas de organizations
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;

-- Paso 3: Crear función de seguridad definer para evitar recursión
CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT org_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 4: Crear función para verificar si el sistema está configurado
CREATE OR REPLACE FUNCTION public.is_system_setup()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.organizations LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 5: Recrear políticas RLS sin recursión para users
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política especial para permitir inserts durante el setup inicial
CREATE POLICY "Allow insert during setup" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Paso 6: Recrear políticas para organizations usando la función de seguridad
CREATE POLICY "Users can view their organization" 
  ON public.organizations 
  FOR SELECT 
  USING (id = public.get_current_user_org());

-- Política especial para permitir operaciones durante el setup inicial
CREATE POLICY "Allow operations during setup" 
  ON public.organizations 
  FOR ALL 
  USING (NOT public.is_system_setup() OR id = public.get_current_user_org())
  WITH CHECK (NOT public.is_system_setup() OR id = public.get_current_user_org());

-- Paso 7: Recrear políticas para clients usando la función de seguridad
DROP POLICY IF EXISTS "Users can view clients from their org" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients in their org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in their org" ON public.clients;

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

-- Paso 8: Recrear políticas para cases usando la función de seguridad
DROP POLICY IF EXISTS "Users can view cases from their org" ON public.cases;
DROP POLICY IF EXISTS "Users can insert cases in their org" ON public.cases;
DROP POLICY IF EXISTS "Users can update cases in their org" ON public.cases;

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

-- Paso 9: Recrear políticas para time_entries usando la función de seguridad
DROP POLICY IF EXISTS "Users can view time entries from their org" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert time entries in their org" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update time entries in their org" ON public.time_entries;

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
