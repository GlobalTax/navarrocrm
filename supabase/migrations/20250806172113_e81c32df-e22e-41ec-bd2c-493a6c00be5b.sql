-- Insertar etapas por defecto para organizaciones que no las tengan
INSERT INTO public.recruitment_pipeline_stages (org_id, name, color, sort_order)
SELECT DISTINCT 
  o.id as org_id,
  stage_name,
  stage_color,
  stage_order
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('Nuevos', '#10b981', 1),
    ('Screening', '#f59e0b', 2),
    ('Entrevista Técnica', '#3b82f6', 3),
    ('Entrevista Final', '#8b5cf6', 4),
    ('Oferta', '#06b6d4', 5),
    ('Contratado', '#22c55e', 6),
    ('Rechazado', '#ef4444', 7)
) AS default_stages(stage_name, stage_color, stage_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.recruitment_pipeline_stages rps 
  WHERE rps.org_id = o.id
);