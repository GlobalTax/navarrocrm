-- Deshabilitar todas las restricciones de claves foráneas relacionadas con propuestas temporalmente
ALTER TABLE public.proposal_line_items DROP CONSTRAINT IF EXISTS proposal_line_items_proposal_id_fkey;
ALTER TABLE public.proposal_audit_log DROP CONSTRAINT IF EXISTS proposal_audit_log_proposal_id_fkey;

-- Deshabilitar el trigger de auditoría
DROP TRIGGER IF EXISTS log_proposal_changes ON public.proposals;

-- Borrar todos los datos de propuestas
DELETE FROM public.proposal_line_items;
DELETE FROM public.proposal_audit_log;
DELETE FROM public.proposals;

-- Recrear las restricciones de claves foráneas
ALTER TABLE public.proposal_line_items 
ADD CONSTRAINT proposal_line_items_proposal_id_fkey 
FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;

ALTER TABLE public.proposal_audit_log 
ADD CONSTRAINT proposal_audit_log_proposal_id_fkey 
FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;

-- Recrear el trigger de auditoría
CREATE TRIGGER log_proposal_changes
    BEFORE INSERT OR UPDATE OR DELETE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.log_proposal_changes();