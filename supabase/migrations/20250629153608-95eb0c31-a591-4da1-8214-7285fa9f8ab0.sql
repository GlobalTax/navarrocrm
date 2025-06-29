
-- Verificar y crear tabla practice_areas si no tiene los campos necesarios
ALTER TABLE public.practice_areas ADD COLUMN IF NOT EXISTS color character varying DEFAULT '#6366f1';
ALTER TABLE public.practice_areas ADD COLUMN IF NOT EXISTS icon character varying DEFAULT 'Scale';

-- Verificar si existe la tabla service_catalog, si no crearla
CREATE TABLE IF NOT EXISTS public.service_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  default_price numeric DEFAULT 0,
  billing_unit character varying NOT NULL DEFAULT 'hour',
  practice_area_id uuid REFERENCES public.practice_areas(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_service_catalog_org_id ON public.service_catalog(org_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_practice_area ON public.service_catalog(practice_area_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_active ON public.service_catalog(is_active);

-- Habilitar RLS en service_catalog
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen y crear nuevas
DROP POLICY IF EXISTS "Users can view services from their org" ON public.service_catalog;
DROP POLICY IF EXISTS "Users can create services in their org" ON public.service_catalog;
DROP POLICY IF EXISTS "Users can update services in their org" ON public.service_catalog;
DROP POLICY IF EXISTS "Users can delete services in their org" ON public.service_catalog;

-- Crear políticas RLS para service_catalog
CREATE POLICY "Users can view services from their org" 
  ON public.service_catalog 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create services in their org" 
  ON public.service_catalog 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update services in their org" 
  ON public.service_catalog 
  FOR UPDATE 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete services in their org" 
  ON public.service_catalog 
  FOR DELETE 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Insertar área de Contabilidad para cada organización
INSERT INTO public.practice_areas (name, description, color, icon, org_id)
SELECT 
  'Contabilidad y Auditoría',
  'Servicios de contabilidad, auditoría interna y revisión financiera',
  '#10b981',
  'Calculator',
  o.id
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.practice_areas pa
  WHERE pa.name = 'Contabilidad y Auditoría' AND pa.org_id = o.id
);

-- Insertar servicios de contabilidad de ejemplo
INSERT INTO public.service_catalog (org_id, name, description, default_price, billing_unit, practice_area_id, is_active)
SELECT 
  o.id as org_id,
  service_data.name,
  service_data.description,
  service_data.default_price,
  service_data.billing_unit,
  pa.id as practice_area_id,
  true
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('Contabilidad Mensual', 'Gestión integral de la contabilidad mensual de la empresa', 800, 'mes'),
    ('Revisión Contable Trimestral', 'Revisión y análisis de estados contables trimestrales', 1200, 'trimestre'),
    ('Auditoría Interna Anual', 'Auditoría interna completa de procesos y estados financieros', 3500, 'año'),
    ('Conciliaciones Bancarias', 'Conciliación mensual de cuentas bancarias', 150, 'mes'),
    ('Estados Financieros', 'Elaboración de estados financieros mensuales', 400, 'mes'),
    ('Asesoría Contable Integral', 'Asesoramiento contable continuo y resolución de consultas', 500, 'mes')
) AS service_data(name, description, default_price, billing_unit)
JOIN public.practice_areas pa ON pa.name = 'Contabilidad y Auditoría' AND pa.org_id = o.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog sc 
  WHERE sc.name = service_data.name AND sc.org_id = o.id
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_service_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_service_catalog_updated_at ON public.service_catalog;
CREATE TRIGGER update_service_catalog_updated_at
    BEFORE UPDATE ON public.service_catalog
    FOR EACH ROW
    EXECUTE FUNCTION public.update_service_catalog_updated_at();
