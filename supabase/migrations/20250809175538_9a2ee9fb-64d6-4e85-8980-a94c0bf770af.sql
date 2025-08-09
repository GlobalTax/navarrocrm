-- Re-apply schema changes for departments and recreate view

-- Ensure RLS enabled on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Add manager_user_id column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'departments' 
      AND column_name = 'manager_user_id'
  ) THEN
    ALTER TABLE public.departments 
      ADD COLUMN manager_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'departments' 
      AND indexname = 'idx_departments_manager_user_id'
  ) THEN
    CREATE INDEX idx_departments_manager_user_id 
      ON public.departments(manager_user_id);
  END IF;
END $$;

-- Create SELECT policy if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='departments' 
      AND policyname='Users can view departments from their org'
  ) THEN
    CREATE POLICY "Users can view departments from their org"
      ON public.departments
      FOR SELECT
      USING (org_id = get_user_org_id());
  END IF;
END $$;

-- Backfill (safe to run)
UPDATE public.departments d
SET manager_user_id = u.id
FROM public.users u
WHERE d.manager_user_id IS NULL
  AND u.department_id = d.id
  AND u.org_id = d.org_id
  AND u.role IN ('partner','area_manager');

-- Recreate view
DROP VIEW IF EXISTS public.v_department_org_chart CASCADE;
CREATE VIEW public.v_department_org_chart
WITH (security_invoker = true)
AS
WITH team_member_counts AS (
  SELECT tm.team_id, COUNT(*)::int AS members_count
  FROM public.team_memberships tm
  GROUP BY tm.team_id
),
team_agg AS (
  SELECT 
    t.department_id,
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'team_lead_id', t.team_lead_id,
        'team_lead_name', ul.email,
        'members_count', COALESCE(tmc.members_count, 0)
      ) ORDER BY t.name
    ) AS teams
  FROM public.teams t
  LEFT JOIN team_member_counts tmc ON tmc.team_id = t.id
  LEFT JOIN public.users ul ON ul.id = t.team_lead_id
  GROUP BY t.department_id
),
employee_counts AS (
  SELECT u.department_id, COUNT(*)::int AS employees_count
  FROM public.users u
  WHERE u.department_id IS NOT NULL
  GROUP BY u.department_id
)
SELECT 
  d.id AS department_id,
  d.name AS department_name,
  d.color AS department_color,
  d.manager_user_id,
  um.email AS manager_name,
  NULL::text AS manager_avatar,
  COALESCE(ta.teams, '[]'::jsonb) AS teams,
  COALESCE(ec.employees_count, 0) AS employees_count
FROM public.departments d
LEFT JOIN public.users um ON um.id = d.manager_user_id
LEFT JOIN team_agg ta ON ta.department_id = d.id
LEFT JOIN employee_counts ec ON ec.department_id = d.id;