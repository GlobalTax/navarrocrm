-- Agregar columna outlook_id a contacts si no existe
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS outlook_id character varying;

-- Crear índice para outlook_id para mejores consultas
CREATE INDEX IF NOT EXISTS idx_contacts_outlook_id 
ON public.contacts(outlook_id) 
WHERE outlook_id IS NOT NULL;