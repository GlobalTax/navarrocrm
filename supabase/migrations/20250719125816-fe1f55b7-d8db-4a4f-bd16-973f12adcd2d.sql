-- Crear trigger para validar relaciones persona-empresa
CREATE OR REPLACE FUNCTION public.validate_person_company_relation()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Aplicar el trigger a la tabla contacts
CREATE TRIGGER trigger_validate_person_company_relation
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.validate_person_company_relation();