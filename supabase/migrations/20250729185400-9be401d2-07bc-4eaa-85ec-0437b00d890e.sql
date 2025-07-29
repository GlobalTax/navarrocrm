-- Deshabilitar temporalmente el trigger de auditoría
DROP TRIGGER IF EXISTS log_proposal_changes ON public.proposals;

-- Borrar todos los datos de propuestas (datos de prueba)
-- 1. Borrar líneas de propuestas
DELETE FROM public.proposal_line_items;

-- 2. Borrar logs de auditoría de propuestas  
DELETE FROM public.proposal_audit_log;

-- 3. Borrar propuestas
DELETE FROM public.proposals;

-- Recrear el trigger de auditoría
CREATE TRIGGER log_proposal_changes
    BEFORE INSERT OR UPDATE OR DELETE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.log_proposal_changes();