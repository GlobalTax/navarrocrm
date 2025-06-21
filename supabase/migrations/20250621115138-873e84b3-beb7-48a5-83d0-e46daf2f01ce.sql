
-- Crear enum para roles de usuario incluyendo super_admin
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'senior', 'junior', 'finance');

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, org_id)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Crear tabla para logs de uso de IA
CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name VARCHAR(100) NOT NULL DEFAULT 'ai-assistant',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost DECIMAL(10,6),
  duration_ms INTEGER,
  model_used VARCHAR(50) DEFAULT 'gpt-4o-mini',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en ai_usage_logs
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar si un usuario es super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin());

-- Políticas RLS para ai_usage_logs
CREATE POLICY "Super admins can view all AI usage logs" ON public.ai_usage_logs
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "System can insert AI usage logs" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_ai_usage_logs_org_date ON public.ai_usage_logs(org_id, created_at);
CREATE INDEX idx_ai_usage_logs_user_date ON public.ai_usage_logs(user_id, created_at);
CREATE INDEX idx_user_roles_user_role ON public.user_roles(user_id, role);

-- Trigger para actualizar updated_at en user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
