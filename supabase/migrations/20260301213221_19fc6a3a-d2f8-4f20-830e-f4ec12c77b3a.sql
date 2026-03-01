
-- Seed default activity types if table is empty
INSERT INTO public.activity_types (name, category, color, icon, is_active)
SELECT * FROM (VALUES
  ('Facturable', 'billable', '#2CBD6E', 'clock', true),
  ('Admin. Oficina', 'office_admin', '#FF9800', 'building', true),
  ('Desarrollo Negocio', 'business_development', '#0061FF', 'trending-up', true),
  ('Interno', 'internal', '#9E9E9E', 'briefcase', true)
) AS v(name, category, color, icon, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.activity_types LIMIT 1);
