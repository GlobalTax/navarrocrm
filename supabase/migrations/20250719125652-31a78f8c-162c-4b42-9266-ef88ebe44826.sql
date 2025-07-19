-- Script para corregir contactos mal clasificados de Quantum

-- 1. Función temporal para detectar tipo de entidad
CREATE OR REPLACE FUNCTION temp_detect_entity_type(contact_name TEXT, contact_nif TEXT)
RETURNS TEXT AS $$
DECLARE
  name_lower TEXT;
  company_keywords TEXT[] := ARRAY[
    's.l.', 'sl.', 'sl', 's.l', 'sociedad limitada',
    's.a.', 'sa.', 'sa', 's.a', 'sociedad anónima', 
    's.l.u.', 'slu.', 'slu', 's.l.u', 'sociedad limitada unipersonal',
    'c.b.', 'cb.', 'cb', 'c.b', 'comunidad de bienes',
    's.c.', 'sc.', 'sc', 's.c', 'sociedad colectiva',
    's.coop.', 'scoop.', 'cooperativa',
    'fundacion', 'fundación', 'asociacion', 'asociación',
    'ayuntamiento', 'diputacion', 'diputación', 'junta',
    'empresa', 'sociedad', 'comercial', 'industrial',
    'consulting', 'consultoria', 'consultoría', 'servicios',
    'construcciones', 'inmobiliaria', 'promociones'
  ];
  company_cif_letters TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'N', 'P', 'Q', 'R', 'S', 'U', 'V', 'W'];
  has_company_keyword BOOLEAN := FALSE;
  has_company_cif BOOLEAN := FALSE;
  first_char TEXT;
  keyword TEXT;
BEGIN
  name_lower := LOWER(COALESCE(contact_name, ''));
  
  -- Verificar palabras clave de empresa
  FOREACH keyword IN ARRAY company_keywords LOOP
    IF name_lower LIKE '%' || keyword || '%' THEN
      has_company_keyword := TRUE;
      EXIT;
    END IF;
  END LOOP;
  
  -- Verificar CIF de empresa
  IF COALESCE(contact_nif, '') != '' THEN
    first_char := UPPER(SUBSTRING(contact_nif FROM 1 FOR 1));
    has_company_cif := first_char = ANY(company_cif_letters);
  END IF;
  
  RETURN CASE WHEN has_company_keyword OR has_company_cif THEN 'empresa' ELSE 'particular' END;
END;
$$ LANGUAGE plpgsql;

-- 2. Identificar y mostrar contactos que necesitan corrección
DO $$
DECLARE
  contact_record RECORD;
  corrected_count INTEGER := 0;
  total_checked INTEGER := 0;
BEGIN
  RAISE NOTICE 'Iniciando corrección de tipos de entidad...';
  
  -- Iterar sobre contactos de Quantum con client_type 'particular'
  FOR contact_record IN 
    SELECT id, name, dni_nif, client_type, quantum_customer_id
    FROM public.contacts 
    WHERE source = 'quantum_auto' 
    AND client_type = 'particular'
    AND quantum_customer_id IS NOT NULL
  LOOP
    total_checked := total_checked + 1;
    
    -- Detectar el tipo correcto
    IF temp_detect_entity_type(contact_record.name, contact_record.dni_nif) = 'empresa' THEN
      -- Actualizar a empresa
      UPDATE public.contacts 
      SET client_type = 'empresa',
          updated_at = now()
      WHERE id = contact_record.id;
      
      corrected_count := corrected_count + 1;
      RAISE NOTICE 'Corregido: % (%) -> empresa', contact_record.name, contact_record.dni_nif;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Corrección completada: % de % contactos corregidos', corrected_count, total_checked;
END $$;

-- 3. Eliminar duplicados exactos basados en quantum_customer_id
WITH duplicates AS (
  SELECT quantum_customer_id, 
         array_agg(id ORDER BY created_at DESC) as contact_ids,
         COUNT(*) as duplicate_count
  FROM public.contacts 
  WHERE quantum_customer_id IS NOT NULL 
  AND source = 'quantum_auto'
  GROUP BY quantum_customer_id 
  HAVING COUNT(*) > 1
),
ids_to_delete AS (
  SELECT unnest(contact_ids[2:]) as id_to_delete
  FROM duplicates
)
DELETE FROM public.contacts 
WHERE id IN (SELECT id_to_delete FROM ids_to_delete);

-- 4. Mostrar estadísticas finales
SELECT 
  'Estadísticas después de la corrección' as descripcion,
  client_type,
  COUNT(*) as cantidad,
  COUNT(*) FILTER (WHERE source = 'quantum_auto') as de_quantum
FROM public.contacts 
GROUP BY client_type
ORDER BY client_type;

-- 5. Limpiar función temporal
DROP FUNCTION temp_detect_entity_type(TEXT, TEXT);