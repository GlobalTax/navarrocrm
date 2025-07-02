-- Solucionar error de recursión infinita en user_roles - Versión corregida

-- 1. Eliminar TODAS las políticas existentes en user_roles para empezar limpio
DROP POLICY IF EXISTS "Bootstrap super admin creation when none exists" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can create other super admins" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create non-super-admin roles in their org" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles from their org" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view user roles from their org" ON public.user_roles;
DROP POLICY IF EXISTS "Org users can create non-super-admin roles" ON public.user_roles;

-- 2. Mejorar la función is_super_admin para evitar problemas RLS
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  -- Usar consulta directa sin RLS para evitar recursión
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
$$;

-- 3. Crear política bootstrap para permitir el primer super admin
CREATE POLICY "allow_bootstrap_super_admin" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    role = 'super_admin' 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
    )
  );

-- 4. Política para que super admins puedan gestionar todos los roles
CREATE POLICY "super_admins_manage_all_roles" 
  ON public.user_roles 
  FOR ALL
  USING (
    public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
  );

-- 5. Política para usuarios normales - solo ver roles de su org
CREATE POLICY "users_view_org_roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE org_id = get_user_org_id()
    )
  );