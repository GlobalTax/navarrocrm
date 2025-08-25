-- Fix critical security issues

-- 1. Add missing RLS policy for users table (organization-scoped access)
CREATE POLICY "Users can view users from their org" 
ON public.users 
FOR SELECT 
USING (org_id = get_user_org_id());

-- 2. Remove public access from organizations table
DROP POLICY IF EXISTS "Public access to organizations" ON public.organizations;
CREATE POLICY "Users can view their own organization" 
ON public.organizations 
FOR SELECT 
USING (id = get_user_org_id());

-- 3. Remove public access from workflow_templates table  
DROP POLICY IF EXISTS "Anyone can view workflow templates" ON public.workflow_templates;
CREATE POLICY "Users can view workflow templates from their org" 
ON public.workflow_templates 
FOR SELECT 
USING (org_id = get_user_org_id());

-- 4. Ensure users can manage workflow templates in their org
CREATE POLICY "Users can manage workflow templates in their org" 
ON public.workflow_templates 
FOR ALL 
USING (org_id = get_user_org_id())
WITH CHECK (org_id = get_user_org_id());