-- Re-arquitectura: PASO A PASO - Crear tabla employee_profiles

-- Paso 1: Crear tabla employee_profiles
CREATE TABLE public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Datos específicos de empleados (migrados de simple_employees)
  employee_number VARCHAR(50),
  hire_date DATE,
  termination_date DATE,
  contract_type VARCHAR(50) DEFAULT 'full_time',
  employment_status VARCHAR(50) DEFAULT 'active',
  working_hours_per_week INTEGER DEFAULT 40,
  
  -- Información salarial y departamento
  salary DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  department_id UUID,
  department_name VARCHAR(255), -- Temporal para migración
  manager_id UUID REFERENCES public.users(id),
  
  -- Información adicional
  position_title VARCHAR(255),
  work_location VARCHAR(255),
  benefits JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Información personal adicional
  birth_date DATE,
  address_street TEXT,
  address_city VARCHAR(255),
  address_postal_code VARCHAR(50),
  address_country VARCHAR(255) DEFAULT 'España',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  dni_nie VARCHAR(50),
  social_security_number VARCHAR(100),
  bank_account VARCHAR(100),
  
  -- Skills y educación
  skills TEXT[],
  languages TEXT[],
  education_level VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Constraints
  CONSTRAINT unique_employee_per_org UNIQUE (user_id, org_id),
  CONSTRAINT valid_employment_status CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave'))
);

-- Paso 2: Configurar RLS para employee_profiles
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Policy para ver profiles de empleados de la org
CREATE POLICY "Users can view employee profiles from their org"
ON public.employee_profiles
FOR SELECT
USING (org_id = get_user_org_id());

-- Policy para crear profiles (solo partners/managers)
CREATE POLICY "Partners and managers can create employee profiles"
ON public.employee_profiles
FOR INSERT
WITH CHECK (
  org_id = get_user_org_id() 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('partner', 'area_manager')
  )
);

-- Policy para actualizar profiles
CREATE POLICY "Partners and managers can update employee profiles"
ON public.employee_profiles
FOR UPDATE
USING (
  org_id = get_user_org_id() 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('partner', 'area_manager')
  )
);

-- Policy para eliminar profiles
CREATE POLICY "Partners and managers can delete employee profiles"
ON public.employee_profiles
FOR DELETE
USING (
  org_id = get_user_org_id() 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('partner', 'area_manager')
  )
);

-- Paso 3: Crear trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_employee_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_employee_profiles_updated_at
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_employee_profiles_updated_at();

-- Paso 4: Crear índices para optimizar consultas
CREATE INDEX idx_employee_profiles_user_id ON public.employee_profiles(user_id);
CREATE INDEX idx_employee_profiles_org_id ON public.employee_profiles(org_id);
CREATE INDEX idx_employee_profiles_department_id ON public.employee_profiles(department_id);
CREATE INDEX idx_employee_profiles_manager_id ON public.employee_profiles(manager_id);
CREATE INDEX idx_employee_profiles_employment_status ON public.employee_profiles(employment_status);
CREATE INDEX idx_employee_profiles_department_name ON public.employee_profiles(department_name);

-- Agregar índice único para employee_number por organización
CREATE UNIQUE INDEX idx_employee_profiles_number_org 
ON public.employee_profiles(employee_number, org_id) 
WHERE employee_number IS NOT NULL;