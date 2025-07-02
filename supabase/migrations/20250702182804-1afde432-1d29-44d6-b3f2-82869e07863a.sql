-- Crear constraint único para practice_areas si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_practice_area_org') THEN
        ALTER TABLE public.practice_areas 
        ADD CONSTRAINT unique_practice_area_org 
        UNIQUE (name, org_id);
    END IF;
END $$;

-- Insertar las 5 áreas de práctica para cada organización existente
INSERT INTO public.practice_areas (name, description, org_id, created_at, updated_at) 
SELECT 
    area_name,
    area_description,
    o.id as org_id,
    now(),
    now()
FROM public.organizations o
CROSS JOIN (
    VALUES 
    ('Fiscal', 'Asesoría fiscal, declaraciones de impuestos, planificación tributaria'),
    ('Mercantil', 'Derecho societario, constitución de empresas, contratos mercantiles'),
    ('Contabilidad', 'Contabilidad empresarial, auditorías, estados financieros'),
    ('Legal', 'Asesoría jurídica general, contratos, representación legal'),
    ('Laboral', 'Derecho laboral, nóminas, contratos de trabajo, seguridad social')
) AS areas(area_name, area_description)
WHERE NOT EXISTS (
    SELECT 1 FROM public.practice_areas pa 
    WHERE pa.name = areas.area_name AND pa.org_id = o.id
);

-- Crear índices para optimizar consultas de casos
CREATE INDEX IF NOT EXISTS idx_cases_practice_area ON public.cases(practice_area);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_org_status ON public.cases(org_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_org_practice_area ON public.cases(org_id, practice_area);
CREATE INDEX IF NOT EXISTS idx_cases_compound ON public.cases(org_id, status, practice_area, created_at DESC);

-- Índices para contactos para mejorar joins
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);

-- Índices para time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_case_id ON public.time_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_org_created ON public.time_entries(org_id, created_at DESC);