
-- Corregir las funciones para incluir SET search_path = '' como medida de seguridad
-- Esto previene ataques de manipulación del search path

-- Actualizar función validate_calendar_event_dates
CREATE OR REPLACE FUNCTION public.validate_calendar_event_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Validar que end_datetime sea posterior a start_datetime
  IF NEW.end_datetime <= NEW.start_datetime THEN
    RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
  END IF;
  
  -- Si es evento de todo el día, asegurar que las horas sean coherentes
  IF NEW.is_all_day = true THEN
    NEW.start_datetime := date_trunc('day', NEW.start_datetime);
    NEW.end_datetime := date_trunc('day', NEW.end_datetime) + INTERVAL '23 hours 59 minutes';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Actualizar función generate_matter_number
CREATE OR REPLACE FUNCTION public.generate_matter_number(org_uuid UUID)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_year INT;
  matter_count INT;
  matter_number VARCHAR(50);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Count existing matters for this year and org
  SELECT COUNT(*) INTO matter_count
  FROM public.cases 
  WHERE org_id = org_uuid 
  AND EXTRACT(YEAR FROM date_opened) = current_year;
  
  -- Generate matter number: YYYY-NNNN format
  matter_number := current_year || '-' || LPAD((matter_count + 1)::TEXT, 4, '0');
  
  RETURN matter_number;
END;
$function$;

-- Actualizar función is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
$function$;

-- Actualizar función update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;
