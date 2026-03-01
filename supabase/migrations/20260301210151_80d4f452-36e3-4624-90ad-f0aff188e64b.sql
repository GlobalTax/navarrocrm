-- Añadir columna recurring_fee_id a time_entries
ALTER TABLE public.time_entries 
ADD COLUMN recurring_fee_id UUID REFERENCES public.recurring_fees(id);

-- Índice para consultas por cuota recurrente
CREATE INDEX idx_time_entries_recurring_fee ON public.time_entries(recurring_fee_id) WHERE recurring_fee_id IS NOT NULL;