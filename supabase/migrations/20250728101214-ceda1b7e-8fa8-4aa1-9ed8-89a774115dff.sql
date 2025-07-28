-- LIMPIEZA DE DUPLICADOS DE QUANTUM
-- Eliminar duplicados manteniendo solo el registro más reciente por quantum_customer_id

-- Crear tabla temporal con los IDs a mantener (el más reciente por quantum_customer_id)
WITH latest_quantum_contacts AS (
  SELECT DISTINCT ON (quantum_customer_id, org_id) 
    id,
    quantum_customer_id,
    org_id,
    created_at,
    name
  FROM contacts 
  WHERE quantum_customer_id IS NOT NULL
    AND quantum_customer_id != ''
  ORDER BY quantum_customer_id, org_id, created_at DESC
)
-- Eliminar todos los registros de Quantum EXCEPTO los más recientes
DELETE FROM contacts 
WHERE quantum_customer_id IS NOT NULL 
  AND quantum_customer_id != ''
  AND id NOT IN (
    SELECT id FROM latest_quantum_contacts
  );

-- Estadísticas después de la limpieza
SELECT 
  'DESPUÉS DE LIMPIEZA' as momento,
  COUNT(*) as total_contacts,
  COUNT(CASE WHEN quantum_customer_id IS NOT NULL THEN 1 END) as quantum_contacts,
  COUNT(CASE WHEN client_type = 'empresa' AND quantum_customer_id IS NOT NULL THEN 1 END) as quantum_empresas,
  COUNT(CASE WHEN client_type = 'particular' AND quantum_customer_id IS NOT NULL THEN 1 END) as quantum_particulares
FROM contacts;