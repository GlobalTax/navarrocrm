-- =====================================================
-- SPRINT 1 FASE 1: Función RPC Optimizada para Empresas
-- =====================================================
-- Elimina el problema N+1 calculando contactos en una sola query

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
  org_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  dni_nif TEXT,
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT,
  legal_representative TEXT,
  client_type TEXT,
  business_sector TEXT,
  how_found_us TEXT,
  contact_preference TEXT,
  preferred_language TEXT,
  hourly_rate NUMERIC,
  payment_method TEXT,
  status TEXT,
  tags TEXT[],
  internal_notes TEXT,
  timezone TEXT,
  preferred_meeting_time TEXT,
  email_preferences JSONB,
  relationship_type TEXT,
  last_contact_date TIMESTAMPTZ,
  company_id UUID,
  quantum_customer_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  primary_contact JSONB,
  total_contacts BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.*,
    -- Primary contact como JSONB (primer contacto vinculado)
    (
      SELECT jsonb_build_object(
        'id', pc.id,
        'name', pc.name,
        'email', pc.email,
        'phone', pc.phone
      )
      FROM public.contacts pc
      WHERE pc.company_id = c.id 
        AND pc.org_id = c.org_id
      ORDER BY pc.created_at ASC
      LIMIT 1
    ) as primary_contact,
    -- Total de contactos vinculados
    (
      SELECT COUNT(*)::BIGINT
      FROM public.contacts cc
      WHERE cc.company_id = c.id 
        AND cc.org_id = c.org_id
    ) as total_contacts
  FROM public.contacts c
  WHERE c.org_id = org_uuid
    AND c.client_type = 'empresa'
    -- Aplicar filtros opcionales
    AND (search_term IS NULL OR (
      c.name ILIKE '%' || search_term || '%' OR
      c.email ILIKE '%' || search_term || '%' OR
      c.phone ILIKE '%' || search_term || '%'
    ))
    AND (status_filter IS NULL OR c.status = status_filter)
    AND (sector_filter IS NULL OR c.business_sector = sector_filter)
  ORDER BY c.name ASC
  LIMIT page_size
  OFFSET page_offset;
END;
$function$;

-- Índices compuestos para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_contacts_search_composite 
ON public.contacts(org_id, client_type, status, relationship_type)
WHERE client_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_company_lookup
ON public.contacts(company_id, org_id)
WHERE company_id IS NOT NULL;

-- Comentario de documentación
COMMENT ON FUNCTION public.get_companies_with_contacts IS 
'Función optimizada para obtener empresas con información de contactos pre-calculada. 
Elimina el problema N+1 (1566 queries → 1 query). 
Soporta paginación y filtros opcionales.';