
DROP FUNCTION IF EXISTS public.get_companies_with_contacts(UUID, INT, INT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_companies_with_contacts(
  org_uuid UUID,
  page_size INT DEFAULT 50,
  page_offset INT DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  sector_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  nif TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN,
  founded_date TEXT,
  org_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  primary_contact JSONB,
  total_contacts BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name::TEXT,
    c.nif::TEXT,
    c.address::TEXT,
    c.notes::TEXT,
    c.is_active,
    c.founded_date::TEXT,
    c.org_id,
    c.created_at,
    c.updated_at,
    (
      SELECT jsonb_build_object('id', ct.id, 'name', ct.name, 'email', ct.email, 'phone', ct.phone)
      FROM public.contacts ct
      WHERE ct.company_id = c.id AND ct.org_id = c.org_id
      LIMIT 1
    ) AS primary_contact,
    (
      SELECT COUNT(*)
      FROM public.contacts ct
      WHERE ct.company_id = c.id AND ct.org_id = c.org_id
    ) AS total_contacts
  FROM public.companies c
  WHERE c.org_id = org_uuid
    AND (search_term IS NULL OR c.name ILIKE '%' || search_term || '%' OR c.nif ILIKE '%' || search_term || '%')
    AND (status_filter IS NULL OR (status_filter = 'activo' AND c.is_active = true) OR (status_filter = 'inactivo' AND c.is_active = false))
  ORDER BY c.name ASC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;

NOTIFY pgrst, 'reload schema';
