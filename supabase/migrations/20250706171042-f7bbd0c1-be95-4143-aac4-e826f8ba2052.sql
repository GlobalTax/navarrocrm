-- Crear foreign key constraint entre proposals.contact_id y contacts.id
ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_contact_id_fkey 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;