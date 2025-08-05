// Tipos para el sistema de reclutamiento

export type CandidateStatus = 
  | 'new' 
  | 'screening' 
  | 'interviewing' 
  | 'offer_sent' 
  | 'hired' 
  | 'rejected' 
  | 'withdrawn'

export type CandidateSource = 
  | 'manual' 
  | 'linkedin' 
  | 'job_board' 
  | 'referral' 
  | 'website'

export type RemoteWorkPreference = 'onsite' | 'remote' | 'hybrid'

export type InterviewType = 'technical' | 'cultural' | 'management' | 'hr'

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export type Recommendation = 'hire' | 'no_hire' | 'maybe' | 'next_round'

export type RecruitmentProcessStatus = 'active' | 'on_hold' | 'completed' | 'cancelled'

export type ProcessPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ProcessStage = 
  | 'initial_screening' 
  | 'phone_interview' 
  | 'technical_test' 
  | 'in_person_interview' 
  | 'reference_check' 
  | 'offer_stage' 
  | 'hired'

export interface Candidate {
  id: string
  org_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  linkedin_url?: string
  cv_file_path?: string
  cover_letter?: string
  current_position?: string
  current_company?: string
  years_experience: number
  expected_salary?: number
  salary_currency: string
  availability_date?: string
  status: CandidateStatus
  source: CandidateSource
  notes?: string
  skills: string[]
  languages: string[]
  location?: string
  remote_work_preference: RemoteWorkPreference
  created_at: string
  updated_at: string
  created_by: string
}

export interface Interview {
  id: string
  org_id: string
  candidate_id: string
  job_offer_id?: string
  interviewer_id: string
  interview_type: InterviewType
  status: InterviewStatus
  scheduled_at: string
  duration_minutes: number
  location?: string
  meeting_url?: string
  interview_round: number
  evaluation_score?: number
  evaluation_notes?: string
  technical_assessment?: Record<string, any>
  cultural_fit_notes?: string
  strengths: string[]
  concerns: string[]
  recommendation?: Recommendation
  feedback_shared_with_candidate: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export interface RecruitmentProcess {
  id: string
  org_id: string
  candidate_id: string
  position_title: string
  department?: string
  hiring_manager_id?: string
  recruiter_id?: string
  status: RecruitmentProcessStatus
  priority: ProcessPriority
  target_start_date?: string
  current_stage: ProcessStage
  stage_deadline?: string
  notes?: string
  budget_min?: number
  budget_max?: number
  created_at: string
  updated_at: string
  created_by: string
}

export interface InterviewFeedback {
  id: string
  org_id: string
  interview_id: string
  interviewer_id: string
  overall_rating: number
  technical_skills_rating?: number
  communication_rating?: number
  cultural_fit_rating?: number
  experience_level_rating?: number
  detailed_feedback?: string
  would_hire?: boolean
  next_steps?: string
  created_at: string
  updated_at: string
}

export interface CreateCandidateData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  linkedin_url?: string
  cv_file_path?: string
  cover_letter?: string
  current_position?: string
  current_company?: string
  years_experience?: number
  expected_salary?: number
  salary_currency?: string
  availability_date?: string
  source?: CandidateSource
  notes?: string
  skills?: string[]
  languages?: string[]
  location?: string
  remote_work_preference?: RemoteWorkPreference
}

export interface CreateInterviewData {
  candidate_id: string
  job_offer_id?: string
  interviewer_id: string
  interview_type: InterviewType
  scheduled_at: string
  duration_minutes?: number
  location?: string
  meeting_url?: string
  interview_round?: number
}

export interface CreateRecruitmentProcessData {
  candidate_id: string
  position_title: string
  department?: string
  hiring_manager_id?: string
  recruiter_id?: string
  priority?: ProcessPriority
  target_start_date?: string
  notes?: string
  budget_min?: number
  budget_max?: number
}

// Datos expandidos para las vistas
export interface CandidateWithDetails extends Candidate {
  interviews?: Interview[]
  recruitment_processes?: RecruitmentProcess[]
  job_offers?: any[] // Re-usar tipo existente
}

export interface InterviewWithDetails extends Interview {
  candidate?: Candidate
  interviewer?: any // Usuario que entrevista
  feedback?: InterviewFeedback[]
}

export interface RecruitmentProcessWithDetails extends RecruitmentProcess {
  candidate?: Candidate
  hiring_manager?: any
  recruiter?: any
  interviews?: Interview[]
  job_offers?: any[]
}

// Estadísticas del dashboard
export interface RecruitmentStats {
  total_candidates: number
  active_processes: number
  interviews_this_week: number
  offers_pending: number
  hired_this_month: number
  by_status: Record<CandidateStatus, number>
  by_source: Record<CandidateSource, number>
  by_stage: Record<ProcessStage, number>
}

// Formularios paso a paso
export interface CandidateFormData {
  // Información personal
  first_name: string
  last_name: string
  email: string
  phone: string
  
  // Información profesional
  current_position: string
  current_company: string
  years_experience: number
  linkedin_url: string
  
  // Expectativas
  expected_salary: number
  salary_currency: string
  availability_date: string
  remote_work_preference: RemoteWorkPreference
  
  // Información adicional
  skills: string[]
  languages: string[]
  location: string
  source: CandidateSource
  cover_letter: string
  notes: string
}

export interface InterviewFormData {
  candidate_id: string
  interview_type: InterviewType
  scheduled_at: string
  duration_minutes: number
  location: string
  meeting_url: string
  interviewer_id: string
}

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  new: 'Nuevo',
  screening: 'En evaluación',
  interviewing: 'En entrevistas',
  offer_sent: 'Oferta enviada',
  hired: 'Contratado',
  rejected: 'Rechazado',
  withdrawn: 'Se retiró'
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: 'Técnica',
  cultural: 'Cultural',
  management: 'Gerencial',
  hr: 'Recursos Humanos'
}

export const PROCESS_STAGE_LABELS: Record<ProcessStage, string> = {
  initial_screening: 'Evaluación inicial',
  phone_interview: 'Entrevista telefónica',
  technical_test: 'Prueba técnica',
  in_person_interview: 'Entrevista presencial',
  reference_check: 'Verificación referencias',
  offer_stage: 'Etapa de oferta',
  hired: 'Contratado'
}