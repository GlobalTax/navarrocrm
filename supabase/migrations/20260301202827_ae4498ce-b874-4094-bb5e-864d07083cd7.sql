
DROP FUNCTION IF EXISTS public.get_companies_with_contacts(uuid, integer, integer, text, text, text);

CREATE OR REPLACE FUNCTION public.get_companies_with_contacts(
  org_uuid uuid,
  page_size integer DEFAULT 50,
  page_offset integer DEFAULT 0,
  search_term text DEFAULT NULL,
  status_filter text DEFAULT NULL,
  sector_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  status text,
  business_sector text,
  dni_nif text,
  address_street text,
  address_city text,
  address_postal_code text,
  address_country text,
  relationship_type text,
  email_preferences jsonb,
  tags text[],
  internal_notes text,
  hourly_rate numeric,
  source text,
  quantum_customer_id text,
  created_at timestamptz,
  updated_at timestamptz,
  org_id uuid,
  primary_contact jsonb,
  total_contacts bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  WITH unique_companies AS (
    SELECT DISTINCT ON (COALESCE(c.quantum_customer_id, c.id::text)) c.*
    FROM public.contacts c
    WHERE c.org_id = org_uuid
      AND c.client_type = 'empresa'
    ORDER BY COALESCE(c.quantum_customer_id, c.id::text), c.created_at DESC
  )
  SELECT 
    uc.id,
    uc.name::text,
    uc.email::text,
    uc.phone::text,
    uc.status::text,
    uc.business_sector::text,
    uc.dni_nif::text,
    uc.address_street::text,
    uc.address_city::text,
    uc.address_postal_code::text,
    uc.address_country::text,
    uc.relationship_type::text,
    uc.email_preferences::jsonb,
    uc.tags,
    uc.internal_notes::text,
    uc.hourly_rate,
    uc.source::text,
    uc.quantum_customer_id::text,
    uc.created_at,
    uc.updated_at,
    uc.org_id,
    (
      SELECT jsonb_build_object('id', ct.id, 'name', ct.name, 'email', ct.email, 'phone', ct.phone)
      FROM public.contacts ct
      WHERE ct.company_id = uc.id AND ct.org_id = uc.org_id
      LIMIT 1
    ) AS primary_contact,
    (
      SELECT COUNT(*)
      FROM public.contacts ct
      WHERE ct.company_id = uc.id AND ct.org_id = uc.org_id
    ) AS total_contacts
  FROM unique_companies uc
  WHERE (search_term IS NULL OR uc.name ILIKE '%' || search_term || '%' OR uc.dni_nif ILIKE '%' || search_term || '%' OR uc.email ILIKE '%' || search_term || '%')
    AND (status_filter IS NULL OR uc.status = status_filter)
    AND (sector_filter IS NULL OR uc.business_sector = sector_filter)
  ORDER BY uc.name ASC
  LIMIT page_size
  OFFSET page_offset;
END;
$function$;
