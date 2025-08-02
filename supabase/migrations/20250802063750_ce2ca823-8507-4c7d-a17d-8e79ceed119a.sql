-- Crear tabla para contratos de empleados
CREATE TABLE public.employee_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  contract_type VARCHAR(50) NOT NULL DEFAULT 'indefinido', -- indefinido, temporal, practicas, etc.
  position VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  start_date DATE NOT NULL,
  end_date DATE,
  salary_amount NUMERIC(10,2) NOT NULL,
  salary_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  working_hours INTEGER NOT NULL DEFAULT 40, -- horas semanales
  vacation_days INTEGER NOT NULL DEFAULT 22,
  contract_document_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, terminated, suspended
  termination_date DATE,
  termination_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Crear tabla para historial de salarios
CREATE TABLE public.employee_salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES public.employee_contracts(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  previous_salary NUMERIC(10,2),
  new_salary NUMERIC(10,2) NOT NULL,
  salary_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  change_type VARCHAR(30) NOT NULL, -- increase, decrease, bonus, adjustment
  change_reason TEXT,
  effective_date DATE NOT NULL,
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Crear tabla para beneficios de empleados
CREATE TABLE public.employee_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES public.employee_contracts(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  benefit_type VARCHAR(50) NOT NULL, -- health_insurance, dental, transport, meal, phone, etc.
  benefit_name VARCHAR(255) NOT NULL,
  benefit_value NUMERIC(10,2), -- valor monetario del beneficio
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para employee_contracts
CREATE POLICY "Users can view contracts from their org" 
ON public.employee_contracts 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create contracts in their org" 
ON public.employee_contracts 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update contracts in their org" 
ON public.employee_contracts 
FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete contracts in their org" 
ON public.employee_contracts 
FOR DELETE 
USING (org_id = get_user_org_id());

-- Políticas RLS para employee_salaries
CREATE POLICY "Users can view salary history from their org" 
ON public.employee_salaries 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create salary records in their org" 
ON public.employee_salaries 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update salary records in their org" 
ON public.employee_salaries 
FOR UPDATE 
USING (org_id = get_user_org_id());

-- Políticas RLS para employee_benefits
CREATE POLICY "Users can view benefits from their org" 
ON public.employee_benefits 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create benefits in their org" 
ON public.employee_benefits 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update benefits in their org" 
ON public.employee_benefits 
FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete benefits in their org" 
ON public.employee_benefits 
FOR DELETE 
USING (org_id = get_user_org_id());

-- Crear índices para optimizar consultas
CREATE INDEX idx_employee_contracts_user_id ON public.employee_contracts(user_id);
CREATE INDEX idx_employee_contracts_org_id ON public.employee_contracts(org_id);
CREATE INDEX idx_employee_contracts_status ON public.employee_contracts(status);
CREATE INDEX idx_employee_salaries_user_id ON public.employee_salaries(user_id);
CREATE INDEX idx_employee_salaries_contract_id ON public.employee_salaries(contract_id);
CREATE INDEX idx_employee_benefits_user_id ON public.employee_benefits(user_id);
CREATE INDEX idx_employee_benefits_contract_id ON public.employee_benefits(contract_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_employee_contracts_updated_at
BEFORE UPDATE ON public.employee_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_benefits_updated_at
BEFORE UPDATE ON public.employee_benefits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();