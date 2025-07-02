-- Crear tabla para onboarding de empleados
CREATE TABLE public.employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  position_title VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Datos del empleado en formato JSON
  personal_data JSONB DEFAULT '{}',
  contact_data JSONB DEFAULT '{}', 
  banking_data JSONB DEFAULT '{}',
  job_data JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  
  -- Control de proceso
  current_step INTEGER DEFAULT 1,
  signed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.employee_onboarding ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their org onboarding records" ON public.employee_onboarding
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create onboarding records in their org" ON public.employee_onboarding
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update their org onboarding records" ON public.employee_onboarding
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Public can access valid tokens" ON public.employee_onboarding
  FOR ALL USING (token IS NOT NULL AND expires_at > now() AND status = 'pending');

-- Función para generar token único
CREATE OR REPLACE FUNCTION public.generate_onboarding_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Generar token único usando UUIDs concatenados
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$$;

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_onboarding()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Trigger para updated_at
CREATE TRIGGER update_employee_onboarding_updated_at
  BEFORE UPDATE ON public.employee_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_employee_onboarding_token ON public.employee_onboarding(token);
CREATE INDEX idx_employee_onboarding_org_status ON public.employee_onboarding(org_id, status);
CREATE INDEX idx_employee_onboarding_expires ON public.employee_onboarding(expires_at);

-- Comentarios para documentación
COMMENT ON TABLE public.employee_onboarding IS 'Gestión del proceso de onboarding de nuevos empleados';
COMMENT ON COLUMN public.employee_onboarding.token IS 'Token único para acceso público al formulario';
COMMENT ON COLUMN public.employee_onboarding.personal_data IS 'Datos personales: nombre, apellidos, DNI, fecha nacimiento, etc.';
COMMENT ON COLUMN public.employee_onboarding.contact_data IS 'Datos de contacto: teléfono, dirección, contacto emergencia, etc.';
COMMENT ON COLUMN public.employee_onboarding.banking_data IS 'Datos bancarios: IBAN, banco, etc.';
COMMENT ON COLUMN public.employee_onboarding.job_data IS 'Datos del puesto: salario, horario, fecha inicio, etc.';
COMMENT ON COLUMN public.employee_onboarding.documents IS 'Array de documentos subidos por el empleado';
COMMENT ON COLUMN public.employee_onboarding.current_step IS 'Paso actual del formulario multi-paso';