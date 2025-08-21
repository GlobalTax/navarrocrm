-- CRITICAL SECURITY FIXES - Phase 1: Data Exposure

-- 1. Remove dangerous public access policy from organizations table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.organizations;

-- 2. Ensure organizations table has proper RLS policies
-- Keep only the secure policies that restrict access to org members
CREATE POLICY IF NOT EXISTS "Users can only view their own organization" 
ON public.organizations 
FOR SELECT 
USING (id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- 3. Secure workflow_templates table - remove any public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.workflow_templates;
DROP POLICY IF EXISTS "Public read access" ON public.workflow_templates;

-- Ensure workflow_templates has proper org-scoped RLS
CREATE POLICY IF NOT EXISTS "Users can view org workflow templates" 
ON public.workflow_templates 
FOR SELECT 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Users can manage org workflow templates" 
ON public.workflow_templates 
FOR ALL 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()))
WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- 4. Secure quantum_sync_history table - remove public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quantum_sync_history;
DROP POLICY IF EXISTS "Public read access" ON public.quantum_sync_history;

-- Ensure quantum_sync_history has proper org-scoped RLS
CREATE POLICY IF NOT EXISTS "Users can view org quantum sync history" 
ON public.quantum_sync_history 
FOR SELECT 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- 5. Security audit - ensure all sensitive tables have RLS enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;

-- 6. Add security event logging function for critical operations
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