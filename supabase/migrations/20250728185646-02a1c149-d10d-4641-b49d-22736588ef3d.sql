-- FASE 1: LIMPIEZA COMPLETA Y AGRESIVA DE DUPLICADOS
-- Eliminar duplicados de quantum_customer_id manteniendo solo el más reciente por org_id

-- Crear tabla temporal con los IDs a mantener (más recientes por quantum_customer_id + org_id)
CREATE TEMP TABLE contacts_to_keep AS
SELECT DISTINCT ON (quantum_customer_id, org_id) id
FROM contacts 
WHERE quantum_customer_id IS NOT NULL 
  AND quantum_customer_id != ''
ORDER BY quantum_customer_id, org_id, created_at DESC;

-- Eliminar todos los duplicados que NO están en la lista de "mantener"
DELETE FROM contacts 
WHERE quantum_customer_id IS NOT NULL 
  AND quantum_customer_id != ''
  AND id NOT IN (SELECT id FROM contacts_to_keep);

-- FASE 2: PREVENCIÓN - Agregar constraint único para evitar futuros duplicados
-- Primero crear un índice único parcial (solo para registros con quantum_customer_id)
CREATE UNIQUE INDEX CONCURRENTLY idx_contacts_quantum_unique 
ON contacts (quantum_customer_id, org_id) 
WHERE quantum_customer_id IS NOT NULL AND quantum_customer_id != '';

-- Agregar constraint único usando el índice
ALTER TABLE contacts 
ADD CONSTRAINT contacts_quantum_customer_unique 
EXCLUDE USING btree (quantum_customer_id WITH =, org_id WITH =) 
WHERE (quantum_customer_id IS NOT NULL AND quantum_customer_id != '');

-- Verificar resultados
SELECT 
  COUNT(*) as total_contacts,
  COUNT(CASE WHEN quantum_customer_id IS NOT NULL THEN 1 END) as quantum_contacts,
  COUNT(DISTINCT quantum_customer_id) FILTER (WHERE quantum_customer_id IS NOT NULL) as unique_quantum_ids
FROM contacts;