
-- Fase 1: Arreglar constraint para upsert y permitir status 'partial'

-- 1. Reemplazar el índice parcial por un UNIQUE CONSTRAINT real que Supabase pueda usar con ON CONFLICT
DROP INDEX IF EXISTS idx_contacts_quantum_unique;

-- Crear constraint único real (no parcial) para que ON CONFLICT funcione correctamente
-- Los NULLs en quantum_customer_id no generan conflicto por naturaleza de UNIQUE en Postgres
ALTER TABLE public.contacts 
ADD CONSTRAINT uq_contacts_org_quantum 
UNIQUE (org_id, quantum_customer_id);

-- 2. Ampliar check de quantum_sync_history.status para incluir 'partial'
ALTER TABLE public.quantum_sync_history 
DROP CONSTRAINT IF EXISTS quantum_sync_history_status_check;

ALTER TABLE public.quantum_sync_history 
ADD CONSTRAINT quantum_sync_history_status_check 
CHECK (status IN ('success', 'error', 'in_progress', 'partial'));
