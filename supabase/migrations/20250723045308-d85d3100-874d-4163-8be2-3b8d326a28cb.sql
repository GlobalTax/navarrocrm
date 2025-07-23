
-- Crear el constraint único para prevenir duplicaciones futuras
ALTER TABLE public.contacts 
ADD CONSTRAINT unique_quantum_customer_per_org 
UNIQUE (quantum_customer_id, org_id);

-- Crear índice para mejorar performance en consultas de duplicados
CREATE INDEX IF NOT EXISTS idx_contacts_quantum_customer_org 
ON public.contacts (quantum_customer_id, org_id) 
WHERE quantum_customer_id IS NOT NULL;

-- Función para detectar y reportar duplicados potenciales
CREATE OR REPLACE FUNCTION detect_quantum_duplicates(org_uuid uuid)
RETURNS TABLE(
    quantum_id TEXT,
    duplicate_count INTEGER,
    contact_names TEXT[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.quantum_customer_id::TEXT,
        COUNT(*)::INTEGER,
        array_agg(c.name)::TEXT[]
    FROM public.contacts c
    WHERE c.org_id = org_uuid
      AND c.quantum_customer_id IS NOT NULL
      AND c.client_type = 'empresa'
    GROUP BY c.quantum_customer_id
    HAVING COUNT(*) > 1;
END $$;
