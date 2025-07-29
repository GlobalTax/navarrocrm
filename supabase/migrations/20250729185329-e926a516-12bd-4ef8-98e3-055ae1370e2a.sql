-- Borrar todos los datos de propuestas (datos de prueba)
-- Orden importante para evitar errores de claves foráneas

-- 1. Borrar líneas de propuestas
DELETE FROM public.proposal_line_items;

-- 2. Borrar logs de auditoría de propuestas  
DELETE FROM public.proposal_audit_log;

-- 3. Borrar propuestas
DELETE FROM public.proposals;