-- Drop la función existente con la firma antigua
DROP FUNCTION IF EXISTS public.detect_misclassified_contacts(UUID, INT, TEXT, NUMERIC);

-- Recrear con patrones ampliados
CREATE OR REPLACE FUNCTION public.detect_misclassified_contacts(
  org_uuid UUID,
  max_results INT DEFAULT 100,
  source_filter TEXT DEFAULT NULL,
  min_confidence NUMERIC DEFAULT 0.7
)
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  current_type TEXT,
  suggested_type TEXT,
  confidence NUMERIC,
  matched_pattern TEXT,
  source TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS contact_id,
    c.name AS contact_name,
    c.client_type AS current_type,
    'empresa'::TEXT AS suggested_type,
    CASE
      WHEN c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?U?|S\.?C\.?|S\.?COOP)\M' THEN 0.95
      WHEN c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M' THEN 0.95
      WHEN c.name ~* '\m(B\.?V\.?)\M' THEN 0.95
      WHEN c.name ~* '\m(SAS|SRL|SCP|CB)\M' THEN 0.90
      WHEN c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M' THEN 0.90
      WHEN c.name ~* 'CDAD\.?\s*DE\s*PROP' THEN 0.90
      WHEN c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M' THEN 0.85
      WHEN c.name ~* '\m(MISIONERAS|MONASTERIO|CLARISAS)\M' THEN 0.85
      WHEN c.dni_nif ~ '^[A-HJ-NP-SUVW]' THEN 0.85
      ELSE 0.70
    END AS confidence,
    CASE
      WHEN c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?U?|S\.?C\.?|S\.?COOP)\M' THEN 'suffix_es'
      WHEN c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M' THEN 'suffix_intl'
      WHEN c.name ~* '\m(B\.?V\.?)\M' THEN 'suffix_bv'
      WHEN c.name ~* '\m(SAS|SRL|SCP|CB)\M' THEN 'suffix_other'
      WHEN c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M' THEN 'keyword_org'
      WHEN c.name ~* 'CDAD\.?\s*DE\s*PROP' THEN 'keyword_cdad'
      WHEN c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M' THEN 'keyword_biz'
      WHEN c.name ~* '\m(MISIONERAS|MONASTERIO|CLARISAS)\M' THEN 'keyword_religious'
      WHEN c.dni_nif ~ '^[A-HJ-NP-SUVW]' THEN 'nif_empresa'
      ELSE 'unknown'
    END AS matched_pattern,
    COALESCE(c.source, 'unknown') AS source
  FROM public.contacts c
  WHERE c.org_id = org_uuid
    AND c.client_type IN ('particular', 'autonomo')
    AND (
      c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?U?|S\.?C\.?|S\.?COOP)\M'
      OR c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M'
      OR c.name ~* '\m(B\.?V\.?)\M'
      OR c.name ~* '\m(SAS|SRL|SCP|CB)\M'
      OR c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M'
      OR c.name ~* 'CDAD\.?\s*DE\s*PROP'
      OR c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M'
      OR c.name ~* '\m(MISIONERAS|MONASTERIO|CLARISAS)\M'
      OR c.dni_nif ~ '^[A-HJ-NP-SUVW]'
    )
    AND (source_filter IS NULL OR c.source = source_filter)
  ORDER BY confidence DESC
  LIMIT max_results;
END;
$$;

-- Saneamiento: reclasificar contactos de alta confianza
UPDATE public.contacts
SET client_type = 'empresa', updated_at = now()
WHERE client_type IN ('particular', 'autonomo')
  AND (
    name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?U?|S\.?C\.?|S\.?COOP)\M'
    OR name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M'
    OR name ~* '\m(B\.?V\.?)\M'
    OR name ~* '\m(SAS|SRL|SCP)\M'
    OR name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M'
    OR name ~* 'CDAD\.?\s*DE\s*PROP'
    OR name ~* '\m(MISIONERAS|MONASTERIO|CLARISAS)\M'
  );