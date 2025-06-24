
-- Crear tabla para invitaciones de usuarios
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  email CHARACTER VARYING NOT NULL,
  role CHARACTER VARYING NOT NULL,
  token CHARACTER VARYING NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status CHARACTER VARYING NOT NULL DEFAULT 'pending'
);

-- Crear tabla para permisos granulares de usuarios
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  module CHARACTER VARYING NOT NULL, -- 'cases', 'contacts', 'proposals', 'time_tracking', 'reports', etc.
  permission CHARACTER VARYING NOT NULL, -- 'read', 'write', 'delete', 'admin'
  granted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id, module, permission)
);

-- Crear tabla para auditoría de cambios de usuarios
CREATE TABLE public.user_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action_by UUID NOT NULL,
  action_type CHARACTER VARYING NOT NULL, -- 'role_change', 'permission_grant', 'permission_revoke', 'invitation_sent', 'user_deleted', 'user_activated'
  old_value JSONB,
  new_value JSONB,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar campos para soft delete y tracking a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_invitations
CREATE POLICY "Users can view invitations from their org" 
  ON public.user_invitations 
  FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create invitations in their org" 
  ON public.user_invitations 
  FOR INSERT 
  WITH CHECK (org_id = get_user_org_id() AND invited_by = auth.uid());

CREATE POLICY "Users can update invitations they created" 
  ON public.user_invitations 
  FOR UPDATE 
  USING (org_id = get_user_org_id() AND invited_by = auth.uid());

-- Políticas RLS para user_permissions
CREATE POLICY "Users can view permissions from their org" 
  ON public.user_permissions 
  FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage permissions in their org" 
  ON public.user_permissions 
  FOR ALL 
  USING (org_id = get_user_org_id());

-- Políticas RLS para user_audit_log
CREATE POLICY "Users can view audit log from their org" 
  ON public.user_audit_log 
  FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create audit entries in their org" 
  ON public.user_audit_log 
  FOR INSERT 
  WITH CHECK (org_id = get_user_org_id() AND action_by = auth.uid());

-- Crear función para generar tokens de invitación seguros
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS CHARACTER VARYING
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_user_invitations_org_id ON public.user_invitations(org_id);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(token);
CREATE INDEX idx_user_invitations_expires_at ON public.user_invitations(expires_at);

CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_org_id ON public.user_permissions(org_id);
CREATE INDEX idx_user_permissions_module ON public.user_permissions(module);

CREATE INDEX idx_user_audit_log_org_id ON public.user_audit_log(org_id);
CREATE INDEX idx_user_audit_log_target_user ON public.user_audit_log(target_user_id);
CREATE INDEX idx_user_audit_log_created_at ON public.user_audit_log(created_at);

CREATE INDEX idx_users_org_id_active ON public.users(org_id, is_active);
