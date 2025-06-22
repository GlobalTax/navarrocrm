
-- Crear tipo ENUM para el estado de la propuesta
CREATE TYPE public.proposal_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'accepted',
    'declined',
    'invoiced',
    'archived'
);

-- Modificar tabla proposals existente para añadir nuevos campos
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS proposal_number text,
ADD COLUMN IF NOT EXISTS introduction text,
ADD COLUMN IF NOT EXISTS scope_of_work text,
ADD COLUMN IF NOT EXISTS timeline text,
ADD COLUMN IF NOT EXISTS pricing_tiers_data jsonb,
ADD COLUMN IF NOT EXISTS currency character varying(3) DEFAULT 'EUR';

-- Actualizar el tipo de status si no existe ya
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_status') THEN
        ALTER TABLE public.proposals 
        ALTER COLUMN status TYPE public.proposal_status 
        USING status::public.proposal_status;
    END IF;
END $$;

-- Añadir comentarios para documentación
COMMENT ON TABLE public.proposals IS 'Stores commercial proposals sent to clients.';
COMMENT ON COLUMN public.proposals.pricing_tiers_data IS 'Flexible JSONB field to store pricing tiers and services.';

-- Crear índices adicionales si no existen
CREATE INDEX IF NOT EXISTS idx_proposals_proposal_number ON public.proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposals_currency ON public.proposals(currency);

-- Función para generar número de propuesta automático
CREATE OR REPLACE FUNCTION public.generate_proposal_number(org_uuid uuid)
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_year INT;
  proposal_count INT;
  proposal_number VARCHAR(50);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Count existing proposals for this year and org
  SELECT COUNT(*) INTO proposal_count
  FROM public.proposals 
  WHERE org_id = org_uuid 
  AND EXTRACT(YEAR FROM created_at) = current_year;
  
  -- Generate proposal number: PROP-YYYY-NNNN format
  proposal_number := 'PROP-' || current_year || '-' || LPAD((proposal_count + 1)::TEXT, 4, '0');
  
  RETURN proposal_number;
END;
$function$;

-- Trigger para generar automáticamente el número de propuesta
CREATE OR REPLACE FUNCTION public.set_proposal_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := public.generate_proposal_number(NEW.org_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS set_proposal_number_trigger ON public.proposals;
CREATE TRIGGER set_proposal_number_trigger
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_number();
