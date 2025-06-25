
-- Corregir los datos existentes: cambiar relationship_type de 'prospecto' a 'cliente' 
-- para contactos que tienen status 'activo' ya que estos deberían ser considerados clientes
UPDATE public.contacts 
SET relationship_type = 'cliente'
WHERE status = 'activo' 
  AND relationship_type = 'prospecto';

-- También actualizar aquellos que tienen status NULL pero tienen información completa 
-- (email, teléfono y otros datos que indican que son clientes activos)
UPDATE public.contacts 
SET relationship_type = 'cliente',
    status = 'activo'
WHERE relationship_type = 'prospecto' 
  AND status IS NULL
  AND (email IS NOT NULL OR phone IS NOT NULL)
  AND name IS NOT NULL;

-- Crear un índice para mejorar el rendimiento de las consultas por relationship_type y status
CREATE INDEX IF NOT EXISTS idx_contacts_relationship_status 
ON public.contacts(relationship_type, status);
