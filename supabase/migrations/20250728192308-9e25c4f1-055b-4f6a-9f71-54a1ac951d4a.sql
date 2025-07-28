-- SECURITY FIX: Add secure search_path to all database functions
-- This prevents schema-poisoning attacks

-- Fix generate_invitation_token function
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
 RETURNS character varying
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Generar un token único usando dos UUIDs concatenados sin guiones
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$function$;

-- Fix update_scheduled_reports_updated_at function
CREATE OR REPLACE FUNCTION public.update_scheduled_reports_updated_at()
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

-- Fix generate_onboarding_token function
CREATE OR REPLACE FUNCTION public.generate_onboarding_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Generar token único usando UUIDs concatenados
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$function$;

-- Fix update_quantum_invoices_updated_at function
CREATE OR REPLACE FUNCTION public.update_quantum_invoices_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix generate_signature_token function
CREATE OR REPLACE FUNCTION public.generate_signature_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$function$;

-- Fix cleanup_expired_onboarding function
CREATE OR REPLACE FUNCTION public.cleanup_expired_onboarding()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Marcar como expirados los registros vencidos
  UPDATE public.employee_onboarding 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
  AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$function$;

-- Fix cleanup_expired_invitations function
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  expired_count integer := 0;
BEGIN
  -- Marcar como expiradas las invitaciones vencidas
  UPDATE public.user_invitations 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
  AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Registrar en auditoría
  INSERT INTO public.user_audit_log (
    org_id, target_user_id, action_by, action_type, 
    details, new_value
  )
  SELECT DISTINCT 
    org_id, invited_by, invited_by, 'bulk_cleanup',
    'Limpieza automática de invitaciones expiradas',
    jsonb_build_object('expired_count', expired_count)
  FROM public.user_invitations 
  WHERE status = 'expired' 
  AND updated_at > (now() - interval '1 minute')
  LIMIT 1;
  
  RETURN expired_count;
END;
$function$;

-- Fix validate_calendar_event_dates function
CREATE OR REPLACE FUNCTION public.validate_calendar_event_dates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- Fix log_proposal_changes function
CREATE OR REPLACE FUNCTION public.log_proposal_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  action_type_val TEXT;
  old_values JSONB;
  new_values JSONB;
  user_id_val UUID;
BEGIN
  -- Determinar el tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'created';
    old_values := NULL;
    new_values := row_to_json(NEW)::jsonb;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar cambios específicos
    IF OLD.status != NEW.status THEN
      action_type_val := 'status_changed';
    ELSIF OLD.total_amount != NEW.total_amount THEN
      action_type_val := 'amount_changed';
    ELSIF OLD.sent_at IS NULL AND NEW.sent_at IS NOT NULL THEN
      action_type_val := 'sent';
    ELSIF OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL THEN
      action_type_val := 'accepted';
    ELSE
      action_type_val := 'updated';
    END IF;
    old_values := row_to_json(OLD)::jsonb;
    new_values := row_to_json(NEW)::jsonb;
  ELSIF TG_OP = 'DELETE' THEN
    action_type_val := 'deleted';
    old_values := row_to_json(OLD)::jsonb;
    new_values := NULL;
  END IF;

  -- Obtener el ID del usuario actual
  user_id_val := auth.uid();

  -- Insertar en el log de auditoría
  INSERT INTO public.proposal_audit_log (
    proposal_id, 
    org_id, 
    user_id, 
    action_type, 
    old_value, 
    new_value
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.org_id, OLD.org_id),
    user_id_val,
    action_type_val,
    old_values,
    new_values
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix log_proposal_action function
CREATE OR REPLACE FUNCTION public.log_proposal_action(proposal_id_param uuid, action_type_param text, details_param text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  org_id_val uuid;
BEGIN
  -- Obtener org_id de la propuesta
  SELECT org_id INTO org_id_val
  FROM public.proposals
  WHERE id = proposal_id_param;

  -- Insertar en el log de auditoría
  INSERT INTO public.proposal_audit_log (
    proposal_id, 
    org_id, 
    user_id, 
    action_type, 
    details
  ) VALUES (
    proposal_id_param,
    org_id_val,
    auth.uid(),
    action_type_param,
    details_param
  );
END;
$function$;