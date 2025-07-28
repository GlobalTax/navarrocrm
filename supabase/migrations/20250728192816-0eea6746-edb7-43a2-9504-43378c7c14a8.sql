-- SECURITY FIX: Complete remaining database functions (Part 3)

-- Fix remaining functions with secure search_path
CREATE OR REPLACE FUNCTION public.is_system_setup()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Verificar si existe al menos una organización Y al menos un usuario
  RETURN EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id IS NOT NULL 
    LIMIT 1
  ) AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE org_id IS NOT NULL 
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, devolver false para ser conservadores
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_setup_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  org_count int;
  user_count int;
  users_with_org int;
BEGIN
  SELECT COUNT(*) INTO org_count FROM public.organizations;
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO users_with_org FROM public.users WHERE org_id IS NOT NULL;
  
  RETURN jsonb_build_object(
    'organizations_count', org_count,
    'users_count', user_count,
    'users_with_org_count', users_with_org,
    'is_setup_complete', org_count > 0 AND users_with_org > 0,
    'checked_at', now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'is_setup_complete', false,
      'checked_at', now()
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  -- Usar consulta directa sin RLS para evitar recursión
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_ai_notification_configs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.get_monthly_time_stats(org_uuid uuid, target_month integer DEFAULT (EXTRACT(month FROM CURRENT_DATE))::integer, target_year integer DEFAULT (EXTRACT(year FROM CURRENT_DATE))::integer)
 RETURNS TABLE(day_date date, billable_hours numeric, office_admin_hours numeric, business_dev_hours numeric, internal_hours numeric, total_hours numeric, entry_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(te.created_at) as day_date,
    COALESCE(SUM(CASE WHEN te.entry_type = 'billable' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as billable_hours,
    COALESCE(SUM(CASE WHEN te.entry_type = 'office_admin' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as office_admin_hours,
    COALESCE(SUM(CASE WHEN te.entry_type = 'business_development' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as business_dev_hours,
    COALESCE(SUM(CASE WHEN te.entry_type = 'internal' THEN te.duration_minutes END) / 60.0, 0)::NUMERIC as internal_hours,
    COALESCE(SUM(te.duration_minutes) / 60.0, 0)::NUMERIC as total_hours,
    COUNT(*)::INTEGER as entry_count
  FROM public.time_entries te
  WHERE te.org_id = org_uuid 
    AND EXTRACT(MONTH FROM te.created_at) = target_month
    AND EXTRACT(YEAR FROM te.created_at) = target_year
  GROUP BY DATE(te.created_at)
  ORDER BY day_date;
END;
$function$;