-- CRITICAL SECURITY FIXES - Phase 1: Data Exposure

-- 1. Remove dangerous public access policy from organizations table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.organizations;

-- Organizations table: users can only view their own organization (org_id from users matches organizations.id)
DROP POLICY IF EXISTS "Users can only view their own organization" ON public.organizations;
CREATE POLICY "Users can only view their own organization" 
ON public.organizations 
FOR SELECT 
USING (id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Partners can manage organizations  
DROP POLICY IF EXISTS "Partners can manage organizations" ON public.organizations;
CREATE POLICY "Partners can manage organizations" 
ON public.organizations 
FOR ALL 
USING ((SELECT role FROM public.users WHERE id = auth.uid() AND org_id = organizations.id) = 'partner')
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid() AND org_id = organizations.id) = 'partner');

-- 2. Secure workflow_templates table - remove any public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.workflow_templates;
DROP POLICY IF EXISTS "Public read access" ON public.workflow_templates;

-- Workflow templates: only org members can access
DROP POLICY IF EXISTS "Users can view org workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Users can manage org workflow templates" ON public.workflow_templates;

CREATE POLICY "Users can view org workflow templates" 
ON public.workflow_templates 
FOR SELECT 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage org workflow templates" 
ON public.workflow_templates 
FOR ALL 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()))
WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- 3. Secure quantum_sync_history table - this appears to be a system table without org_id
-- Only partners and super admins should access sync history
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quantum_sync_history;
DROP POLICY IF EXISTS "Public read access" ON public.quantum_sync_history;
DROP POLICY IF EXISTS "Only partners can view sync history" ON public.quantum_sync_history;

CREATE POLICY "Only partners can view sync history" 
ON public.quantum_sync_history 
FOR SELECT 
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'partner' OR is_super_admin());

-- 4. Ensure RLS is enabled on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;