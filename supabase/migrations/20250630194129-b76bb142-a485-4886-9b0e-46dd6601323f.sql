
-- Fase 1: Reestructuración de la Base de Datos
-- Agregar campo company_id para vincular personas físicas con empresas
ALTER TABLE public.contacts 
ADD COLUMN company_id uuid REFERENCES public.contacts(id);

-- Crear índice para optimizar consultas por client_type
CREATE INDEX IF NOT EXISTS idx_contacts_client_type ON public.contacts(client_type);

-- Crear índice para optimizar consultas por company_id
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);

-- Crear índice compuesto para consultas comunes
CREATE INDEX IF NOT EXISTS idx_contacts_org_client_type ON public.contacts(org_id, client_type);

-- Actualizar valor por defecto de client_type a 'particular'
ALTER TABLE public.contacts 
ALTER COLUMN client_type SET DEFAULT 'particular';

-- Actualizar registros existentes que no tengan client_type definido
UPDATE public.contacts 
SET client_type = 'particular' 
WHERE client_type IS NULL;

-- Crear función para validar relaciones persona-empresa
CREATE OR REPLACE FUNCTION validate_person_company_relation()
RETURNS TRIGGER AS $$
BEGIN
  -- Una empresa no puede estar vinculada a otra empresa
  IF NEW.client_type = 'empresa' AND NEW.company_id IS NOT NULL THEN
    RAISE EXCEPTION 'Una empresa no puede estar vinculada a otra empresa';
  END IF;
  
  -- Solo personas físicas pueden tener company_id
  IF NEW.client_type != 'empresa' AND NEW.company_id IS NOT NULL THEN
    -- Verificar que company_id apunta a una empresa válida
    IF NOT EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = NEW.company_id 
      AND client_type = 'empresa' 
      AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'La empresa especificada no existe o no es válida';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar relaciones
CREATE TRIGGER validate_person_company_relation_trigger
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION validate_person_company_relation();
