-- Secure sensitive tables with RLS and org-based policies

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

-- 2) Activity Types: org-scoped access
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Org members can insert activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Org members can update activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Org members can delete activity_types" ON public.activity_types;

CREATE POLICY "Org members can read activity_types"
ON public.activity_types
FOR SELECT
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can insert activity_types"
ON public.activity_types
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can update activity_types"
ON public.activity_types
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
)
WITH CHECK (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can delete activity_types"
ON public.activity_types
FOR DELETE
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

-- 3) Workflow Templates: org-scoped access
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
