
-- ============================================================
-- Fase 1+2: Tabla de revisión + Saneamiento de datos
-- ============================================================

-- 1. Crear tabla de revisión de clasificación
CREATE TABLE IF NOT EXISTS public.contact_classification_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  current_client_type TEXT NOT NULL,
  suggested_client_type TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  reason JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_applied')),
  source TEXT NOT NULL DEFAULT 'rule_engine' CHECK (source IN ('rule_engine', 'ai_bulk_validate', 'quantum_auto', 'manual_form')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id)
);

-- Índices
CREATE INDEX idx_ccr_org_status ON public.contact_classification_reviews(org_id, status);
CREATE INDEX idx_ccr_contact ON public.contact_classification_reviews(contact_id);
CREATE INDEX idx_ccr_created ON public.contact_classification_reviews(created_at DESC);

-- RLS
ALTER TABLE public.contact_classification_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org reviews"
  ON public.contact_classification_reviews FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert org reviews"
  ON public.contact_classification_reviews FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update org reviews"
  ON public.contact_classification_reviews FOR UPDATE
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- 2. Función RPC para detectar contactos mal clasificados
CREATE OR REPLACE FUNCTION public.detect_misclassified_contacts(
  org_uuid UUID,
  max_results INT DEFAULT 100,
  source_filter TEXT DEFAULT NULL,
  confidence_min NUMERIC DEFAULT 0.7
)
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  current_client_type TEXT,
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
      -- Alta confianza: sufijos claros de empresa
      WHEN c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?C\.?|S\.?COOP)\M' THEN 0.95
      WHEN c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M' THEN 0.95
      WHEN c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M' THEN 0.90
      WHEN c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M' THEN 0.80
      -- Media confianza: NIF de empresa (empieza por letra excepto X,Y,Z que son NIE)
      WHEN c.dni_nif IS NOT NULL AND c.dni_nif ~ '^[A-HJ-NP-SUVW]' THEN 0.85
      ELSE 0.70
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
      -- Patrones de nombre de empresa
      c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?C\.?|S\.?COOP)\M'
      OR c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M'
      OR c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M'
      OR c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M'
      -- O NIF de empresa
      OR (c.dni_nif IS NOT NULL AND c.dni_nif ~ '^[A-HJ-NP-SUVW]')
    )
    AND (source_filter IS NULL OR c.source = source_filter)
    -- Excluir los que ya tienen una revisión pendiente
    AND NOT EXISTS (
      SELECT 1 FROM public.contact_classification_reviews r
      WHERE r.contact_id = c.id AND r.status IN ('pending', 'auto_applied')
    )
  ORDER BY confidence DESC
  LIMIT max_results;
END;
$$;
