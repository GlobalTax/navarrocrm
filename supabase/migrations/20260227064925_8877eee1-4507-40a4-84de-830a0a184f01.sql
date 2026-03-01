
-- Fase 3: Saneamiento de contactos existentes

-- 1. Reclasificar empresas evidentes que están como "particular"
UPDATE public.contacts
SET client_type = 'empresa', updated_at = now()
WHERE client_type = 'particular'
AND (
  -- Sufijos societarios
  name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?|S\.?C\.?|S\.?COOP)\M'
  OR name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\M'
  OR name ~* '\m(B\.?V\.?|SAS|SRL|SCP|CB)\M'
  -- Keywords de entidades
  OR name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M'
  OR name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M'
  OR name ~* 'CDAD\.?\s*DE\s*PROP'
  OR name ~* '\m(MISIONERAS|MONASTERIO|CLARISAS)\M'
  -- Keywords de negocio ampliados
  OR name ~* '\m(ABOGADOS|HOTELES?|HOSPEDERA|MARKETING|PATRIMONIAL)\M'
  OR name ~* '\m(INMOBILIARIA|CONSTRUCCI[OÓ]N|TRANSPORTES?|COMERCIAL)\M'
  OR name ~* '\m(DISTRIBUIDORA|INSTALACIONES|EL[EÉ]CTRICAS?|SERVICIOS)\M'
  OR name ~* '\m(PROMOTORA|INVERSIONES|GESTI[OÓ]N|ASESOR[IÍ]A|CONSULTOR[IÍ]A)\M'
  OR name ~* '\m(HOSTELERA|ALIMENTACI[OÓ]N|FARMAC[IÍ]A|CL[IÍ]NICA)\M'
  OR name ~* '\mFUNDACIO\M'
  OR name ~* '\mINDUST\M'
  OR name ~* '\mINST\M'
);

-- 2. Marcar registros contables/basura como inactivos
UPDATE public.contacts
SET status = 'inactivo', 
    internal_notes = COALESCE(internal_notes, '') || ' [Auto: registro contable/basura marcado como inactivo]',
    updated_at = now()
WHERE status != 'inactivo'
AND (
  name ~ '\.{3,}'
  OR name ~* '\mNO\s+USAR\M'
  OR name ~* '\mCLIENTES\s+(VARIOS|DUDOSO)\M'
  OR name ~* '\mDEUDORES\M'
  OR name ~* '\mREGISTRO\s+MERCANTIL\M'
  OR name ~* 'FACT\.?\s*PEND'
);

-- 3. Actualizar la función RPC detect_misclassified_contacts con los nuevos patrones
CREATE OR REPLACE FUNCTION public.detect_misclassified_contacts(org_uuid uuid)
RETURNS TABLE(
  contact_id uuid,
  contact_name text,
  current_type text,
  suggested_type text,
  confidence numeric,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS contact_id,
    c.name AS contact_name,
    c.client_type AS current_type,
    'empresa'::text AS suggested_type,
    CASE
      WHEN c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?|S\.?C\.?|S\.?COOP)\M' THEN 0.95
      WHEN c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC|B\.?V\.?|SAS|SRL|SCP|CB)\M' THEN 0.95
      WHEN c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M' THEN 0.90
      WHEN c.name ~* '\m(ABOGADOS|HOTELES?|HOSPEDERA|MARKETING|PATRIMONIAL)\M' THEN 0.85
      WHEN c.name ~* '\m(INMOBILIARIA|CONSTRUCCI[OÓ]N|TRANSPORTES?|COMERCIAL|DISTRIBUIDORA)\M' THEN 0.85
      WHEN c.name ~* '\m(INSTALACIONES|EL[EÉ]CTRICAS?|SERVICIOS|PROMOTORA|INVERSIONES)\M' THEN 0.85
      WHEN c.name ~* '\m(GESTI[OÓ]N|ASESOR[IÍ]A|CONSULTOR[IÍ]A|HOSTELERA|ALIMENTACI[OÓ]N)\M' THEN 0.85
      WHEN c.name ~* '\mFUNDACIO\M' THEN 0.85
      WHEN c.name ~* '\mINDUST\M' THEN 0.85
      WHEN c.name ~* '\mINST\M' THEN 0.80
      WHEN c.name ~* 'CDAD\.?\s*DE\s*PROP' THEN 0.90
      ELSE 0.70
    END::numeric AS confidence,
    CASE
      WHEN c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?)\M' THEN 'Sufijo societario detectado'
      WHEN c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N)\M' THEN 'Keyword de entidad'
      WHEN c.name ~* '\m(ABOGADOS|HOTELES?|MARKETING|PATRIMONIAL|INMOBILIARIA)\M' THEN 'Keyword de negocio'
      WHEN c.name ~* '\mFUNDACIO\M' THEN 'Fundación (catalán)'
      WHEN c.name ~* '\m(INDUST|INST)\M' THEN 'Abreviatura de empresa/institución'
      ELSE 'Patrón de empresa detectado'
    END AS reason
  FROM public.contacts c
  WHERE c.org_id = org_uuid
  AND c.client_type = 'particular'
  AND (
    c.name ~* '\m(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?L\.?P\.?|S\.?C\.?|S\.?COOP)\M'
    OR c.name ~* '\m(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC|B\.?V\.?|SAS|SRL|SCP|CB)\M'
    OR c.name ~* '\m(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\M'
    OR c.name ~* '\m(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\M'
    OR c.name ~* 'CDAD\.?\s*DE\s*PROP'
    OR c.name ~* '\m(MISIONERAS|MONASTERIO|CLARISAS)\M'
    OR c.name ~* '\m(ABOGADOS|HOTELES?|HOSPEDERA|MARKETING|PATRIMONIAL)\M'
    OR c.name ~* '\m(INMOBILIARIA|CONSTRUCCI[OÓ]N|TRANSPORTES?|COMERCIAL|DISTRIBUIDORA)\M'
    OR c.name ~* '\m(INSTALACIONES|EL[EÉ]CTRICAS?|SERVICIOS|PROMOTORA|INVERSIONES)\M'
    OR c.name ~* '\m(GESTI[OÓ]N|ASESOR[IÍ]A|CONSULTOR[IÍ]A|HOSTELERA|ALIMENTACI[OÓ]N|FARMAC[IÍ]A|CL[IÍ]NICA)\M'
    OR c.name ~* '\mFUNDACIO\M'
    OR c.name ~* '\mINDUST\M'
    OR c.name ~* '\mINST\M'
  )
  ORDER BY confidence DESC, c.name;
END;
$function$;
