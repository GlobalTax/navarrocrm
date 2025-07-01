
-- Crear una política de bootstrap para permitir la creación del primer super admin
-- cuando no existe ningún super admin en el sistema
CREATE POLICY "Bootstrap super admin creation when none exists" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    role = 'super_admin' 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
    )
  );

-- También necesitamos una política para que los super admins existentes puedan crear más
CREATE POLICY "Super admins can create other super admins" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    role = 'super_admin' 
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Política general para que los usuarios puedan insertar roles en su organización
-- (excluyendo super_admin que tiene sus propias políticas)
CREATE POLICY "Users can create non-super-admin roles in their org" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    role != 'super_admin' 
    AND user_id IN (
      SELECT id FROM public.users WHERE org_id = get_user_org_id()
    )
  );

-- Política para que los usuarios puedan ver roles de su organización
CREATE POLICY "Users can view roles from their org" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE org_id = get_user_org_id()
    )
  );
