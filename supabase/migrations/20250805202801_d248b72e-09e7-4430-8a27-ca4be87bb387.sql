-- Fase 1: Mejoras del sistema de empleados
-- Añadir campos adicionales para un sistema más completo

ALTER TABLE public.simple_employees 
ADD COLUMN IF NOT EXISTS employee_number character varying UNIQUE,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_city character varying,
ADD COLUMN IF NOT EXISTS address_postal_code character varying,
ADD COLUMN IF NOT EXISTS address_country character varying DEFAULT 'España',
ADD COLUMN IF NOT EXISTS emergency_contact_name character varying,
ADD COLUMN IF NOT EXISTS emergency_contact_phone character varying,
ADD COLUMN IF NOT EXISTS dni_nie character varying,
ADD COLUMN IF NOT EXISTS social_security_number character varying,
ADD COLUMN IF NOT EXISTS bank_account character varying,
ADD COLUMN IF NOT EXISTS contract_type character varying DEFAULT 'indefinido',
ADD COLUMN IF NOT EXISTS working_hours_per_week integer DEFAULT 40,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS languages text[],
ADD COLUMN IF NOT EXISTS education_level character varying;

-- Crear función para generar número de empleado automático
CREATE OR REPLACE FUNCTION public.generate_employee_number(org_uuid uuid)
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_year INT;
  employee_count INT;
  employee_number VARCHAR(50);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Count existing employees for this org
  SELECT COUNT(*) INTO employee_count
  FROM public.simple_employees 
  WHERE org_id = org_uuid;
  
  -- Generate employee number: EMP-YYYY-NNNN format
  employee_number := 'EMP-' || current_year || '-' || LPAD((employee_count + 1)::TEXT, 4, '0');
  
  RETURN employee_number;
END;
$function$;

-- Trigger para generar número de empleado automáticamente
CREATE OR REPLACE FUNCTION public.set_employee_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.employee_number IS NULL THEN
    NEW.employee_number := public.generate_employee_number(NEW.org_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Crear trigger
DROP TRIGGER IF EXISTS set_employee_number_trigger ON public.simple_employees;
CREATE TRIGGER set_employee_number_trigger
  BEFORE INSERT ON public.simple_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_employee_number();