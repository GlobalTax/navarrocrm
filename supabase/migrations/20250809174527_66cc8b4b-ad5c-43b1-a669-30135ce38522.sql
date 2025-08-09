-- Adjust view to use only users.email (no first_name/last_name)
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