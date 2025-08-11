-- Harden RLS policies based on actual schema

-- 1) Organizations: restrict to user’s own org (or super_admin)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org members can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org members can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org members can delete organizations" ON public.organizations;

CREATE POLICY "Org members can read organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can insert organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can update organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  id = public.get_user_org_id() OR public.is_super_admin()
)
WITH CHECK (
  id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (
  id = public.get_user_org_id() OR public.is_super_admin()
);

-- 2) Activity Types: restrict read to authenticated users (no org_id column)
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive public read
DROP POLICY IF EXISTS "Anyone can view activity types" ON public.activity_types;

-- Keep existing admin manage policy, just add a safe read policy
CREATE POLICY "Authenticated users can view activity types"
ON public.activity_types
FOR SELECT
TO authenticated
USING (true);

-- 3) Workflow Templates: org-scoped access (has org_id)
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read workflow_templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Org members can insert workflow_templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Org members can update workflow_templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Org members can delete workflow_templates" ON public.workflow_templates;

CREATE POLICY "Org members can read workflow_templates"
ON public.workflow_templates
FOR SELECT
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can insert workflow_templates"
ON public.workflow_templates
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can update workflow_templates"
ON public.workflow_templates
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
)
WITH CHECK (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can delete workflow_templates"
ON public.workflow_templates
FOR DELETE
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);
