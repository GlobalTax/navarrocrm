-- Usar TRUNCATE para borrar todos los datos sin activar triggers
-- TRUNCATE es más eficiente y evita problemas con constraints

TRUNCATE TABLE public.proposal_line_items CASCADE;
TRUNCATE TABLE public.proposal_audit_log CASCADE;  
TRUNCATE TABLE public.proposals CASCADE;