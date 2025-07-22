
-- Script para limpiar empresas duplicadas de Quantum Economics de manera segura
-- Conserva el registro más reciente y transfiere todas las relaciones

-- 1. Crear tabla temporal para mapear duplicados
CREATE TEMP TABLE empresa_duplicates AS
WITH duplicates_analysis AS (
  SELECT 
    quantum_customer_id,
    name,
    org_id,
    array_agg(id ORDER BY created_at DESC, updated_at DESC) as contact_ids,
    COUNT(*) as duplicate_count
  FROM public.contacts 
  WHERE client_type = 'empresa' 
    AND source = 'quantum_auto'
    AND quantum_customer_id IS NOT NULL
  GROUP BY quantum_customer_id, name, org_id
  HAVING COUNT(*) > 1
)
SELECT 
  quantum_customer_id,
  name,
  org_id,
  contact_ids[1] as keep_id,
  contact_ids[2:] as delete_ids,
  duplicate_count
FROM duplicates_analysis;

-- 2. Mostrar estadísticas antes de la limpieza
DO $$
DECLARE
  total_duplicates INTEGER;
  total_to_delete INTEGER;
  unique_companies INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_duplicates FROM empresa_duplicates;
  SELECT SUM(array_length(delete_ids, 1)) INTO total_to_delete FROM empresa_duplicates;
  SELECT COUNT(DISTINCT quantum_customer_id) INTO unique_companies FROM empresa_duplicates;
  
  RAISE NOTICE 'ESTADÍSTICAS DE LIMPIEZA:';
  RAISE NOTICE '- Empresas con duplicados: %', total_duplicates;
  RAISE NOTICE '- Registros a eliminar: %', total_to_delete;
  RAISE NOTICE '- Empresas únicas que se conservarán: %', unique_companies;
END $$;

-- 3. Transferir relaciones de contactos (personas vinculadas a empresas)
UPDATE public.contacts 
SET company_id = (
  SELECT keep_id 
  FROM empresa_duplicates ed 
  WHERE company_id = ANY(ed.delete_ids)
  LIMIT 1
)
WHERE company_id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 4. Transferir relaciones de casos
UPDATE public.cases 
SET contact_id = (
  SELECT keep_id 
  FROM empresa_duplicates ed 
  WHERE contact_id = ANY(ed.delete_ids)
  LIMIT 1
)
WHERE contact_id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 5. Transferir relaciones de documentos
UPDATE public.contact_documents 
SET contact_id = (
  SELECT keep_id 
  FROM empresa_duplicates ed 
  WHERE contact_id = ANY(ed.delete_ids)
  LIMIT 1
)
WHERE contact_id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 6. Transferir relaciones de notas
UPDATE public.contact_notes 
SET contact_id = (
  SELECT keep_id 
  FROM empresa_duplicates ed 
  WHERE contact_id = ANY(ed.delete_ids)
  LIMIT 1
)
WHERE contact_id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 7. Transferir relaciones de eventos de calendario
UPDATE public.calendar_events 
SET contact_id = (
  SELECT keep_id 
  FROM empresa_duplicates ed 
  WHERE contact_id = ANY(ed.delete_ids)
  LIMIT 1
)
WHERE contact_id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 8. Transferir relaciones de propuestas
UPDATE public.proposals 
SET contact_id = (
  SELECT keep_id 
  FROM empresa_duplicates ed 
  WHERE contact_id = ANY(ed.delete_ids)
  LIMIT 1
)
WHERE contact_id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 9. Eliminar los registros duplicados
DELETE FROM public.contacts 
WHERE id IN (
  SELECT unnest(delete_ids) 
  FROM empresa_duplicates
);

-- 10. Crear constraint único para prevenir futuras duplicaciones
ALTER TABLE public.contacts 
ADD CONSTRAINT unique_quantum_customer_per_org 
UNIQUE (quantum_customer_id, org_id) 
DEFERRABLE INITIALLY DEFERRED;

-- 11. Mostrar estadísticas finales
DO $$
DECLARE
  remaining_companies INTEGER;
  remaining_duplicates INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_companies 
  FROM public.contacts 
  WHERE client_type = 'empresa' AND source = 'quantum_auto';
  
  SELECT COUNT(*) INTO remaining_duplicates
  FROM (
    SELECT quantum_customer_id, org_id, COUNT(*) as cnt
    FROM public.contacts 
    WHERE client_type = 'empresa' 
      AND source = 'quantum_auto'
      AND quantum_customer_id IS NOT NULL
    GROUP BY quantum_customer_id, org_id
    HAVING COUNT(*) > 1
  ) duplicates_check;
  
  RAISE NOTICE 'LIMPIEZA COMPLETADA:';
  RAISE NOTICE '- Empresas restantes: %', remaining_companies;
  RAISE NOTICE '- Duplicados restantes: %', remaining_duplicates;
  
  IF remaining_duplicates = 0 THEN
    RAISE NOTICE '✅ Limpieza exitosa - No hay duplicados restantes';
  ELSE
    RAISE NOTICE '⚠️ Aún quedan % duplicados por revisar', remaining_duplicates;
  END IF;
END $$;

-- 12. Limpiar tabla temporal
DROP TABLE empresa_duplicates;
