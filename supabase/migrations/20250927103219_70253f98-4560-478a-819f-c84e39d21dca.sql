-- NUEVO ENFOQUE: Employee profiles independientes

-- Modificar employee_profiles para que sea independiente
ALTER TABLE public.employee_profiles 
DROP CONSTRAINT employee_profiles_user_id_fkey,
ALTER COLUMN user_id DROP NOT NULL;

-- Agregar columnas adicionales para datos básicos de empleado
ALTER TABLE public.employee_profiles
ADD COLUMN email VARCHAR(255),
ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN is_user BOOLEAN DEFAULT FALSE; -- Indica si tiene usuario en auth

-- Crear índice para email y nombre
CREATE INDEX idx_employee_profiles_email ON public.employee_profiles(email);
CREATE INDEX idx_employee_profiles_name ON public.employee_profiles(name);

-- Migrar datos de simple_employees directamente a employee_profiles
INSERT INTO public.employee_profiles (
  org_id,
  name,
  email,
  employee_number,
  hire_date,
  contract_type,
  employment_status,
  working_hours_per_week,
  salary,
  department_name,
  position_title,
  notes,
  birth_date,
  address_street,
  address_city,
  address_postal_code,
  address_country,
  emergency_contact_name,
  emergency_contact_phone,
  dni_nie,
  social_security_number,
  bank_account,
  skills,
  languages,
  education_level,
  created_at,
  updated_at,
  created_by,
  is_user
)
SELECT 
  se.org_id,
  se.name,
  se.email,
  se.employee_number,
  se.hire_date,
  se.contract_type,
  se.status as employment_status,
  se.working_hours_per_week,
  se.salary,
  se.department as department_name,
  se.position as position_title,
  se.notes,
  se.birth_date,
  se.address_street,
  se.address_city,
  se.address_postal_code,
  se.address_country,
  se.emergency_contact_name,
  se.emergency_contact_phone,
  se.dni_nie,
  se.social_security_number,
  se.bank_account,
  se.skills,
  se.languages,
  se.education_level,
  se.created_at,
  se.updated_at,
  se.created_by,
  false as is_user -- Por defecto no son usuarios autenticados
FROM public.simple_employees se;