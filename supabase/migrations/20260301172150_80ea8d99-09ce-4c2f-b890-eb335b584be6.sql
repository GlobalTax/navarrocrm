
-- =============================================
-- PERMISSION GROUPS SYSTEM
-- =============================================

-- 1. permission_groups: plantillas de permisos
CREATE TABLE public.permission_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- 2. permission_group_items: permisos dentro de un grupo
CREATE TABLE public.permission_group_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.permission_groups(id) ON DELETE CASCADE,
  module varchar(50) NOT NULL,
  permission varchar(50) NOT NULL,
  UNIQUE(group_id, module, permission)
);

-- 3. user_permission_groups: asignación de grupos a usuarios
CREATE TABLE public.user_permission_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  group_id uuid NOT NULL REFERENCES public.permission_groups(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Índices
CREATE INDEX idx_permission_groups_org ON public.permission_groups(org_id);
CREATE INDEX idx_permission_group_items_group ON public.permission_group_items(group_id);
CREATE INDEX idx_user_permission_groups_user ON public.user_permission_groups(user_id);
CREATE INDEX idx_user_permission_groups_org ON public.user_permission_groups(org_id);

-- Trigger updated_at
CREATE TRIGGER set_permission_groups_updated_at
  BEFORE UPDATE ON public.permission_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_groups ENABLE ROW LEVEL SECURITY;

-- Policies for permission_groups
CREATE POLICY "Users can view org permission groups"
  ON public.permission_groups FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Partners/managers manage permission groups"
  ON public.permission_groups FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('partner', 'area_manager'))
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('partner', 'area_manager'));

-- Policies for permission_group_items
CREATE POLICY "Users can view permission group items"
  ON public.permission_group_items FOR SELECT TO authenticated
  USING (group_id IN (
    SELECT id FROM public.permission_groups 
    WHERE org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
  ));

CREATE POLICY "Partners/managers manage permission group items"
  ON public.permission_group_items FOR ALL TO authenticated
  USING (group_id IN (
    SELECT id FROM public.permission_groups 
    WHERE org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('partner', 'area_manager')
  ))
  WITH CHECK (group_id IN (
    SELECT id FROM public.permission_groups 
    WHERE org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('partner', 'area_manager')
  ));

-- Policies for user_permission_groups
CREATE POLICY "Users can view org user permission groups"
  ON public.user_permission_groups FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Partners/managers manage user permission groups"
  ON public.user_permission_groups FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('partner', 'area_manager'))
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('partner', 'area_manager'));
