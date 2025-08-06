/**
 * Tipos para el sistema de datos de empleados
 */

import { BaseEntity } from '../core'

export interface ActivityType {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  category: 'general' | 'hr' | 'evaluation' | 'training' | 'project'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeActivity extends BaseEntity {
  employee_id: string
  activity_type_id: string
  title: string
  description?: string
  activity_date: string
  metadata: Record<string, unknown>
  created_by: string
  visibility: 'internal' | 'manager_only' | 'employee_visible'
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled'
  activity_type?: ActivityType
}

export interface EmployeeEvaluation extends BaseEntity {
  employee_id: string
  evaluator_id: string
  evaluation_period_start: string
  evaluation_period_end: string
  overall_score?: number
  goals_achieved: Array<{ goal: string; achieved: boolean; notes?: string }>
  strengths?: string
  areas_for_improvement?: string
  development_plan?: string
  competencies: Record<string, number>
  status: 'draft' | 'completed' | 'approved'
}

export interface EmployeeTraining extends BaseEntity {
  employee_id: string
  course_name: string
  provider?: string
  start_date?: string
  completion_date?: string
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled'
  certificate_url?: string
  score?: number
  credits_earned: number
  cost?: number
  notes?: string
}

export interface EmployeeProject extends BaseEntity {
  employee_id: string
  project_name: string
  role?: string
  start_date?: string
  end_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  description?: string
  achievements?: string
  skills_used: string[]
}

export interface EmployeeNote extends BaseEntity {
  employee_id: string
  author_id: string
  title: string
  content: string
  note_type: 'general' | 'performance' | 'disciplinary' | 'achievement'
  is_private: boolean
  visibility: 'hr_only' | 'manager_only' | 'all_managers'
}

export interface CandidateActivity extends BaseEntity {
  candidate_id: string
  activity_type_id: string
  title: string
  description?: string
  activity_date: string
  metadata: Record<string, unknown>
  created_by: string
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled'
  activity_type?: ActivityType
}

export interface CandidateEvaluation extends BaseEntity {
  candidate_id: string
  evaluator_id: string
  evaluation_type: 'interview' | 'technical' | 'cultural' | 'reference'
  position?: string
  overall_score?: number
  technical_skills: Record<string, number>
  soft_skills: Record<string, number>
  cultural_fit_score?: number
  notes?: string
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
  evaluation_date: string
}

export interface CandidateReference extends BaseEntity {
  candidate_id: string
  reference_name: string
  reference_position?: string
  reference_company?: string
  reference_email?: string
  reference_phone?: string
  relationship?: string
  contacted_date?: string
  response_received: boolean
  overall_rating?: number
  would_rehire?: boolean
  strengths?: string
  weaknesses?: string
  additional_notes?: string
  status: 'pending' | 'contacted' | 'completed' | 'declined'
}

// Form Data Types
export interface CreateActivityData {
  employee_id?: string
  candidate_id?: string
  activity_type_id: string
  title: string
  description?: string
  activity_date: string
  metadata?: Record<string, unknown>
  visibility?: string
  status?: string
}

export interface CreateEvaluationData {
  employee_id?: string
  candidate_id?: string
  evaluator_id: string
  evaluation_period_start?: string
  evaluation_period_end?: string
  evaluation_type?: string
  position?: string
  overall_score?: number
  technical_skills?: Record<string, number>
  soft_skills?: Record<string, number>
  cultural_fit_score?: number
  goals_achieved?: Array<{ goal: string; achieved: boolean; notes?: string }>
  strengths?: string
  areas_for_improvement?: string
  development_plan?: string
  competencies?: Record<string, number>
  notes?: string
  recommendation?: string
  evaluation_date?: string
  status?: string
}

export interface CreateTrainingData {
  employee_id: string
  course_name: string
  provider?: string
  start_date?: string
  completion_date?: string
  status?: string
  certificate_url?: string
  score?: number
  credits_earned?: number
  cost?: number
  notes?: string
}

export interface CreateProjectData {
  employee_id: string
  project_name: string
  role?: string
  start_date?: string
  end_date?: string
  status?: string
  description?: string
  achievements?: string
  skills_used?: string[]
}

export interface CreateNoteData {
  employee_id: string
  author_id: string
  title: string
  content: string
  note_type?: string
  is_private?: boolean
  visibility?: string
}

export interface CreateReferenceData {
  candidate_id: string
  reference_name: string
  reference_position?: string
  reference_company?: string
  reference_email?: string
  reference_phone?: string
  relationship?: string
  contacted_date?: string
  response_received?: boolean
  overall_rating?: number
  would_rehire?: boolean
  strengths?: string
  weaknesses?: string
  additional_notes?: string
  status?: string
}

// Labels
export const ACTIVITY_STATUS_LABELS = {
  completed: 'Completada',
  in_progress: 'En progreso',
  scheduled: 'Programada',
  cancelled: 'Cancelada'
} as const

export const EVALUATION_STATUS_LABELS = {
  draft: 'Borrador',
  completed: 'Completada',
  approved: 'Aprobada'
} as const

export const TRAINING_STATUS_LABELS = {
  enrolled: 'Inscrito',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado'
} as const

export const PROJECT_STATUS_LABELS = {
  active: 'Activo',
  completed: 'Completado',
  paused: 'Pausado',
  cancelled: 'Cancelado'
} as const

export const NOTE_TYPE_LABELS = {
  general: 'General',
  performance: 'Rendimiento',
  disciplinary: 'Disciplinario',
  achievement: 'Logro'
} as const

export const RECOMMENDATION_LABELS = {
  strong_yes: 'Muy recomendado',
  yes: 'Recomendado',
  maybe: 'Tal vez',
  no: 'No recomendado',
  strong_no: 'Muy no recomendado'
} as const

export const REFERENCE_STATUS_LABELS = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  completed: 'Completado',
  declined: 'Declinado'
} as const