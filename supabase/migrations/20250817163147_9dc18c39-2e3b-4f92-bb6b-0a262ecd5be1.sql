-- Añadir campo billing_status a time_entries para mejorar el flujo de facturación
ALTER TABLE public.time_entries 
ADD COLUMN billing_status character varying DEFAULT 'unbilled' CHECK (billing_status IN ('unbilled', 'billed', 'invoiced'));

-- Crear índice para mejor performance en consultas de facturación
CREATE INDEX idx_time_entries_billing_status ON public.time_entries(billing_status, org_id, is_billable);

-- Insertar algunos datos de prueba para propuestas (solo si no existen)
INSERT INTO public.proposals (
  org_id, 
  contact_id, 
  title, 
  description, 
  total_amount, 
  status,
  is_recurring,
  recurring_frequency,
  contract_start_date,
  created_by
)
SELECT 
  c.org_id,
  c.id as contact_id,
  'Asesoría Fiscal Mensual - ' || c.name,
  'Servicios de asesoría fiscal y contable mensual para ' || c.name,
  750.00,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY c.created_at) % 3 = 0 THEN 'won'
    WHEN ROW_NUMBER() OVER (ORDER BY c.created_at) % 3 = 1 THEN 'sent'
    ELSE 'draft'
  END as status,
  true as is_recurring,
  'monthly' as recurring_frequency,
  CURRENT_DATE as contract_start_date,
  (SELECT id FROM public.users WHERE org_id = c.org_id LIMIT 1) as created_by
FROM public.contacts c
WHERE c.relationship_type = 'cliente'
AND NOT EXISTS (
  SELECT 1 FROM public.proposals p 
  WHERE p.contact_id = c.id
)
LIMIT 5;

-- Asociar correctamente algunos time_entries existentes a casos específicos
UPDATE public.time_entries 
SET case_id = (
  SELECT ca.id 
  FROM public.cases ca 
  WHERE ca.org_id = time_entries.org_id 
  AND ca.contact_id IS NOT NULL
  ORDER BY ca.created_at 
  LIMIT 1
)
WHERE case_id IS NULL 
AND org_id IN (SELECT DISTINCT org_id FROM public.cases WHERE contact_id IS NOT NULL);