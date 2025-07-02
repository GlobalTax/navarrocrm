-- Insertar las 5 áreas de práctica por defecto
INSERT INTO public.practice_areas (name, description, org_id, created_at, updated_at) VALUES
('Fiscal', 'Asesoría fiscal, declaraciones de impuestos, planificación tributaria', '00000000-0000-0000-0000-000000000000', now(), now()),
('Mercantil', 'Derecho societario, constitución de empresas, contratos mercantiles', '00000000-0000-0000-0000-000000000000', now(), now()),
('Contabilidad', 'Contabilidad empresarial, auditorías, estados financieros', '00000000-0000-0000-0000-000000000000', now(), now()),
('Legal', 'Asesoría jurídica general, contratos, representación legal', '00000000-0000-0000-0000-000000000000', now(), now()),
('Laboral', 'Derecho laboral, nóminas, contratos de trabajo, seguridad social', '00000000-0000-0000-0000-000000000000', now(), now())
ON CONFLICT (name, org_id) DO NOTHING;

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