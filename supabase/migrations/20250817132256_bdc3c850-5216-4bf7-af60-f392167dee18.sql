-- =====================================
-- CRITICAL SECURITY FIXES - Phase 1 (Fixed)
-- =====================================

-- 1. Fix RLS policies for organizations table
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON public.organizations;

-- Only allow users to see their own organization
CREATE POLICY "Users can only view their own organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  id = (SELECT org_id FROM public.users WHERE id = auth.uid())
);

-- Only super admins can manage organizations
CREATE POLICY "Super admins can manage organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- 2. Fix RLS policies for workflow_templates table (handle existing policies)
DROP POLICY IF EXISTS "Authenticated users can view workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Users can view workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Users can view org workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Partners can manage org workflow templates" ON public.workflow_templates;

-- Restrict workflow templates to organization members only
CREATE POLICY "Users can view org workflow templates"
ON public.workflow_templates
FOR SELECT
TO authenticated
USING (
  org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Partners can manage org workflow templates"
ON public.workflow_templates
FOR ALL
TO authenticated
USING (
  org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('partner', 'area_manager')
  )
)
WITH CHECK (
  org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('partner', 'area_manager')
  )
);

-- 3. Create role validation function to prevent unauthorized role changes
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role TEXT;
  target_user_role TEXT;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();

  -- Get target user's current role
  SELECT role INTO target_user_role
  FROM public.users
  WHERE id = NEW.id;

  -- Prevent self-role escalation
  IF NEW.id = auth.uid() AND OLD.role != NEW.role THEN
    RAISE EXCEPTION 'Users cannot change their own role';
  END IF;

  -- Only partners and super admins can change roles
  IF current_user_role NOT IN ('partner') AND 
     NOT EXISTS (
       SELECT 1 FROM public.user_roles 
       WHERE user_id = auth.uid() AND role = 'super_admin'
     ) THEN
    RAISE EXCEPTION 'Insufficient permissions to change user roles';
  END IF;

  -- Partners cannot create other partners (only super admins can)
  IF NEW.role = 'partner' AND current_user_role != 'partner' AND
     NOT EXISTS (
       SELECT 1 FROM public.user_roles 
       WHERE user_id = auth.uid() AND role = 'super_admin'
     ) THEN
    RAISE EXCEPTION 'Only existing partners or super admins can create new partners';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. Create trigger for role validation
DROP TRIGGER IF EXISTS validate_user_role_changes ON public.users;
CREATE TRIGGER validate_user_role_changes
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_change();

-- 5. Create audit logging for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_role TEXT,
  new_role TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view org role change audit" ON public.role_change_audit;
DROP POLICY IF EXISTS "System can insert audit records" ON public.role_change_audit;

-- Only allow viewing audit logs for same organization
CREATE POLICY "Users can view org role change audit"
ON public.role_change_audit
FOR SELECT
TO authenticated
USING (
  org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
);

-- System can insert audit records
CREATE POLICY "System can insert audit records"
ON public.role_change_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role != NEW.role THEN
    INSERT INTO public.role_change_audit (
      org_id,
      target_user_id,
      changed_by,
      old_role,
      new_role,
      reason
    ) VALUES (
      NEW.org_id,
      NEW.id,
      auth.uid(),
      OLD.role,
      NEW.role,
      'Role changed via system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS log_user_role_changes ON public.users;
CREATE TRIGGER log_user_role_changes
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();