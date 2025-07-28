-- LIMPIEZA COMPLETA DE DUPLICADOS POR NOMBRE Y EMAIL
-- Eliminar duplicados manteniendo el más reciente por nombre + org_id

-- Paso 1: Crear tabla temporal con los IDs a mantener (más recientes por nombre + org_id)
CREATE TEMP TABLE contacts_to_keep_by_name AS
SELECT DISTINCT ON (UPPER(name), org_id) id
FROM contacts 
WHERE client_type = 'empresa'
  AND name IS NOT NULL 
  AND TRIM(name) != ''
ORDER BY UPPER(name), org_id, created_at DESC;

-- Paso 2: Eliminar duplicados que NO están en la lista de "mantener"
DELETE FROM contacts 
WHERE client_type = 'empresa'
  AND name IS NOT NULL 
  AND TRIM(name) != ''
  AND id NOT IN (SELECT id FROM contacts_to_keep_by_name);

-- Paso 3: Verificar resultados finales
SELECT 
  'DESPUÉS DE LIMPIEZA' as fase,
  COUNT(*) as total_empresas,
  COUNT(DISTINCT UPPER(name)) as nombres_unicos
FROM contacts 
WHERE client_type = 'empresa';