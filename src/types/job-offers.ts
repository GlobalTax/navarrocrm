// Tipos para el sistema de ofertas de trabajo

export type JobOfferStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'declined' 
  | 'expired'

export type PositionLevel = 'junior' | 'senior' | 'manager' | 'director'
export type WorkSchedule = 'full_time' | 'part_time' | 'hybrid'
export type SalaryPeriod = 'monthly' | 'annual'

export interface JobOffer {
  id: string
  org_id: string
  title: string
  department?: string
  position_level: PositionLevel
  candidate_name: string
  candidate_email: string
  candidate_phone?: string
  
  // Detalles de la oferta
  salary_amount?: number
  salary_currency: string
  salary_period: SalaryPeriod
  start_date?: string
  probation_period_months: number
  vacation_days: number
  work_schedule: WorkSchedule
  work_location?: string
  remote_work_allowed: boolean
  
  // Beneficios y condiciones
  benefits: string[]
  requirements: string[]
  responsibilities: string[]
  additional_notes?: string
  
  // Estado y seguimiento
  status: JobOfferStatus
  template_id?: string
  sent_at?: string
  viewed_at?: string
  responded_at?: string
  expires_at?: string
  access_token: string
  
  // Integración con onboarding
  employee_onboarding_id?: string
  
  // Metadatos
  created_by: string
  created_at: string
  updated_at: string
}

export interface JobOfferTemplate {
  id: string
  org_id: string
  name: string
  description?: string
  position_level: PositionLevel
  department?: string
  
  // Plantilla de contenido
  title_template?: string
  salary_range_min?: number
  salary_range_max?: number
  default_benefits: string[]
  default_requirements: string[]
  default_responsibilities: string[]
  default_probation_months: number
  default_vacation_days: number
  
  // Configuración
  is_active: boolean
  is_default: boolean
  
  // Metadatos
  created_by: string
  created_at: string
  updated_at: string
}

export interface JobOfferActivity {
  id: string
  job_offer_id: string
  org_id: string
  user_id?: string
  activity_type: 'created' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'modified'
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface CreateJobOfferData {
  title: string
  department?: string
  position_level: PositionLevel
  candidate_name: string
  candidate_email: string
  candidate_phone?: string
  salary_amount?: number
  salary_currency?: string
  salary_period?: SalaryPeriod
  start_date?: string
  probation_period_months?: number
  vacation_days?: number
  work_schedule?: WorkSchedule
  work_location?: string
  remote_work_allowed?: boolean
  benefits?: string[]
  requirements?: string[]
  responsibilities?: string[]
  additional_notes?: string
  template_id?: string
  expires_at?: string
}

export interface JobOfferFormData {
  // Información básica
  title: string
  department: string
  position_level: PositionLevel
  
  // Información del candidato
  candidate_name: string
  candidate_email: string
  candidate_phone: string
  
  // Detalles de la oferta
  salary_amount: number
  salary_currency: string
  salary_period: SalaryPeriod
  start_date: string
  probation_period_months: number
  vacation_days: number
  work_schedule: WorkSchedule
  work_location: string
  remote_work_allowed: boolean
  
  // Beneficios y condiciones
  benefits: string[]
  requirements: string[]
  responsibilities: string[]
  additional_notes: string
  
  // Configuración
  expires_in_days: number
}

export interface JobOfferStep {
  id: string
  title: string
  description: string
  isRequired: boolean
  fields: string[]
}

export const JOB_OFFER_STEPS: JobOfferStep[] = [
  {
    id: 'basic-info',
    title: 'Información Básica',
    description: 'Datos del puesto y candidato',
    isRequired: true,
    fields: ['title', 'department', 'position_level', 'candidate_name', 'candidate_email']
  },
  {
    id: 'salary-conditions',
    title: 'Condiciones Salariales',
    description: 'Salario y beneficios económicos',
    isRequired: true,
    fields: ['salary_amount', 'salary_period', 'work_schedule']
  },
  {
    id: 'work-conditions',
    title: 'Condiciones Laborales',
    description: 'Horarios, vacaciones y ubicación',
    isRequired: false,
    fields: ['start_date', 'vacation_days', 'work_location', 'remote_work_allowed']
  },
  {
    id: 'responsibilities',
    title: 'Responsabilidades',
    description: 'Funciones y requisitos del puesto',
    isRequired: false,
    fields: ['responsibilities', 'requirements']
  },
  {
    id: 'benefits',
    title: 'Beneficios',
    description: 'Beneficios adicionales de la empresa',
    isRequired: false,
    fields: ['benefits', 'additional_notes']
  },
  {
    id: 'review',
    title: 'Revisión Final',
    description: 'Confirmar todos los datos antes de enviar',
    isRequired: true,
    fields: []
  }
]