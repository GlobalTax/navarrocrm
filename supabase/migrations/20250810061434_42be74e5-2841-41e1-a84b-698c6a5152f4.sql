-- Ensure columns exist on time_entries then (re)create report function
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='time_entries') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'service_contract_id'
    ) THEN
      ALTER TABLE public.time_entries ADD COLUMN service_contract_id uuid;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'service_type'
    ) THEN
      -- ensure enum exists
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE public.service_type AS ENUM ('accounting','tax','labor');
      END IF;
      ALTER TABLE public.time_entries ADD COLUMN service_type public.service_type;
    END IF;
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.get_monthly_service_hours(org_uuid uuid, period text)
RETURNS TABLE (
  service_contract_id uuid,
  contact_id uuid,
  client_name text,
  service_type public.service_type,
  allocated_hours numeric,
  actual_hours numeric,
  delta_hours numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH alloc AS (
    SELECT 
      a.service_contract_id,
      c.contact_id,
      a.service_type,
      SUM(a.allocated_hours) AS allocated_hours
    FROM public.service_hours_allocations a
    JOIN public.recurring_service_contracts c ON c.id = a.service_contract_id
    WHERE a.org_id = org_uuid AND a.month = period
    GROUP BY a.service_contract_id, c.contact_id, a.service_type
  ),
  actual AS (
    SELECT 
      te.service_contract_id,
      rsc.contact_id,
      te.service_type,
      COALESCE(SUM(te.duration_minutes) / 60.0, 0) AS actual_hours
    FROM public.time_entries te
    JOIN public.recurring_service_contracts rsc ON rsc.id = te.service_contract_id
    WHERE te.service_contract_id IS NOT NULL
      AND te.org_id = org_uuid
      AND to_char(te.created_at, 'YYYY-MM') = period
    GROUP BY te.service_contract_id, rsc.contact_id, te.service_type
  )
  SELECT 
    COALESCE(a.service_contract_id, ac.service_contract_id) AS service_contract_id,
    COALESCE(a.contact_id, ac.contact_id) AS contact_id,
    (SELECT name FROM public.contacts ct WHERE ct.id = COALESCE(a.contact_id, ac.contact_id) LIMIT 1) AS client_name,
    COALESCE(a.service_type, ac.service_type) AS service_type,
    COALESCE(a.allocated_hours, 0) AS allocated_hours,
    COALESCE(ac.actual_hours, 0) AS actual_hours,
    COALESCE(ac.actual_hours, 0) - COALESCE(a.allocated_hours, 0) AS delta_hours
  FROM alloc a
  FULL OUTER JOIN actual ac 
    ON ac.service_contract_id = a.service_contract_id
   AND ac.service_type = a.service_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';