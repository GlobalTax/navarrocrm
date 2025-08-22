-- PHASE 2: Additional Security Enhancements

-- Create comprehensive security event logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.analytics_events (
    org_id,
    user_id,
    session_id,
    event_type,
    event_name,
    page_url,
    event_data,
    timestamp
  ) VALUES (
    (SELECT org_id FROM public.users WHERE id = auth.uid()),
    auth.uid(),
    'security-audit',
    'security_event',
    event_type,
    '/security-audit',
    details,
    now()
  );
END;
$$;

-- Enhance user audit logging for role changes
CREATE OR REPLACE FUNCTION public.enhanced_log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
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

    -- Also log as security event
    PERFORM public.log_security_event(
      'role_change',
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Replace the existing role change trigger with enhanced version
DROP TRIGGER IF EXISTS log_role_change ON public.users;
CREATE TRIGGER enhanced_log_role_change
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_log_role_change();

-- Add security trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log access to organization data
  IF TG_TABLE_NAME = 'organizations' AND TG_OP = 'SELECT' THEN
    PERFORM public.log_security_event(
      'organization_access',
      jsonb_build_object(
        'organization_id', NEW.id,
        'access_type', 'read'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;