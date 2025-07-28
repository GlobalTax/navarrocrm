-- Actualizar todos los contactos existentes importados desde Quantum para que sean clientes
UPDATE contacts 
SET relationship_type = 'cliente', 
    updated_at = now()
WHERE source IN ('quantum_auto', 'quantum_import') 
  AND relationship_type = 'prospecto';

-- Obtener estadísticas de la actualización
SELECT 
  COUNT(*) as total_quantum_contacts,
  COUNT(CASE WHEN relationship_type = 'cliente' THEN 1 END) as clientes,
  COUNT(CASE WHEN relationship_type = 'prospecto' THEN 1 END) as prospectos,
  COUNT(CASE WHEN client_type = 'empresa' THEN 1 END) as empresas,
  COUNT(CASE WHEN client_type = 'particular' THEN 1 END) as particulares
FROM contacts 
WHERE source IN ('quantum_auto', 'quantum_import');