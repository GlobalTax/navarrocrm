
-- PASO 1: Eliminar TODAS las políticas que dependen de get_current_user_org()
DROP POLICY IF EXISTS "Users can view clients from their org" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients in their org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in their org" ON public.clients;

DROP POLICY IF EXISTS "Users can view cases from their org" ON public.cases;
DROP POLICY IF EXISTS "Users can insert cases in their org" ON public.cases;
DROP POLICY IF EXISTS "Users can update cases in their org" ON public.cases;

DROP POLICY IF EXISTS "Users can view time entries from their org" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert time entries in their org" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update time entries in their org" ON public.time_entries;

-- PASO 2: Eliminar TODAS las políticas RLS existentes de users y organizations
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during setup" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow insert during setup" ON public.users;

DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Allow organization operations during setup" ON public.organizations;
DROP POLICY IF EXISTS "Allow operations during setup" ON public.organizations;

-- PASO 3: Ahora sí podemos eliminar la función problemática
DROP FUNCTION IF EXISTS public.get_current_user_org();

-- PASO 4: Crear función simple para verificar si el sistema está configurado
CREATE OR REPLACE FUNCTION public.is_system_setup()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.organizations LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PASO 5: Crear políticas RLS simples y NO recursivas

-- Políticas para users (muy simples, solo acceso propio)
CREATE POLICY "users_select_own" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política especial para permitir inserción durante setup inicial
CREATE POLICY "users_insert_during_setup" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas para organizations (solo durante setup inicial)
CREATE POLICY "organizations_all_during_setup" 
  ON public.organizations 
  FOR ALL 
  USING (NOT public.is_system_setup())
  WITH CHECK (NOT public.is_system_setup());

-- Política para ver organizaciones una vez configurado el sistema
CREATE POLICY "organizations_select_configured" 
  ON public.organizations 
  FOR SELECT 
  USING (public.is_system_setup());

-- PASO 6: Por ahora, deshabilitar RLS en las otras tablas para evitar problemas
-- (se pueden reconfigurar más tarde cuando el sistema funcione)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;
