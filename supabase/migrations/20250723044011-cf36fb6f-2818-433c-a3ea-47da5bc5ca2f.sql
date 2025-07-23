
-- Script mejorado para limpiar empresas duplicadas de Quantum Economics
-- Con mejor manejo de errores y verificaciones paso a paso

-- 1. Primero, eliminar el constraint que podría existir parcialmente
DO $$
BEGIN
    ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS unique_quantum_customer_per_org;
EXCEPTION 
    WHEN OTHERS THEN 
        NULL; -- Ignorar si no existe
END $$;

-- 2. Crear una función temporal para la limpieza
CREATE OR REPLACE FUNCTION cleanup_quantum_duplicates()
RETURNS TABLE(
    action_type TEXT,
    record_count INTEGER,
    details TEXT
) LANGUAGE plpgsql AS $$
DECLARE
    duplicate_record RECORD;
    deleted_count INTEGER := 0;
    kept_count INTEGER := 0;
    relations_updated INTEGER := 0;
BEGIN
    -- Paso 1: Mostrar estadísticas iniciales
    RETURN QUERY
    SELECT 
        'INITIAL_STATS'::TEXT,
        COUNT(*)::INTEGER,
        'Empresas Quantum antes de limpieza'::TEXT
    FROM public.contacts 
    WHERE client_type = 'empresa' 
      AND source = 'quantum_auto'
      AND quantum_customer_id IS NOT NULL;

    -- Paso 2: Procesar duplicados uno por uno
    FOR duplicate_record IN 
        SELECT 
            quantum_customer_id,
            org_id,
            array_agg(id ORDER BY created_at DESC, updated_at DESC) as all_ids,
            COUNT(*) as duplicate_count
        FROM public.contacts 
        WHERE client_type = 'empresa' 
          AND source = 'quantum_auto'
          AND quantum_customer_id IS NOT NULL
        GROUP BY quantum_customer_id, org_id
        HAVING COUNT(*) > 1
    LOOP
        DECLARE
            keep_id UUID := duplicate_record.all_ids[1];
            delete_ids UUID[] := duplicate_record.all_ids[2:];
            current_delete_id UUID;
        BEGIN
            -- Actualizar relaciones para cada ID a eliminar
            FOREACH current_delete_id IN ARRAY delete_ids
            LOOP
                -- Actualizar contactos vinculados
                UPDATE public.contacts 
                SET company_id = keep_id 
                WHERE company_id = current_delete_id;
                
                -- Actualizar casos
                UPDATE public.cases 
                SET contact_id = keep_id 
                WHERE contact_id = current_delete_id;
                
                -- Actualizar documentos
                UPDATE public.contact_documents 
                SET contact_id = keep_id 
                WHERE contact_id = current_delete_id;
                
                -- Actualizar notas
                UPDATE public.contact_notes 
                SET contact_id = keep_id 
                WHERE contact_id = current_delete_id;
                
                -- Actualizar eventos
                UPDATE public.calendar_events 
                SET contact_id = keep_id 
                WHERE contact_id = current_delete_id;
                
                -- Actualizar propuestas
                UPDATE public.proposals 
                SET contact_id = keep_id 
                WHERE contact_id = current_delete_id;
                
                relations_updated := relations_updated + 1;
            END LOOP;
            
            -- Eliminar duplicados
            DELETE FROM public.contacts 
            WHERE id = ANY(delete_ids);
            
            deleted_count := deleted_count + array_length(delete_ids, 1);
            kept_count := kept_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Si hay error, continuar con el siguiente
                CONTINUE;
        END;
    END LOOP;

    -- Paso 3: Crear constraint único
    BEGIN
        ALTER TABLE public.contacts 
        ADD CONSTRAINT unique_quantum_customer_per_org 
        UNIQUE (quantum_customer_id, org_id);
        
        RETURN QUERY
        SELECT 
            'CONSTRAINT_ADDED'::TEXT,
            1::INTEGER,
            'Constraint único creado exitosamente'::TEXT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY
            SELECT 
                'CONSTRAINT_FAILED'::TEXT,
                0::INTEGER,
                ('Error al crear constraint: ' || SQLERRM)::TEXT;
    END;

    -- Paso 4: Estadísticas finales
    RETURN QUERY
    SELECT 
        'CLEANUP_SUMMARY'::TEXT,
        deleted_count::INTEGER,
        ('Eliminados: ' || deleted_count || ', Conservados: ' || kept_count || ', Relaciones actualizadas: ' || relations_updated)::TEXT;

    RETURN QUERY
    SELECT 
        'FINAL_STATS'::TEXT,
        COUNT(*)::INTEGER,
        'Empresas Quantum después de limpieza'::TEXT
    FROM public.contacts 
    WHERE client_type = 'empresa' 
      AND source = 'quantum_auto'
      AND quantum_customer_id IS NOT NULL;

    -- Verificar si quedan duplicados
    RETURN QUERY
    SELECT 
        'DUPLICATES_CHECK'::TEXT,
        COUNT(*)::INTEGER,
        'Duplicados restantes (debería ser 0)'::TEXT
    FROM (
        SELECT quantum_customer_id, org_id, COUNT(*) as cnt
        FROM public.contacts 
        WHERE client_type = 'empresa' 
          AND source = 'quantum_auto'
          AND quantum_customer_id IS NOT NULL
        GROUP BY quantum_customer_id, org_id
        HAVING COUNT(*) > 1
    ) remaining_duplicates;
END $$;

-- 3. Ejecutar la limpieza
SELECT * FROM cleanup_quantum_duplicates();

-- 4. Limpiar la función temporal
DROP FUNCTION cleanup_quantum_duplicates();
