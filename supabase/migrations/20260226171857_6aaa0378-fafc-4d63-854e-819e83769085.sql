
DROP FUNCTION IF EXISTS public.detect_misclassified_contacts(uuid,integer,text,numeric);

CREATE OR REPLACE FUNCTION public.detect_misclassified_contacts(
  org_uuid UUID,
  max_results INT DEFAULT 100,
  source_filter TEXT DEFAULT NULL,
  confidence_min NUMERIC DEFAULT 0.7
)
RETURNS TABLE (
  contact_id UUID,
  contact_name VARCHAR(255),
  current_client_type VARCHAR(255),
  suggested_client_type TEXT,
  confidence NUMERIC,
  reason JSONB
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
    c.client_type AS current_client_type,
    'empresa'::TEXT AS suggested_client_type,
    CASE
      WHEN c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?C\.?|S\.?COOP)\M' THEN 0.95::NUMERIC
      WHEN c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M' THEN 0.95::NUMERIC
      WHEN c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M' THEN 0.90::NUMERIC
      WHEN c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M' THEN 0.80::NUMERIC
      WHEN c.dni_nif IS NOT NULL AND c.dni_nif ~ '^[A-HJ-NP-SUVW]' THEN 0.85::NUMERIC
      ELSE 0.70::NUMERIC
    END AS confidence,
    jsonb_build_object(
      'matched_patterns', ARRAY(
        SELECT pattern FROM (VALUES
          ('suffix_sl', c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?)\M'),
          ('suffix_intl', c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M'),
          ('keyword_org', c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|COOPERATIVA)\M'),
          ('keyword_business', c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M'),
          ('nif_empresa', c.dni_nif IS NOT NULL AND c.dni_nif ~ '^[A-HJ-NP-SUVW]')
        ) AS t(pattern, matched) WHERE matched
      ),
      'source', COALESCE(c.source, 'unknown')
    ) AS reason
  FROM public.contacts c
  WHERE c.org_id = org_uuid
    AND c.client_type IN ('particular', 'autonomo')
    AND (
      c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?C\.?|S\.?COOP)\M'
      OR c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M'
      OR c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M'
      OR c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M'
      OR (c.dni_nif IS NOT NULL AND c.dni_nif ~ '^[A-HJ-NP-SUVW]')
    )
    AND (source_filter IS NULL OR c.source = source_filter)
    AND NOT EXISTS (
      SELECT 1 FROM public.contact_classification_reviews r
      WHERE r.contact_id = c.id AND r.status IN ('pending', 'auto_applied')
    )
  ORDER BY confidence DESC
  LIMIT max_results;
END;
$$;
