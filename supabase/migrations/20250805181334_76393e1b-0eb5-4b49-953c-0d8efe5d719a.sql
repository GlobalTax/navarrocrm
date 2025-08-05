-- FASE 1: Extensión del Sistema de Usuarios - Nuevas tablas para gestión de empleados

-- 1. Tabla de perfiles extendidos de empleados
CREATE TABLE public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información personal extendida
  employee_number VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  marital_status VARCHAR(50),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  
  -- Información laboral
  employment_type VARCHAR(50) NOT NULL DEFAULT 'fixed', -- 'fixed', 'autonomous', 'temporary'
  hire_date DATE NOT NULL,
  probation_end_date DATE,
  work_location VARCHAR(255),
  work_schedule VARCHAR(100), -- 'full_time', 'part_time', 'flexible'
  remote_work_allowed BOOLEAN DEFAULT false,
  
  -- Información bancaria
  bank_name VARCHAR(255),
  bank_account VARCHAR(100),
  tax_id VARCHAR(50),
  social_security_number VARCHAR(50),
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- 2. Tabla de contratos laborales
CREATE TABLE public.employment_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información del contrato
  contract_type VARCHAR(50) NOT NULL, -- 'indefinido', 'temporal', 'practicas', 'autonomo'
  contract_number VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  trial_period_months INTEGER DEFAULT 0,
  
  -- Condiciones salariales
  base_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  salary_frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual', 'hourly'
  overtime_rate NUMERIC(5,2) DEFAULT 1.5,
  
  -- Condiciones laborales
  weekly_hours INTEGER DEFAULT 40,
  vacation_days_per_year INTEGER DEFAULT 22,
  sick_leave_days_per_year INTEGER DEFAULT 30,
  
  -- Estado del contrato
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'terminated', 'suspended'
  termination_date DATE,
  termination_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- 3. Historial de salarios
CREATE TABLE public.salary_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información del cambio salarial
  effective_date DATE NOT NULL,
  previous_salary NUMERIC(10,2),
  new_salary NUMERIC(10,2) NOT NULL,
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Detalles del cambio
  change_type VARCHAR(50) NOT NULL, -- 'increment', 'promotion', 'adjustment', 'bonus'
  change_percentage NUMERIC(5,2),
  reason TEXT,
  
  -- Aprobación
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- 4. Formación y educación de empleados
CREATE TABLE public.employee_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información educativa
  education_type VARCHAR(50) NOT NULL, -- 'university', 'vocational', 'certification', 'course'
  institution_name VARCHAR(255) NOT NULL,
  degree_title VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  
  -- Fechas
  start_date DATE,
  end_date DATE,
  graduation_date DATE,
  
  -- Estado y validación
  status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'in_progress', 'verified'
  is_verified BOOLEAN DEFAULT false,
  verification_date DATE,
  
  -- Archivos adjuntos
  certificate_file_path TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- 5. Gestión específica para colaboradores autónomos
CREATE TABLE public.autonomous_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información fiscal
  company_name VARCHAR(255),
  tax_identification_number VARCHAR(50) NOT NULL,
  vat_number VARCHAR(50),
  business_address TEXT,
  
  -- Condiciones comerciales
  hourly_rate NUMERIC(10,2),
  project_rate NUMERIC(10,2),
  payment_terms INTEGER DEFAULT 30, -- días para pago
  preferred_payment_method VARCHAR(50) DEFAULT 'transfer',
  
  -- Servicios y especialidades
  services_offered TEXT[],
  specializations TEXT[],
  availability_hours VARCHAR(100), -- 'full_time', 'part_time', 'project_based'
  
  -- Facturación
  requires_invoice BOOLEAN DEFAULT true,
  invoice_frequency VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'monthly', 'project_completion'
  
  -- Estado
  collaboration_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- 6. Control de asistencia y tiempo
CREATE TABLE public.time_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información de asistencia
  attendance_date DATE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_duration_minutes INTEGER DEFAULT 0,
  
  -- Horas trabajadas
  regular_hours NUMERIC(4,2) DEFAULT 0,
  overtime_hours NUMERIC(4,2) DEFAULT 0,
  total_hours NUMERIC(4,2) DEFAULT 0,
  
  -- Estado y tipo
  attendance_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'overtime', 'holiday', 'sick_leave'
  status VARCHAR(50) DEFAULT 'present', -- 'present', 'absent', 'late', 'partial'
  
  -- Observaciones
  notes TEXT,
  location VARCHAR(255), -- oficina, remoto, cliente
  
  -- Aprobación
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Solicitudes de permisos y vacaciones
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- Información de la solicitud
  leave_type VARCHAR(50) NOT NULL, -- 'vacation', 'sick_leave', 'personal', 'maternity', 'paternity'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  
  -- Detalles
  reason TEXT,
  emergency_contact_during_leave VARCHAR(255),
  work_coverage_plan TEXT,
  
  -- Estado de aprobación
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id),
  review_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Índices para optimización
CREATE INDEX idx_employee_profiles_user_id ON public.employee_profiles(user_id);
CREATE INDEX idx_employee_profiles_org_id ON public.employee_profiles(org_id);
CREATE INDEX idx_employment_contracts_employee_profile_id ON public.employment_contracts(employee_profile_id);
CREATE INDEX idx_salary_history_employee_profile_id ON public.salary_history(employee_profile_id);
CREATE INDEX idx_employee_education_employee_profile_id ON public.employee_education(employee_profile_id);
CREATE INDEX idx_autonomous_collaborators_employee_profile_id ON public.autonomous_collaborators(employee_profile_id);
CREATE INDEX idx_time_attendance_employee_profile_id ON public.time_attendance(employee_profile_id);
CREATE INDEX idx_time_attendance_date ON public.time_attendance(attendance_date);
CREATE INDEX idx_leave_requests_employee_profile_id ON public.leave_requests(employee_profile_id);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Triggers para updated_at
CREATE TRIGGER update_employee_profiles_updated_at
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employment_contracts_updated_at
  BEFORE UPDATE ON public.employment_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_education_updated_at
  BEFORE UPDATE ON public.employee_education
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_autonomous_collaborators_updated_at
  BEFORE UPDATE ON public.autonomous_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_attendance_updated_at
  BEFORE UPDATE ON public.time_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();