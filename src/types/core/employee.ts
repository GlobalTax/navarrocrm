/**
 * Tipos para empleados unificados con usuarios
 * Nueva arquitectura post-migración
 */

import { BaseEntity } from './index'

export interface EmployeeProfile extends BaseEntity {
  // Referencia a usuario (opcional)
  user_id?: string
  is_user: boolean
  
  // Datos básicos del empleado
  name: string
  email?: string
  employee_number?: string
  
  // Información laboral
  hire_date?: string
  termination_date?: string
  contract_type: string
  employment_status: EmploymentStatus
  working_hours_per_week?: number
  
  // Información salarial y departamento
  salary?: number
  currency: string
  department_id?: string
  department_name?: string
  manager_id?: string
  
  // Información adicional
  position_title?: string
  work_location?: string
  benefits?: Record<string, any>
  notes?: string
  
  // Información personal
  birth_date?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  dni_nie?: string
  social_security_number?: string
  bank_account?: string
  
  // Skills y educación
  skills?: string[]
  languages?: string[]
  education_level?: string
  
  // Metadata
  created_by?: string
}

export type EmploymentStatus = 'active' | 'inactive' | 'terminated' | 'on_leave'

export interface CreateEmployeeProfileData {
  name: string
  email?: string
  employee_number?: string
  hire_date?: string
  contract_type?: string
  employment_status?: EmploymentStatus
  working_hours_per_week?: number
  salary?: number
  currency?: string
  department_name?: string
  position_title?: string
  notes?: string
  birth_date?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  dni_nie?: string
  social_security_number?: string
  bank_account?: string
  skills?: string[]
  languages?: string[]
  education_level?: string
}

export interface UpdateEmployeeProfileData extends Partial<CreateEmployeeProfileData> {
  id: string
}

export interface EmployeeFilters {
  search: string
  employment_status: string
  department: string
  contract_type: string
}

export interface EmployeeStats {
  total: number
  active: number
  inactive: number
  terminated: number
  on_leave: number
  by_department: Record<string, number>
  by_contract_type: Record<string, number>
}

// Backward compatibility - Employee que combina User + EmployeeProfile
export interface Employee {
  id: string
  user_id?: string
  is_user: boolean
  
  // Datos de usuario (si existe)
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  role?: string
  is_active?: boolean
  
  // Datos del profile
  name: string
  employee_number?: string
  position_title?: string
  department_name?: string
  employment_status: EmploymentStatus
  hire_date?: string
  salary?: number
  contract_type: string
  working_hours_per_week?: number
  notes?: string
  
  // Metadata
  org_id: string
  created_at: string
  updated_at: string
  created_by?: string
}