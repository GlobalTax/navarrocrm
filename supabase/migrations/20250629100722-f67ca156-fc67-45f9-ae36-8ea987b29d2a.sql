
-- Crear tabla de auditoría de propuestas
CREATE TABLE public.proposal_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type character varying NOT NULL,
  old_value jsonb,
  new_value jsonb,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.proposal_audit_log ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean el historial de su organización
CREATE POLICY "Users can view audit log in their organization"
  ON public.proposal_audit_log
  FOR SELECT
  USING (org_id = public.get_user_org_id());

-- Política para que los usuarios puedan crear entradas de auditoría
CREATE POLICY "Users can create audit log entries in their organization"
  ON public.proposal_audit_log
  FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id());

-- Crear índices para optimización
CREATE INDEX idx_proposal_audit_log_proposal_id ON public.proposal_audit_log(proposal_id);
CREATE INDEX idx_proposal_audit_log_org_id ON public.proposal_audit_log(org_id);
CREATE INDEX idx_proposal_audit_log_created_at ON public.proposal_audit_log(created_at);
CREATE INDEX idx_proposal_audit_log_action_type ON public.proposal_audit_log(action_type);

-- Función para registrar cambios en propuestas
CREATE OR REPLACE FUNCTION public.log_proposal_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Crear trigger para auditoría automática
CREATE TRIGGER proposal_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_proposal_changes();

-- Función para registrar acciones manuales (duplicar, enviar, etc.)
CREATE OR REPLACE FUNCTION public.log_proposal_action(
  proposal_id_param uuid,
  action_type_param text,
  details_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;
