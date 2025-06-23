
-- Fase 1: Cambios en Base de Datos
-- Renombrar la tabla clients a contacts
ALTER TABLE public.clients RENAME TO contacts;

-- Agregar el campo relationship_type para distinguir entre prospecto, cliente, ex_cliente
ALTER TABLE public.contacts 
ADD COLUMN relationship_type character varying DEFAULT 'prospecto';

-- Actualizar los valores existentes basándose en el campo status
UPDATE public.contacts 
SET relationship_type = CASE 
  WHEN status = 'activo' THEN 'cliente'
  WHEN status = 'prospecto' THEN 'prospecto'
  WHEN status = 'inactivo' THEN 'ex_cliente'
  WHEN status = 'bloqueado' THEN 'ex_cliente'
  ELSE 'prospecto'
END;

-- Hacer el campo NOT NULL después de establecer los valores
ALTER TABLE public.contacts 
ALTER COLUMN relationship_type SET NOT NULL;

-- Actualizar las referencias de foreign keys en otras tablas
ALTER TABLE public.cases RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.client_documents RENAME TO contact_documents;
ALTER TABLE public.contact_documents RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.client_notes RENAME TO contact_notes;
ALTER TABLE public.contact_notes RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.calendar_events RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.proposals RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.recurring_fees RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.retainer_contracts RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.recurring_invoices RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.email_threads RENAME COLUMN client_id TO contact_id;
ALTER TABLE public.tasks RENAME COLUMN client_id TO contact_id;

-- Actualizar índices y constraints si existen
-- Los nombres de constraints se actualizan automáticamente con el rename

-- Crear un índice para el nuevo campo relationship_type
CREATE INDEX idx_contacts_relationship_type ON public.contacts(relationship_type);

-- Crear un índice compuesto para consultas comunes
CREATE INDEX idx_contacts_org_relationship_status ON public.contacts(org_id, relationship_type, status);
