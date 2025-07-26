-- 1. IDENTIFICAR Y LIMPIAR DUPLICADOS DE FORMA MÁS ROBUSTA
-- Primero, crear una función para limpiar duplicados de forma segura
CREATE OR REPLACE FUNCTION clean_quantum_duplicates()
RETURNS INTEGER AS $$
DECLARE
  duplicates_count INTEGER := 0;
  deleted_count INTEGER := 0;
BEGIN
  -- Crear tabla temporal con IDs a mantener (el más reciente de cada grupo)
  CREATE TEMP TABLE IF NOT EXISTS contacts_to_keep AS
  SELECT DISTINCT ON (quantum_customer_id, org_id) id
  FROM contacts 
  WHERE client_type = 'empresa' 
    AND quantum_customer_id IS NOT NULL
    AND quantum_customer_id != ''
  ORDER BY quantum_customer_id, org_id, created_at DESC;

  -- Contar duplicados antes de limpiar
  SELECT COUNT(*) INTO duplicates_count 
  FROM contacts 
  WHERE client_type = 'empresa' 
    AND quantum_customer_id IS NOT NULL
    AND quantum_customer_id != ''
    AND id NOT IN (SELECT id FROM contacts_to_keep);

  -- Eliminar duplicados manteniendo solo el más reciente
  DELETE FROM contacts 
  WHERE client_type = 'empresa' 
    AND quantum_customer_id IS NOT NULL
    AND quantum_customer_id != ''
    AND id NOT IN (SELECT id FROM contacts_to_keep);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Limpiar tabla temporal
  DROP TABLE IF EXISTS contacts_to_keep;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la limpieza
SELECT clean_quantum_duplicates() as duplicados_eliminados;

-- 2. AHORA CREAR EL CONSTRAINT ÚNICO
-- Verificar que no queden duplicados
DO $$
DECLARE
  remaining_duplicates INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_duplicates
  FROM (
    SELECT quantum_customer_id, org_id, COUNT(*) as cnt
    FROM contacts 
    WHERE client_type = 'empresa' 
      AND quantum_customer_id IS NOT NULL
      AND quantum_customer_id != ''
    GROUP BY quantum_customer_id, org_id 
    HAVING COUNT(*) > 1
  ) duplicates;

  IF remaining_duplicates > 0 THEN
    RAISE EXCEPTION 'Aún quedan % grupos de duplicados. No se puede crear el constraint.', remaining_duplicates;
  END IF;
END $$;

-- Eliminar constraint existente si existe
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_quantum_customer_org_unique;

-- Crear el constraint único
ALTER TABLE contacts 
ADD CONSTRAINT contacts_quantum_customer_org_unique 
UNIQUE (quantum_customer_id, org_id);

-- 3. CREAR ÍNDICE ADICIONAL PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_contacts_quantum_search 
ON contacts (quantum_customer_id, org_id, client_type) 
WHERE quantum_customer_id IS NOT NULL;

-- Limpiar función temporal
DROP FUNCTION clean_quantum_duplicates();