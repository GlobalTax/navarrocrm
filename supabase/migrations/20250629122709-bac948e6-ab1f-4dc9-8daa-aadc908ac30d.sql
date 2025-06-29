
-- Temporalmente desactivar la función problemática
DROP TRIGGER IF EXISTS update_recurring_fee_hours_trigger ON public.time_entries;

-- Agregar columna entry_type a time_entries para clasificar tipos de entrada
ALTER TABLE public.time_entries 
ADD COLUMN IF NOT EXISTS entry_type character varying DEFAULT 'billable';

-- Actualizar constraint para permitir solo valores válidos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'time_entries_entry_type_check'
  ) THEN
    ALTER TABLE public.time_entries 
    ADD CONSTRAINT time_entries_entry_type_check 
    CHECK (entry_type IN ('billable', 'office_admin', 'business_development', 'internal'));
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_type ON public.time_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_time_entries_monthly ON public.time_entries(org_id, created_at, entry_type);

-- Actualizar entradas existentes basándose en lógica simple
UPDATE public.time_entries 
SET entry_type = CASE 
  WHEN is_billable = true THEN 'billable'
  WHEN description ILIKE '%admin%' OR description ILIKE '%gestión%' OR description ILIKE '%administra%' THEN 'office_admin'
  WHEN description ILIKE '%captación%' OR description ILIKE '%comercial%' OR description ILIKE '%propuesta%' OR description ILIKE '%marketing%' THEN 'business_development'
  ELSE 'internal'
END
WHERE entry_type IS NULL OR entry_type = 'billable';

-- Función para obtener estadísticas mensuales de time tracking
CREATE OR REPLACE FUNCTION public.get_monthly_time_stats(
  org_uuid UUID,
  target_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE(
  day_date DATE,
  billable_hours NUMERIC,
  office_admin_hours NUMERIC,
  business_dev_hours NUMERIC,  
  internal_hours NUMERIC,
  total_hours NUMERIC,
  entry_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(te.created_at) as day_date,
    COALESCE(SUM(CASE WHEN te.entry_type = 'billable' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as billable_hours,
    COALESCE(SUM(CASE WHEN te.entry_type = 'office_admin' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as office_admin_hours,
    COALESCE(SUM(CASE WHEN te.entry_type = 'business_development' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as business_dev_hours,
    COALESCE(SUM(CASE WHEN te.entry_type = 'internal' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as internal_hours,
    COALESCE(SUM(te.duration_minutes) / 60.0, 0)::NUMERIC as total_hours,
    COUNT(*)::INTEGER as entry_count
  FROM public.time_entries te
  WHERE te.org_id = org_uuid 
    AND EXTRACT(MONTH FROM te.created_at) = target_month
    AND EXTRACT(YEAR FROM te.created_at) = target_year
  GROUP BY DATE(te.created_at)
  ORDER BY day_date;
END;
$function$;
