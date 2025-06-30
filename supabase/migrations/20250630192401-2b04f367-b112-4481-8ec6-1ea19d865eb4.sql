
-- 1. Cancelar todas las invitaciones pendientes existentes
UPDATE public.user_invitations 
SET status = 'cancelled', updated_at = now() 
WHERE status = 'pending';

-- 2. Crear función para limpiar invitaciones expiradas automáticamente
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 3. Crear función para asignar rol cuando se acepta una invitación
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Solo procesar cuando el status cambia a 'accepted'
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    -- Crear usuario en la tabla users (si no existe)
    INSERT INTO public.users (id, email, role, org_id, is_active)
    VALUES (
      auth.uid(), 
      NEW.email, 
      NEW.role, 
      NEW.org_id, 
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      role = NEW.role,
      org_id = NEW.org_id,
      is_active = true,
      updated_at = now();
    
    -- Registrar en auditoría
    INSERT INTO public.user_audit_log (
      org_id, target_user_id, action_by, action_type,
      new_value, details
    ) VALUES (
      NEW.org_id, auth.uid(), NEW.invited_by, 'invitation_accepted',
      jsonb_build_object('email', NEW.email, 'role', NEW.role),
      'Usuario creado tras aceptar invitación'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Crear trigger para manejar aceptación de invitaciones
DROP TRIGGER IF EXISTS trigger_invitation_acceptance ON public.user_invitations;
CREATE TRIGGER trigger_invitation_acceptance
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_invitation_acceptance();

-- 5. Asegurar que existe la función get_user_org_id (requerida para RLS)
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (SELECT org_id FROM public.users WHERE id = auth.uid());
END;
$$;

-- 6. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_invitations_status_expires 
ON public.user_invitations(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_audit_log_action_type 
ON public.user_audit_log(action_type, created_at);
