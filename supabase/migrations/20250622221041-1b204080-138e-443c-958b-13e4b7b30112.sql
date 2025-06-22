
-- Añadir la clave foránea faltante entre recurring_fees y clients
ALTER TABLE public.recurring_fees 
ADD CONSTRAINT recurring_fees_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Añadir índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_recurring_fees_client_id ON public.recurring_fees(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_fees_org_id ON public.recurring_fees(org_id);
CREATE INDEX IF NOT EXISTS idx_recurring_fees_status ON public.recurring_fees(status);
