-- MIGRACIÓN ESPECÍFICA PARA ELIMINAR DUPLICADOS PROBLEMÁTICOS
-- Primero, identificar y eliminar duplicados específicos que están causando el error

-- 1. Eliminar duplicados del registro específico que está causando problemas
WITH duplicates_to_remove AS (
  SELECT id
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY quantum_customer_id, org_id 
             ORDER BY created_at DESC
           ) as rn
    FROM contacts 
    WHERE client_type = 'empresa' 
      AND quantum_customer_id IS NOT NULL
      AND quantum_customer_id != ''
  ) ranked
  WHERE rn > 1
)
DELETE FROM contacts 
WHERE id IN (SELECT id FROM duplicates_to_remove);

-- 2. Verificar que no queden duplicados
-- Si hay duplicados, mostrar los detalles
DO $$
DECLARE
  duplicate_info RECORD;
  has_duplicates BOOLEAN := FALSE;
BEGIN
  FOR duplicate_info IN 
    SELECT quantum_customer_id, org_id, COUNT(*) as cnt,
           array_agg(id) as ids,
           array_agg(name) as names
    FROM contacts 
    WHERE client_type = 'empresa' 
      AND quantum_customer_id IS NOT NULL
      AND quantum_customer_id != ''
    GROUP BY quantum_customer_id, org_id 
    HAVING COUNT(*) > 1
    LIMIT 5
  LOOP
    has_duplicates := TRUE;
    RAISE NOTICE 'Duplicado encontrado: quantum_id=%, org_id=%, count=%, ids=%, names=%', 
      duplicate_info.quantum_customer_id, 
      duplicate_info.org_id, 
      duplicate_info.cnt,
      duplicate_info.ids,
      duplicate_info.names;
  END LOOP;
  
  IF has_duplicates THEN
    RAISE EXCEPTION 'Aún existen duplicados que deben ser eliminados manualmente';
  END IF;
END $$;

-- 3. Ahora intentar crear el constraint único
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_quantum_customer_org_unique;
ALTER TABLE contacts 
ADD CONSTRAINT contacts_quantum_customer_org_unique 
UNIQUE (quantum_customer_id, org_id);

-- 4. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_contacts_quantum_search 
ON contacts (quantum_customer_id, org_id, client_type) 
WHERE quantum_customer_id IS NOT NULL;