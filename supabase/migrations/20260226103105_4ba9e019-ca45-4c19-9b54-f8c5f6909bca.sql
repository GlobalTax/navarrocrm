
DROP FUNCTION IF EXISTS public.get_companies_with_contacts(UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_companies_with_contacts(
  org_uuid UUID,
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  sector_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  relationship_type TEXT,
  client_type TEXT,
  business_sector TEXT,
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT,
  dni_nif TEXT,
  contact_preference TEXT,
  hourly_rate NUMERIC,
  tags TEXT[],
  internal_notes TEXT,
  source TEXT,
  how_found_us TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  org_id UUID,
  email_preferences JSONB,
  company_id UUID,
  legal_representative TEXT,
  payment_method TEXT,
  preferred_language TEXT,
  preferred_meeting_time TEXT,
  timezone TEXT,
  last_contact_date TIMESTAMPTZ,
  auto_imported_at TIMESTAMPTZ,
  outlook_id TEXT,
  quantum_customer_id TEXT,
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
    c.id, c.name, c.email, c.phone, c.status, c.relationship_type,
    c.client_type, c.business_sector, c.address_street, c.address_city,
    c.address_postal_code, c.address_country, c.dni_nif, c.contact_preference,
    c.hourly_rate, c.tags, c.internal_notes, c.source, c.how_found_us,
    c.created_at, c.updated_at, c.org_id, c.email_preferences, c.company_id,
    c.legal_representative, c.payment_method, c.preferred_language,
    c.preferred_meeting_time, c.timezone, c.last_contact_date,
    c.auto_imported_at, c.outlook_id, c.quantum_customer_id,
    (
      SELECT jsonb_build_object('id', pc.id, 'name', pc.name, 'email', pc.email, 'phone', pc.phone)
      FROM public.contacts pc
      WHERE pc.company_id = c.id AND pc.org_id = c.org_id
      LIMIT 1
    ) AS primary_contact,
    (
      SELECT COUNT(*)
      FROM public.contacts cc
      WHERE cc.company_id = c.id AND cc.org_id = c.org_id
    ) AS total_contacts
  FROM public.contacts c
  WHERE c.org_id = org_uuid
    AND c.client_type = 'empresa'
    AND (search_term IS NULL OR c.name ILIKE '%' || search_term || '%' OR c.email ILIKE '%' || search_term || '%' OR c.phone ILIKE '%' || search_term || '%')
    AND (status_filter IS NULL OR c.status = status_filter)
    AND (sector_filter IS NULL OR c.business_sector = sector_filter)
  ORDER BY c.name ASC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_contacts_search_composite 
ON public.contacts(org_id, client_type, status, relationship_type);

CREATE INDEX IF NOT EXISTS idx_contacts_company_lookup 
ON public.contacts(company_id, org_id) 
WHERE company_id IS NOT NULL;
