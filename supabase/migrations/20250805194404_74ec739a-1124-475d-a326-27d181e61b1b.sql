-- Eliminar sistema complejo de empleados existente
DROP TABLE IF EXISTS public.employee_profiles CASCADE;
DROP TABLE IF EXISTS public.employment_contracts CASCADE;
DROP TABLE IF EXISTS public.salary_history CASCADE;
DROP TABLE IF EXISTS public.employee_education CASCADE;
DROP TABLE IF EXISTS public.autonomous_collaborators CASCADE;
DROP TABLE IF EXISTS public.time_attendance CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;

-- Crear nueva tabla simple para empleados
CREATE TABLE public.simple_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary NUMERIC(10,2),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.simple_employees ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view employees from their org" 
ON public.simple_employees 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create employees in their org" 
ON public.simple_employees 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update employees in their org" 
ON public.simple_employees 
FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete employees in their org" 
ON public.simple_employees 
FOR DELETE 
USING (org_id = get_user_org_id());

-- Crear índices
CREATE INDEX idx_simple_employees_org_id ON public.simple_employees(org_id);
CREATE INDEX idx_simple_employees_status ON public.simple_employees(status);

-- Crear trigger para updated_at
CREATE TRIGGER update_simple_employees_updated_at
BEFORE UPDATE ON public.simple_employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();